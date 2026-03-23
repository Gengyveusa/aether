#!/usr/bin/env python3
"""
ScienceClaw → Supabase Sync

Pushes artifact metadata from ~/.scienceclaw/artifacts/ to a Supabase table.

Config: ~/.scienceclaw/supabase_config.json (url + anon_key)
Template: supabase_config_template.json in this repo

Usage:
    python3 supabase_sync.py                # Sync all artifacts
    python3 supabase_sync.py --once         # Sync once and exit
    python3 supabase_sync.py --watch        # Watch mode (continuous)
    python3 supabase_sync.py --create-table # Create the artifacts table
"""

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import requests

CONFIG_DIR = Path.home() / ".scienceclaw"
ARTIFACTS_DIR = CONFIG_DIR / "artifacts"
SUPABASE_CONFIG = CONFIG_DIR / "supabase_config.json"
SYNC_STATE_FILE = CONFIG_DIR / "supabase_sync_state.json"
POLL_INTERVAL = 30  # seconds


def load_supabase_config() -> Optional[dict]:
    """Load Supabase config from ~/.scienceclaw/supabase_config.json."""
    if not SUPABASE_CONFIG.exists():
        print(f"Supabase config not found: {SUPABASE_CONFIG}")
        print(f"Copy supabase_config_template.json to {SUPABASE_CONFIG} and fill in credentials.")
        return None
    try:
        with open(SUPABASE_CONFIG) as f:
            config = json.load(f)
    except (json.JSONDecodeError, OSError) as e:
        print(f"Error reading config: {e}")
        return None

    if not config.get("url") or "YOUR" in config.get("url", "YOUR"):
        print("Supabase URL not configured. Update ~/.scienceclaw/supabase_config.json")
        return None
    if not config.get("anon_key") or "YOUR" in config.get("anon_key", "YOUR"):
        print("Supabase anon key not configured. Update ~/.scienceclaw/supabase_config.json")
        return None

    return config


def load_sync_state() -> dict:
    """Load set of already-synced artifact IDs."""
    if SYNC_STATE_FILE.exists():
        try:
            with open(SYNC_STATE_FILE) as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {"synced_ids": [], "last_sync": None}


def save_sync_state(state: dict):
    """Persist sync state."""
    state["last_sync"] = datetime.now(timezone.utc).isoformat()
    with open(SYNC_STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


class SupabaseClient:
    """Minimal Supabase REST client (no SDK dependency)."""

    def __init__(self, url: str, anon_key: str, table: str = "artifacts"):
        self.base_url = url.rstrip("/")
        self.table = table
        self.headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

    def upsert(self, rows: list[dict]) -> bool:
        """Upsert rows into the artifacts table."""
        if not rows:
            return True
        url = f"{self.base_url}/rest/v1/{self.table}"
        headers = {**self.headers, "Prefer": "resolution=merge-duplicates,return=minimal"}
        try:
            resp = requests.post(url, json=rows, headers=headers, timeout=30)
            if resp.status_code in (200, 201, 204):
                return True
            print(f"  Supabase error: HTTP {resp.status_code} — {resp.text[:200]}")
            return False
        except requests.exceptions.RequestException as e:
            print(f"  Supabase connection error: {e}")
            return False

    def create_table_sql(self) -> str:
        """Return SQL to create the artifacts table."""
        return f"""
CREATE TABLE IF NOT EXISTS {self.table} (
    id TEXT PRIMARY KEY,
    agent TEXT NOT NULL,
    artifact_type TEXT,
    skill_used TEXT,
    investigation_id TEXT,
    timestamp TIMESTAMPTZ,
    tags JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    status TEXT DEFAULT 'synced',
    payload_hash TEXT,
    parent_ids JSONB DEFAULT '[]'::jsonb,
    result_quality TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_{self.table}_agent ON {self.table}(agent);
CREATE INDEX IF NOT EXISTS idx_{self.table}_type ON {self.table}(artifact_type);
CREATE INDEX IF NOT EXISTS idx_{self.table}_investigation ON {self.table}(investigation_id);
CREATE INDEX IF NOT EXISTS idx_{self.table}_timestamp ON {self.table}(timestamp);
"""


def artifact_to_row(artifact: dict) -> dict:
    """Convert an artifact dict to a Supabase table row."""
    artifact_type = artifact.get("artifact_type", "unknown")
    skill = artifact.get("skill_used", "unknown")
    payload = artifact.get("payload", {})

    # Build summary from payload
    summary_parts = []
    if isinstance(payload, dict):
        if payload.get("topic"):
            summary_parts.append(f"Topic: {payload['topic']}")
        if payload.get("paper_count"):
            summary_parts.append(f"Papers: {payload['paper_count']}")
        if payload.get("tool_count") or payload.get("tools_used"):
            tools = payload.get("tools_used", [])
            summary_parts.append(f"Tools: {', '.join(tools) if isinstance(tools, list) else tools}")
    summary = "; ".join(summary_parts) if summary_parts else f"{artifact_type} via {skill}"

    # Build tags
    tags = [
        f"type:{artifact_type}",
        f"skill:{skill}",
        f"agent:{artifact.get('producer_agent', 'unknown')}",
    ]

    return {
        "id": artifact.get("artifact_id", ""),
        "agent": artifact.get("producer_agent", "unknown"),
        "artifact_type": artifact_type,
        "skill_used": skill,
        "investigation_id": artifact.get("investigation_id", ""),
        "timestamp": artifact.get("timestamp", ""),
        "tags": tags,
        "summary": summary,
        "status": "synced",
        "payload_hash": artifact.get("content_hash", ""),
        "parent_ids": artifact.get("parent_artifact_ids", []),
        "result_quality": artifact.get("result_quality", "unknown"),
    }


def sync_artifacts(client: SupabaseClient, state: dict) -> int:
    """Scan for new artifacts and push to Supabase. Returns count of new rows."""
    synced = set(state.get("synced_ids", []))
    new_rows = []

    for store_file in sorted(ARTIFACTS_DIR.glob("*/store.jsonl")):
        with open(store_file) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    artifact = json.loads(line)
                except json.JSONDecodeError:
                    continue
                aid = artifact.get("artifact_id", "")
                if not aid or aid in synced:
                    continue
                new_rows.append(artifact_to_row(artifact))
                synced.add(aid)

    if not new_rows:
        return 0

    # Batch upsert (chunks of 50)
    total = 0
    for i in range(0, len(new_rows), 50):
        batch = new_rows[i:i + 50]
        if client.upsert(batch):
            total += len(batch)
        else:
            # Roll back synced IDs for failed batch
            for row in batch:
                synced.discard(row["id"])

    state["synced_ids"] = sorted(synced)
    return total


def main():
    parser = argparse.ArgumentParser(description="Sync ScienceClaw artifacts to Supabase")
    parser.add_argument("--once", action="store_true", help="Sync once and exit")
    parser.add_argument("--watch", action="store_true", help="Watch mode (continuous)")
    parser.add_argument("--create-table", action="store_true", help="Print CREATE TABLE SQL")
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL,
                        help=f"Poll interval in seconds (default: {POLL_INTERVAL})")
    args = parser.parse_args()

    config = load_supabase_config()

    if args.create_table:
        table = config.get("table", "artifacts") if config else "artifacts"
        client = SupabaseClient("", "", table)
        print(client.create_table_sql())
        return 0

    if not config:
        return 1

    client = SupabaseClient(
        url=config["url"],
        anon_key=config["anon_key"],
        table=config.get("table", "artifacts"),
    )

    print("ScienceClaw Supabase Sync")
    print(f"  Supabase: {config['url']}")
    print(f"  Table: {config.get('table', 'artifacts')}")
    print()

    state = load_sync_state()

    if args.once or not args.watch:
        count = sync_artifacts(client, state)
        save_sync_state(state)
        print(f"Synced {count} artifact(s) to Supabase.")
        return 0

    # Watch mode
    print(f"Watching for new artifacts (every {args.interval}s)... Ctrl+C to stop.")
    try:
        while True:
            count = sync_artifacts(client, state)
            if count > 0:
                save_sync_state(state)
                ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
                print(f"  [{ts}] Synced {count} new artifact(s)")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        save_sync_state(state)
        print("\nSync stopped.")
        return 0


if __name__ == "__main__":
    raise SystemExit(main() or 0)

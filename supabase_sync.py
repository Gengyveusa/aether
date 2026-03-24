#!/usr/bin/env python3
"""
ScienceClaw -> Supabase Sync — Enhanced for Delphi Mission

Pushes artifact metadata from ~/.scienceclaw/artifacts/ to a Supabase table.
Enhanced with investigation tracking, architecture tagging, retry logic,
and mission-aware schema for the ARPA-H Delphi quantum biology project.

Config: ~/.scienceclaw/supabase_config.json (url + anon_key)
Template: supabase_config_template.json in this repo

Usage:
    python3 supabase_sync.py                    # Sync all artifacts
    python3 supabase_sync.py --once             # Sync once and exit
    python3 supabase_sync.py --watch            # Watch mode (continuous)
    python3 supabase_sync.py --create-table     # Print CREATE TABLE SQL
    python3 supabase_sync.py --stats            # Show sync statistics
    python3 supabase_sync.py --agent Coherence-1  # Sync single agent only
    python3 supabase_sync.py --migrate          # Print schema migration SQL
"""

import argparse
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

CONFIG_DIR = Path.home() / ".scienceclaw"
ARTIFACTS_DIR = CONFIG_DIR / "artifacts"
SUPABASE_CONFIG = CONFIG_DIR / "supabase_config.json"
SYNC_STATE_FILE = CONFIG_DIR / "supabase_sync_state.json"
POLL_INTERVAL = 30  # seconds
MAX_RETRIES = 4
SCHEMA_VERSION = "2.0"  # Delphi-enhanced schema

# Architecture mapping for tagging
ARCHITECTURE_SKILLS = {
    "FMO": ["scanpy", "scvi-tools", "pydeseq2", "biopython"],
    "tunneling": ["rdkit", "pubchem", "tdc", "datamol"],
    "ETC": ["pdb", "alphafold-database", "openmm", "uniprot"],
    "spin": ["biopython", "clinicaltrials-database", "scholar-search"],
}


def _log(msg: str, level: str = "INFO"):
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
    print(f"  [{ts}] [{level}] {msg}")


# ---------------------------------------------------------------------------
# Supabase Client with Retry
# ---------------------------------------------------------------------------

class SupabaseClient:
    """Minimal Supabase REST client with exponential backoff retry."""

    def __init__(self, url: str, anon_key: str, table: str = "artifacts"):
        self.base_url = url.rstrip("/")
        self.table = table
        self.headers = {
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

    def _request_with_retry(
        self,
        method: str,
        url: str,
        json_data: Optional[list | dict] = None,
        headers: Optional[dict] = None,
    ) -> tuple[bool, str]:
        """Execute HTTP request with exponential backoff retry."""
        import requests

        hdrs = headers or self.headers
        last_error = ""

        for attempt in range(MAX_RETRIES + 1):
            try:
                resp = requests.request(
                    method, url, json=json_data, headers=hdrs, timeout=30,
                )
                if resp.status_code in (200, 201, 204):
                    return True, ""
                last_error = f"HTTP {resp.status_code} — {resp.text[:200]}"
                if resp.status_code < 500:
                    # Client error — don't retry
                    return False, last_error
            except requests.exceptions.ConnectionError as e:
                last_error = f"Connection error: {e}"
            except requests.exceptions.Timeout:
                last_error = "Request timeout"
            except Exception as e:
                last_error = f"{type(e).__name__}: {e}"

            if attempt < MAX_RETRIES:
                wait = 2 ** (attempt + 1)
                _log(f"Retry {attempt + 1}/{MAX_RETRIES} in {wait}s — {last_error}", "WARN")
                time.sleep(wait)

        return False, last_error

    def upsert(self, rows: list[dict]) -> bool:
        """Upsert rows into the artifacts table with retry."""
        if not rows:
            return True
        url = f"{self.base_url}/rest/v1/{self.table}"
        headers = {
            **self.headers,
            "Prefer": "resolution=merge-duplicates,return=minimal",
        }
        ok, err = self._request_with_retry("POST", url, json_data=rows, headers=headers)
        if not ok:
            _log(f"Supabase upsert failed: {err}", "ERROR")
        return ok

    def create_table_sql(self) -> str:
        """Return SQL to create the Delphi-enhanced artifacts table."""
        return f"""-- ScienceClaw Delphi Artifacts Table (schema v{SCHEMA_VERSION})
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
    -- Delphi mission fields (v2.0)
    architecture TEXT,                  -- FMO | tunneling | ETC | spin
    mission_id TEXT DEFAULT 'delphi-qpi-2026',
    qpi_relevance REAL,                -- 0.0-1.0 relevance to QPI model
    metabolite_targets JSONB DEFAULT '[]'::jsonb,  -- NADH, FAD, ATP, GSH
    evidence_type TEXT,                -- literature | experimental | computational | clinical
    cancer_signature TEXT,             -- amplified | suppressed | mixed | unknown
    aging_signature TEXT,              -- decohered | preserved | mixed | unknown
    schema_version TEXT DEFAULT '{SCHEMA_VERSION}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_{self.table}_agent ON {self.table}(agent);
CREATE INDEX IF NOT EXISTS idx_{self.table}_type ON {self.table}(artifact_type);
CREATE INDEX IF NOT EXISTS idx_{self.table}_investigation ON {self.table}(investigation_id);
CREATE INDEX IF NOT EXISTS idx_{self.table}_timestamp ON {self.table}(timestamp);
CREATE INDEX IF NOT EXISTS idx_{self.table}_architecture ON {self.table}(architecture);
CREATE INDEX IF NOT EXISTS idx_{self.table}_mission ON {self.table}(mission_id);
CREATE INDEX IF NOT EXISTS idx_{self.table}_evidence ON {self.table}(evidence_type);

-- Full-text search on summary
CREATE INDEX IF NOT EXISTS idx_{self.table}_summary_fts
    ON {self.table} USING gin(to_tsvector('english', coalesce(summary, '')));

-- Composite index for architecture + agent queries
CREATE INDEX IF NOT EXISTS idx_{self.table}_arch_agent
    ON {self.table}(architecture, agent);

-- Row-level security (optional)
ALTER TABLE {self.table} ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY IF NOT EXISTS "Allow anonymous read"
    ON {self.table} FOR SELECT
    USING (true);

-- Allow authenticated insert/update
CREATE POLICY IF NOT EXISTS "Allow authenticated write"
    ON {self.table} FOR ALL
    USING (true)
    WITH CHECK (true);
"""

    def migration_sql(self) -> str:
        """Return SQL to migrate v1.0 schema to v2.0 (Delphi enhanced)."""
        return f"""-- Migration: artifacts v1.0 -> v2.0 (Delphi enhanced)
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS architecture TEXT;
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS mission_id TEXT DEFAULT 'delphi-qpi-2026';
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS qpi_relevance REAL;
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS metabolite_targets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS evidence_type TEXT;
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS cancer_signature TEXT;
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS aging_signature TEXT;
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS schema_version TEXT DEFAULT '{SCHEMA_VERSION}';
ALTER TABLE {self.table} ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_{self.table}_architecture ON {self.table}(architecture);
CREATE INDEX IF NOT EXISTS idx_{self.table}_mission ON {self.table}(mission_id);
CREATE INDEX IF NOT EXISTS idx_{self.table}_evidence ON {self.table}(evidence_type);
CREATE INDEX IF NOT EXISTS idx_{self.table}_arch_agent ON {self.table}(architecture, agent);
"""


# ---------------------------------------------------------------------------
# Config & State
# ---------------------------------------------------------------------------

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
    return {"synced_ids": [], "last_sync": None, "sync_count": 0, "schema_version": SCHEMA_VERSION}


def save_sync_state(state: dict):
    """Persist sync state."""
    state["last_sync"] = datetime.now(timezone.utc).isoformat()
    state["schema_version"] = SCHEMA_VERSION
    with open(SYNC_STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


# ---------------------------------------------------------------------------
# Architecture Detection
# ---------------------------------------------------------------------------

def infer_architecture(artifact: dict) -> str:
    """Infer which quantum protection architecture an artifact relates to."""
    skill = artifact.get("skill_used", "").lower()
    artifact_type = artifact.get("artifact_type", "").lower()
    payload = artifact.get("payload", {})

    # Check by skill mapping
    for arch, skills in ARCHITECTURE_SKILLS.items():
        if skill in skills:
            return arch

    # Check by payload content
    if isinstance(payload, dict):
        content = json.dumps(payload).lower()
        if any(kw in content for kw in ["nadh", "fad", "fluorescence", "fmo", "coherence", "exciton"]):
            return "FMO"
        if any(kw in content for kw in ["gsh", "glutathione", "tunneling", "hydrogen transfer", "isotope"]):
            return "tunneling"
        if any(kw in content for kw in ["complex i", "coq10", "cytochrome", "etc", "electron transport", "mitochond"]):
            return "ETC"
        if any(kw in content for kw in ["cryptochrome", "cry1", "cry2", "radical pair", "spin", "magnetoreception"]):
            return "spin"

    return "general"


def infer_evidence_type(artifact: dict) -> str:
    """Infer evidence type from artifact metadata."""
    skill = artifact.get("skill_used", "").lower()
    artifact_type = artifact.get("artifact_type", "").lower()

    if any(kw in skill for kw in ["pubmed", "arxiv", "scholar", "literature", "openalex"]):
        return "literature"
    if any(kw in skill for kw in ["clinicaltrials", "clinical", "fda"]):
        return "clinical"
    if any(kw in skill for kw in ["openmm", "alphafold", "diffdock", "simulation"]):
        return "computational"
    if any(kw in artifact_type for kw in ["structure", "simulation"]):
        return "computational"
    return "mixed"


def extract_metabolite_targets(artifact: dict) -> list[str]:
    """Extract metabolite targets mentioned in artifact payload."""
    targets = []
    payload = artifact.get("payload", {})
    if isinstance(payload, dict):
        content = json.dumps(payload).lower()
        metabolites = {
            "NADH": ["nadh", "nad+", "nicotinamide adenine dinucleotide"],
            "FAD": ["fad", "fadh2", "flavin adenine dinucleotide"],
            "ATP": ["atp", "adenosine triphosphate"],
            "GSH": ["gsh", "gssg", "glutathione"],
            "CoQ10": ["coq10", "ubiquinone", "coenzyme q"],
        }
        for name, keywords in metabolites.items():
            if any(kw in content for kw in keywords):
                targets.append(name)
    return targets


# ---------------------------------------------------------------------------
# Artifact -> Row Conversion
# ---------------------------------------------------------------------------

def artifact_to_row(artifact: dict) -> dict:
    """Convert an artifact dict to a Delphi-enhanced Supabase table row."""
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
        if payload.get("tools_used"):
            tools = payload["tools_used"]
            summary_parts.append(f"Tools: {', '.join(tools) if isinstance(tools, list) else tools}")
        if payload.get("query"):
            summary_parts.append(f"Query: {str(payload['query'])[:100]}")
    summary = "; ".join(summary_parts) if summary_parts else f"{artifact_type} via {skill}"

    # Build tags
    architecture = infer_architecture(artifact)
    evidence_type = infer_evidence_type(artifact)
    metabolite_targets = extract_metabolite_targets(artifact)

    tags = [
        f"type:{artifact_type}",
        f"skill:{skill}",
        f"agent:{artifact.get('producer_agent', 'unknown')}",
        f"arch:{architecture}",
        f"evidence:{evidence_type}",
    ]
    for target in metabolite_targets:
        tags.append(f"metabolite:{target}")

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
        # Delphi mission fields
        "architecture": architecture,
        "mission_id": "delphi-qpi-2026",
        "metabolite_targets": metabolite_targets,
        "evidence_type": evidence_type,
        "schema_version": SCHEMA_VERSION,
    }


# ---------------------------------------------------------------------------
# Sync Engine
# ---------------------------------------------------------------------------

def sync_artifacts(
    client: SupabaseClient,
    state: dict,
    agent_filter: Optional[str] = None,
) -> int:
    """Scan for new artifacts and push to Supabase. Returns count of new rows."""
    synced = set(state.get("synced_ids", []))
    new_rows = []

    glob_pattern = f"{agent_filter}/store.jsonl" if agent_filter else "*/store.jsonl"
    for store_file in sorted(ARTIFACTS_DIR.glob(glob_pattern)):
        try:
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
        except OSError:
            continue

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
    state["sync_count"] = state.get("sync_count", 0) + total
    return total


# ---------------------------------------------------------------------------
# Statistics
# ---------------------------------------------------------------------------

def print_sync_stats():
    """Print sync statistics."""
    state = load_sync_state()
    synced_count = len(state.get("synced_ids", []))

    # Count total artifacts on disk
    total_on_disk = 0
    agent_counts = {}
    for store_file in sorted(ARTIFACTS_DIR.glob("*/store.jsonl")):
        agent = store_file.parent.name
        try:
            with open(store_file) as f:
                count = sum(1 for line in f if line.strip())
            agent_counts[agent] = count
            total_on_disk += count
        except OSError:
            pass

    print()
    print("ScienceClaw Supabase Sync Statistics")
    print("=" * 50)
    print(f"  Schema version:    {state.get('schema_version', '1.0')}")
    print(f"  Last sync:         {state.get('last_sync', 'never')}")
    print(f"  Total synced:      {synced_count}")
    print(f"  Total on disk:     {total_on_disk}")
    print(f"  Pending sync:      {total_on_disk - synced_count}")
    print(f"  Cumulative syncs:  {state.get('sync_count', 0)}")
    print()

    if agent_counts:
        print("  Per-Agent Artifact Counts:")
        for agent, count in sorted(agent_counts.items()):
            print(f"    {agent:<20} {count:>6} artifacts")
    print()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Sync ScienceClaw artifacts to Supabase (Delphi Enhanced)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 supabase_sync.py --once              # Sync once
  python3 supabase_sync.py --watch             # Continuous sync
  python3 supabase_sync.py --create-table      # Print CREATE TABLE SQL
  python3 supabase_sync.py --migrate           # Print migration SQL (v1->v2)
  python3 supabase_sync.py --stats             # Sync statistics
  python3 supabase_sync.py --agent Coherence-1 # Sync single agent
        """,
    )
    parser.add_argument("--once", action="store_true", help="Sync once and exit")
    parser.add_argument("--watch", action="store_true", help="Watch mode (continuous)")
    parser.add_argument("--create-table", action="store_true", help="Print CREATE TABLE SQL")
    parser.add_argument("--migrate", action="store_true", help="Print schema migration SQL")
    parser.add_argument("--stats", action="store_true", help="Show sync statistics")
    parser.add_argument("--agent", default=None, help="Sync only this agent")
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL,
                        help=f"Poll interval in seconds (default: {POLL_INTERVAL})")
    args = parser.parse_args()

    # Stats mode
    if args.stats:
        print_sync_stats()
        return 0

    config = load_supabase_config()

    # SQL generation modes
    if args.create_table:
        table = config.get("table", "artifacts") if config else "artifacts"
        client = SupabaseClient("", "", table)
        print(client.create_table_sql())
        return 0

    if args.migrate:
        table = config.get("table", "artifacts") if config else "artifacts"
        client = SupabaseClient("", "", table)
        print(client.migration_sql())
        return 0

    if not config:
        return 1

    client = SupabaseClient(
        url=config["url"],
        anon_key=config["anon_key"],
        table=config.get("table", "artifacts"),
    )

    print("ScienceClaw Supabase Sync (Delphi Enhanced)")
    print(f"  Supabase:  {config['url']}")
    print(f"  Table:     {config.get('table', 'artifacts')}")
    print(f"  Schema:    v{SCHEMA_VERSION}")
    if args.agent:
        print(f"  Agent:     {args.agent}")
    print()

    state = load_sync_state()

    if args.once or not args.watch:
        count = sync_artifacts(client, state, agent_filter=args.agent)
        save_sync_state(state)
        print(f"Synced {count} artifact(s) to Supabase.")
        return 0

    # Watch mode
    print(f"Watching for new artifacts (every {args.interval}s)... Ctrl+C to stop.")
    try:
        while True:
            count = sync_artifacts(client, state, agent_filter=args.agent)
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

#!/usr/bin/env python3
"""
ScienceClaw → Obsidian Vault Sync

Watches ~/.scienceclaw/artifacts/ for new artifacts and converts them into
Obsidian Markdown notes with YAML frontmatter, saving to the Quantum Distillery vault.

Usage:
    python3 vault_sync.py                          # Watch mode (continuous)
    python3 vault_sync.py --once                   # One-shot sync
    python3 vault_sync.py --vault ~/my-vault       # Custom vault path
"""

import argparse
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DEFAULT_ARTIFACTS_DIR = Path.home() / ".scienceclaw" / "artifacts"
DEFAULT_VAULT_DIR = Path.home() / "Quantum Distillery"
STATE_FILE = Path.home() / ".scienceclaw" / "vault_sync_state.json"
POLL_INTERVAL = 5  # seconds


def slugify(text: str, max_len: int = 80) -> str:
    """Convert text to a filesystem-safe slug."""
    text = re.sub(r"[^\w\s-]", "", text.lower())
    text = re.sub(r"[\s_]+", "-", text).strip("-")
    return text[:max_len]


def load_sync_state() -> dict:
    """Load the set of already-synced artifact IDs."""
    if STATE_FILE.exists():
        try:
            with open(STATE_FILE) as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {"synced_ids": []}


def save_sync_state(state: dict):
    """Persist sync state."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


def artifact_to_markdown(artifact: dict) -> str:
    """Convert a single artifact dict to Obsidian Markdown with YAML frontmatter."""
    artifact_id = artifact.get("artifact_id", "unknown")
    artifact_type = artifact.get("artifact_type", "unknown")
    producer = artifact.get("producer_agent", "unknown")
    skill = artifact.get("skill_used", "unknown")
    timestamp = artifact.get("timestamp", "")
    investigation_id = artifact.get("investigation_id", "")
    quality = artifact.get("result_quality", "unknown")
    parents = artifact.get("parent_artifact_ids", [])
    needs = artifact.get("needs", [])
    payload = artifact.get("payload", {})

    # Parse timestamp for display
    try:
        dt = datetime.fromisoformat(timestamp)
        date_str = dt.strftime("%Y-%m-%d")
        time_str = dt.strftime("%H:%M:%S")
    except (ValueError, TypeError):
        date_str = "unknown"
        time_str = "unknown"

    # Build tags
    tags = [f"scienceclaw/{artifact_type}", f"agent/{producer}", f"skill/{skill}"]
    if quality and quality != "ok":
        tags.append(f"quality/{quality}")

    # YAML frontmatter
    frontmatter_lines = [
        "---",
        f"artifact_id: {artifact_id}",
        f"artifact_type: {artifact_type}",
        f"producer_agent: {producer}",
        f"skill_used: {skill}",
        f"date: {date_str}",
        f"timestamp: {timestamp}",
        f"result_quality: {quality}",
    ]
    if investigation_id:
        frontmatter_lines.append(f"investigation_id: {investigation_id}")
    if parents:
        frontmatter_lines.append(f"parent_artifacts: {json.dumps(parents)}")
    frontmatter_lines.append(f"tags: {json.dumps(tags)}")
    frontmatter_lines.append("---")

    # Body
    body_lines = [
        f"# {artifact_type.replace('_', ' ').title()}",
        "",
        f"**Agent:** [[{producer}]]  ",
        f"**Skill:** `{skill}`  ",
        f"**Date:** {date_str} {time_str}  ",
        f"**Quality:** {quality}  ",
    ]

    if investigation_id:
        body_lines.append(f"**Investigation:** `{investigation_id}`  ")

    if parents:
        body_lines.append("")
        body_lines.append("## Lineage")
        for pid in parents:
            body_lines.append(f"- Parent: `{pid}`")

    # Payload section
    body_lines.append("")
    body_lines.append("## Payload")
    body_lines.append("")

    if isinstance(payload, dict):
        _render_payload(payload, body_lines)
    else:
        body_lines.append(f"```json\n{json.dumps(payload, indent=2, default=str)}\n```")

    # Needs / knowledge gaps
    if needs:
        body_lines.append("")
        body_lines.append("## Knowledge Gaps")
        for need in needs:
            if isinstance(need, dict):
                entity = need.get("entity", "unknown")
                context = need.get("context", "")
                body_lines.append(f"- **{entity}**: {context}")
            else:
                body_lines.append(f"- {need}")

    return "\n".join(frontmatter_lines) + "\n\n" + "\n".join(body_lines) + "\n"


def _render_payload(payload: dict, lines: list, depth: int = 0):
    """Recursively render payload as readable Markdown."""
    for key, value in payload.items():
        label = key.replace("_", " ").title()
        if isinstance(value, dict):
            lines.append(f"{'  ' * depth}### {label}")
            _render_payload(value, lines, depth + 1)
        elif isinstance(value, list):
            lines.append(f"{'  ' * depth}**{label}:**")
            for item in value[:20]:  # cap list rendering
                if isinstance(item, dict):
                    summary = ", ".join(f"{k}: {v}" for k, v in list(item.items())[:4])
                    lines.append(f"{'  ' * depth}- {summary}")
                else:
                    lines.append(f"{'  ' * depth}- {item}")
            if len(value) > 20:
                lines.append(f"{'  ' * depth}- ... and {len(value) - 20} more")
        else:
            lines.append(f"{'  ' * depth}**{label}:** {value}  ")


def sync_artifacts(artifacts_dir: Path, vault_dir: Path, state: dict) -> int:
    """Scan for new artifacts and write Obsidian notes. Returns count of new notes."""
    synced = set(state.get("synced_ids", []))
    notes_dir = vault_dir / "ScienceClaw Artifacts"
    notes_dir.mkdir(parents=True, exist_ok=True)

    new_count = 0

    # Scan all agent store files
    for store_file in sorted(artifacts_dir.glob("*/store.jsonl")):
        agent_name = store_file.parent.name
        agent_dir = notes_dir / agent_name
        agent_dir.mkdir(parents=True, exist_ok=True)

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

                # Generate note
                md_content = artifact_to_markdown(artifact)
                atype = artifact.get("artifact_type", "unknown")
                filename = f"{slugify(atype)}-{aid[:8]}.md"
                note_path = agent_dir / filename

                note_path.write_text(md_content, encoding="utf-8")
                synced.add(aid)
                new_count += 1

    # Also scan global_index.jsonl for any artifacts not in per-agent stores
    global_index = artifacts_dir / "global_index.jsonl"
    if global_index.exists():
        with open(global_index) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                aid = entry.get("artifact_id", "")
                if aid and aid not in synced:
                    # Minimal index entry — write a stub note
                    producer = entry.get("producer_agent", "unknown")
                    agent_dir = notes_dir / producer
                    agent_dir.mkdir(parents=True, exist_ok=True)
                    md_content = artifact_to_markdown(entry)
                    atype = entry.get("artifact_type", "index_entry")
                    filename = f"{slugify(atype)}-{aid[:8]}.md"
                    (agent_dir / filename).write_text(md_content, encoding="utf-8")
                    synced.add(aid)
                    new_count += 1

    state["synced_ids"] = sorted(synced)
    return new_count


def main():
    parser = argparse.ArgumentParser(description="Sync ScienceClaw artifacts to Obsidian vault")
    parser.add_argument("--vault", type=Path, default=DEFAULT_VAULT_DIR,
                        help=f"Obsidian vault path (default: {DEFAULT_VAULT_DIR})")
    parser.add_argument("--artifacts", type=Path, default=DEFAULT_ARTIFACTS_DIR,
                        help=f"Artifacts directory (default: {DEFAULT_ARTIFACTS_DIR})")
    parser.add_argument("--once", action="store_true", help="Sync once and exit")
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL,
                        help=f"Poll interval in seconds (default: {POLL_INTERVAL})")
    args = parser.parse_args()

    vault_dir = args.vault.expanduser().resolve()
    artifacts_dir = args.artifacts.expanduser().resolve()

    if not artifacts_dir.exists():
        print(f"Artifacts directory not found: {artifacts_dir}")
        return 1

    vault_dir.mkdir(parents=True, exist_ok=True)
    print(f"ScienceClaw Vault Sync")
    print(f"  Artifacts: {artifacts_dir}")
    print(f"  Vault:     {vault_dir}")
    print()

    state = load_sync_state()

    if args.once:
        count = sync_artifacts(artifacts_dir, vault_dir, state)
        save_sync_state(state)
        print(f"Synced {count} new artifact(s) to vault.")
        return 0

    # Watch mode
    print(f"Watching for new artifacts (every {args.interval}s)... Press Ctrl+C to stop.")
    try:
        while True:
            count = sync_artifacts(artifacts_dir, vault_dir, state)
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

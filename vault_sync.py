#!/usr/bin/env python3
"""
ScienceClaw → Obsidian Vault Sync (Enhanced)

Watches ~/.scienceclaw/artifacts/ for new artifacts and converts them into
Obsidian Markdown notes with YAML frontmatter, saving to the Quantum Distillery vault.

Features:
  - Dataview-compatible YAML fields (status, priority, review_date)
  - Daily index note (ScienceClaw-Daily-YYYY-MM-DD.md)
  - Wikilink cross-references between related artifacts (shared tags)
  - MOC (Map of Content) auto-generator per agent

Usage:
    python3 vault_sync.py                          # Watch mode (continuous)
    python3 vault_sync.py --once                   # One-shot sync
    python3 vault_sync.py --vault ~/my-vault       # Custom vault path
"""

import argparse
import json
import re
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

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
    return {"synced_ids": [], "daily_notes": [], "moc_versions": {}}


def save_sync_state(state: dict):
    """Persist sync state."""
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)


# ── Tag index for cross-referencing ──────────────────────────────────────────

class TagIndex:
    """Tracks artifact→tags and tag→artifacts for wikilink cross-references."""

    def __init__(self):
        self.tag_to_artifacts: dict[str, list[str]] = defaultdict(list)
        self.artifact_to_tags: dict[str, list[str]] = {}
        self.artifact_to_filename: dict[str, str] = {}
        self.artifact_to_agent: dict[str, str] = {}
        self.artifact_to_type: dict[str, str] = {}
        self.artifact_to_date: dict[str, str] = {}
        self.artifact_to_investigation: dict[str, str] = {}

    def add(self, artifact_id: str, tags: list[str], filename: str,
            agent: str, atype: str, date: str, investigation_id: str = ""):
        self.artifact_to_tags[artifact_id] = tags
        self.artifact_to_filename[artifact_id] = filename
        self.artifact_to_agent[artifact_id] = agent
        self.artifact_to_type[artifact_id] = atype
        self.artifact_to_date[artifact_id] = date
        self.artifact_to_investigation[artifact_id] = investigation_id
        for tag in tags:
            if artifact_id not in self.tag_to_artifacts[tag]:
                self.tag_to_artifacts[tag].append(artifact_id)

    def related(self, artifact_id: str, max_results: int = 8) -> list[str]:
        """Find artifacts sharing tags with the given artifact."""
        my_tags = set(self.artifact_to_tags.get(artifact_id, []))
        if not my_tags:
            return []
        scores: dict[str, int] = defaultdict(int)
        for tag in my_tags:
            for other_id in self.tag_to_artifacts.get(tag, []):
                if other_id != artifact_id:
                    scores[other_id] += 1
        ranked = sorted(scores, key=lambda x: scores[x], reverse=True)
        return ranked[:max_results]


# ── Artifact → Markdown ─────────────────────────────────────────────────────

def artifact_to_markdown(artifact: dict, tag_index: TagIndex | None = None) -> str:
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

    # Parse timestamp
    try:
        dt = datetime.fromisoformat(timestamp)
        date_str = dt.strftime("%Y-%m-%d")
        time_str = dt.strftime("%H:%M:%S")
    except (ValueError, TypeError):
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        time_str = "unknown"

    # Compute review_date (7 days after artifact)
    try:
        dt = datetime.fromisoformat(timestamp)
        from datetime import timedelta
        review_dt = dt + timedelta(days=7)
        review_date = review_dt.strftime("%Y-%m-%d")
    except (ValueError, TypeError):
        review_date = ""

    # Build tags
    tags = [f"scienceclaw/{artifact_type}", f"agent/{producer}", f"skill/{skill}"]
    if quality and quality != "ok":
        tags.append(f"quality/{quality}")
    if investigation_id:
        tags.append(f"investigation/{slugify(investigation_id, 40)}")

    # Priority heuristic: synthesis > results > metadata
    if "synthesis" in artifact_type:
        priority = "high"
    elif artifact_type in ("pubmed_results", "protein_data", "compound_data", "web_content"):
        priority = "medium"
    else:
        priority = "low"

    # Status based on quality
    status_map = {"ok": "reviewed", "empty": "needs-review", "error": "flagged"}
    status = status_map.get(quality, "pending")

    # ── YAML frontmatter (Dataview-compatible) ──
    frontmatter_lines = [
        "---",
        f"artifact_id: \"{artifact_id}\"",
        f"artifact_type: {artifact_type}",
        f"producer_agent: {producer}",
        f"skill_used: {skill}",
        f"date: {date_str}",
        f"timestamp: \"{timestamp}\"",
        f"result_quality: {quality}",
        f"status: {status}",
        f"priority: {priority}",
    ]
    if review_date:
        frontmatter_lines.append(f"review_date: {review_date}")
    if investigation_id:
        frontmatter_lines.append(f"investigation_id: \"{investigation_id}\"")
    if parents:
        frontmatter_lines.append(f"parent_artifacts: {json.dumps(parents)}")
    frontmatter_lines.append(f"tags: {json.dumps(tags)}")
    frontmatter_lines.append("---")

    # ── Body ──
    body_lines = [
        f"# {artifact_type.replace('_', ' ').title()}",
        "",
        f"**Agent:** [[{producer}]]  ",
        f"**Skill:** `{skill}`  ",
        f"**Date:** {date_str} {time_str}  ",
        f"**Quality:** {quality}  ",
        f"**Status:** `{status}` | **Priority:** `{priority}`  ",
    ]

    if investigation_id:
        body_lines.append(f"**Investigation:** `{investigation_id}`  ")

    # Cross-references via shared tags
    if tag_index:
        related_ids = tag_index.related(artifact_id)
        if related_ids:
            body_lines.append("")
            body_lines.append("## Related Artifacts")
            for rid in related_ids:
                fname = tag_index.artifact_to_filename.get(rid, rid[:8])
                rtype = tag_index.artifact_to_type.get(rid, "unknown")
                ragent = tag_index.artifact_to_agent.get(rid, "")
                # Wikilink to the note (without .md extension)
                link_name = fname.replace(".md", "")
                shared = set(tag_index.artifact_to_tags.get(artifact_id, [])) & \
                         set(tag_index.artifact_to_tags.get(rid, []))
                shared_str = ", ".join(sorted(shared)[:3])
                body_lines.append(
                    f"- [[{ragent}/{link_name}|{rtype.replace('_', ' ').title()}]] "
                    f"(shared: {shared_str})"
                )

    # Lineage
    if parents:
        body_lines.append("")
        body_lines.append("## Lineage")
        for pid in parents:
            if tag_index and pid in tag_index.artifact_to_filename:
                fname = tag_index.artifact_to_filename[pid].replace(".md", "")
                pagent = tag_index.artifact_to_agent.get(pid, "")
                body_lines.append(f"- Parent: [[{pagent}/{fname}|{pid[:8]}]]")
            else:
                body_lines.append(f"- Parent: `{pid}`")

    # Payload
    body_lines.append("")
    body_lines.append("## Payload")
    body_lines.append("")

    if isinstance(payload, dict):
        _render_payload(payload, body_lines)
    else:
        body_lines.append(f"```json\n{json.dumps(payload, indent=2, default=str)}\n```")

    # Knowledge gaps
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

    # Dataview query block for related items
    body_lines.extend([
        "",
        "## Dataview Queries",
        "",
        "```dataview",
        "TABLE artifact_type, skill_used, status, priority",
        f"FROM \"ScienceClaw Artifacts/{producer}\"",
        f"WHERE investigation_id = \"{investigation_id}\"" if investigation_id else "WHERE producer_agent = \"{producer}\"",
        "SORT date DESC",
        "LIMIT 20",
        "```",
    ])

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
            for item in value[:20]:
                if isinstance(item, dict):
                    summary = ", ".join(f"{k}: {v}" for k, v in list(item.items())[:4])
                    lines.append(f"{'  ' * depth}- {summary}")
                else:
                    lines.append(f"{'  ' * depth}- {item}")
            if len(value) > 20:
                lines.append(f"{'  ' * depth}- ... and {len(value) - 20} more")
        else:
            lines.append(f"{'  ' * depth}**{label}:** {value}  ")


# ── Daily Index Note ─────────────────────────────────────────────────────────

def generate_daily_index(vault_dir: Path, tag_index: TagIndex, today: str):
    """Generate ScienceClaw-Daily-YYYY-MM-DD.md listing all artifacts synced today."""
    notes_dir = vault_dir / "ScienceClaw Artifacts"
    notes_dir.mkdir(parents=True, exist_ok=True)

    # Collect today's artifacts
    todays_artifacts = []
    for aid, date in tag_index.artifact_to_date.items():
        if date == today:
            todays_artifacts.append(aid)

    if not todays_artifacts:
        return

    lines = [
        "---",
        f"date: {today}",
        "type: daily-index",
        f"tags: [\"scienceclaw/daily-index\", \"date/{today}\"]",
        f"artifact_count: {len(todays_artifacts)}",
        "---",
        "",
        f"# ScienceClaw Daily Index — {today}",
        "",
        f"**Artifacts synced:** {len(todays_artifacts)}",
        "",
    ]

    # Group by agent
    by_agent: dict[str, list[str]] = defaultdict(list)
    for aid in todays_artifacts:
        agent = tag_index.artifact_to_agent.get(aid, "unknown")
        by_agent[agent].append(aid)

    for agent in sorted(by_agent):
        lines.append(f"## [[{agent}]]")
        lines.append("")
        lines.append("| Artifact | Type | Skill | Quality |")
        lines.append("|----------|------|-------|---------|")
        for aid in by_agent[agent]:
            fname = tag_index.artifact_to_filename.get(aid, aid[:8])
            atype = tag_index.artifact_to_type.get(aid, "unknown")
            # Recover skill from tags
            atags = tag_index.artifact_to_tags.get(aid, [])
            skill = "unknown"
            for t in atags:
                if t.startswith("skill/"):
                    skill = t.split("/", 1)[1]
                    break
            link = fname.replace(".md", "")
            quality_tag = "ok"
            for t in atags:
                if t.startswith("quality/"):
                    quality_tag = t.split("/", 1)[1]
                    break
            lines.append(f"| [[{agent}/{link}\\|{atype}]] | {atype} | `{skill}` | {quality_tag} |")
        lines.append("")

    # Dataview block for the day
    lines.extend([
        "## All Artifacts Today",
        "",
        "```dataview",
        "TABLE producer_agent AS Agent, artifact_type AS Type, skill_used AS Skill, status, priority",
        "FROM \"ScienceClaw Artifacts\"",
        f"WHERE date = date(\"{today}\")",
        "SORT timestamp DESC",
        "```",
    ])

    daily_path = notes_dir / f"ScienceClaw-Daily-{today}.md"
    daily_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ── Agent MOC (Map of Content) ───────────────────────────────────────────────

def generate_agent_moc(vault_dir: Path, agent_name: str, tag_index: TagIndex):
    """Generate or update the MOC for a given agent."""
    notes_dir = vault_dir / "ScienceClaw Artifacts" / agent_name
    notes_dir.mkdir(parents=True, exist_ok=True)

    # Collect this agent's artifacts
    agent_artifacts = [
        aid for aid, agent in tag_index.artifact_to_agent.items()
        if agent == agent_name
    ]

    if not agent_artifacts:
        return

    # Group by type
    by_type: dict[str, list[str]] = defaultdict(list)
    by_investigation: dict[str, list[str]] = defaultdict(list)
    for aid in agent_artifacts:
        atype = tag_index.artifact_to_type.get(aid, "unknown")
        by_type[atype].append(aid)
        inv = tag_index.artifact_to_investigation.get(aid, "")
        if inv:
            by_investigation[inv].append(aid)

    # Build all unique tags for this agent
    all_tags = set()
    for aid in agent_artifacts:
        all_tags.update(tag_index.artifact_to_tags.get(aid, []))

    lines = [
        "---",
        f"agent: {agent_name}",
        "type: moc",
        f"artifact_count: {len(agent_artifacts)}",
        f"tags: [\"scienceclaw/moc\", \"agent/{agent_name}\"]",
        f"last_updated: \"{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}\"",
        "---",
        "",
        f"# {agent_name} — Map of Content",
        "",
        f"**Total Artifacts:** {len(agent_artifacts)}  ",
        f"**Artifact Types:** {len(by_type)}  ",
        f"**Investigations:** {len(by_investigation)}  ",
        "",
    ]

    # By investigation
    if by_investigation:
        lines.append("## Investigations")
        lines.append("")
        for inv_id in sorted(by_investigation):
            inv_artifacts = by_investigation[inv_id]
            lines.append(f"### {inv_id}")
            lines.append("")
            for aid in inv_artifacts:
                fname = tag_index.artifact_to_filename.get(aid, aid[:8])
                atype = tag_index.artifact_to_type.get(aid, "unknown")
                link = fname.replace(".md", "")
                date = tag_index.artifact_to_date.get(aid, "")
                lines.append(f"- [[{agent_name}/{link}|{atype.replace('_', ' ').title()}]] ({date})")
            lines.append("")

    # By type
    lines.append("## By Type")
    lines.append("")
    for atype in sorted(by_type):
        aids = by_type[atype]
        lines.append(f"### {atype.replace('_', ' ').title()} ({len(aids)})")
        lines.append("")
        for aid in aids:
            fname = tag_index.artifact_to_filename.get(aid, aid[:8])
            link = fname.replace(".md", "")
            date = tag_index.artifact_to_date.get(aid, "")
            lines.append(f"- [[{agent_name}/{link}]] ({date})")
        lines.append("")

    # Dataview overview
    lines.extend([
        "## Full Artifact Table",
        "",
        "```dataview",
        "TABLE artifact_type AS Type, skill_used AS Skill, status, priority, review_date AS Review",
        f"FROM \"ScienceClaw Artifacts/{agent_name}\"",
        "WHERE type != \"moc\"",
        "SORT date DESC",
        "```",
        "",
        "## Pending Review",
        "",
        "```dataview",
        "TABLE artifact_type AS Type, date, review_date",
        f"FROM \"ScienceClaw Artifacts/{agent_name}\"",
        "WHERE status = \"needs-review\" OR status = \"pending\"",
        "SORT review_date ASC",
        "```",
    ])

    moc_path = notes_dir / f"{agent_name}-MOC.md"
    moc_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


# ── Main sync logic ─────────────────────────────────────────────────────────

def sync_artifacts(artifacts_dir: Path, vault_dir: Path, state: dict) -> int:
    """Scan for new artifacts and write Obsidian notes. Returns count of new notes."""
    synced = set(state.get("synced_ids", []))
    notes_dir = vault_dir / "ScienceClaw Artifacts"
    notes_dir.mkdir(parents=True, exist_ok=True)

    # First pass: build tag index from ALL artifacts (including already-synced)
    tag_index = TagIndex()
    all_artifacts: list[dict] = []
    new_artifacts: list[dict] = []
    agents_seen: set[str] = set()

    for store_file in sorted(artifacts_dir.glob("*/store.jsonl")):
        agent_name = store_file.parent.name
        agents_seen.add(agent_name)
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
                if not aid:
                    continue

                atype = artifact.get("artifact_type", "unknown")
                producer = artifact.get("producer_agent", agent_name)
                skill = artifact.get("skill_used", "unknown")
                timestamp = artifact.get("timestamp", "")
                investigation_id = artifact.get("investigation_id", "")
                quality = artifact.get("result_quality", "unknown")

                try:
                    dt = datetime.fromisoformat(timestamp)
                    date_str = dt.strftime("%Y-%m-%d")
                except (ValueError, TypeError):
                    date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

                tags = [f"scienceclaw/{atype}", f"agent/{producer}", f"skill/{skill}"]
                if quality and quality != "ok":
                    tags.append(f"quality/{quality}")
                if investigation_id:
                    tags.append(f"investigation/{slugify(investigation_id, 40)}")

                filename = f"{slugify(atype)}-{aid[:8]}.md"
                tag_index.add(aid, tags, filename, producer, atype, date_str, investigation_id)
                all_artifacts.append(artifact)

                if aid not in synced:
                    new_artifacts.append(artifact)

    # Also scan global_index.jsonl
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
                if aid and aid not in synced and aid not in tag_index.artifact_to_tags:
                    producer = entry.get("producer_agent", "unknown")
                    atype = entry.get("artifact_type", "index_entry")
                    timestamp = entry.get("timestamp", "")
                    try:
                        dt = datetime.fromisoformat(timestamp)
                        date_str = dt.strftime("%Y-%m-%d")
                    except (ValueError, TypeError):
                        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
                    tags = [f"scienceclaw/{atype}", f"agent/{producer}"]
                    filename = f"{slugify(atype)}-{aid[:8]}.md"
                    tag_index.add(aid, tags, filename, producer, atype, date_str)
                    new_artifacts.append(entry)

    # Second pass: write new notes with cross-references
    new_count = 0
    for artifact in new_artifacts:
        aid = artifact.get("artifact_id", "")
        producer = artifact.get("producer_agent",
                                tag_index.artifact_to_agent.get(aid, "unknown"))
        agent_dir = notes_dir / producer
        agent_dir.mkdir(parents=True, exist_ok=True)

        md_content = artifact_to_markdown(artifact, tag_index)
        filename = tag_index.artifact_to_filename.get(aid, f"{aid[:8]}.md")
        note_path = agent_dir / filename
        note_path.write_text(md_content, encoding="utf-8")
        synced.add(aid)
        new_count += 1

    # Generate daily index for today
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    generate_daily_index(vault_dir, tag_index, today)

    # Generate/update MOC for each agent
    for agent in agents_seen:
        generate_agent_moc(vault_dir, agent, tag_index)

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
    print(f"ScienceClaw Vault Sync (Enhanced)")
    print(f"  Artifacts: {artifacts_dir}")
    print(f"  Vault:     {vault_dir}")
    print(f"  Features:  Dataview fields, daily index, MOC, cross-references")
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

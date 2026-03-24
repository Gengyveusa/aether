#!/usr/bin/env python3
"""
ScienceClaw Heartbeat Daemon — Enhanced for Delphi Mission

Pings the Infinite platform, reports agent health metrics, tracks mission
progress, and coordinates multi-agent artifact production.

Enhancements over v1:
  - Exponential backoff retry on network failures (up to 4 retries)
  - Per-agent health scoring (artifact velocity, investigation depth, freshness)
  - Delphi mission progress tracking (architecture coverage, deadline countdown)
  - Structured JSON logging alongside human-readable console output
  - Knowledge graph statistics per agent
  - Graceful degradation when platform is unreachable

Usage:
    python3 heartbeat.py                        # Default: 5-minute interval, all agents
    python3 heartbeat.py --interval 10          # 10-minute interval
    python3 heartbeat.py --agent Coherence-1    # Single agent only
    python3 heartbeat.py --once                 # Single ping and exit
    python3 heartbeat.py --status               # Print mission status dashboard
    python3 heartbeat.py --mission-report       # Generate markdown mission report
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Optional

CONFIG_DIR = Path.home() / ".scienceclaw"
PROFILES_DIR = CONFIG_DIR / "profiles"
ARTIFACTS_DIR = CONFIG_DIR / "artifacts"
KNOWLEDGE_DIR = CONFIG_DIR / "knowledge"
HEARTBEAT_LOG = CONFIG_DIR / "heartbeat.log"
STRUCTURED_LOG = CONFIG_DIR / "heartbeat_structured.jsonl"
MISSION_STATE = CONFIG_DIR / "delphi_mission_state.json"
DEFAULT_INTERVAL = 300  # 5 minutes
MAX_RETRIES = 4
DELPHI_DEADLINE = datetime(2026, 4, 8, tzinfo=timezone.utc)

# Add scienceclaw root to path for imports
_ROOT = Path(__file__).resolve().parent
if (_ROOT / "scienceclaw").exists():
    _ROOT = _ROOT / "scienceclaw"
sys.path.insert(0, str(_ROOT))


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

def log(msg: str, level: str = "INFO"):
    """Log with timestamp to console and file."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] [{level}] {msg}"
    print(line)
    try:
        with open(HEARTBEAT_LOG, "a") as f:
            f.write(line + "\n")
    except OSError:
        pass


def log_structured(event: str, data: dict):
    """Append a structured JSON log entry for machine consumption."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": event,
        **data,
    }
    try:
        STRUCTURED_LOG.parent.mkdir(parents=True, exist_ok=True)
        with open(STRUCTURED_LOG, "a") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    except OSError:
        pass


# ---------------------------------------------------------------------------
# Agent Discovery
# ---------------------------------------------------------------------------

def discover_agents(agent_filter: Optional[str] = None) -> list[dict]:
    """Find all configured agent profiles."""
    agents = []

    # Check per-agent profiles
    if PROFILES_DIR.exists():
        for agent_dir in sorted(PROFILES_DIR.iterdir()):
            profile_file = agent_dir / "agent_profile.json"
            if profile_file.exists():
                try:
                    with open(profile_file) as f:
                        profile = json.load(f)
                    agents.append(profile)
                except (json.JSONDecodeError, OSError):
                    log(f"  WARNING: Could not read {profile_file}", "WARN")

    # Fallback: default profile
    if not agents:
        default = CONFIG_DIR / "agent_profile.json"
        if default.exists():
            try:
                with open(default) as f:
                    agents.append(json.load(f))
            except (json.JSONDecodeError, OSError):
                pass

    if agent_filter:
        agents = [a for a in agents if a.get("name") == agent_filter]

    return agents


# ---------------------------------------------------------------------------
# Health Metrics
# ---------------------------------------------------------------------------

def count_artifacts(agent_name: str) -> int:
    """Count artifacts for a given agent."""
    store = ARTIFACTS_DIR / agent_name / "store.jsonl"
    if not store.exists():
        return 0
    try:
        with open(store) as f:
            return sum(1 for line in f if line.strip())
    except OSError:
        return 0


def get_latest_artifact_timestamp(agent_name: str) -> Optional[str]:
    """Get the timestamp of the most recent artifact."""
    store = ARTIFACTS_DIR / agent_name / "store.jsonl"
    if not store.exists():
        return None
    last_ts = None
    try:
        with open(store) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                    last_ts = obj.get("timestamp", last_ts)
                except json.JSONDecodeError:
                    pass
    except OSError:
        pass
    return last_ts


def count_investigations(agent_name: str) -> dict:
    """Count active and completed investigations for an agent."""
    tracker_file = CONFIG_DIR / "investigations" / agent_name / "tracker.json"
    if not tracker_file.exists():
        return {"active": 0, "completed": 0, "total": 0}
    try:
        with open(tracker_file) as f:
            data = json.load(f)
        investigations = data.get("investigations", {})
        active = sum(1 for inv in investigations.values()
                     if inv.get("status") in ("active", "in_progress"))
        completed = sum(1 for inv in investigations.values()
                        if inv.get("status") == "completed")
        return {"active": active, "completed": completed, "total": len(investigations)}
    except (json.JSONDecodeError, OSError):
        return {"active": 0, "completed": 0, "total": 0}


def get_knowledge_graph_stats(agent_name: str) -> dict:
    """Get knowledge graph node/edge counts for an agent."""
    graph_file = KNOWLEDGE_DIR / agent_name / "graph.json"
    if not graph_file.exists():
        return {"nodes": 0, "edges": 0}
    try:
        with open(graph_file) as f:
            graph = json.load(f)
        return {
            "nodes": len(graph.get("nodes", {})),
            "edges": len(graph.get("edges", [])),
        }
    except (json.JSONDecodeError, OSError):
        return {"nodes": 0, "edges": 0}


def compute_agent_health(agent_name: str, profile: dict) -> dict:
    """Compute comprehensive health metrics for an agent."""
    artifact_count = count_artifacts(agent_name)
    latest_ts = get_latest_artifact_timestamp(agent_name)
    investigations = count_investigations(agent_name)
    kg_stats = get_knowledge_graph_stats(agent_name)
    tools = profile.get("preferences", {}).get("tools", [])
    community = profile.get("community", "science")

    # Freshness score: hours since last artifact (lower is better)
    freshness_hours = None
    if latest_ts:
        try:
            last_dt = datetime.fromisoformat(latest_ts.replace("Z", "+00:00"))
            delta = datetime.now(timezone.utc) - last_dt
            freshness_hours = round(delta.total_seconds() / 3600, 1)
        except (ValueError, TypeError):
            pass

    # Mission context
    delphi_meta = profile.get("delphi_metadata", {})
    architecture = delphi_meta.get("architecture", "unknown")

    return {
        "agent": agent_name,
        "artifact_count": artifact_count,
        "latest_artifact": latest_ts,
        "freshness_hours": freshness_hours,
        "investigations": investigations,
        "knowledge_graph": kg_stats,
        "tools": tools,
        "tool_count": len(tools),
        "community": community,
        "architecture": architecture,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ---------------------------------------------------------------------------
# Platform Ping with Exponential Backoff
# ---------------------------------------------------------------------------

def get_infinite_config() -> dict:
    """Load Infinite platform config."""
    config_file = CONFIG_DIR / "infinite_config.json"
    if config_file.exists():
        try:
            with open(config_file) as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            pass
    return {}


def ping_agent_with_retry(
    agent_name: str,
    health: dict,
    infinite_config: dict,
    max_retries: int = MAX_RETRIES,
) -> dict:
    """Send heartbeat ping with exponential backoff retry."""
    try:
        import requests
    except ImportError:
        log(f"  {agent_name}: requests library not available — skipping ping", "WARN")
        return {**health, "status": "no_requests_lib"}

    api_base = infinite_config.get("api_base", "https://infinite-lamm.vercel.app")
    api_key = infinite_config.get("api_key", "")

    result = {**health, "status": "unknown"}

    if not api_key:
        result["status"] = "no_api_key"
        log(f"  {agent_name}: No Infinite API key — local-only mode")
        return result

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "agent_name": agent_name,
        "status": "alive",
        "artifact_count": health["artifact_count"],
        "tools": health["tools"],
        "community": health["community"],
        "timestamp": health["timestamp"],
        "health_metrics": {
            "freshness_hours": health.get("freshness_hours"),
            "investigations": health.get("investigations"),
            "knowledge_graph": health.get("knowledge_graph"),
            "architecture": health.get("architecture"),
        },
    }

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            resp = requests.post(
                f"{api_base}/api/agents/heartbeat",
                json=payload,
                headers=headers,
                timeout=15,
            )
            if resp.status_code in (200, 201, 204):
                result["status"] = "ok"
                log(f"  {agent_name}: OK (artifacts={health['artifact_count']}, "
                    f"kg_nodes={health['knowledge_graph']['nodes']}, "
                    f"investigations={health['investigations']['total']})")
                return result
            else:
                result["status"] = f"http_{resp.status_code}"
                last_error = f"HTTP {resp.status_code} — {resp.text[:120]}"
                if resp.status_code < 500:
                    # Client error — don't retry
                    break
        except requests.exceptions.ConnectionError as e:
            last_error = f"Connection error: {e}"
            result["status"] = "connection_error"
        except requests.exceptions.Timeout:
            last_error = "Timeout"
            result["status"] = "timeout"
        except Exception as e:
            last_error = f"{type(e).__name__}: {e}"
            result["status"] = "error"

        if attempt < max_retries:
            wait = 2 ** (attempt + 1)  # 2s, 4s, 8s, 16s
            log(f"  {agent_name}: Retry {attempt + 1}/{max_retries} in {wait}s — {last_error}", "WARN")
            time.sleep(wait)

    log(f"  {agent_name}: FAILED after {max_retries + 1} attempts — {last_error}", "ERROR")
    return result


# ---------------------------------------------------------------------------
# Heartbeat Cycle
# ---------------------------------------------------------------------------

def heartbeat_cycle(agents: list[dict], infinite_config: dict) -> list[dict]:
    """Run one heartbeat cycle for all agents with enhanced metrics."""
    cycle_start = datetime.now(timezone.utc)
    days_remaining = (DELPHI_DEADLINE - cycle_start).days

    log(f"Heartbeat cycle — {len(agents)} agent(s) | "
        f"Delphi T-{days_remaining} days")

    results = []
    total_artifacts = 0
    total_kg_nodes = 0

    for profile in agents:
        name = profile.get("name", "unknown")
        health = compute_agent_health(name, profile)
        result = ping_agent_with_retry(name, health, infinite_config)
        results.append(result)
        total_artifacts += health["artifact_count"]
        total_kg_nodes += health["knowledge_graph"]["nodes"]

    # Write enhanced state
    state_file = CONFIG_DIR / "heartbeat_state.json"
    state = {
        "last_heartbeat": cycle_start.isoformat(),
        "delphi_deadline": DELPHI_DEADLINE.isoformat(),
        "days_remaining": days_remaining,
        "agents": {},
        "total_artifacts": total_artifacts,
        "total_kg_nodes": total_kg_nodes,
        "cycle_duration_ms": int((datetime.now(timezone.utc) - cycle_start).total_seconds() * 1000),
    }
    for r in results:
        state["agents"][r["agent"]] = {
            "status": r["status"],
            "artifact_count": r["artifact_count"],
            "architecture": r.get("architecture", "unknown"),
            "freshness_hours": r.get("freshness_hours"),
            "investigations": r.get("investigations", {}),
            "knowledge_graph": r.get("knowledge_graph", {}),
        }

    try:
        with open(state_file, "w") as f:
            json.dump(state, f, indent=2)
    except OSError:
        pass

    # Structured log
    log_structured("heartbeat_cycle", {
        "agent_count": len(agents),
        "total_artifacts": total_artifacts,
        "total_kg_nodes": total_kg_nodes,
        "days_remaining": days_remaining,
        "statuses": {r["agent"]: r["status"] for r in results},
    })

    # Summary line
    ok_count = sum(1 for r in results if r["status"] == "ok")
    log(f"  Summary: {ok_count}/{len(results)} agents OK | "
        f"{total_artifacts} artifacts | {total_kg_nodes} KG nodes | "
        f"T-{days_remaining}d to Delphi deadline")

    return results


# ---------------------------------------------------------------------------
# Mission Status Dashboard
# ---------------------------------------------------------------------------

def print_mission_status():
    """Print the Delphi mission status dashboard."""
    now = datetime.now(timezone.utc)
    days_remaining = (DELPHI_DEADLINE - now).days
    hours_remaining = int((DELPHI_DEADLINE - now).total_seconds() / 3600)

    # Load heartbeat state
    state_file = CONFIG_DIR / "heartbeat_state.json"
    state = {}
    if state_file.exists():
        try:
            with open(state_file) as f:
                state = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    agents = state.get("agents", {})

    print()
    print("=" * 72)
    print("  SCIENCECLAW DELPHI MISSION — STATUS DASHBOARD")
    print("=" * 72)
    print()
    print(f"  ARPA-H Delphi Deadline: {DELPHI_DEADLINE.strftime('%Y-%m-%d')}")
    print(f"  Time Remaining:         T-{days_remaining} days ({hours_remaining} hours)")
    print(f"  Last Heartbeat:         {state.get('last_heartbeat', 'never')}")
    print(f"  Total Artifacts:        {state.get('total_artifacts', 0)}")
    print(f"  Total KG Nodes:         {state.get('total_kg_nodes', 0)}")
    print()

    if days_remaining <= 3:
        print("  !!! CRITICAL: DEADLINE IMMINENT !!!")
    elif days_remaining <= 7:
        print("  !! WARNING: LESS THAN 1 WEEK REMAINING !!")
    elif days_remaining <= 14:
        print("  ! NOTICE: 2 WEEKS TO DEADLINE !")
    print()

    # Agent table
    print("  AGENT STATUS")
    print("  " + "-" * 68)
    print(f"  {'Agent':<16} {'Arch':<12} {'Status':<10} {'Artifacts':>9} "
          f"{'KG Nodes':>9} {'Fresh(h)':>9}")
    print("  " + "-" * 68)

    for name, info in sorted(agents.items()):
        # Handle both old format (string) and new format (dict)
        if isinstance(info, str):
            info = {"status": info}
        status_icon = "OK" if info.get("status") == "ok" else str(info.get("status", "?"))[:8]
        arch = str(info.get("architecture", "?"))[:10]
        arts = info.get("artifact_count", 0) if isinstance(info, dict) else 0
        kg_data = info.get("knowledge_graph", {}) if isinstance(info, dict) else {}
        kg = kg_data.get("nodes", 0) if isinstance(kg_data, dict) else 0
        fresh = info.get("freshness_hours") if isinstance(info, dict) else None
        fresh_str = f"{fresh:.1f}" if fresh is not None else "—"

        print(f"  {name:<16} {arch:<12} {status_icon:<10} {arts:>9} "
              f"{kg:>9} {fresh_str:>9}")

    print("  " + "-" * 68)
    print()

    # Architecture coverage
    print("  ARCHITECTURE COVERAGE")
    print("  " + "-" * 68)
    architectures = {
        "FMO": {"agents": [], "artifacts": 0},
        "tunneling": {"agents": [], "artifacts": 0},
        "ETC": {"agents": [], "artifacts": 0},
        "spin": {"agents": [], "artifacts": 0},
    }
    for name, info in agents.items():
        if isinstance(info, str):
            info = {"status": info}
        arch = info.get("architecture", "") if isinstance(info, dict) else ""
        if arch in architectures:
            architectures[arch]["agents"].append(name)
            architectures[arch]["artifacts"] += info.get("artifact_count", 0) if isinstance(info, dict) else 0

    for arch, data in architectures.items():
        agents_str = ", ".join(data["agents"]) if data["agents"] else "(unassigned)"
        bar_len = min(data["artifacts"], 40)
        bar = "#" * bar_len
        print(f"  {arch:<12} [{bar:<40}] {data['artifacts']:>4} artifacts")
        print(f"               Agents: {agents_str}")
    print()
    print("=" * 72)


def generate_mission_report() -> str:
    """Generate a markdown mission status report."""
    now = datetime.now(timezone.utc)
    days_remaining = (DELPHI_DEADLINE - now).days

    state_file = CONFIG_DIR / "heartbeat_state.json"
    state = {}
    if state_file.exists():
        try:
            with open(state_file) as f:
                state = json.load(f)
        except (json.JSONDecodeError, OSError):
            pass

    agents = state.get("agents", {})
    lines = [
        f"# ScienceClaw Delphi Mission Report",
        f"",
        f"**Generated:** {now.strftime('%Y-%m-%d %H:%M UTC')}",
        f"**Deadline:** {DELPHI_DEADLINE.strftime('%Y-%m-%d')} (T-{days_remaining} days)",
        f"**Total Artifacts:** {state.get('total_artifacts', 0)}",
        f"**Total KG Nodes:** {state.get('total_kg_nodes', 0)}",
        f"",
        f"## Agent Status",
        f"",
        f"| Agent | Architecture | Status | Artifacts | KG Nodes | Investigations |",
        f"|-------|-------------|--------|-----------|----------|----------------|",
    ]

    for name, info in sorted(agents.items()):
        if isinstance(info, str):
            info = {"status": info}
        inv = info.get("investigations", {}) if isinstance(info, dict) else {}
        if isinstance(inv, dict):
            inv_str = f"{inv.get('completed', 0)}/{inv.get('total', 0)}"
        else:
            inv_str = "0/0"
        kg_data = info.get("knowledge_graph", {}) if isinstance(info, dict) else {}
        lines.append(
            f"| {name} | {info.get('architecture', '?')} | "
            f"{info.get('status', '?')} | {info.get('artifact_count', 0)} | "
            f"{kg_data.get('nodes', 0) if isinstance(kg_data, dict) else 0} | {inv_str} |"
        )

    lines.extend([
        f"",
        f"## QPI Architecture Coverage",
        f"",
        f"- **FMO Coherence** (w=0.30): NADH/FAD fluorescence lifetime ratios",
        f"- **Enzyme Tunneling** (w=0.25): GSH redox cycling kinetic isotope effects",
        f"- **Mitochondrial ETC** (w=0.30): Complex I/CoQ10/CytC electron transport",
        f"- **Cryptochrome Spin** (w=0.15): Radical pair recombination kinetics",
        f"",
    ])

    report = "\n".join(lines)

    # Save report
    report_dir = CONFIG_DIR / "reports"
    report_dir.mkdir(parents=True, exist_ok=True)
    report_file = report_dir / f"mission_report_{now.strftime('%Y%m%d_%H%M')}.md"
    try:
        with open(report_file, "w") as f:
            f.write(report)
        log(f"Mission report saved: {report_file}")
    except OSError:
        pass

    return report


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="ScienceClaw Heartbeat Daemon — Delphi Mission Enhanced",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 heartbeat.py                     # Continuous monitoring (5m interval)
  python3 heartbeat.py --once              # Single heartbeat cycle
  python3 heartbeat.py --status            # Mission status dashboard
  python3 heartbeat.py --mission-report    # Generate markdown report
  python3 heartbeat.py --agent Coherence-1 # Monitor single agent
        """,
    )
    parser.add_argument("--interval", type=int, default=DEFAULT_INTERVAL,
                        help=f"Ping interval in seconds (default: {DEFAULT_INTERVAL})")
    parser.add_argument("--agent", default=None,
                        help="Ping only this agent (default: all)")
    parser.add_argument("--once", action="store_true",
                        help="Single heartbeat cycle and exit")
    parser.add_argument("--status", action="store_true",
                        help="Print mission status dashboard")
    parser.add_argument("--mission-report", action="store_true",
                        help="Generate markdown mission report")
    args = parser.parse_args()

    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    # Status dashboard
    if args.status:
        print_mission_status()
        return 0

    # Mission report
    if args.mission_report:
        report = generate_mission_report()
        print(report)
        return 0

    # Heartbeat mode
    log("ScienceClaw Heartbeat Daemon starting (Delphi Enhanced)")
    log(f"  Interval: {args.interval}s ({args.interval // 60}m)")
    log(f"  Max retries: {MAX_RETRIES} (exponential backoff)")

    days_remaining = (DELPHI_DEADLINE - datetime.now(timezone.utc)).days
    log(f"  Delphi deadline: {DELPHI_DEADLINE.strftime('%Y-%m-%d')} (T-{days_remaining}d)")

    agents = discover_agents(agent_filter=args.agent)
    if args.agent and not agents:
        log(f"Agent '{args.agent}' not found")
        return 1

    if not agents:
        log("No agents found. Run 'python3 scienceclaw/delphi_profiles.py --deploy' first.")
        return 1

    log(f"  Agents: {', '.join(a.get('name', '?') for a in agents)}")

    infinite_config = get_infinite_config()

    if args.once:
        heartbeat_cycle(agents, infinite_config)
        return 0

    # Continuous mode
    log("Running continuously (Ctrl+C to stop)...")
    try:
        while True:
            heartbeat_cycle(agents, infinite_config)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        log("Heartbeat daemon stopped")
        return 0


if __name__ == "__main__":
    raise SystemExit(main() or 0)

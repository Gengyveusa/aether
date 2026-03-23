#!/usr/bin/env python3
"""
ScienceClaw Heartbeat Daemon

Pings the Infinite platform every N minutes to keep agents registered and alive.
Also reports agent health metrics and artifact counts.

Usage:
    python3 heartbeat.py                    # Default: 5-minute interval, all agents
    python3 heartbeat.py --interval 10      # 10-minute interval
    python3 heartbeat.py --agent BioBot-7   # Single agent only
    python3 heartbeat.py --once             # Single ping and exit
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

CONFIG_DIR = Path.home() / ".scienceclaw"
PROFILES_DIR = CONFIG_DIR / "profiles"
ARTIFACTS_DIR = CONFIG_DIR / "artifacts"
HEARTBEAT_LOG = CONFIG_DIR / "heartbeat.log"
DEFAULT_INTERVAL = 300  # 5 minutes

# Add scienceclaw root to path for imports
_ROOT = Path(__file__).resolve().parent
if (_ROOT / "scienceclaw").exists():
    _ROOT = _ROOT / "scienceclaw"
sys.path.insert(0, str(_ROOT))


def log(msg: str):
    """Log with timestamp."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(HEARTBEAT_LOG, "a") as f:
            f.write(line + "\n")
    except OSError:
        pass


def discover_agents() -> list[dict]:
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
                    log(f"  WARNING: Could not read {profile_file}")

    # Fallback: default profile
    if not agents:
        default = CONFIG_DIR / "agent_profile.json"
        if default.exists():
            try:
                with open(default) as f:
                    agents.append(json.load(f))
            except (json.JSONDecodeError, OSError):
                pass

    return agents


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


def ping_agent(agent_name: str, profile: dict, infinite_config: dict) -> dict:
    """Send heartbeat ping for a single agent."""
    import requests

    artifact_count = count_artifacts(agent_name)
    tools = profile.get("preferences", {}).get("tools", [])
    community = profile.get("community", "science")

    result = {
        "agent": agent_name,
        "artifact_count": artifact_count,
        "tools": tools,
        "community": community,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "unknown",
    }

    api_base = infinite_config.get("api_base", "https://infinite-lamm.vercel.app")
    api_key = infinite_config.get("api_key", "")

    if not api_key:
        result["status"] = "no_api_key"
        log(f"  {agent_name}: No Infinite API key — skipping platform ping")
        return result

    # Ping the Infinite platform
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "agent_name": agent_name,
            "status": "alive",
            "artifact_count": artifact_count,
            "tools": tools,
            "community": community,
            "timestamp": result["timestamp"],
        }
        resp = requests.post(
            f"{api_base}/api/agents/heartbeat",
            json=payload,
            headers=headers,
            timeout=15,
        )
        if resp.status_code in (200, 201, 204):
            result["status"] = "ok"
            log(f"  {agent_name}: OK (artifacts={artifact_count}, tools={len(tools)})")
        else:
            result["status"] = f"http_{resp.status_code}"
            log(f"  {agent_name}: HTTP {resp.status_code} — {resp.text[:120]}")
    except requests.exceptions.ConnectionError:
        result["status"] = "connection_error"
        log(f"  {agent_name}: Connection error (platform may be offline)")
    except requests.exceptions.Timeout:
        result["status"] = "timeout"
        log(f"  {agent_name}: Timeout")
    except Exception as e:
        result["status"] = "error"
        log(f"  {agent_name}: {type(e).__name__}: {e}")

    return result


def heartbeat_cycle(agents: list[dict], infinite_config: dict) -> list[dict]:
    """Run one heartbeat cycle for all agents."""
    log(f"Heartbeat cycle — {len(agents)} agent(s)")
    results = []
    for profile in agents:
        name = profile.get("name", "unknown")
        result = ping_agent(name, profile, infinite_config)
        results.append(result)

    # Write state
    state_file = CONFIG_DIR / "heartbeat_state.json"
    state = {
        "last_heartbeat": datetime.now(timezone.utc).isoformat(),
        "agents": {r["agent"]: r["status"] for r in results},
        "total_artifacts": sum(r["artifact_count"] for r in results),
    }
    try:
        with open(state_file, "w") as f:
            json.dump(state, f, indent=2)
    except OSError:
        pass

    return results


def main():
    parser = argparse.ArgumentParser(description="ScienceClaw Heartbeat Daemon")
    parser.add_argument("--interval", type=int, default=DEFAULT_INTERVAL,
                        help=f"Ping interval in seconds (default: {DEFAULT_INTERVAL})")
    parser.add_argument("--agent", default=None,
                        help="Ping only this agent (default: all)")
    parser.add_argument("--once", action="store_true",
                        help="Single heartbeat cycle and exit")
    args = parser.parse_args()

    CONFIG_DIR.mkdir(parents=True, exist_ok=True)

    log("ScienceClaw Heartbeat Daemon starting")
    log(f"  Interval: {args.interval}s ({args.interval // 60}m)")

    agents = discover_agents()
    if args.agent:
        agents = [a for a in agents if a.get("name") == args.agent]
        if not agents:
            log(f"Agent '{args.agent}' not found")
            return 1

    log(f"  Agents: {', '.join(a.get('name', '?') for a in agents)}")

    infinite_config = get_infinite_config()

    if args.once:
        heartbeat_cycle(agents, infinite_config)
        return 0

    # Continuous mode
    log(f"Running continuously (Ctrl+C to stop)...")
    try:
        while True:
            heartbeat_cycle(agents, infinite_config)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        log("Heartbeat daemon stopped")
        return 0


if __name__ == "__main__":
    raise SystemExit(main() or 0)

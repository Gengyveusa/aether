#!/usr/bin/env python3
"""
ScienceClaw Delphi Mission — Full Bootstrap

Initializes the complete infrastructure for the ARPA-H Delphi quantum biology
mission. This is the single entry point for deploying the full agent swarm.

Steps performed:
  1. Deploy 4 specialist agent profiles (Coherence-1, Tunneler-1, ETC-Prime, SpinDoctor)
  2. Initialize artifact stores with global index
  3. Seed knowledge graphs with quantum biology domain ontology
  4. Initialize mission state and investigation queues
  5. Validate infrastructure and print status dashboard

Usage:
    python3 bootstrap_delphi.py              # Full bootstrap
    python3 bootstrap_delphi.py --validate   # Validate existing deployment
    python3 bootstrap_delphi.py --reset      # Reset and redeploy (careful!)
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add scienceclaw to path
_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(_ROOT / "scienceclaw"))
sys.path.insert(0, str(_ROOT))

CONFIG_DIR = Path.home() / ".scienceclaw"
PROFILES_DIR = CONFIG_DIR / "profiles"
ARTIFACTS_DIR = CONFIG_DIR / "artifacts"
KNOWLEDGE_DIR = CONFIG_DIR / "knowledge"
REPORTS_DIR = CONFIG_DIR / "reports"
INVESTIGATIONS_DIR = CONFIG_DIR / "investigations"

DELPHI_AGENTS = ["Coherence-1", "Tunneler-1", "ETC-Prime", "SpinDoctor"]

DELPHI_DEADLINE = "2026-04-08"


def banner():
    print()
    print("=" * 72)
    print("  SCIENCECLAW DELPHI MISSION — FULL BOOTSTRAP")
    print("  ARPA-H Quantum Protection Index (QPI)")
    print("=" * 72)
    print()
    print(f"  Deadline:       {DELPHI_DEADLINE}")
    days = (datetime(2026, 4, 8, tzinfo=timezone.utc) - datetime.now(timezone.utc)).days
    print(f"  Days remaining: T-{days}")
    print(f"  Agents:         {', '.join(DELPHI_AGENTS)}")
    print(f"  Architectures:  FMO, tunneling, ETC, spin")
    print(f"  Metabolites:    NADH, FAD, ATP, GSH, CoQ10")
    print()


def step_1_create_directories():
    """Create all required directory structure."""
    print("Step 1: Creating directory structure...")

    dirs = [
        CONFIG_DIR,
        PROFILES_DIR,
        ARTIFACTS_DIR,
        ARTIFACTS_DIR / "global_index.jsonl",  # touch as file below
        KNOWLEDGE_DIR,
        REPORTS_DIR,
        INVESTIGATIONS_DIR,
        CONFIG_DIR / "post_index",
    ]

    for d in dirs:
        if d.suffix:  # It's a file path (like global_index.jsonl)
            d.parent.mkdir(parents=True, exist_ok=True)
            if not d.exists():
                d.touch()
        else:
            d.mkdir(parents=True, exist_ok=True)

    for agent in DELPHI_AGENTS:
        (PROFILES_DIR / agent).mkdir(parents=True, exist_ok=True)
        (ARTIFACTS_DIR / agent).mkdir(parents=True, exist_ok=True)
        (KNOWLEDGE_DIR / agent).mkdir(parents=True, exist_ok=True)
        (INVESTIGATIONS_DIR / agent).mkdir(parents=True, exist_ok=True)
        (CONFIG_DIR / "post_index" / agent).mkdir(parents=True, exist_ok=True)

        # Touch store files
        store = ARTIFACTS_DIR / agent / "store.jsonl"
        if not store.exists():
            store.touch()

    print("  Done. All directories created.")
    return True


def step_2_deploy_profiles():
    """Deploy agent profiles using delphi_profiles.py."""
    print("\nStep 2: Deploying Delphi agent profiles...")
    try:
        from delphi_profiles import deploy_delphi_agents
        agents = deploy_delphi_agents()
        print(f"  Done. Deployed {len(agents)} agents: {', '.join(agents)}")
        return True
    except ImportError:
        print("  WARNING: delphi_profiles.py not found — creating minimal profiles")
        return _create_minimal_profiles()
    except Exception as e:
        print(f"  ERROR: {e}")
        return _create_minimal_profiles()


def _create_minimal_profiles() -> bool:
    """Fallback: create minimal agent profiles if delphi_profiles.py fails."""
    architectures = {
        "Coherence-1": {
            "architecture": "FMO",
            "focus": "NADH/FAD excitonic energy transfer",
            "metabolites": ["NADH", "FAD"],
            "tools": ["pubmed", "scholar-search", "biopython", "scanpy", "pydeseq2",
                       "matplotlib", "arxiv", "websearch"],
        },
        "Tunneler-1": {
            "architecture": "tunneling",
            "focus": "GSH redox cycling and hydrogen transfer",
            "metabolites": ["GSH", "GSSG"],
            "tools": ["pubmed", "scholar-search", "rdkit", "pubchem", "tdc",
                       "matplotlib", "arxiv", "websearch"],
        },
        "ETC-Prime": {
            "architecture": "ETC",
            "focus": "Mitochondrial electron transport chain",
            "metabolites": ["CoQ10", "NADH", "ATP"],
            "tools": ["pubmed", "scholar-search", "uniprot", "pdb", "biopython",
                       "alphafold-database", "matplotlib", "arxiv", "websearch"],
        },
        "SpinDoctor": {
            "architecture": "spin",
            "focus": "Cryptochrome radical pair mechanism",
            "metabolites": ["FAD"],
            "tools": ["pubmed", "scholar-search", "clinicaltrials-database",
                       "biopython", "matplotlib", "arxiv", "websearch"],
        },
    }

    for name, arch_info in architectures.items():
        profile = {
            "name": name,
            "bio": f"Delphi mission specialist — {arch_info['focus']}",
            "research": {
                "interests": ["quantum biology", arch_info["focus"]],
                "organisms": ["human"],
                "proteins": [],
                "compounds": arch_info["metabolites"],
            },
            "personality": {
                "curiosity_style": "deep-diver",
                "communication_style": "formal",
            },
            "preferences": {
                "tools": arch_info["tools"],
                "exploration_mode": "systematic",
            },
            "community": "scienceclaw",
            "expertise_preset": "quantum_biology",
            "delphi_metadata": {
                "architecture": arch_info["architecture"],
                "mission_id": "delphi-qpi-2026",
                "deadline": DELPHI_DEADLINE,
            },
        }

        profile_dir = PROFILES_DIR / name
        profile_dir.mkdir(parents=True, exist_ok=True)
        profile_file = profile_dir / "agent_profile.json"
        with open(profile_file, "w") as f:
            json.dump(profile, f, indent=2)
        profile_file.chmod(0o600)
        print(f"  Created: {name} ({arch_info['architecture']})")

    return True


def step_3_seed_knowledge_graphs():
    """Seed knowledge graphs with quantum biology domain ontology."""
    print("\nStep 3: Seeding knowledge graphs...")
    try:
        from seed_knowledge_graph import seed_all_delphi_agents
        seed_all_delphi_agents()
        print("  Done. Knowledge graphs seeded.")
        return True
    except ImportError:
        print("  WARNING: seed_knowledge_graph.py not found — creating minimal graphs")
        return _create_minimal_graphs()
    except Exception as e:
        print(f"  ERROR: {e}")
        return _create_minimal_graphs()


def _create_minimal_graphs() -> bool:
    """Fallback: create minimal knowledge graphs."""
    try:
        from memory.knowledge_graph import KnowledgeGraph
    except ImportError:
        print("  Could not import KnowledgeGraph — skipping")
        return False

    # Seed a shared base graph for each agent
    metabolites = [
        ("NADH", "compound", {"role": "electron_carrier", "qpi_architecture": "FMO+ETC"}),
        ("FAD", "compound", {"role": "electron_carrier", "qpi_architecture": "FMO+spin"}),
        ("ATP", "compound", {"role": "energy_currency", "qpi_architecture": "ETC+tunneling"}),
        ("GSH", "compound", {"role": "antioxidant", "qpi_architecture": "ALL", "keystone": "true"}),
        ("CoQ10", "compound", {"role": "electron_shuttle", "qpi_architecture": "ETC"}),
    ]

    architectures = [
        ("FMO Coherence", "concept", {"qpi_weight": 0.30, "description": "Excitonic energy transfer"}),
        ("Enzyme Tunneling", "concept", {"qpi_weight": 0.25, "description": "Quantum hydrogen/electron tunneling"}),
        ("Mitochondrial ETC", "concept", {"qpi_weight": 0.30, "description": "Electron transport chain quantum transfer"}),
        ("Cryptochrome Spin", "concept", {"qpi_weight": 0.15, "description": "Radical pair mechanism"}),
    ]

    for agent in DELPHI_AGENTS:
        kg = KnowledgeGraph(agent)
        node_ids = {}

        for name, ntype, props in metabolites + architectures:
            nid = kg.add_node(name, ntype, properties=props)
            node_ids[name] = nid

        # Connect metabolites to architectures
        kg.add_edge(node_ids["NADH"], node_ids["FMO Coherence"], "correlates", confidence="high")
        kg.add_edge(node_ids["NADH"], node_ids["Mitochondrial ETC"], "requires", confidence="high")
        kg.add_edge(node_ids["FAD"], node_ids["FMO Coherence"], "correlates", confidence="high")
        kg.add_edge(node_ids["FAD"], node_ids["Cryptochrome Spin"], "correlates", confidence="high")
        kg.add_edge(node_ids["GSH"], node_ids["Enzyme Tunneling"], "correlates", confidence="high")
        kg.add_edge(node_ids["ATP"], node_ids["Mitochondrial ETC"], "correlates", confidence="high")
        kg.add_edge(node_ids["CoQ10"], node_ids["Mitochondrial ETC"], "requires", confidence="high")

        stats = kg.get_stats()
        print(f"  {agent}: {stats['total_nodes']} nodes, {stats['total_edges']} edges")

    return True


def step_4_initialize_mission_state():
    """Initialize the Delphi mission state."""
    print("\nStep 4: Initializing mission state...")

    mission_state = {
        "mission_id": "delphi-qpi-2026",
        "mission_name": "ARPA-H Delphi — Quantum Protection Index",
        "deadline": DELPHI_DEADLINE,
        "phase": "active_investigation",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "agents_deployed": DELPHI_AGENTS,
        "architectures": {
            "FMO": {
                "primary_agent": "Coherence-1",
                "secondary_agent": "ETC-Prime",
                "qpi_weight": 0.30,
                "metabolites": ["NADH", "FAD"],
                "evidence_count": 0,
            },
            "tunneling": {
                "primary_agent": "Tunneler-1",
                "secondary_agent": "SpinDoctor",
                "qpi_weight": 0.25,
                "metabolites": ["GSH"],
                "evidence_count": 0,
            },
            "ETC": {
                "primary_agent": "ETC-Prime",
                "secondary_agent": "Coherence-1",
                "qpi_weight": 0.30,
                "metabolites": ["NADH", "CoQ10", "ATP"],
                "evidence_count": 0,
            },
            "spin": {
                "primary_agent": "SpinDoctor",
                "secondary_agent": "Tunneler-1",
                "qpi_weight": 0.15,
                "metabolites": ["FAD"],
                "evidence_count": 0,
            },
        },
        "qpi_model": {
            "weights": {"alpha": 0.30, "beta": 0.25, "gamma": 0.30, "delta": 0.15},
            "validation_targets": {
                "auc": 0.80,
                "sensitivity": 0.85,
                "specificity": 0.80,
            },
        },
        "collaborators": [
            {"name": "Alessandra Lanzara", "institution": "UCB Physics", "role": "Co-PI"},
            {"name": "Markus Buehler", "institution": "MIT", "role": "Platform (ScienceClaw)"},
        ],
        "investigation_queue": [],
        "completed_investigations": [],
        "total_artifacts": 0,
    }

    state_file = CONFIG_DIR / "delphi_mission_state.json"
    with open(state_file, "w") as f:
        json.dump(mission_state, f, indent=2)
    print(f"  Mission state saved: {state_file}")

    # Initialize investigation tracker for each agent
    for agent in DELPHI_AGENTS:
        tracker_file = INVESTIGATIONS_DIR / agent / "tracker.json"
        if not tracker_file.exists():
            tracker = {
                "agent": agent,
                "investigations": {},
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
            with open(tracker_file, "w") as f:
                json.dump(tracker, f, indent=2)

    print("  Done. Mission state and investigation trackers initialized.")
    return True


def step_5_validate():
    """Validate the deployment."""
    print("\nStep 5: Validating deployment...")
    issues = []

    # Check agent profiles
    for agent in DELPHI_AGENTS:
        profile = PROFILES_DIR / agent / "agent_profile.json"
        if not profile.exists():
            issues.append(f"Missing profile: {agent}")
        else:
            try:
                with open(profile) as f:
                    data = json.load(f)
                if not data.get("name"):
                    issues.append(f"Invalid profile (no name): {agent}")
            except json.JSONDecodeError:
                issues.append(f"Corrupt profile JSON: {agent}")

    # Check artifact stores
    for agent in DELPHI_AGENTS:
        store = ARTIFACTS_DIR / agent / "store.jsonl"
        if not store.exists():
            issues.append(f"Missing artifact store: {agent}")

    # Check knowledge graphs
    for agent in DELPHI_AGENTS:
        graph = KNOWLEDGE_DIR / agent / "graph.json"
        if not graph.exists():
            issues.append(f"Missing knowledge graph: {agent}")
        else:
            try:
                with open(graph) as f:
                    data = json.load(f)
                nodes = len(data.get("nodes", {}))
                if nodes == 0:
                    issues.append(f"Empty knowledge graph: {agent}")
            except json.JSONDecodeError:
                issues.append(f"Corrupt graph JSON: {agent}")

    # Check mission state
    state_file = CONFIG_DIR / "delphi_mission_state.json"
    if not state_file.exists():
        issues.append("Missing mission state file")

    # Check global index
    global_idx = ARTIFACTS_DIR / "global_index.jsonl"
    if not global_idx.exists():
        issues.append("Missing global artifact index")

    if issues:
        print("  ISSUES FOUND:")
        for issue in issues:
            print(f"    - {issue}")
        return False
    else:
        print("  All checks passed.")
        return True


def print_deployment_summary():
    """Print final deployment summary."""
    print()
    print("=" * 72)
    print("  DEPLOYMENT COMPLETE")
    print("=" * 72)
    print()

    for agent in DELPHI_AGENTS:
        profile_file = PROFILES_DIR / agent / "agent_profile.json"
        arch = "?"
        tools_count = 0
        if profile_file.exists():
            try:
                with open(profile_file) as f:
                    data = json.load(f)
                arch = data.get("delphi_metadata", {}).get("architecture", "?")
                tools_count = len(data.get("preferences", {}).get("tools", []))
            except Exception:
                pass

        graph_file = KNOWLEDGE_DIR / agent / "graph.json"
        kg_nodes = 0
        kg_edges = 0
        if graph_file.exists():
            try:
                with open(graph_file) as f:
                    g = json.load(f)
                kg_nodes = len(g.get("nodes", {}))
                kg_edges = len(g.get("edges", []))
            except Exception:
                pass

        print(f"  {agent:<16} arch={arch:<10} tools={tools_count:<3} "
              f"kg_nodes={kg_nodes:<4} kg_edges={kg_edges}")

    print()
    print("  Next steps:")
    print("    1. python3 heartbeat.py --status          # View mission dashboard")
    print("    2. python3 heartbeat.py --once            # Run first heartbeat")
    print("    3. python3 supabase_sync.py --create-table # Set up Supabase (optional)")
    print("    4. systemctl --user enable scienceclaw-heartbeat.service")
    print()
    print("=" * 72)


def main():
    parser = argparse.ArgumentParser(
        description="Bootstrap the ScienceClaw Delphi Mission",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--validate", action="store_true",
                        help="Validate existing deployment only")
    parser.add_argument("--reset", action="store_true",
                        help="Reset and redeploy (preserves artifacts)")
    args = parser.parse_args()

    banner()

    if args.validate:
        success = step_5_validate()
        return 0 if success else 1

    # Full bootstrap
    step_1_create_directories()
    step_2_deploy_profiles()
    step_3_seed_knowledge_graphs()
    step_4_initialize_mission_state()
    valid = step_5_validate()
    print_deployment_summary()

    return 0 if valid else 1


if __name__ == "__main__":
    raise SystemExit(main() or 0)

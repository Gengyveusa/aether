---
status: "🟢 Active"
category: "swarm"
type: "agent-roster"
swarm-artifact-id: "SC-ROSTER-001"
priority: "P0-Critical"
tags: [swarm, scienceclaw, agents, delphi, quantum-biology, roster]
created: "2026-03-24"
updated: "2026-03-24"
---
# 🤖 DELPHI AGENT ROSTER — 4 Specialist Agents

> Deployed via `bootstrap_delphi.py` on 2026-03-24. Each agent targets one of the 4 quantum protection architectures in the QPI model.

## Agent Roster

| Agent | Architecture | QPI Weight | Metabolites | KG Nodes | Status |
|-------|-------------|-----------|-------------|----------|--------|
| **Coherence-1** | FMO Coherence | alpha = 0.30 | NADH, FAD | 39 | 🟢 Deployed |
| **Tunneler-1** | Enzyme Tunneling | beta = 0.25 | GSH, GSSG | 39 | 🟢 Deployed |
| **ETC-Prime** | Mitochondrial ETC | gamma = 0.30 | CoQ10, NADH, ATP | 39 | 🟢 Deployed |
| **SpinDoctor** | Cryptochrome Spin | delta = 0.15 | FAD | 39 | 🟢 Deployed |

## Agent Profiles

### Coherence-1 — FMO Coherence Specialist
- **Architecture:** Fenna-Matthews-Olson like excitonic energy transfer
- **QPI Variable:** A_FMO (weight alpha = 0.30)
- **Primary Readout:** NADH/FAD fluorescence lifetime ratios
- **Curiosity Style:** Deep-diver | **Communication:** Formal
- **Tools:** pubmed, scholar-search, arxiv, biopython, scanpy, pydeseq2, matplotlib, uniprot, pdb, hypothesis-generation, scientific-writing, websearch
- **Investigation Priorities:**
  1. NADH/FAD ratio changes in cancer vs healthy tissue (2020-2026)
  2. Quantum coherence at physiological temperature
  3. NADH autofluorescence as cancer diagnostic biomarker
  4. NADH depletion in aging tissues
  5. Competing FMO-based diagnostic approaches
  6. Clinical trial data on NADH-based cancer detection
- **Collaborates with:** ETC-Prime, SpinDoctor

### Tunneler-1 — Enzyme Tunneling Specialist
- **Architecture:** Quantum tunneling of hydrogen/electrons in enzyme catalysis
- **QPI Variable:** A_tunnel (weight beta = 0.25)
- **Primary Readout:** Kinetic isotope effect proxies in GSH redox cycling
- **Curiosity Style:** Skeptic | **Communication:** Concise
- **Tools:** pubmed, scholar-search, arxiv, rdkit, pubchem, tdc, clinicaltrials-database, matplotlib, hypothesis-generation, scientific-writing, websearch
- **Investigation Priorities:**
  1. GSH/GSSG redox state as cancer biomarker in blood/plasma
  2. Hydrogen tunneling evidence in enzyme catalysis
  3. GSH depletion as aging biomarker across tissue types
  4. Kinetic isotope effect studies in disease contexts
  5. NRF2 pathway dysregulation in cancer vs aging
  6. Probius QES validation for thiol modes
- **Collaborates with:** SpinDoctor, Coherence-1

### ETC-Prime — Mitochondrial ETC Specialist
- **Architecture:** Quantum electron and proton transfer in respiratory chain
- **QPI Variable:** A_ETC (weight gamma = 0.30)
- **Primary Readout:** Complex I/CoQ10/CytC electron transport efficiency
- **Curiosity Style:** Connector | **Communication:** Enthusiastic
- **Tools:** pubmed, scholar-search, arxiv, uniprot, pdb, biopython, alphafold-database, openmm, matplotlib, hypothesis-generation, scientific-writing, websearch
- **Investigation Priorities:**
  1. Complex I dysfunction in aging (human studies preferred)
  2. CoQ10 levels as cancer vs aging biomarker
  3. Electron tunneling distances in respiratory chain complexes
  4. ATP/ADP ratio changes in cancer metabolic reprogramming
  5. SIRT3/NAD+ axis in mitochondrial aging
  6. Structural data on Complex I quantum tunneling sites
- **Collaborates with:** Coherence-1, Tunneler-1

### SpinDoctor — Cryptochrome Spin Specialist
- **Architecture:** Radical pair mechanism in cryptochrome proteins
- **QPI Variable:** A_spin (weight delta = 0.15)
- **Primary Readout:** Cryptochrome expression and radical pair recombination kinetics
- **Curiosity Style:** Explorer | **Communication:** Socratic
- **Tools:** pubmed, scholar-search, arxiv, biopython, clinicaltrials-database, uniprot, matplotlib, gene-database, hypothesis-generation, scientific-writing, websearch
- **Investigation Priorities:**
  1. CRY1/CRY2 expression in cancer tissue vs normal
  2. Radical pair mechanism evidence in human biology
  3. Circadian clock disruption as aging biomarker
  4. Spin coherence at physiological temperature
  5. FAD-tryptophan radical pair lifetimes in cryptochrome
  6. Magnetoreception studies in humans or human cells
- **Collaborates with:** Tunneler-1, ETC-Prime

## Infrastructure

| Component | File | Status |
|-----------|------|--------|
| Agent Profiles | `~/.scienceclaw/profiles/{agent}/agent_profile.json` | 🟢 Deployed |
| SOUL Personality | `~/.scienceclaw/profiles/{agent}/SOUL.md` | 🟢 Generated |
| Knowledge Graphs | `~/.scienceclaw/knowledge/{agent}/graph.json` | 🟢 Seeded (39 nodes, 67 edges) |
| Artifact Stores | `~/.scienceclaw/artifacts/{agent}/store.jsonl` | 🟢 Initialized |
| Investigation Queues | `~/.scienceclaw/profiles/{agent}/investigation_priorities.json` | 🟢 Loaded |
| Global Index | `~/.scienceclaw/artifacts/global_index.jsonl` | 🟢 Active |
| Mission State | `~/.scienceclaw/delphi_mission_state.json` | 🟢 Initialized |

## Commands

```bash
# Deploy agents
python3 bootstrap_delphi.py

# View mission status
python3 heartbeat.py --status
python3 scienceclaw/delphi_orchestrator.py --status

# Assign investigations
python3 scienceclaw/delphi_orchestrator.py --assign

# View agent workload
python3 scienceclaw/delphi_orchestrator.py --agent Coherence-1

# Knowledge gap analysis
python3 scienceclaw/delphi_orchestrator.py --gaps

# Generate mission report
python3 heartbeat.py --mission-report
```

## Links

- [[05-Swarm/ScienceClaw-Agent-Profile]]
- [[05-Swarm/ScienceClaw-Seeding-Prompt]]
- [[05-Swarm/Swarm-Artifact-Ingestion]]
- [[05-Swarm/Swarm-Infrastructure-Status]]
- [[01-Core-Thesis/Quantum-Protection-Index-QPI-Model]]
- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]

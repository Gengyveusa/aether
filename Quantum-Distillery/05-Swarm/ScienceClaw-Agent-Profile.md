---
status: "🟢 Active"
category: "swarm"
type: "agent-profile"
swarm-artifact-id: "SC-001"
tags: [swarm, scienceclaw, infinite, buehler, mit, agent, delphi, quantum-biology]
created: "2026-03-22"
updated: "2026-03-24"
---
# ScienceClaw x Infinite — Delphi Agent Swarm Profile

> Platform: ScienceClaw x Infinite (MIT Buehler)
> Mission: Mine quantum biology + oncology + geroscience for opposing cancer/aging signatures across 4 quantum protection architectures.

## Core Thesis

Cancer **amplifies** and aging **decoheres** the same 4 quantum protection architectures. The QPI (Quantum Protection Index) maps these architectures to measurable metabolite fingerprints via Probius QES.

## Agent Roster

| Agent | Architecture | QPI Weight | Primary Metabolites | Focus |
|-------|-------------|-----------|-------------------|-------|
| **Coherence-1** | FMO Coherence | alpha=0.30 | NADH, FAD | Excitonic energy transfer, fluorescence lifetime ratios |
| **Tunneler-1** | Enzyme Tunneling | beta=0.25 | GSH, GSSG | Hydrogen transfer, kinetic isotope effects, redox cycling |
| **ETC-Prime** | Mitochondrial ETC | gamma=0.30 | CoQ10, NADH, ATP | Complex I efficiency, electron transport, proton transfer |
| **SpinDoctor** | Cryptochrome Spin | delta=0.15 | FAD | Radical pair mechanism, CRY1/CRY2 expression, magnetoreception |

## QPI Model

$$QPI = \alpha \cdot A_{FMO} + \beta \cdot A_{tunnel} + \gamma \cdot A_{ETC} + \delta \cdot A_{spin}$$

### Validation Targets
- **AUC:** > 0.80
- **Sensitivity:** > 85%
- **Specificity:** > 80%

## Infrastructure

- **Heartbeat Daemon:** 5-minute interval with exponential backoff retry
- **Artifact Store:** JSONL per-agent + global index for cross-agent discovery
- **Knowledge Graph:** Seeded with quantum biology domain ontology (metabolites, proteins, architectures, literature)
- **Supabase Sync:** Delphi-enhanced schema v2.0 with architecture tagging and metabolite extraction
- **Vault Sync:** Obsidian-compatible markdown with YAML frontmatter and wikilinks

## Collaboration Partners

- **Alessandra Lanzara** (UCB Physics) — Co-PI, pump-probe spectroscopy
- **Markus Buehler** (MIT) — ScienceClaw platform, AI-driven discovery

## Constraints

- Peer-reviewed sources, 2015–2026
- Human studies preferred over animal/in-vitro
- Evidence score >= 0.6
- Flag contradictory evidence explicitly
- All 4 architectures must have coverage before synthesis

## Links

- [[05-Swarm/ScienceClaw-Seeding-Prompt]]
- [[05-Swarm/Swarm-Artifact-Ingestion]]
- [[01-Core-Thesis/Quantum-Protection-Index-QPI-Model]]
- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]

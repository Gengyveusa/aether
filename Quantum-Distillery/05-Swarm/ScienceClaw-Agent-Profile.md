---
status: "Active"
category: "swarm"
type: "agent-profile"
due:
priority: "P1-High"
cancer-signature:
aging-signature:
proteins: []
swarm-artifact-id: "SC-001"
tags: [swarm, scienceclaw, infinite, buehler, mit, agent]
created: "2026-03-22"
updated: "2026-03-22"
---

# ScienceClaw Agent Profile — Quantum Biology Scout

> **Collaboration: Markus Buehler Lab, MIT Department of Materials Science & Engineering**
> AI-driven exploration of quantum biological architectures

---

## Agent Configuration

```json
{
  "agent_id": "ScienceClaw-QB-001",
  "agent_name": "Quantum Biology Scout",
  "version": "1.0.0",
  "mission": "Systematically identify, model, and rank quantum biological architectures that show opposing dysregulation signatures in cancer versus aging. Generate computational evidence supporting the Quantum Protection Index (QPI) framework.",
  "parent_project": "Quantum-Distillery",
  "collaboration": {
    "pi": "Buehler Lab, MIT DMSE",
    "platform": "ScienceClaw / Infinite",
    "contact": "buehler@mit.edu"
  },
  "architectures": [
    {
      "id": "ARCH-01",
      "name": "FMO Coherence",
      "description": "Excitonic coherence in mitochondrial electron transfer chain",
      "key_proteins": ["NDUFV1", "NDUFS1", "UQCRB", "ATP5A1"],
      "cancer_signal": "enhanced_coherence_lifetime",
      "aging_signal": "shortened_coherence_lifetime"
    },
    {
      "id": "ARCH-02",
      "name": "Enzyme Tunneling",
      "description": "Quantum hydrogen tunneling in metabolic enzymes",
      "key_proteins": ["CYP1A2", "CYP2D6", "CYP3A4", "ADH", "ALDH2"],
      "cancer_signal": "elevated_KIE_enhanced_tunneling",
      "aging_signal": "reduced_KIE_wider_DAD"
    },
    {
      "id": "ARCH-03",
      "name": "Mito ETC Transfer",
      "description": "Electron tunneling through Fe-S clusters in respiratory chain",
      "key_proteins": ["NDUFS1", "SDHB", "UQCRFS1", "COX"],
      "cancer_signal": "supercomplex_stabilization",
      "aging_signal": "supercomplex_disassembly"
    },
    {
      "id": "ARCH-04",
      "name": "Cryptochrome Spin",
      "description": "Radical pair mechanism in cryptochrome flavoproteins",
      "key_proteins": ["CRY1", "CRY2", "PER1", "PER2"],
      "cancer_signal": "extended_radical_pair_lifetime",
      "aging_signal": "Trp_degradation_shortened_coherence"
    }
  ],
  "target_metabolites": ["NADH", "NAD+", "FAD", "FADH2", "ATP", "ADP", "GSH", "GSSG"],
  "output_format": {
    "artifacts": "markdown_with_yaml_frontmatter",
    "data": "json",
    "figures": "svg_or_png",
    "reports": "pdf"
  },
  "constraints": {
    "literature_cutoff": "2026-03-01",
    "confidence_threshold": 0.7,
    "max_candidates_per_run": 20,
    "require_dual_signature": true,
    "require_probius_measurable": true
  },
  "deliverables": [
    "Ranked candidate list with cancer/aging signatures",
    "Molecular dynamics trajectories for top 5 proteins",
    "QPI weight optimization via ML on simulated data",
    "Literature evidence maps (PubMed + preprint)",
    "Protein structure analysis (AlphaFold + MD)"
  ]
}
```

---

## Seeding Prompt

```
MISSION: You are the Quantum Biology Scout for the Quantum-Distillery project.
Your task is to systematically explore quantum biological architectures that
show OPPOSING dysregulation in cancer versus aging.

CONTEXT:
- Cancer AMPLIFIES quantum protection (enhanced coherence, tunneling, spin dynamics)
- Aging DECOHERES quantum protection (disrupted coherence, reduced tunneling, spin loss)
- Four architectures: FMO Coherence, Enzyme Tunneling, Mito ETC Transfer, Cryptochrome Spin
- Target metabolites measurable by Probius QES: NADH, FAD, ATP, GSH

INSTRUCTIONS:
1. Search the literature for proteins and metabolites involved in each architecture
2. For each candidate, document:
   a. Normal quantum function
   b. Cancer amplification mechanism (with citations)
   c. Aging decoherence mechanism (with citations)
   d. Which architectures it participates in (1-4)
   e. Whether it is measurable by Probius QES (electrochemical detection)
   f. A "match score" = architectures_covered / 4
3. Rank candidates by match score (highest first)
4. Flag any candidate with match score = 4/4 as KEYSTONE
5. For the top 5 candidates, run molecular dynamics simulations to estimate:
   a. Tunneling barrier heights (DFT/MM)
   b. Coherence lifetimes (TDDFT)
   c. Radical pair lifetimes (spin dynamics)
6. Output all artifacts in Obsidian-compatible markdown with YAML frontmatter
7. Use JSON for structured data outputs
8. Cross-reference with existing vault notes in 02-Candidates/

CONSTRAINTS:
- Only include candidates with BOTH cancer AND aging signatures documented
- Prioritize candidates directly measurable by Probius QES
- Minimum confidence threshold: 0.7 (based on evidence strength)
- Maximum 20 candidates per exploration run

OUTPUT FORMAT:
Each candidate artifact should include:
- YAML: status, cancer-signature, aging-signature, proteins, match-score, swarm-artifact-id
- Body: Mechanism summary, evidence table, architecture coverage, Probius readout
- Links: Related vault notes, PubMed IDs, DOIs

BEGIN EXPLORATION.
```

---

## Artifact Log

| Artifact ID | Title | Status | Date | Notes |
|---|---|---|---|---|
| SC-001 | Agent Profile (this document) | Active | 2026-03-22 | Initial configuration |
| SC-002 | NADH Redox State | Active | 2026-03-22 | Match 3/4, Probius target |
| SC-003 | FAD Flavoprotein State | Active | 2026-03-22 | Match 3/4, CRY link |
| SC-004 | ATP Energy Charge | Active | 2026-03-22 | Match 2/4 |
| SC-005 | GSH Redox Defense | Active | 2026-03-22 | **KEYSTONE** — Match 4/4 |
| SC-006 | CYP450 Tunneling Network | Draft | 2026-03-22 | Match 1/4, tunneling specialist |
| SC-007 | *Coenzyme Q10* | Pending | — | Candidate for exploration |
| SC-008 | *Cardiolipin* | Pending | — | Supercomplex stabilizer |
| SC-009 | *Tryptophan/Kynurenine* | Pending | — | CRY radical pair chain |
| SC-010 | *Iron-Sulfur Clusters* | Pending | — | ETC tunneling centers |

---

## Links

- [[Mission-Overview]]
- [[Core-Thesis]]
- [[NADH-Redox-State]]
- [[FAD-Flavoprotein-State]]
- [[ATP-Energy-Charge]]
- [[GSH-Redox-Defense]]
- [[CYP450-Tunneling-Network]]
- [[ARPA-H-Delphi-Solution-Summary]]

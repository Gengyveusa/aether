---
status: "🟢 Active"
category: "dashboard"
type: "candidate-tracker"
priority: "P0-Critical"
tags: [dashboard, candidates]
created: "2026-03-22"
updated: "2026-03-22"
---
# 🎯 CANDIDATE TRACKER

| Candidate | Architecture Alignment | Probius Readout | Evidence | Keystone |
|---|---|---|---|---|
| NADH Redox State | 3/4 | Direct | Strong | |
| FAD Flavoprotein | 3/4 | Direct | Moderate-Strong | |
| ATP Energy Charge | 2/4 | Direct | Strong | |
| GSH Redox Defense | **4/4** | Direct | Strong | ⭐ KEYSTONE |
| CYP450 Tunneling | 1/4 | Indirect | Moderate | |
| Complex I | 3/4 | Direct | Strong | |
| CoQ10 | 2/4 | Indirect | Moderate | |
| Cytochrome C | 2/4 | Indirect | Moderate | |
| SIRT3 | 2/4 | Indirect | Strong | |
| NRF2 | 3/4 | Indirect | Strong | |

```dataview
TABLE
  cancer-signature AS "Cancer ↑",
  aging-signature AS "Aging ↓",
  proteins AS "Proteins",
  status AS "Status"
FROM "02-Candidates"
SORT priority ASC
```

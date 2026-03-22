---
status: "🟢 Active"
category: "thesis"
type: "mathematical-model"
due: "2026-04-08"
priority: "P0-Critical"
tags: [thesis, QPI, model, mathematics, probius]
created: "2026-03-22"
updated: "2026-03-22"
---
# 📐 QUANTUM PROTECTION INDEX (QPI) — MATHEMATICAL FRAMEWORK

> The QPI is a composite score mapping four metabolite fingerprints to a cancer-amplification / aging-decoherence axis.

## Formal Definition

$$QPI = w_1 \cdot f(NADH) + w_2 \cdot f(FAD) + w_3 \cdot f(ATP) + w_4 \cdot f(GSH)$$

| QPI Value | Interpretation |
|---|---|
| QPI > 0 | Cancer trajectory (quantum protection amplified) |
| QPI < 0 | Aging trajectory (quantum protection decohered) |
| QPI ≈ 0 | Quantum homeostasis |

## Transform Functions

$f(x)$ are nonlinear transforms — log-ratio for concentration-based metabolites, z-score normalized to a healthy reference population. Each transform maps raw Probius QES signal to a standardized deviation from homeostatic baseline.

## Weight Training

Weights $w_1$ through $w_4$ are trained via logistic regression on paired Probius QES + Lanzara spectroscopy datasets from three cohorts:

1. **Young healthy** (ages 20–35, n=50)
2. **Aged** (ages 65+, n=50)
3. **Cancer** (mixed solid tumors, n=50)

## Architecture Decomposition

The QPI decomposes into architecture-specific sub-indices:

- **QPI_FMO** — Excitonic coherence (FMO-like energy transfer)
- **QPI_tunnel** — Enzyme quantum tunneling (H-transfer, electron tunneling)
- **QPI_ETC** — Mitochondrial electron transport chain quantum transfer
- **QPI_spin** — Cryptochrome radical pair spin coherence

Each sub-index isolates the contribution of one architecture to the composite score.

## Threshold Calibration

Clinical decision boundaries are calibrated against the Lanzara spectroscopy ground truth. Thresholds define zones: protective (cancer-like amplification), homeostatic, and vulnerable (aging-like decoherence).

## Sensitivity Analysis

Hypothesis: GSH carries the highest weight ($w_4$) as the keystone metabolite — its redox status affects all four architectures simultaneously. NADH expected second due to direct ETC and tunneling roles.

## Validation Metrics

- **AUC target:** > 0.80
- **Sensitivity:** > 85%
- **Specificity:** > 80%

## Metabolite Summary

| Metabolite | Transform | Architecture Link | Expected Weight Rank |
|---|---|---|---|
| NADH | log-ratio | ETC + tunneling | Rank 2 |
| FAD | z-score | Cryptochrome + ETC | Rank 3 |
| ATP | log-ratio | ETC + tunneling | Rank 4 |
| GSH | log-ratio | ALL (keystone) | Rank 1 |

## Links

- [[01-Core-Thesis/Core-Thesis]]
- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]
- [[04-Experiments/Probius-QES-Protocol]]

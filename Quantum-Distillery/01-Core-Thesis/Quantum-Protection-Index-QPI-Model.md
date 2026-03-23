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

## Mathematical Specification of QPI Weights

The QPI composite score is calculated as:

```
QPI = α·A_FMO + β·A_tunnel + γ·A_ETC + δ·A_spin
```

Where:
- **A_FMO** = FMO coherence score (derived from NADH/FAD fluorescence lifetime ratios)
- **A_tunnel** = Enzyme tunneling score (derived from kinetic isotope effect proxies in GSH redox cycling)
- **A_ETC** = Mitochondrial ETC quantum transfer score (derived from Complex I/CoQ10/CytC electron transport efficiency markers)
- **A_spin** = Cryptochrome spin coherence score (derived from cryptochrome expression and radical pair recombination kinetics)

### Proposed Initial Weights (Literature-Derived)

- **α = 0.30** (strongest direct Probius QES signal: NADH/FAD)
- **β = 0.25** (GSH thiol modes detectable, strong cancer/aging data)
- **γ = 0.30** (Complex I is primary ETC target, robust spectral signature)
- **δ = 0.15** (weakest current evidence in human plasma; weight to be increased as cryptochrome biomarkers are validated)

### Weight Justification

- α and γ weighted highest because NADH and Complex I have the most direct Probius QES readout and the strongest published cancer↑/aging↓ differential data (see [[02-Candidates/NADH-Redox-State]], [[02-Candidates/Complex-I-Activity]]).
- δ weighted lowest pending human validation of cryptochrome spin signatures in plasma (see red-team finding #1).
- Weights are designed to be re-calibrated after Year 1 validation cohort data.

### Scoring Interpretation

| QPI Range | Interpretation |
|---|---|
| 0.8–1.0 | Optimal quantum protection (healthy young adult) |
| 0.6–0.79 | Mild decoherence (early aging signature) |
| 0.4–0.59 | Moderate dysregulation (aging or early cancer) |
| 0.2–0.39 | Severe dysregulation (advanced aging or active cancer) |
| <0.2 | Critical (late-stage cancer with aging acceleration) |

### Cancer vs Aging Discrimination

- **Cancer:** QPI may be elevated (>1.0) due to amplification, with individual architecture scores showing asymmetric spikes
- **Aging:** QPI decreases monotonically with age, all architecture scores declining proportionally
- **Cancer+Aging:** Mixed pattern with overall low QPI but specific architecture amplification

## Links

- [[01-Core-Thesis/Core-Thesis]]
- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]
- [[04-Experiments/Probius-QES-Protocol]]

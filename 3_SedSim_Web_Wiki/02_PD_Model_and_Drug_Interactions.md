# PD Model & Drug Interactions

> **Source:** `src/engines/pdEngine.ts` | **Model:** Sigmoid Emax + Bouillon Response Surface
> **Interaction model:** Greco (synergistic respiratory depression), Additive (BIS/sedation)
> **References:** Bouillon et al. 2004, Minto et al. 2000, Kern et al. 2004

---

## Overview

The pharmacodynamic (PD) engine converts effect-site concentrations (Ce) from the PK engine into physiological drug effects. It implements two critical models:

1. **Single-drug Sigmoid Emax** — baseline dose-response for each drug in isolation
2. **Bouillon Response Surface** — multi-drug interaction model for combined hypnotic + opioid effects

The PD engine outputs **fractional drug effects** (0.0 = no effect, 1.0 = maximal effect) consumed by the [[04_Physiology_Pipeline]] to compute vital signs.

---

## Sigmoid Emax Model (Hill Equation)

For a single drug acting alone:

```
E = E0 + (Emax - E0) × Ce^γ / (EC50^γ + Ce^γ)

where:
  E    = observed effect
  E0   = baseline (no drug) effect
  Emax = maximum possible effect
  Ce   = effect-site concentration
  EC50 = concentration producing 50% of Emax
  γ    = Hill coefficient (steepness of curve)
```

### Hill Coefficient Interpretation

| γ Value | Curve Shape | Clinical Meaning |
|---------|-------------|------------------|
| 1.0 | Hyperbolic | Gradual onset, wide therapeutic window |
| 1.5–2.5 | Sigmoid | Moderate dose-sensitivity |
| 3.0–5.0 | Steep sigmoid | Narrow margin: small dose change → big effect |
| > 5.0 | Near-binary | On/off response |

---

## Fractional Occupancy

Each drug's contribution is normalized to a **fractional occupancy** (U):

```
U_drug = Ce / EC50_drug

where Ce is the current effect-site concentration for that drug
```

This normalized representation allows the Bouillon surface to combine drugs with different potencies on a common scale.

---

## Bouillon Response Surface Model

The Bouillon model describes how hypnotics (propofol, midazolam) and opioids (fentanyl, remifentanil) interact to produce combined sedation and respiratory depression.

### Interaction Surface Equation

```
Combined Effect = f(U_hypnotic, U_opioid)

θ = U_hyp / (U_hyp + U_opi)      // fractional hypnotic contribution

EC50_mix(θ) = 1 / [θ/EC50_hyp + (1-θ)/EC50_opi + β×θ×(1-θ)]

E_combined = (U_hyp + U_opi)^γ / [(U_hyp + U_opi)^γ + EC50_mix^γ]

where β = interaction parameter:
  β > 0  → synergism (less drug needed for same effect)
  β = 0  → additivity
  β < 0  → antagonism
```

### Interaction Parameters Used

| Effect | Interaction Type | β Value | Clinical Significance |
|--------|-----------------|---------|----------------------|
| **BIS / Sedation** | Additive | β ≈ 0 | Hypnotic + opioid sedation sums linearly |
| **Respiratory depression** | **Synergistic** | **β > 0** | Combined RR depression exceeds sum of individual |
| **Analgesia** | Additive | β ≈ 0 | Pain relief sums approximately linearly |

### Critical Safety Implication

> **Respiratory depression is synergistic while sedation is additive.** This means a patient can appear only moderately sedated (BIS 70) while having profound respiratory depression (RR < 6). This mismatch is the #1 cause of sedation-related adverse events and the core teaching point of SedSim.

---

## Drug Effect Outputs

The PD engine outputs the following fractional effects per tick:

| Output | Range | Driven By | Consumed By |
|--------|-------|-----------|-------------|
| `sedationFraction` | 0.0–1.0 | Propofol + Midazolam + Ketamine | BIS computation |
| `respiratoryDepressionFraction` | 0.0–1.0 | Propofol + Fentanyl + Midazolam (synergistic) | RR, tidal volume |
| `analgesiaFraction` | 0.0–1.0 | Fentanyl + Ketamine | Patient comfort score |
| `cardiovascularDepressionFraction` | 0.0–1.0 | Propofol (dominant) + Fentanyl (mild) | HR, BP |
| `vagalFraction` | 0.0–1.0 | Fentanyl (high-dose bradycardia) | HR |
| `dissociationFraction` | 0.0–1.0 | Ketamine only | BIS artifact, nystagmus flag |
| `reversalOpioidFraction` | 0.0–1.0 | Naloxone → displaces opioid effect | Reduces all opioid PD |
| `reversalBenzoFraction` | 0.0–1.0 | Flumazenil → displaces benzo effect | Reduces midazolam PD |

---

## Reversal Agent Mechanics

Reversal agents (Naloxone, Flumazenil) are modeled as **competitive antagonists** at the PD layer:

```
Effective_U_opioid = U_opioid × (1 - reversalOpioidFraction)
Effective_U_benzo  = U_benzo  × (1 - reversalBenzoFraction)

reversalFraction = Ce_reversal^γ_rev / (EC50_rev^γ_rev + Ce_reversal^γ_rev)
```

### Reversal Agent Characteristics

| Agent | Reverses | Onset | Duration | Risk |
|-------|----------|-------|----------|------|
| Naloxone | Fentanyl, Remifentanil | 1–2 min | 30–45 min | Re-narcotization (opioid outlasts naloxone) |
| Flumazenil | Midazolam | 1–2 min | 45–60 min | Re-sedation, seizure risk |

---

## Ketamine Special Handling

Ketamine is modeled differently from other hypnotics:

```
Ketamine PD Effects:
  - Sedation: additive with propofol/midazolam
  - Respiratory: minimal depression (preserved drive)
  - Cardiovascular: sympathomimetic (↑HR, ↑BP) — OPPOSITE of propofol
  - Dissociation: unique effect channel
  - BIS: may paradoxically increase BIS (artifact) at subanesthetic doses
```

This makes ketamine a **counter-intuitive drug** in the simulator — it produces sedation without respiratory depression and raises hemodynamics rather than depressing them.

---

## Response Surface Visualization

```
Respiratory Depression Response Surface (Top View — Isoboles)

  U_opioid ↑
  1.0 ┤         ╱ 90% depression
      │       ╱
  0.8 ┤     ╱   ← synergistic curve bows INWARD
      │   ╱       (less total drug needed)
  0.6 ┤ ╱
      │╱        ╱ 50% depression
  0.4 ┤       ╱
      │     ╱
  0.2 ┤   ╱
      │ ╱
  0.0 ┼──┬──┬──┬──┬──→ U_hypnotic
      0  0.2 0.4 0.6 1.0

  If additive: isoboles would be straight lines
  Synergistic: isoboles curve toward origin (less drug needed)
```

```
BIS Response Surface (Top View — Isoboles)

  U_opioid ↑
  1.0 ┤       ╱ BIS 40
      │     ╱
  0.8 ┤   ╱     ← approximately additive (straight lines)
      │ ╱
  0.6 ┤         ╱ BIS 60
      │       ╱
  0.4 ┤     ╱
      │   ╱
  0.2 ┤ ╱       ╱ BIS 80
      │╱      ╱
  0.0 ┼──┬──┬──┬──┬──→ U_hypnotic
      0  0.2 0.4 0.6 1.0
```

---

## Computation Per Tick

```
1. For each active drug:
   a. Read Ce from PK engine
   b. Compute U = Ce / EC50

2. Combine hypnotic occupancies:
   U_hyp_total = U_propofol + U_midazolam × (1 - reversalBenzoFraction)

3. Combine opioid occupancies:
   U_opi_total = U_fentanyl × (1 - reversalOpioidFraction)

4. Apply Bouillon surface for each effect channel:
   - sedationFraction     (additive model, β ≈ 0)
   - respDepressionFrac   (synergistic model, β > 0)
   - cvDepressionFrac     (propofol-dominant)

5. Add ketamine effects (separate channels)
6. Output all fractions to physiology pipeline
```

---

## Related Files

- [[01_PK_Engine_Three_Compartment]] — Upstream: Ce values fed into PD
- [[03_Drug_Library_and_Parameters]] — EC50, γ, Emax for each drug
- [[04_Physiology_Pipeline]] — Downstream: fractional effects → vital signs
- [[12_Validation_and_Clinical_Accuracy]] — Bouillon interaction validation (MDAPE < 20%)

---

#pharmacodynamics #bouillon #response-surface #sigmoid-emax #drug-interactions #synergy #hill-equation

# Drug Library & Parameters

> **Source:** `src/models/drugLibrary.ts` | **Drugs:** 6 active agents
> **PK models:** Marsh, Minto, Greenblatt, Shafer, Clements
> **Reversal agents:** Naloxone (opioid), Flumazenil (benzodiazepine)

---

## Overview

The drug library defines all pharmacokinetic and pharmacodynamic parameters for each drug in SedSim. Parameters are sourced from peer-reviewed publications and validated against reference TCI (Target-Controlled Infusion) implementations. See [[12_Validation_and_Clinical_Accuracy]] for MDAPE results.

All drugs share the same 3-compartment PK interface ([[01_PK_Engine_Three_Compartment]]) but with drug-specific rate constants, volumes, and effect-site parameters.

---

## Drug Registry

| Drug | Class | PK Model | Primary Effect | Route |
|------|-------|----------|----------------|-------|
| **Propofol** | Hypnotic (GABAa) | Marsh 1991 | Sedation, respiratory depression, hypotension | IV bolus / infusion |
| **Midazolam** | Benzodiazepine (GABAa) | Greenblatt 1989 | Anxiolysis, sedation, amnesia | IV bolus |
| **Fentanyl** | Opioid (μ-receptor) | Shafer 1990 | Analgesia, respiratory depression, bradycardia | IV bolus |
| **Ketamine** | Dissociative (NMDA) | Clements 1982 | Dissociation, analgesia, sympathomimetic | IV bolus |
| **Naloxone** | Opioid antagonist | Literature | Opioid reversal | IV bolus |
| **Flumazenil** | Benzo antagonist | Literature | Benzodiazepine reversal | IV bolus |

---

## Propofol (Marsh Model)

> **Reference:** Marsh B et al. *Br J Anaesth* 1991;67:41–48

### PK Parameters (70 kg reference patient)

| Parameter | Value | Unit | Scaling |
|-----------|-------|------|---------|
| V1 | 0.228 × TBW | L | Linear with total body weight |
| V2 | 0.463 × TBW | L | Linear with total body weight |
| V3 | 2.893 × TBW | L | Linear with total body weight |
| Cl1 | 0.0270 × TBW | L/min | Linear with total body weight |
| Cl2 | 0.0290 × TBW | L/min | Linear with total body weight |
| Cl3 | 0.0147 × TBW | L/min | Linear with total body weight |
| ke0 | 0.26 | min⁻¹ | Fixed |
| t½ke0 | 2.67 | min | Effect-site equilibration half-life |

### PD Parameters

| Parameter | Value | Effect Channel |
|-----------|-------|----------------|
| EC50_sedation | 3.4 mcg/mL | BIS / sedation |
| EC50_respiratory | 1.5 mcg/mL | Respiratory depression |
| EC50_cardiovascular | 2.5 mcg/mL | Hypotension |
| γ_sedation | 2.8 | Hill coefficient |
| γ_respiratory | 3.0 | Steep dose-response |
| γ_cardiovascular | 1.8 | Moderate |

### Clinical Dosing (simulated)

| Use | Bolus | Infusion | Typical Ce Target |
|-----|-------|----------|-------------------|
| Moderate sedation | 0.5–1.0 mg/kg | 25–75 mcg/kg/min | 1.5–3.0 mcg/mL |
| Deep sedation | 1.0–2.0 mg/kg | 75–150 mcg/kg/min | 3.0–5.0 mcg/mL |
| General anesthesia | 2.0–2.5 mg/kg | 100–200 mcg/kg/min | 4.0–6.0 mcg/mL |

---

## Midazolam (Greenblatt Model)

> **Reference:** Greenblatt DJ et al. *Clin Pharmacol Ther* 1989;46:210–218

### PK Parameters (70 kg reference patient)

| Parameter | Value | Unit | Scaling |
|-----------|-------|------|---------|
| V1 | 7.8 | L | Age-adjusted |
| V2 | 22.0 | L | Fixed |
| V3 | 70.0 | L | Fixed |
| Cl1 | 0.408 | L/min | Age-adjusted |
| Cl2 | 0.660 | L/min | Fixed |
| Cl3 | 0.072 | L/min | Fixed |
| ke0 | 0.077 | min⁻¹ | Fixed |
| t½ke0 | 9.0 | min | Slower equilibration than propofol |

### PD Parameters

| Parameter | Value | Effect Channel |
|-----------|-------|----------------|
| EC50_sedation | 0.10 mcg/mL | BIS / sedation |
| EC50_respiratory | 0.08 mcg/mL | Respiratory depression |
| γ_sedation | 3.0 | Steep |
| γ_respiratory | 2.5 | Moderate-steep |

### Clinical Dosing (simulated)

| Use | Bolus | Onset | Duration |
|-----|-------|-------|----------|
| Anxiolysis | 0.5–1.0 mg | 2–3 min | 30–60 min |
| Moderate sedation | 1.0–2.5 mg | 2–3 min | 45–90 min |
| Deep sedation | 2.5–5.0 mg | 2–3 min | 60–120 min |

---

## Fentanyl (Shafer Model)

> **Reference:** Shafer SL et al. *Anesthesiology* 1990;73:1091–1102

### PK Parameters (70 kg reference patient)

| Parameter | Value | Unit | Scaling |
|-----------|-------|------|---------|
| V1 | 12.7 | L | Weight-adjusted |
| V2 | 32.0 | L | Weight-adjusted |
| V3 | 226.0 | L | Weight-adjusted |
| Cl1 | 0.770 | L/min | Weight-adjusted |
| Cl2 | 1.290 | L/min | Fixed |
| Cl3 | 0.272 | L/min | Fixed |
| ke0 | 0.147 | min⁻¹ | Fixed |
| t½ke0 | 4.7 | min | Moderate equilibration |

### PD Parameters

| Parameter | Value | Effect Channel |
|-----------|-------|----------------|
| EC50_analgesia | 1.2 ng/mL | Pain suppression |
| EC50_respiratory | 0.8 ng/mL | **Lower than analgesic EC50** |
| EC50_vagal | 3.0 ng/mL | Bradycardia at high doses |
| γ_respiratory | 2.5 | Moderate-steep |
| γ_vagal | 4.0 | Very steep onset |

### Critical Safety Note

> **Fentanyl's EC50 for respiratory depression (0.8 ng/mL) is LOWER than its EC50 for analgesia (1.2 ng/mL).** This means respiratory depression occurs at doses below those needed for full analgesia — a core danger modeled in SedSim.

---

## Ketamine (Clements Model)

> **Reference:** Clements JA et al. *J Pharm Sci* 1982;71:539–542

### PK Parameters (70 kg reference patient)

| Parameter | Value | Unit | Scaling |
|-----------|-------|------|---------|
| V1 | 15.3 | L | Weight-adjusted |
| V2 | 28.0 | L | Weight-adjusted |
| V3 | 100.0 | L | Weight-adjusted |
| Cl1 | 1.200 | L/min | Weight-adjusted |
| Cl2 | 0.950 | L/min | Fixed |
| Cl3 | 0.120 | L/min | Fixed |
| ke0 | 0.200 | min⁻¹ | Fixed |

### PD Parameters (Unique Profile)

| Parameter | Value | Effect Channel | Direction |
|-----------|-------|----------------|-----------|
| EC50_dissociation | 0.8 mcg/mL | Dissociative state | ↑ |
| EC50_analgesia | 0.15 mcg/mL | Pain suppression | ↑ |
| EC50_sympathomimetic | 0.5 mcg/mL | HR + BP elevation | **↑ (opposite to propofol)** |
| Respiratory depression | Minimal | Preserved airway reflexes | **Minimal** |

---

## Naloxone (Opioid Antagonist)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Dose | 0.04–0.4 mg IV | Titrated in 0.04 mg increments |
| Onset | 1–2 minutes | Rapid |
| Duration | 30–45 minutes | **Shorter than fentanyl** → re-narcotization risk |
| Mechanism | Competitive μ-receptor antagonist | Displaces fentanyl from receptor |
| ke0 | 0.350 min⁻¹ | Fast effect-site equilibration |

---

## Flumazenil (Benzodiazepine Antagonist)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Dose | 0.1–0.5 mg IV | Titrated in 0.1 mg increments |
| Onset | 1–2 minutes | Rapid |
| Duration | 45–60 minutes | Re-sedation risk with long-acting benzos |
| Mechanism | Competitive GABAa antagonist | Displaces midazolam from receptor |
| ke0 | 0.200 min⁻¹ | Moderate equilibration |
| Risk | Seizures | If benzodiazepine-dependent patient |

---

## Drug Interaction Summary Matrix

```
             Propofol  Midazolam  Fentanyl  Ketamine  Naloxone  Flumazenil
Propofol       —       additive   SYNERGY     add      none      none
Midazolam    additive    —        SYNERGY     add      none      REVERSED
Fentanyl     SYNERGY   SYNERGY     —         add      REVERSED   none
Ketamine     additive  additive  additive     —       none      none
Naloxone      none      none     REVERSES    none       —        none
Flumazenil    none     REVERSES   none       none      none       —

SYNERGY  = synergistic respiratory depression (Bouillon β > 0)
additive = additive sedation effects
REVERSED = antagonist reverses agonist effect
REVERSES = this agent reverses the target
none     = no significant interaction
```

---

## Related Files

- [[01_PK_Engine_Three_Compartment]] — PK model consuming these parameters
- [[02_PD_Model_and_Drug_Interactions]] — PD interaction model (Bouillon surface)
- [[05_Patient_Archetypes_and_Scenarios]] — Covariate scaling per archetype
- [[07_Drug_Administration_and_Interventions]] — UI for drug delivery
- [[12_Validation_and_Clinical_Accuracy]] — MDAPE validation per drug model

---

#drug-library #propofol #midazolam #fentanyl #ketamine #naloxone #flumazenil #PK-parameters #PD-parameters

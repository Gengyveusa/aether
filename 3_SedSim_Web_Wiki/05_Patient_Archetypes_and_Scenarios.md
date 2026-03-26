# Patient Archetypes & Scenarios

> **Source:** `src/models/patientArchetypes.ts`, `src/engines/scenarioEngine.ts`
> **Archetypes:** 7 pre-defined patient profiles | **Scenarios:** JSON-driven state machine
> **Validation:** Zod schema validation for all scenario definitions

---

## Overview

SedSim provides 7 patient archetypes spanning the clinical spectrum from healthy young adults to complex elderly patients with multiple comorbidities. Each archetype defines baseline vitals, airway risk factors, PK covariate modifiers, and drug sensitivity adjustments that propagate through the entire simulation pipeline.

Scenarios are defined as JSON state machines that trigger timed events, clinical complications, and teaching moments during simulation.

---

## Patient Archetypes

### Complete Archetype Registry

| # | Name | ASA | Age | Weight | Sex | Key Risks |
|---|------|-----|-----|--------|-----|-----------|
| 1 | **Healthy Adult** | I | 35 | 75 kg | M | None — baseline reference |
| 2 | **Elderly Frail** | III | 78 | 60 kg | F | ↑ Drug sensitivity, ↓ cardiac reserve |
| 3 | **Obese OSA** | III | 52 | 130 kg | M | Difficult airway, rapid desaturation |
| 4 | **CHF Patient** | III | 68 | 85 kg | M | ↓ CO, ↓ cardiac reserve, fluid sensitivity |
| 5 | **Pediatric** | I | 8 | 25 kg | F | Weight-based dosing, rapid desaturation |
| 6 | **Anxious Young** | II | 28 | 65 kg | F | ↑ Baseline HR/BP, paradoxical benzo risk |
| 7 | **Renal Impairment** | III | 62 | 72 kg | M | Altered drug clearance, ↑ sensitivity |

---

### Archetype 1: Healthy Adult (Reference)

```
{
  name: "Healthy Adult",
  asa: "I",
  age: 35, weight: 75, height: 178, sex: "M",
  bmi: 23.7, lbm: 62.1,

  baselines: {
    HR: 72, SBP: 120, DBP: 78, RR: 14,
    SpO2: 99, EtCO2: 38, BIS: 97
  },

  airway: {
    mallampati: 1, osa: false,
    obstructionModifier: 1.0
  },

  pkModifiers: {
    clearanceMultiplier: 1.0,
    volumeMultiplier: 1.0
  },

  pdModifiers: {
    sensitivityMultiplier: 1.0,
    ec50Shift: 0
  }
}
```

---

### Archetype 3: Obese OSA (High-Risk Airway)

```
{
  name: "Obese OSA",
  asa: "III",
  age: 52, weight: 130, height: 175, sex: "M",
  bmi: 42.4, lbm: 68.2,

  baselines: {
    HR: 88, SBP: 148, DBP: 92, RR: 18,
    SpO2: 94, EtCO2: 42, BIS: 97
  },

  airway: {
    mallampati: 3, osa: true,
    obstructionModifier: 1.8   // ← 80% more likely to obstruct
  },

  pkModifiers: {
    clearanceMultiplier: 1.1,  // slightly increased hepatic clearance
    volumeMultiplier: 1.4      // larger Vd for lipophilic drugs
  },

  pdModifiers: {
    sensitivityMultiplier: 1.2, // ↑ sensitivity to respiratory depression
    ec50Shift: -0.15            // lower EC50 → effect at lower concentrations
  },

  specialRules: {
    reducedFRC: true,           // faster desaturation from apnea
    desaturationRate: 2.0,      // 2× faster SpO2 decline
    preOxBenefit: 0.5           // 50% less benefit from pre-oxygenation
  }
}
```

---

### Archetype 4: CHF Patient

```
{
  name: "CHF Patient",
  asa: "III",
  age: 68, weight: 85, height: 172, sex: "M",
  bmi: 28.7, ejectionFraction: 0.35,

  baselines: {
    HR: 92, SBP: 105, DBP: 65, RR: 20,
    SpO2: 95, EtCO2: 36, BIS: 97
  },

  specialRules: {
    reducedCO: true,
    cardiacOutput: 3.5,         // L/min (normal ≈ 5.0)
    armBrainTime: 45,           // seconds (normal ≈ 30) — slower onset
    hypotensionSensitivity: 1.8, // propofol BP drop amplified
    fluidResponsive: false       // won't improve with IV fluids alone
  }
}
```

---

## Covariate Scaling Rules

| Covariate | Affects | Formula |
|-----------|---------|---------|
| Total Body Weight (TBW) | Propofol PK volumes + clearances | Linear: V1 = 0.228 × TBW |
| Lean Body Mass (LBM) | Remifentanil PK (Minto) | James: M = 1.1×TBW - 128×(TBW/ht)²; F = 1.07×TBW - 148×(TBW/ht)² |
| Age | Clearance reduction, ↑ sensitivity | Cl_adjusted = Cl × (1 - 0.005 × (age - 40)) for age > 40 |
| Sex | LBM calculation, volume differences | Female: ~10% lower V1, ~15% lower LBM |
| BMI | Airway obstruction, FRC, desaturation | obstructionMod × (1 + max(0, BMI-30)/40) |
| Ejection Fraction | Cardiac output, arm-brain time | CO = baselineCO × EF/0.55 |

---

## Scenario Engine (State Machine)

The ScenarioEngine runs JSON-defined scenarios as a finite state machine:

```
┌──────────┐    trigger     ┌──────────┐    trigger     ┌──────────┐
│  IDLE    │──────────────→│  EVENT   │──────────────→│  EVENT   │
│          │               │  Phase 1  │               │  Phase 2  │
└──────────┘               └──────────┘               └──────────┘
     ↑                          │                          │
     │          timeout /       │         timeout /        │
     │          learner action  │         learner action   │
     └──────────────────────────┴──────────────────────────┘
                              (end)
```

### Scenario JSON Schema (Zod-Validated)

```typescript
const ScenarioSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  patient: z.string(),              // archetype ID
  duration: z.number(),            // max sim time (seconds)
  objectives: z.array(z.string()),

  phases: z.array(z.object({
    id: z.string(),
    name: z.string(),
    startTime: z.number(),         // seconds from sim start
    trigger: z.enum(['time', 'vital_threshold', 'drug_given', 'manual']),
    triggerCondition: z.any().optional(),
    events: z.array(z.object({
      type: z.enum(['vital_change', 'complication', 'prompt', 'milestone']),
      target: z.string().optional(),
      value: z.any(),
      duration: z.number().optional()
    })),
    teachingPoints: z.array(z.string()).optional(),
    expectedActions: z.array(z.string()).optional()
  }))
});
```

---

## Scenario Library

### Built-In Scenarios

| Scenario | Patient | Difficulty | Key Learning |
|----------|---------|------------|-------------|
| **Routine Colonoscopy (ASA I)** | Healthy Adult | Beginner | Basic propofol titration, monitoring |
| **Colonoscopy (ASA III CHF)** | CHF Patient | Advanced | Reduced CO, slow onset, hypotension risk |
| **Difficult Airway** | Obese OSA | Intermediate | Airway obstruction, rapid desaturation, interventions |
| **Opioid Oversedation** | Elderly Frail | Intermediate | Recognize resp depression, naloxone use |
| **Paradoxical Reaction** | Anxious Young | Intermediate | Midazolam agitation, ketamine alternative |
| **Pediatric Sedation** | Pediatric | Advanced | Weight-based dosing, rapid physiology changes |
| **Multi-Drug Interaction** | Healthy Adult | Advanced | Bouillon synergy, titration strategy |

### BLS/ACLS Module Scenarios

| Scenario | Starting State | Key Skills |
|----------|---------------|------------|
| **Respiratory Arrest** | Apnea, SpO2 falling | Bag-mask, airway adjuncts, naloxone |
| **Bradycardia (Opioid)** | HR < 40, fentanyl overdose | Atropine concept, naloxone |
| **Hypotension Crisis** | SBP < 70 post-propofol | Fluids, vasopressor concept, positioning |
| **Cardiac Arrest (VFib)** | Pulseless, VFib rhythm | Defibrillation, CPR, ACLS algorithm |

---

## ScenarioLoader

```
ScenarioLoader responsibilities:
  1. Fetch JSON from /public/scenarios/*.json
  2. Validate against Zod schema (fail-fast on invalid)
  3. Register with ScenarioEngine state machine
  4. Bind patient archetype to simulation
  5. Arm phase triggers (time-based or condition-based)
  6. Connect to Millie teaching point hooks
```

---

## Related Files

- [[01_PK_Engine_Three_Compartment]] — PK covariate scaling
- [[03_Drug_Library_and_Parameters]] — Drug parameters modified by archetype
- [[04_Physiology_Pipeline]] — Baselines and modifiers consumed here
- [[08_AI_Integration_Millie_SimMaster]] — Millie triggered by scenario teaching points
- [[09_Scoring_Assessment_Debrief]] — Scenario objectives feed scoring
- [[14_Education_and_Tutorial_System]] — Scenarios used in educational modules

---

#patient-archetypes #scenarios #state-machine #covariate-scaling #BLS #ACLS #scenario-engine #zod

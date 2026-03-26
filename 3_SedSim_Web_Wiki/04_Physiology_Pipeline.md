# Physiology Pipeline

> **Source:** `src/engines/physiologyEngine.ts` | **Tick rate:** 4 Hz (250 ms)
> **Inputs:** PD fractional effects + patient baseline + interventions
> **Outputs:** HR, BP, RR, SpO2, EtCO2, BIS, airway status, EmergencyState

---

## Overview

The physiology pipeline transforms PD drug effects into realistic vital signs every simulation tick. It models five interconnected physiological subsystems: **respiratory**, **oxygenation (SpO2)**, **cardiovascular**, **airway**, and **neurological (BIS)**. Each subsystem has drug-dependent and drug-independent components, patient-specific baselines, and intervention modifiers.

The pipeline executes in strict order — each subsystem's output feeds into subsequent subsystems within the same tick.

---

## Pipeline Execution Order

```
PD Fractional Effects (from pdEngine)
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────────┐
│Airway  │ │Respiratory │
│Status  │ │Drive       │
└───┬────┘ └──────┬─────┘
    │             │
    ▼             ▼
┌─────────────────────┐
│  Effective          │
│  Ventilation        │
│  (RR × Vt × airway)│
└──────────┬──────────┘
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
┌──────┐┌──────┐┌──────┐
│ SpO2 ││EtCO2 ││ BIS  │
│Cascade││Calc  ││Calc  │
└──┬───┘└──┬───┘└──┬───┘
   │       │       │
   ▼       ▼       ▼
┌──────────────────────┐
│  Cardiovascular      │
│  (HR, BP, CO)        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  EmergencyState      │
│  Classification      │
└──────────────────────┘
```

---

## 1. Respiratory Subsystem

### Respiratory Rate (RR)

```
effectiveRR = baselineRR × (1 - respiratoryDepressionFraction)
                         × airwayPatencyFactor
                         + interventionRRBonus

Clamped to: [0, 40] breaths/min
Apnea threshold: effectiveRR < 2
```

### Tidal Volume (Vt)

```
effectiveVt = baselineVt × (1 - respiratoryDepressionFraction × 0.7)
                         × airwayPatencyFactor

Minute ventilation (MV) = effectiveRR × effectiveVt
```

### Drug Effects on Respiration

| Drug | Mechanism | Effect on RR | Effect on Vt |
|------|-----------|-------------|-------------|
| Propofol | Central depression | ↓↓ | ↓ |
| Fentanyl | μ-receptor medullary | ↓↓↓ | ↓↓ |
| Midazolam | GABAa central | ↓ | ↓ |
| Propofol + Fentanyl | **Synergistic** | **↓↓↓↓↓** | **↓↓↓** |
| Ketamine | Preserved drive | Minimal ↓ | Minimal ↓ |

---

## 2. SpO2 Cascade

SpO2 is modeled as a **multi-stage cascade** with realistic time delays:

```
Stage 1: Alveolar O2 (PAO2)
  PAO2 = FiO2 × (Patm - PH2O) - PaCO2/RQ
  FiO2 adjusted by O2 delivery: room air (0.21) → nasal cannula (0.24-0.44) → facemask (0.60)

Stage 2: Arterial O2 (PaO2)
  PaO2 = PAO2 × ventilationEfficiency × shuntFactor
  ventilationEfficiency = effectiveMV / baselineMV

Stage 3: SpO2 (Oxygen-Hemoglobin Dissociation)
  SpO2 = 100 × PaO2^n / (PaO2^n + P50^n)     // Hill equation
  P50 = 26.6 mmHg (standard), n ≈ 2.7

Stage 4: Time Delay (Circulatory Transit)
  displayedSpO2 = lpf(SpO2, τ = 15-30 seconds)
  Finger probe delay: additional 10-15 second lag
```

### SpO2 Cascade Diagram

```
  FiO2 ──→ Alveolar Gas ──→ V/Q Matching ──→ PaO2 ──→ Hb Binding ──→ SpO2
  ↑              ↑                ↑              ↑            ↑
  O2 delivery    Ventilation      Shunt          Delay        OxyHb curve
  intervention   (RR × Vt)       (baseline)     (transit)    (P50, pH, temp)
```

### Pre-oxygenation Effect

```
O2 reservoir model:
  FRC capacity ≈ 30 mL/kg (functional residual capacity)
  Pre-O2 fills FRC with high FiO2 → extends time-to-desaturation
  Obese patient: reduced FRC → faster desaturation

  Time to SpO2 < 90% from apnea onset:
    Healthy, pre-oxygenated:    8-10 minutes
    Healthy, room air:          2-3 minutes
    Obese, pre-oxygenated:     3-4 minutes
    Obese, room air:           1-2 minutes
```

---

## 3. Airway Obstruction

Airway patency is modeled as a **nonlinear function of sedation depth**, modified by patient risk factors:

```
obstructionLevel = sigmoidObstruction(sedationFraction)
                 × mallampatiModifier
                 × osaModifier
                 × bmiModifier
                 × positionModifier

sigmoidObstruction(s):
  if s < 0.3: return 0.0              // light sedation → patent airway
  if s < 0.5: return 0.2 × (s-0.3)/0.2  // transition zone
  if s < 0.8: return 0.2 + 0.6 × (s-0.5)/0.3  // progressive obstruction
  else:       return 0.8 + 0.2 × (s-0.8)/0.2   // near-complete obstruction
```

### Risk Factor Modifiers

| Factor | Modifier Range | High-Risk Value |
|--------|---------------|-----------------|
| Mallampati score | 1.0–2.0 | Class IV = 2.0× |
| OSA diagnosis | 1.0–1.8 | Severe OSA = 1.8× |
| BMI | 1.0–1.5 | BMI > 40 = 1.5× |
| Position | 0.8–1.2 | Supine = 1.2, lateral = 0.8 |

### Intervention Relief

| Intervention | Obstruction Reduction | Onset |
|--------------|----------------------|-------|
| Chin lift | -30% | Immediate |
| Jaw thrust | -50% | Immediate |
| Oral airway (OPA) | -60% | Immediate |
| Nasal airway (NPA) | -50% | Immediate |
| Bag-mask ventilation | -40% + assisted Vt | Immediate |
| Suction | -20% (clears secretions) | 5 seconds |

---

## 4. EtCO2 (End-Tidal CO2)

```
EtCO2 = (VCO2 / alveolarVentilation) × k

where:
  VCO2 = CO2 production rate (≈ 200 mL/min baseline, ↑ with metabolic rate)
  alveolarVentilation = (effectiveRR × effectiveVt) × (1 - Vd/Vt)
  k = conversion constant
  Vd/Vt = dead space fraction (≈ 0.3 baseline)
```

### EtCO2 Waveform Morphology

| Condition | Waveform Shape | EtCO2 Value |
|-----------|---------------|-------------|
| Normal | Rectangular with plateau | 35–45 mmHg |
| Hypoventilation | Normal shape, elevated | 45–70+ mmHg |
| Obstruction | **Shark-fin** (sloped upstroke) | Variable |
| Apnea/disconnect | **Flatline** | 0 mmHg |
| Hyperventilation | Normal shape, reduced | < 30 mmHg |
| Bronchospasm | Shark-fin morphology | Variable |

### Shark-Fin Detection

```
Capnogram shape factor:
  normal_upstroke = 0.95 (near-vertical)
  shark_fin = airwayObstruction × 0.7 (sloped upstroke)

  Rendered in canvas with angle interpolation based on obstruction level
```

---

## 5. Cardiovascular Subsystem

### Heart Rate (HR)

```
HR = baselineHR
   × (1 - cardiovascularDepressionFraction × 0.3)   // propofol depression
   × (1 - vagalFraction × 0.5)                      // fentanyl bradycardia
   × (1 + sympathomimeticFraction × 0.3)             // ketamine effect
   × baroReflexGain                                  // compensatory reflex
   + noiseHR                                         // ±2 bpm variability

baroReflexGain:
  if SBP < baselineSBP:
    gain = 1 + 0.01 × (baselineSBP - SBP)  // compensatory tachycardia
  else:
    gain = 1.0
```

### Blood Pressure (BP)

```
SBP = baselineSBP × (1 - cardiovascularDepressionFraction × 0.4)
                   × (1 + sympathomimeticFraction × 0.2)
                   × fluidBolusEffect
                   + noiseBP

DBP = SBP × 0.6   // simplified constant ratio
MAP = DBP + (SBP - DBP) / 3
```

### Fentanyl Vagal Bradycardia

```
At high Ce_fentanyl (> 3 ng/mL):
  vagalFraction increases steeply (γ = 4.0)
  HR can drop to < 50 bpm
  Baroreceptor reflex partially compensates

Clinical teaching point: high-dose opioid bolus → sudden bradycardia
```

---

## 6. BIS Computation

```
BIS = 97 - (97 - 20) × combinedSedationFraction^γ_BIS
    + patientSensitivityOffset     // ±5 inter-patient variability
    + noise_BIS                     // ±3 random variation (EMG, artifacts)
    + ketamineArtifact              // paradoxical ↑ BIS with ketamine

Clamped to: [0, 100]

where:
  combinedSedationFraction = f(U_propofol, U_midazolam, U_ketamine)
  γ_BIS ≈ 2.0 (moderate sigmoid mapping)
```

### BIS Interpretation Scale

| BIS Range | Clinical State | Color Code |
|-----------|---------------|------------|
| 90–100 | Awake | White |
| 65–85 | **Target: Moderate sedation** | **Green** |
| 40–65 | Deep sedation / light anesthesia | Yellow |
| 20–40 | General anesthesia | Orange |
| 0–20 | Burst suppression / isoelectric | Red |

---

## 7. EmergencyState Classification

Computed every tick based on current vitals:

```
enum EmergencyState {
  NORMAL,     // All vitals within acceptable range
  WARNING,    // One or more vitals in amber zone
  CRITICAL,   // One or more vitals in red zone
  ARREST      // Cardiac or respiratory arrest
}
```

| Parameter | Normal | Warning (Amber) | Critical (Red) |
|-----------|--------|-----------------|----------------|
| SpO2 | ≥ 94% | 90–93% | < 90% |
| HR | 50–120 | 40–49 or 121–140 | < 40 or > 140 |
| SBP | 90–180 | 80–89 or 181–200 | < 80 or > 200 |
| RR | 8–30 | 5–7 or 31–35 | < 5 or > 35 |
| EtCO2 | 30–45 | 46–55 or 25–29 | > 55 or < 20 |
| BIS | 65–85 | 40–64 or 86–97 | < 40 |

---

## Related Files

- [[02_PD_Model_and_Drug_Interactions]] — Upstream: fractional drug effects
- [[05_Patient_Archetypes_and_Scenarios]] — Patient baselines feeding pipeline
- [[06_Monitor_Display_and_Waveforms]] — Downstream: rendered vital signs
- [[07_Drug_Administration_and_Interventions]] — Interventions modifying physiology
- [[11_State_Management_and_Data_Flow]] — Zustand integration of computed vitals
- [[09_Scoring_Assessment_Debrief]] — EmergencyState drives scoring

---

#physiology #respiratory #SpO2 #cardiovascular #airway #EtCO2 #BIS #emergency-state #vital-signs

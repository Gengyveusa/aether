# Drug Administration & Interventions

> **Source:** `src/components/drugs/DrugPanel.tsx`, `src/engines/physiologyEngine.ts`
> **Drugs:** 6 agents (4 agonists + 2 reversal) | **Interventions:** 7 airway/supportive maneuvers
> **O2 delivery:** 4 modes (room air, nasal cannula, face mask, bag-mask)

---

## Overview

The Drug Administration panel and Intervention controls are the primary learner interaction surfaces. Drugs are administered as IV boluses or continuous infusions, with real-time concentration trends displayed alongside the monitor. Airway interventions and supplemental oxygen directly modify the physiology pipeline (see [[04_Physiology_Pipeline]]).

---

## DrugPanel Component

### Layout

```
┌─────────────────────────────────────────────────────┐
│  💉 DRUG ADMINISTRATION                              │
├──────────────┬──────────────┬────────────────────────┤
│  Propofol    │  [20] [50]  │  ▶ Infusion: 75 mcg/kg │
│  Ce: 2.1    │  [100][200] │  [Start] [Stop] [Rate↑]│
├──────────────┼──────────────┼────────────────────────┤
│  Midazolam   │  [0.5] [1]  │                        │
│  Ce: 0.04   │  [2]  [5]   │  Bolus only            │
├──────────────┼──────────────┼────────────────────────┤
│  Fentanyl    │  [25] [50]  │                        │
│  Ce: 0.6    │  [75] [100] │  Bolus only            │
├──────────────┼──────────────┼────────────────────────┤
│  Ketamine    │  [10] [25]  │                        │
│  Ce: 0.0    │  [50]       │  Bolus only            │
├──────────────┼──────────────┼────────────────────────┤
│  ⚠ REVERSAL AGENTS                                  │
│  Naloxone    │  [0.04][0.1]│  [0.2] [0.4]          │
│  Flumazenil  │  [0.1][0.2] │  [0.5]                │
├──────────────┴──────────────┴────────────────────────┤
│  Concentration Trend Chart (Cp and Ce vs time)       │
│  ─── Cp (plasma)   --- Ce (effect-site)              │
│  Ghost preview: ╌╌╌ (proposed dose)                  │
└──────────────────────────────────────────────────────┘
```

### Bolus Buttons

Each bolus button represents a fixed dose in clinical units:

| Drug | Button Doses | Unit | Route |
|------|-------------|------|-------|
| Propofol | 20, 50, 100, 200 | mg | IV push |
| Midazolam | 0.5, 1, 2, 5 | mg | IV push |
| Fentanyl | 25, 50, 75, 100 | mcg | IV push |
| Ketamine | 10, 25, 50 | mg | IV push |
| Naloxone | 0.04, 0.1, 0.2, 0.4 | mg | IV push |
| Flumazenil | 0.1, 0.2, 0.5 | mg | IV push |

### Infusion Controls (Propofol Only)

```
Infusion rate options:
  - Manual rate entry: mcg/kg/min
  - Preset rates: 25, 50, 75, 100, 150, 200 mcg/kg/min
  - Controls: [Start] [Stop] [Rate ↑] [Rate ↓]

  Conversion: mg/min = (mcg/kg/min × weight_kg) / 1000
  Added to A1 each tick: mg/min × (dt / 60)
```

### Concentration Trend Display

```
Chart specifications:
  X-axis: Time (last 30 minutes, scrollable)
  Y-axis: Concentration (auto-scaled per drug)

  Traces:
    Solid line:  Cp (plasma concentration)
    Dashed line: Ce (effect-site concentration)
    Dotted gray: GhostDosePreview (proposed dose projection)

  Markers:
    ▼ Bolus marker at time of administration
    ▮ Infusion start/stop markers

  Colors: Match drug panel row colors
```

---

## GhostDosePreview

```
On hover over any bolus button:
  1. Clone current PK state for that drug
  2. Simulate proposed bolus forward 10 minutes (RK4)
  3. Include current interventions in forward sim
  4. Render predicted Cp + Ce as dotted overlay
  5. Show predicted peak Ce and time-to-peak
  6. Highlight if predicted Ce crosses safety threshold

  Visual: Dashed line diverging from current trend
  Color: Semi-transparent version of drug color
  Label: "Peak Ce: 4.2 mcg/mL @ +1.5 min"
```

---

## Airway Interventions

### Available Interventions

| Intervention | Obstruction Relief | Additional Effects | Toggle/Momentary |
|-------------|-------------------|-------------------|------------------|
| **Chin lift** | -30% | None | Toggle (on/off) |
| **Jaw thrust** | -50% | None | Toggle |
| **Oral airway (OPA)** | -60% | May trigger gag if light sedation | Toggle |
| **Nasal airway (NPA)** | -50% | Better tolerated at lighter levels | Toggle |
| **Bag-mask ventilation** | -40% obstruction + assisted Vt | Provides positive pressure ventilation | Momentary (hold) |
| **Suction** | -20% (clears secretions) | Brief interruption of ventilation | Momentary (5s) |
| **IV fluids** | None | ↑ BP (+10-15 mmHg over 5 min) | Toggle (250mL bolus) |

### Intervention Panel Layout

```
┌────────────────────────────────────┐
│  🫁 AIRWAY & INTERVENTIONS         │
├────────┬────────┬──────────────────┤
│ [Chin  │ [Jaw   │  Active: ✅ Jaw  │
│  Lift] │ Thrust]│  thrust          │
├────────┼────────┤                  │
│ [OPA]  │ [NPA]  │  Obstruction:    │
│        │        │  ▓▓░░░░░░ 25%    │
├────────┼────────┤                  │
│ [Bag-  │[Suction│  FiO2: 0.40     │
│  Mask] │       ]│                  │
├────────┴────────┤                  │
│  O2 Delivery:   │                  │
│  ○ Room Air     │  SpO2 trend:     │
│  ● Nasal 4L     │  98 → 97 → 96   │
│  ○ Face Mask    │                  │
│  ○ Non-Rebreath │                  │
├─────────────────┤                  │
│ [IV Fluids 250] │  BP trend:       │
│  Total: 500 mL  │  120 → 118      │
└────────┬────────┴──────────────────┘
```

---

## Supplemental Oxygen Management

| Delivery Mode | FiO2 | Flow Rate | Use Case |
|--------------|-------|-----------|----------|
| Room air | 0.21 | — | No supplementation |
| Nasal cannula (2L) | 0.28 | 2 L/min | Light sedation |
| Nasal cannula (4L) | 0.36 | 4 L/min | Moderate sedation |
| Nasal cannula (6L) | 0.44 | 6 L/min | Maximum nasal |
| Simple face mask | 0.50 | 8 L/min | Desaturation rescue |
| Non-rebreather mask | 0.80 | 15 L/min | Emergency |
| Bag-mask (100% O2) | 1.00 | 15 L/min | Apnea/arrest |

### Pre-Oxygenation Protocol

```
Pre-O2 workflow (before sedation):
  1. Apply O2 delivery device (nasal cannula or face mask)
  2. Wait 3-5 minutes of tidal breathing at high FiO2
  3. O2 reservoir (FRC) fills with O2-rich gas
  4. Extends "safe apnea time" before desaturation

  SedSim models this via FRC O2 store:
    O2store += FiO2 × tidalVolume × RR × dt
    O2store capped at FRC × FiO2_alveolar

    During apnea: O2store depletes at metabolic rate (VO2 ≈ 250 mL/min)
    SpO2 drops when O2store < critical threshold
```

---

## Drug Administration Workflow

```
User clicks bolus button:
  1. Validate: drug not on cooldown (prevent accidental double-dose)
  2. Log event: { type: 'bolus', drug, dose, time, Ce_at_time }
  3. Add dose to PK engine: drugStates[drug].A1 += doseMg
  4. Update totalDoseGiven
  5. Trigger Millie context update (if dose is notable)
  6. Play admin sound effect (click)
  7. Flash bolus marker on concentration trend
  8. If dose exceeds safety threshold: show amber warning tooltip

  Safety thresholds (warning only, not blocked):
    Propofol: > 200 mg single bolus
    Fentanyl: > 100 mcg single bolus
    Midazolam: > 5 mg single bolus
    Naloxone: > 0.4 mg total
```

---

## Reversal Agent Decision Logic

```
When to use Naloxone:
  ✅ Apnea or RR < 6 with opioid on board
  ✅ SpO2 < 85% not responding to airway maneuvers
  ⚠ Risk: re-narcotization (opioid half-life > naloxone)
  ⚠ Risk: acute withdrawal symptoms, hypertension, arrhythmia

When to use Flumazenil:
  ✅ Prolonged sedation from midazolam, not recovering
  ✅ Need to rapidly reverse for airway management
  ⚠ Risk: seizures (especially if chronic benzo use)
  ⚠ Risk: re-sedation with high midazolam doses
```

---

## Related Files

- [[01_PK_Engine_Three_Compartment]] — PK engine receiving bolus/infusion inputs
- [[03_Drug_Library_and_Parameters]] — Drug doses and parameters
- [[04_Physiology_Pipeline]] — Interventions modifying physiology
- [[06_Monitor_Display_and_Waveforms]] — Concentration trend display
- [[08_AI_Integration_Millie_SimMaster]] — Millie commenting on drug choices
- [[09_Scoring_Assessment_Debrief]] — Drug decisions scored for grading
- [[10_Component_Architecture]] — DrugPanel component spec

---

#drug-panel #bolus #infusion #interventions #airway #oxygen #reversal-agents #ghost-preview

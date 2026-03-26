# Scoring, Assessment & Debrief

> **Source:** `src/scoring/metricsCollector.ts`, `src/scoring/gradingRubric.ts`
> **Metrics:** 3 categories — Safety, Sedation Quality, Decision Quality
> **Grading:** A (>90) / B (75–90) / C (60–75) / F (<60)

---

## Overview

SedSim provides a comprehensive post-simulation assessment system that scores learner performance across three domains: **safety** (did the patient come to harm?), **sedation quality** (was the sedation level appropriate?), and **decision quality** (did the learner make good clinical choices?). Scores are combined into a final grade with a detailed debrief timeline.

---

## Metrics Collection

The `metricsCollector` runs throughout the simulation, recording events and computing running statistics:

```
MetricsCollector responsibilities:
  1. Sample vitals every tick (4 Hz) → compute time-weighted averages
  2. Record all drug administration events with timestamps
  3. Track alarm durations (time spent in each alarm state)
  4. Record intervention timing (time from event to response)
  5. Detect and log apnea episodes (RR < 2 for > 10 seconds)
  6. Flag safety-critical events for debrief markers
```

---

## Safety Metrics (40% of Final Score)

| Metric | Description | Scoring | Weight |
|--------|-------------|---------|--------|
| Time SpO2 < 94% | Mild desaturation duration | -2 pts per 15 seconds | 8% |
| Time SpO2 < 90% | Significant desaturation | -5 pts per 15 seconds | 10% |
| Lowest SpO2 | Nadir oxygen saturation | 100 if ≥ 94%, linear ↓ to 0 at SpO2 60% | 8% |
| Time-to-recognize | Seconds from alarm onset to first intervention | 100 if < 15s, -3 pts per 5s after | 5% |
| Apnea count | Number of apnea episodes (RR < 2, > 10s) | 100 minus 15 per episode | 4% |
| Hypotension time | Duration SBP < 90 mmHg | -3 pts per 30 seconds | 5% |

### Safety Score Computation

```
safetyScore = weightedAverage([
  { metric: spo2_below_94_score, weight: 0.20 },
  { metric: spo2_below_90_score, weight: 0.25 },
  { metric: lowest_spo2_score,   weight: 0.20 },
  { metric: time_to_recognize,   weight: 0.125 },
  { metric: apnea_count_score,   weight: 0.10 },
  { metric: hypotension_score,   weight: 0.125 }
])

// Clamped to [0, 100]
```

---

## Sedation Quality Metrics (30% of Final Score)

| Metric | Description | Scoring | Weight |
|--------|-------------|---------|--------|
| Time in target BIS (65–85) | Percentage of procedure time in target range | Direct percentage → score | 12% |
| Oversedation episodes | BIS < 50 for > 30 seconds | 100 minus 10 per episode | 8% |
| Undersedation episodes | BIS > 85 for > 60 seconds (after induction) | 100 minus 8 per episode | 5% |
| BIS stability | Standard deviation of BIS during maintenance | 100 if SD < 5, linear ↓ | 5% |

### Target BIS Ranges

```
BIS Target Zones:
  ┌─────────────────────────────────────────┐
  │ 100 │ Awake                              │
  │  97 │──────── Baseline ────────────────  │
  │  85 │════════ TARGET ZONE TOP ═════════  │ ← undersedation above
  │  75 │         OPTIMAL                    │
  │  65 │════════ TARGET ZONE BOTTOM ══════  │ ← oversedation below
  │  50 │-------- Deep sedation warning ---- │
  │  40 │-------- General anesthesia ------  │
  │  20 │-------- Burst suppression ------   │
  └─────────────────────────────────────────┘
```

---

## Decision Quality Metrics (30% of Final Score)

| Metric | Description | Scoring | Weight |
|--------|-------------|---------|--------|
| Pre-oxygenation | Applied O2 before first sedative dose | 100 if yes, 40 if no | 8% |
| Starting dose | First dose within appropriate range for patient | 100 if appropriate, penalties for over/under | 7% |
| Titration approach | Incremental dosing vs. large single boluses | Titration score algorithm | 7% |
| Reversal agent use | Appropriate use when indicated | See decision matrix below | 4% |
| Monitoring awareness | Responded to alarm within 30 seconds | 100 minus 5 per missed alarm | 4% |

### Pre-Oxygenation Scoring

```
preOxScore:
  if (O2_applied_before_first_sedative):
    if (O2_duration >= 180 seconds): 100  // 3+ minutes, ideal
    if (O2_duration >= 60 seconds):  85   // adequate
    else: 70                              // brief but present
  else:
    if (high_risk_patient): 20            // critical miss
    else: 40                              // significant miss
```

### Titration Scoring Algorithm

```
titrationScore:
  totalBoluses = count of all sedative boluses
  avgDosePerBolus = totalDose / totalBoluses
  maxSingleBolus = max dose in any single bolus

  if (totalBoluses >= 3 && avgDosePerBolus < maxRecommended * 0.5):
    score = 95  // excellent titration
  else if (totalBoluses >= 2 && avgDosePerBolus < maxRecommended * 0.75):
    score = 80  // good titration
  else if (totalBoluses == 1 && dose < maxRecommended):
    score = 60  // single appropriate dose
  else if (maxSingleBolus > maxRecommended):
    score = 30  // excessive single dose
  else:
    score = 50  // default moderate
```

### Reversal Agent Decision Matrix

| Scenario | Used Reversal | Didn't Use | Score |
|----------|--------------|------------|-------|
| Apnea + opioid on board | Naloxone given | Missed opportunity | 100 / 30 |
| Prolonged sedation, benzo only | Flumazenil given | Waited too long | 90 / 50 |
| No indication for reversal | Correctly withheld | N/A | 100 |
| Unnecessary reversal given | Inappropriate use | N/A | 40 |

---

## Final Grading

```
finalScore = safetyScore     × 0.40
           + sedationScore   × 0.30
           + decisionScore   × 0.30

Grade assignment:
  A  = finalScore > 90   // "Excellent — ready for clinical sedation"
  B  = finalScore > 75   // "Good — minor areas for improvement"
  C  = finalScore > 60   // "Needs improvement — review key concepts"
  F  = finalScore ≤ 60   // "Unsafe — repeat training required"
```

### Grade Display

```
┌──────────────────────────────────────────────┐
│  📊 SIMULATION RESULTS                       │
├──────────────────────────────────────────────┤
│                                              │
│         Final Grade:  B  (82/100)            │
│                                              │
│  Safety:          78/100  ████████░░         │
│  Sedation:        88/100  █████████░         │
│  Decisions:       80/100  ████████░░         │
│                                              │
│  ⚠ Key Issues:                               │
│  • SpO2 < 90% for 22 seconds                │
│  • No pre-oxygenation before first dose      │
│  • Delayed airway intervention (28 seconds)  │
│                                              │
│  ✅ Strengths:                                │
│  • Good BIS target maintenance (72% in zone) │
│  • Appropriate titration approach             │
│  • Correct naloxone use for apnea            │
│                                              │
│  [View Detailed Timeline] [Export Report]     │
└──────────────────────────────────────────────┘
```

---

## Debrief Timeline

An interactive timeline showing the full simulation with clickable markers:

```
Timeline visualization:
  ──────────────────────────────────────────────→ Time
  │         │              │           │
  ▼         ▼              ▼           ▼
  Propofol  Fentanyl       Jaw thrust  Naloxone
  100mg     75mcg          applied     0.2mg

  Vital trends overlaid:
  ───── SpO2 (green line, 94→88→92→97)
  ───── HR (yellow line, 72→65→58→62)
  ───── BIS (white line, 97→72→55→68)

  Clickable markers:
  🔴 Critical event: SpO2 dropped below 90%
  🟡 Warning: RR < 8 detected
  🟢 Good action: Airway opened within 10 seconds
  💬 Millie spoke: "What's your next move?"
```

### Event Logger

```
eventLog: Array<{
  time: number,          // simulation seconds
  type: EventType,       // 'bolus' | 'infusion' | 'intervention' | 'alarm' | 'milestone' | 'ai_message'
  category: Category,    // 'drug' | 'airway' | 'vital' | 'ai' | 'scenario'
  detail: string,        // human-readable description
  value?: number,        // associated numeric value
  severity?: Severity    // 'info' | 'warning' | 'critical'
}>

Logged automatically:
  - Every drug bolus and infusion change
  - Every alarm activation and resolution
  - Every intervention start and stop
  - Every Millie message
  - Every scenario phase transition
  - Every vital sign crossing a threshold
```

---

## Related Files

- [[04_Physiology_Pipeline]] — EmergencyState classification feeding scoring
- [[06_Monitor_Display_and_Waveforms]] — Alarm events logged for scoring
- [[07_Drug_Administration_and_Interventions]] — Drug decisions scored
- [[08_AI_Integration_Millie_SimMaster]] — AI interactions in debrief timeline
- [[13_LMS_Integration_and_Deployment]] — Scores exported via xAPI/SCORM
- [[14_Education_and_Tutorial_System]] — Scoring tied to learning objectives

---

#scoring #assessment #debrief #grading #safety-metrics #BIS-target #event-logger #timeline

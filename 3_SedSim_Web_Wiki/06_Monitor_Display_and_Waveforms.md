# Monitor Display & Waveforms

> **Source:** `src/components/monitor/` | **Rendering:** HTML5 Canvas (2D context)
> **Aesthetic:** Medical-grade dark UI (Philips IntelliVue / GE CARESCAPE inspired)
> **Audio:** Web Audio API for SpO2 pitch + alarm tones

---

## Overview

The monitor display replicates a clinical patient monitor with real-time waveform traces, numeric vital sign readouts, and a tiered alarm system. It is designed to be visually indistinguishable from a real anesthesia monitor to maximize training transfer.

---

## Color Palette

### Waveform Colors

| Trace | Color | Hex | Clinical Standard |
|-------|-------|-----|-------------------|
| **ECG** | Green | `#08cc66` | Philips/GE standard |
| **SpO2 Pleth** | Cyan | `#00ff88` | Industry standard |
| **Capnography** | Yellow | `#ffcc00` | Industry standard |
| **IBP / Art Line** | Red | `#ff3333` | Industry standard |
| **BIS / EEG** | White | `#cccccc` | Neutral trace |

### UI Colors

| Element | Color | Hex |
|---------|-------|-----|
| Background | Near-black | `#0a0a0f` |
| Panel borders | Dark charcoal | `#1a1a2e` |
| Text (primary) | Off-white | `#e0e0e0` |
| Text (dimmed) | Gray | `#666680` |
| Alarm amber | Warning yellow | `#ffaa00` |
| Alarm red | Critical red | `#ff2222` |
| Safe zone | Muted green | `#22cc44` |

### Typography

| Context | Font | Weight | Size |
|---------|------|--------|------|
| Vital sign numerics | **JetBrains Mono** | 700 | 48–64px |
| Vital sign labels | **IBM Plex Sans** | 400 | 12–14px |
| Alarm text | **IBM Plex Sans** | 700 | 16px |
| Waveform labels | **IBM Plex Sans** | 300 | 10px |
| Clock / timer | **JetBrains Mono** | 400 | 18px |

---

## Monitor Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  SEDSIM  ██████████████████  ⏱ 00:04:32  🔇 🔊  ⚙ Settings        │
├──────────────────────────────────┬───────────────────────────────────┤
│                                  │                                   │
│   ECG Trace (#08cc66)           │   HR        72    bpm  ♡          │
│   ~~~~~~~~~/\~~~~~/\~~~~~       │   ──────────────────              │
│                                  │   SpO2      98    %   (pleth)    │
│   SpO2 Pleth (#00ff88)          │   ──────────────────              │
│   ~~~~∩~~~~∩~~~~∩~~~~           │   NIBP    120/78   mmHg          │
│                                  │           (MAP 92)               │
│   Capnography (#ffcc00)         │   ──────────────────              │
│   ___/‾‾‾‾\___/‾‾‾‾\___        │   RR        14    br/min         │
│                                  │   ──────────────────              │
│   BIS Trend (white)             │   EtCO2     38    mmHg           │
│   ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾         │   ──────────────────              │
│                                  │   BIS       97                    │
│                                  │   ▓▓▓▓▓▓▓▓▓▓▓░░ (bar graph)    │
├──────────────────────────────────┴───────────────────────────────────┤
│  ALARMS: ▮ All Clear                                                 │
├──────────────────────────────────────────────────────────────────────┤
│  Drug Panel  │  Concentration Trends  │  Millie AI  │  Controls     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Canvas Waveform Rendering

### ECG Waveform

```
ECG generation algorithm:
  1. Base cycle length = 60 / HR (seconds)
  2. PQRST template (normalized amplitude):
     P-wave:  0.15 amplitude, 80ms duration
     PR seg:  0.00, 120ms
     Q-wave: -0.10, 20ms
     R-wave:  1.00, 40ms (sharp peak)
     S-wave: -0.20, 40ms
     ST seg:  0.00, 100ms
     T-wave:  0.25, 160ms
  3. Interpolate template to current HR
  4. Add baseline wander (0.05 amplitude, 0.1 Hz)
  5. Add EMG noise (±0.02 random)
  6. Render via canvas lineTo() at 250 samples/sec
```

### SpO2 Plethysmograph

```
Pleth generation:
  1. Dicrotic notch template (systolic + diastolic peaks)
  2. Amplitude proportional to SpO2 (lower SpO2 → smaller amplitude)
  3. Cycle synced to HR
  4. Perfusion index modulates amplitude
  5. Damped waveform in hypotension
```

### Capnography (EtCO2)

```
Capno waveform generation:
  Phase I:   Inspiratory baseline (≈ 0 mmHg)     — dead space gas
  Phase II:  Rapid upstroke                        — alveolar gas mixing
  Phase III: Alveolar plateau (= EtCO2 value)     — pure alveolar gas
  Phase IV:  Sharp downstroke                      — inspiration begins

  Shark-fin morphology (obstruction):
    Phase II slope decreases proportional to airwayObstruction
    Phase III plateau becomes sloped upward

  Flatline (apnea):
    All phases → 0 mmHg after 15-20 second washout
```

---

## SpO2 Audible Pitch (Web Audio API)

```
Web Audio API implementation:
  const audioCtx = new AudioContext();
  const oscillator = audioCtx.createOscillator();

  Pitch mapping (clinical standard):
    SpO2 100% → 880 Hz (high A)
    SpO2  90% → 440 Hz (middle A)
    SpO2  80% → 220 Hz (low A)

    frequency = 220 + (SpO2 - 80) × (660 / 20)  // linear mapping 80-100%

  Beep pattern:
    One beep per heartbeat (synced to HR)
    Beep duration: 100ms
    Silence: remainder of cardiac cycle

  Volume: user-adjustable, default 0.3
  Mute: toggle via 🔇 button
```

### Audio Cue Summary

| Event | Sound | Frequency | Pattern |
|-------|-------|-----------|---------|
| Normal SpO2 beep | Pure tone | 660–880 Hz | Per heartbeat |
| Desaturation beep | Dropping pitch | 220–440 Hz | Per heartbeat |
| Warning alarm | Repeating chime | 1000 Hz | 3 beeps, pause |
| Critical alarm | Urgent tone | 1400 Hz | Continuous rapid |
| Flatline | Continuous tone | 440 Hz | Sustained |

---

## Alarm System

### Alarm Tiers

| Tier | Color | Visual | Audio | Trigger Conditions |
|------|-------|--------|-------|-------------------|
| **Normal** | Green text | Steady display | SpO2 beeps only | All vitals in range |
| **Warning** | Amber `#ffaa00` | Amber border flash | 3-tone chime, 5s interval | Any vital in amber zone |
| **Critical** | Red `#ff2222` | **Red pulsing background** | Continuous urgent alarm | Any vital in red zone |

### Alarm Thresholds

| Vital | Warning Low | Warning High | Critical Low | Critical High |
|-------|-------------|-------------|--------------|---------------|
| SpO2 | 93% | — | **< 90%** | — |
| HR | 50 bpm | 120 bpm | **< 40 bpm** | **> 140 bpm** |
| SBP | 90 mmHg | 180 mmHg | **< 80 mmHg** | **> 200 mmHg** |
| RR | 8 br/min | 30 br/min | **< 5 br/min** | **> 35 br/min** |
| EtCO2 | 30 mmHg | **55 mmHg** | < 20 mmHg | > 65 mmHg |
| BIS | — | — | < 40 | — |

### Alarm Suppression Rules

```
1. New alarm: 10-second grace period before audio (prevents nuisance alarms)
2. Repeated alarm: 30-second silence after user acknowledges
3. Critical SpO2 < 85%: NO suppression allowed — always audible
4. Alarm history logged to event timeline for debrief
```

---

## VitalCoherenceMonitor

The VitalCoherenceMonitor component reads `activeAlarms` directly from the unified alarm store and cross-checks vital sign coherence:

```
Coherence checks:
  - SpO2 dropping + RR normal → sensor artifact? or early desaturation?
  - HR rising + BP falling → compensatory tachycardia (check volume)
  - EtCO2 rising + RR falling → hypoventilation (check airway)
  - BIS dropping + vitals stable → deepening sedation (titrate down)
  - All dropping simultaneously → cardiovascular collapse (emergency)
```

---

## Conductor Audio Layer

The Conductor module orchestrates all audio sources:

```
Conductor responsibilities:
  1. SpO2 pitch oscillator (continuous, synced to HR)
  2. Alarm tone generator (priority-based: critical > warning)
  3. UI sound effects (drug administered click, timer beep)
  4. Precordial stethoscope audio (heart/breath sounds)
  5. Millie voice output (TTS or pre-recorded)

  Audio priority queue:
    Critical alarm > Millie speech > Warning alarm > SpO2 beep > UI sounds
```

---

## Related Files

- [[04_Physiology_Pipeline]] — Vital signs driving display values
- [[07_Drug_Administration_and_Interventions]] — Drug panel adjacent to monitor
- [[09_Scoring_Assessment_Debrief]] — Alarm events logged for scoring
- [[10_Component_Architecture]] — Monitor component hierarchy
- [[11_State_Management_and_Data_Flow]] — activeAlarms Zustand store slice

---

#monitor #waveforms #canvas #ECG #SpO2 #capnography #alarms #web-audio #medical-UI #conductor

---
status: "Draft"
category: "experiments"
type: "protocol"
due: "2026-04-01"
priority: "P0-Critical"
cancer-signature:
aging-signature:
proteins: []
swarm-artifact-id:
tags: [experiment, probius, QES, protocol]
created: "2026-03-22"
updated: "2026-03-22"
---

# Probius QES Protocol — Quantum Electrochemical Sensing

---

## Overview Parameters

| Parameter | Specification |
|---|---|
| Platform | Probius QES v2.0 |
| Modality | Multi-analyte electrochemical sensing |
| Analytes | NADH, FAD, ATP, GSH (simultaneous) |
| Sample type | Capillary blood (finger-stick) or venous blood (EDTA) |
| Sample volume | 50 μL |
| Time to result | < 5 minutes |
| Test strip | Disposable, 4-electrode configuration |
| Operating temp | 20-25°C (room temperature) |
| Storage (strips) | 2-8°C, desiccated, 12-month shelf life |

---

## Sample Collection

### Procedure A: Finger-Stick Capillary Blood

1. Clean collection site (ring or middle finger) with alcohol swab, allow to dry
2. Warm hand for 30 seconds (improves capillary flow)
3. Lance with single-use 1.8mm lancet (medial side of fingertip)
4. Wipe away first drop (contains tissue fluid contamination)
5. Collect 50 μL into EDTA microtainer by capillary action (do not squeeze)
6. Invert microtainer 8-10 times for anticoagulant mixing
7. Process within stability window (see table below)

### Procedure B: Venous Blood Draw (Paired Validation)

1. Standard venipuncture, antecubital fossa
2. Collect into 4 mL EDTA vacutainer (lavender top)
3. Invert 8-10 times immediately
4. Aliquot 50 μL for QES within 30 minutes of draw
5. Spin remainder at 1500g × 10 min for plasma banking (within 2 hours)
6. Aliquot plasma into 500 μL cryovials, snap-freeze in liquid nitrogen

---

## Stability Windows

| Analyte | Room Temp (20-25°C) | Refrigerated (2-8°C) | Frozen (-80°C) |
|---|---|---|---|
| NADH | 2 hours | 6 hours | 6 months |
| FAD | 4 hours | 12 hours | 12 months |
| ATP | 30 minutes | 2 hours | 6 months |
| GSH | 1 hour | 4 hours | 6 months |

> [!warning] CRITICAL
> ATP is the most labile analyte. Process finger-stick samples within 30 minutes at room temperature. For paired venous samples, aliquot for QES immediately after draw.

---

## QES Measurement Protocol

### Step 1: Instrument Preparation
```
1. Power on QES reader (3-minute warm-up)
2. Run daily calibration check with QC Low standard
3. Verify temperature display: 20-25°C
4. Load fresh test strip (check lot number, expiry)
5. Confirm 4-electrode impedance check: PASS
```

### Step 2: Sample Application
```
1. Mix sample (invert microtainer 3x)
2. Pipette exactly 50 μL onto strip sample port
3. Confirm capillary fill indicator (blue line reaches "FILL" mark)
4. Close sample chamber lid
5. Press START — measurement initiates automatically
```

### Step 3: Measurement Cycle
```
Cycle timing:
  T=0s    Chronoamperometry: NADH oxidation at +0.3V (15s)
  T=20s   Square-wave voltammetry: FAD reduction -0.2V to -0.6V (20s)
  T=45s   Amperometry: ATP-luciferase bioluminescence coupled (30s)
  T=80s   Differential pulse voltammetry: GSH at +0.5V (20s)
  T=105s  Data integration & QPI calculation (15s)
  T=120s  RESULT DISPLAY
```

### Step 4: Data Recording
```
Record in lab notebook AND digital system:
  - Sample ID (format: QD-YYYYMMDD-NNN)
  - Patient/subject ID (coded)
  - Collection method (finger-stick / venous)
  - Collection time → QES measurement time (Δt in minutes)
  - Room temperature at measurement
  - Strip lot number
  - Raw values: NADH (μM), FAD (μM), ATP (μM), GSH (μM)
  - Calculated ratios: NADH/NAD+, FAD/FADH2, ATP/ADP, GSH/GSSG
  - QPI score
  - QC flag (PASS/FAIL/REVIEW)
```

---

## Quality Control

### QC Standards (run daily before patient samples)

| Standard | NADH (μM) | FAD (μM) | ATP (μM) | GSH (μM) |
|---|---|---|---|---|
| QC-Low | 5.0 ± 0.5 | 1.0 ± 0.1 | 10 ± 1.0 | 50 ± 5.0 |
| QC-Mid | 50 ± 5.0 | 10 ± 1.0 | 100 ± 10 | 500 ± 50 |
| QC-High | 500 ± 50 | 100 ± 10 | 1000 ± 100 | 5000 ± 500 |

### Acceptance Criteria
- All QC values within ±2 SD of target
- CV between triplicates < 10%
- If ANY QC fails: recalibrate, rerun QC. If fails again: contact Probius support, do not run patient samples.

### Westgard Rules Applied
- 1-2s warning, 1-3s reject, 2-2s reject, R-4s reject
- Document all QC failures in QC Log

---

## Paired Validation Protocol with Lanzara

For the 50-sample paired validation set:

| QES Measurement | Lanzara Measurement | Correlation Target |
|---|---|---|
| NADH/NAD+ ratio | Mid-IR Complex I coherence lifetime (τ_coh) | r > 0.7 |
| FAD/FADH2 ratio | THz CRY1 radical pair lifetime (τ_rp) | r > 0.6 |
| ATP/ADP ratio | Mid-IR ATP synthase rotational mode | r > 0.7 |
| GSH/GSSG ratio | Mid-IR GSH vibrational peak (ν_SH 2525 cm⁻¹) | r > 0.8 |

### Sample Split for Paired Protocol
1. Collect venous blood (4 mL EDTA)
2. Aliquot 50 μL → QES measurement (immediate)
3. Aliquot 1 mL → mitochondrial isolation (Lanzara, same day)
4. Aliquot 1 mL → plasma banking (-80°C)
5. Remainder → buffy coat isolation (biobanking)

---

## JSON Data Output Format

```json
{
  "sample_id": "QD-20260322-001",
  "subject_id": "SUBJ-XXX",
  "collection": {
    "method": "venous",
    "time": "2026-03-22T09:00:00Z",
    "tube": "EDTA_4mL"
  },
  "measurement": {
    "instrument": "QES-v2.0",
    "strip_lot": "LOT-2026-03-A",
    "room_temp_C": 22.5,
    "delta_t_min": 12,
    "timestamp": "2026-03-22T09:12:00Z"
  },
  "raw_values": {
    "NADH_uM": 45.2,
    "FAD_uM": 8.7,
    "ATP_uM": 95.3,
    "GSH_uM": 420.0
  },
  "ratios": {
    "NADH_NADplus": 0.45,
    "FAD_FADH2": 0.87,
    "ATP_ADP": 4.2,
    "GSH_GSSG": 42.0
  },
  "qpi": {
    "score": 0.15,
    "interpretation": "borderline_elevated",
    "weights": [0.30, 0.25, 0.20, 0.25]
  },
  "qc_flag": "PASS"
}
```

---

## Links

- [[QC-Log]]
- [[Lanzara-Pump-Probe-Protocol]]
- [[Core-Thesis]]
- [[ARPA-H-Delphi-Solution-Summary]]
- [[Mission-Overview]]

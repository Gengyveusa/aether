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
tags: [experiment, lanzara, ucb, pump-probe, mid-IR, THz]
created: "2026-03-22"
updated: "2026-03-22"
---

# Lanzara Pump-Probe Protocol — Ultrafast Quantum Spectroscopy

> **Co-PI: Alessandra Lanzara, UC Berkeley Physics**
> Direct measurement of quantum coherence, tunneling kinetics, and radical pair dynamics

---

## Instrument Specifications

| System | Mid-IR Pump-Probe | THz Time-Domain |
|---|---|---|
| Source | Optical parametric amplifier (OPA) | Photoconductive antenna / ZnTe |
| Pump wavelength | Tunable 2-20 μm | 800 nm (Ti:Sapph fundamental) |
| Probe wavelength | Broadband mid-IR continuum | 0.1-10 THz |
| Temporal resolution | 100 fs | < 1 ps |
| Spectral resolution | 4 cm⁻¹ | 0.05 THz |
| Temperature range | 4K - 310K (He cryostat) | 4K - 310K |
| Detector | MCT (HgCdTe) array | Electro-optic sampling |
| Repetition rate | 1 kHz | 1 kHz |
| Sample throughput | ~20 samples/day | ~15 samples/day |

---

## Sample Preparation Matrix

| Sample Type | Source | Preparation | Volume/Mass | Storage |
|---|---|---|---|---|
| **Mitochondrial isolates** | Venous blood (1 mL buffy coat) | Differential centrifugation: 600g→10,000g, resuspend in MRB (250mM sucrose, 5mM HEPES, 1mM EGTA, pH 7.4) | 200 μL suspension (1-5 mg protein/mL) | Ice, measure within 4 hours |
| **Cryptochrome fractions** | Cell lysate (HEK293-CRY1 or patient PBMC) | Anti-CRY1 immunoprecipitation, elute in low-salt buffer | 100 μL (~0.5 mg/mL) | Ice, measure within 2 hours |
| **Paired plasma** | Venous blood (matched draw) | 1500g × 10 min, aliquot supernatant | 500 μL | -80°C or measure fresh |

---

## Measurement Protocol A: Coherence Lifetime (Mid-IR)

**Objective**: Quantify excitonic coherence lifetime in mitochondrial ETC complexes

```
Target:          Complex I NADH dehydrogenase Fe-S cluster vibrations
Pump:            6.1 μm (1640 cm⁻¹, amide I of protein scaffold)
Probe:           Broadband 5-8 μm (1250-2000 cm⁻¹)
Delay range:     -500 fs to +10 ps (50 fs steps)
Temperature:     295K (physiological), then 77K and 4K for comparison
Polarization:    Parallel and perpendicular (anisotropy decay)
Scans:           100 averages per delay point
Analysis:        Fit ΔA(t) to multi-exponential: A1·exp(-t/τ1) + A2·exp(-t/τ2) + A3·exp(-t/τ3)
                 τ1 = coherence dephasing (expect 200-600 fs)
                 τ2 = vibrational relaxation (1-5 ps)
                 τ3 = thermal equilibration (>10 ps)
Expected result: Cancer samples → τ1 > 400 fs (enhanced coherence)
                 Aging samples → τ1 < 250 fs (accelerated decoherence)
```

---

## Measurement Protocol B: Tunneling Kinetics / KIE (Mid-IR)

**Objective**: Measure hydrogen tunneling rates via kinetic isotope effect

```
Target:          CYP450 enzyme active-site C-H activation
Pump:            3.4 μm (2940 cm⁻¹, C-H stretch) OR 4.6 μm (2170 cm⁻¹, C-D stretch)
Probe:           Broadband 3-5 μm (2000-3300 cm⁻¹)
Delay range:     -1 ps to +100 ps (variable steps: 100 fs to 0-5ps, 1 ps to 5-100ps)
Temperature:     295K, 310K, 280K (Arrhenius series)
Isotope swap:    H2O buffer vs. D2O buffer (90% D enrichment)
Scans:           200 averages per delay point
Analysis:        Extract rate constants k_H and k_D from rise/decay kinetics
                 KIE = k_H / k_D
                 Normal KIE: 3-7 (semiclassical)
                 Tunneling KIE: 7-80+ (quantum)
Expected result: Cancer samples → KIE > 15 (enhanced tunneling)
                 Aging samples → KIE < 5 (tunneling suppressed)
                 Healthy controls → KIE 7-12 (baseline tunneling)
```

---

## Measurement Protocol C: Radical Pair Dynamics (THz)

**Objective**: Detect spin-correlated radical pair signatures in cryptochrome

```
Target:          CRY1 FAD-Trp radical pair
Pump:            400 nm (FAD excitation, frequency-doubled Ti:Sapph)
Probe:           THz pulse (0.1-5 THz broadband)
Delay range:     -10 ps to +50 μs (logarithmic spacing)
Magnetic field:  0 mT, 1 mT, 5 mT, 50 mT (Helmholtz coils)
Temperature:     295K
Scans:           500 averages (weak signal)
Analysis:        Magnetic field effect (MFE) on THz transmission
                 MFE(%) = [ΔA(B) - ΔA(0)] / ΔA(0) × 100
                 Radical pair lifetime from MFE decay: τ_rp
Expected result: Cancer CRY1-overexpressing → τ_rp > 5 μs, MFE > 10%
                 Aging samples → τ_rp < 1 μs, MFE < 3%
                 Healthy controls → τ_rp 1-5 μs, MFE 3-10%
```

---

## Data Integration: Lanzara → Probius QES Mapping

| Lanzara Measurement | Parameter | Probius QES Correlate | Expected Correlation |
|---|---|---|---|
| Mid-IR coherence lifetime | τ_coh (fs) | NADH/NAD+ ratio | r > 0.7 |
| Mid-IR tunneling KIE | k_H/k_D | FAD/FADH2 ratio | r > 0.6 |
| Mid-IR ATP synthase mode | ν_rot intensity | ATP/ADP ratio | r > 0.7 |
| THz radical pair lifetime | τ_rp (μs) | FAD/FADH2 ratio | r > 0.6 |
| THz MFE amplitude | MFE (%) | GSH/GSSG ratio | r > 0.5 |

---

## Sample Identification Format

| Field | Format | Example |
|---|---|---|
| Study ID | QD-YYYYMMDD-NNN | QD-20260322-001 |
| Subject ID | SUBJ-CCC-NNN | SUBJ-CAN-001 (cancer), SUBJ-AGE-001 (aging), SUBJ-CTL-001 (control) |
| Sample type | MITO / CRY / PLAS | MITO (mitochondrial), CRY (cryptochrome), PLAS (plasma) |
| Measurement | MIR-A / MIR-B / THZ-C | Protocol A / B / C |
| Full label | QD-20260322-001_SUBJ-CAN-001_MITO_MIR-A | |

---

## Safety Checklist

- [ ] Laser safety training current for all operators (ANSI Z136.1)
- [ ] Laser safety goggles verified for OPA output wavelength range
- [ ] Interlock system tested on sample chamber
- [ ] Cryogen handling training current (liquid He, liquid N2)
- [ ] Biosafety Level 2 certification for human blood samples
- [ ] Sharps disposal container in sample prep area
- [ ] Spill kit accessible (biological + chemical)
- [ ] Emergency eyewash station verified within 10 seconds travel
- [ ] Fire extinguisher location confirmed (CO2 type for laser lab)
- [ ] After-hours work buddy system confirmed

---

## Links

- [[Probius-QES-Protocol]]
- [[QC-Log]]
- [[Core-Thesis]]
- [[UCB-UCSF-Seed-Grant]]
- [[ARPA-H-Delphi-Solution-Summary]]
- [[Mission-Overview]]

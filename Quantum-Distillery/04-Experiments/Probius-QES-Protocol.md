---
status: "🟡 Draft"
category: "experiment"
type: "protocol"
due: "2026-04-01"
priority: "P0-Critical"
tags: [experiment, probius, QES, protocol]
created: "2026-03-22"
updated: "2026-03-22"
---
# 🧪 Probius QES Protocol
Label-free simultaneous NADH/FAD/ATP/GSH in 2-4 uL plasma. <15 min turnaround. Point-of-care.

## Spectral Resolution & Sensitivity Specifications

- **Spectral resolution:** <2 cm⁻¹ (sufficient to distinguish NADH-bound at 340nm vs NADH-free at 360nm excitation)
- **Sample volume:** 2–4 µL (finger-stick capillary or venous plasma)
- **Detection limits** (estimated from manufacturer specs and literature):

| Analyte | Physiological Range | Estimated LOD | QES Mode |
|---|---|---|---|
| NADH | 10–50 µM (plasma) | ~5 µM | Fluorescence lifetime |
| FAD | 1–10 µM (plasma) | ~2 µM | Fluorescence |
| GSH | 2–20 µM (plasma, reduced) | ~1 µM | Thiol vibrational (2500–2600 cm⁻¹) |
| ATP | 1–10 µM (plasma) | ~3 µM | Phosphate stretch (1000–1100 cm⁻¹) |
| CoQ10 | 0.5–2 µM (plasma) | ~0.5 µM | Quinone ring vibration |

> [!warning] These are estimated LODs. Actual validation required in Year 1 with spiked plasma standards.

- **NADH-bound vs free discrimination:** Uses fluorescence lifetime decay (bound ~1.2ns vs free ~0.4ns) rather than spectral shift alone.

---
status: "📝 Draft"
category: "experiment"
type: "SOP"
due: "2026-03-28"
priority: "P1-High"
tags: [experiment, SOP, sample-handling, biosafety]
created: "2026-03-22"
updated: "2026-03-22"
---
# 🧪 SAMPLE HANDLING SOP

> Standard operating procedure for all biospecimen handling in the Quantum Distillery pipeline.

## Scope

Covers finger-stick and venous plasma collection for:
- **Probius QES** metabolite sensing (NADH, FAD, GSH, ATP)
- **Lanzara ultrafast spectroscopy** (mid-IR / THz pump-probe)

## Personnel Requirements

- BSL-2 trained (institutional certification required)
- Phlebotomy certified for venous draws
- Universal precautions observed at all times
- Annual bloodborne pathogen training current

## Equipment List

| Item | Specification |
|---|---|
| EDTA microtainers | Lavender-top, 200–500 µL |
| Spring-loaded lancets | 21G, single-use |
| Centrifuge | 2000×g capable, refrigerated |
| CaF₂ liquid cells | For mid-IR spectroscopy |
| TPX cuvettes | For THz spectroscopy |
| LN₂ dewar | For flash-freezing |
| Dry ice shipper | For sample transport |
| QES cartridges | Probius proprietary |
| PPE kit | Gloves, lab coat, face shield |

## Collection Procedure

### Finger-Stick Protocol

1. Clean fingertip with alcohol swab, allow to dry
2. Lance lateral fingertip with 21G spring-loaded lancet
3. **Discard first drop** (contains tissue fluid contamination)
4. Collect 5 µL into EDTA microtainer
5. Gentle inversion ×10 (do not vortex)
6. Centrifuge 2000×g for 5 min — **within 30 min of collection**

### Venous Protocol

1. Standard venipuncture into EDTA tube (lavender-top)
2. Centrifuge 2000×g for 10 min at 4°C
3. Aliquot:
   - **3 µL per QES cartridge** (load immediately)
   - **100 µL × 5 aliquots** for Lanzara spectroscopy (flash-freeze)

## Processing Timeline

| Step | Time Limit | Notes |
|---|---|---|
| Sample → QES | < 15 min | Load cartridge immediately |
| Sample → Lanzara flash-freeze | < 15 min | Then ship on dry ice |
| **Critical** | — | ATP and GSH degrade rapidly at room temperature |

## Storage Conditions

| Condition | Temperature | Duration | Use |
|---|---|---|---|
| Immediate processing | Room temp | < 15 min | QES readout |
| Short-term | 4°C | < 4 hours | Same-day spectroscopy |
| Flash-frozen | −80°C | Up to 6 months | Lanzara batch runs |
| LN₂ archive | −196°C | Long-term | Biobank |

## Shipping to Lanzara Lab

- **Triple containment**: primary tube → absorbent wrap → secondary container → outer shipper
- **Classification**: UN3373 Category B biological substance
- **Ship Monday–Wednesday only** (avoid weekend transit delays)
- Include **sample manifest form** with each shipment (sample IDs, collection dates, cohort, storage conditions)

## Waste Disposal

- **Sharps container** for all lancets and needles
- **Biohazard bag** for blood-contaminated items (swabs, gloves, microtainers)
- Follow institutional biosafety manual for final disposal

## Documentation

Every sample logged in [[04-Experiments/QC-Log]] with sample ID format:

**`QD-[cohort]-###`**

Example: `QD-YOUNG-001`, `QD-AGED-042`, `QD-CANCER-017`

## Links

- [[04-Experiments/Probius-QES-Protocol]]
- [[04-Experiments/Lanzara-Pump-Probe-Protocol]]
- [[04-Experiments/QC-Log]]

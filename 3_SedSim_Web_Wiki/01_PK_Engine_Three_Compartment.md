# PK Engine — Three-Compartment Mammillary Model

> **Source:** `src/engines/pkEngine.ts` | **Model type:** 3-compartment mammillary
> **Solver:** 4th-order Runge-Kutta (RK4) | **Timestep:** 1 second (internal), 250 ms (display)
> **Validated against:** Marsh (Propofol), Minto (Remifentanil), Greenblatt (Midazolam)

---

## Overview

The pharmacokinetic engine implements a classical **three-compartment mammillary model** for each active drug. Compartments represent the central (plasma), rapid-peripheral, and slow-peripheral distribution volumes. An additional **effect-site compartment** (Ce) is linked to the central compartment via a first-order rate constant ke0, enabling effect-site concentration tracking for PD coupling.

The engine runs **multi-drug** — up to 6 simultaneous drug instances with independent compartment states, merged only at the PD layer via the Bouillon response surface (see [[02_PD_Model_and_Drug_Interactions]]).

---

## Three-Compartment Model

```
                    ┌──────────────────┐
                    │   V1 (Central)   │
       Drug In ────→│   Plasma         │────→ Elimination (k10)
                    │                  │
                    └──┬──────────┬────┘
                       │          │
                  k12 ↕ k21  k13 ↕ k31
                       │          │
              ┌────────┴───┐ ┌───┴────────┐
              │ V2 (Rapid  │ │ V3 (Slow   │
              │ peripheral)│ │ peripheral)│
              └────────────┘ └────────────┘

                    │
               ke0 ↕ (first-order link)
                    │
              ┌─────┴──────┐
              │ Ce (Effect  │
              │ Site)       │
              └─────────────┘
```

---

## Differential Equations

The system of ordinary differential equations (ODEs) governing each drug:

```
dA1/dt = -(k10 + k12 + k13) * A1 + k21 * A2 + k31 * A3 + R(t)
dA2/dt = k12 * A1 - k21 * A2
dA3/dt = k13 * A1 - k31 * A3
dCe/dt = ke0 * (Cp - Ce)

where:
  A1, A2, A3 = drug amounts in compartments 1, 2, 3 (mg)
  Cp = A1 / V1  (plasma concentration, mcg/mL)
  Ce = effect-site concentration (mcg/mL)
  R(t) = infusion rate (mg/min) + bolus input
  kij  = micro-rate constants (min⁻¹)
  ke0  = effect-site equilibration rate constant (min⁻¹)
```

---

## Micro-Rate Constants

Derived from clearances and volumes:

| Constant | Formula | Description |
|----------|---------|-------------|
| k10 | Cl1 / V1 | Elimination from central |
| k12 | Cl2 / V1 | Central → rapid peripheral |
| k21 | Cl2 / V2 | Rapid peripheral → central |
| k13 | Cl3 / V1 | Central → slow peripheral |
| k31 | Cl3 / V3 | Slow peripheral → central |
| ke0 | model-specific | Effect-site equilibration |

---

## RK4 Solver Implementation

The engine uses **4th-order Runge-Kutta** for numerical integration, chosen for its balance of accuracy and computational efficiency in a browser environment.

```
Given state vector y = [A1, A2, A3, Ce] and step size h:

  k1 = f(t,       y)
  k2 = f(t + h/2, y + h*k1/2)
  k3 = f(t + h/2, y + h*k2/2)
  k4 = f(t + h,   y + h*k3)

  y(t+h) = y(t) + (h/6)(k1 + 2*k2 + 2*k3 + k4)
```

### Why RK4 Over Euler?

| Method | Order | Error per step | Stability | Use case |
|--------|-------|----------------|-----------|----------|
| Forward Euler | 1st | O(h²) | Poor for stiff systems | Quick prototyping |
| **RK4** | **4th** | **O(h⁵)** | **Excellent for PK** | **Production** |
| Implicit methods | Varies | Varies | Best for stiff | Overkill here |

The PK system is **non-stiff** (eigenvalues well-separated, all negative real), making RK4 ideal. With h = 1 second and rate constants on the order of minutes⁻¹, RK4 achieves MDAPE < 1% against published reference implementations.

---

## Multi-Drug Tracking

Each drug maintains its own independent 4-state vector:

```
drugStates: Map<DrugId, {
  A1: number,    // Central compartment amount (mg)
  A2: number,    // Rapid peripheral amount (mg)
  A3: number,    // Slow peripheral amount (mg)
  Ce: number,    // Effect-site concentration (mcg/mL)
  Cp: number,    // Plasma concentration (computed: A1/V1)
  infusionRate: number,  // Current infusion (mg/min)
  totalDoseGiven: number // Cumulative dose (mg)
}>
```

Drugs interact **only** at the PD layer — PK states are fully independent. This simplifies the math and matches clinical reality (drugs distribute independently in plasma).

---

## Bolus Administration

A bolus is modeled as an instantaneous addition to A1:

```
On bolus(drug, doseMg):
  drugStates[drug].A1 += doseMg
  drugStates[drug].totalDoseGiven += doseMg
  eventLogger.log({ type: 'bolus', drug, dose: doseMg, time: simTime })
```

---

## Infusion Administration

Continuous infusions add to A1 each tick:

```
On each tick (dt = 1 second):
  A1 += infusionRate * (dt / 60)   // rate is in mg/min, dt in seconds
```

---

## Covariate Scaling

PK parameters are adjusted for patient covariates (weight, age, sex, lean body mass):

| Drug | PK Model | Covariates Used |
|------|----------|-----------------|
| Propofol | Marsh | Weight (total body weight) |
| Remifentanil | Minto | Age, sex, lean body mass (James formula) |
| Midazolam | Greenblatt | Weight, age |
| Fentanyl | Shafer | Weight |
| Ketamine | Clements | Weight |

See [[03_Drug_Library_and_Parameters]] for full parameter tables and [[05_Patient_Archetypes_and_Scenarios]] for archetype covariate definitions.

---

## GhostDosePreview (Forward Simulation)

The `GhostDosePreview` feature runs a **parallel forward simulation** to show predicted concentration curves for a proposed dose before administration:

```
ghostPreview(drug, proposedDose, horizonMinutes):
  1. Clone current drugStates[drug]
  2. Apply proposedDose as bolus to cloned state
  3. Include current active interventions in simulation
  4. Run RK4 for horizonMinutes at 1s steps
  5. Return predicted Cp[] and Ce[] arrays
  6. Render as dashed overlay on concentration trend
```

This enables learners to see the pharmacokinetic consequences of a dose before committing to it — a key educational feature.

---

## Performance Considerations

| Metric | Value | Notes |
|--------|-------|-------|
| RK4 steps per tick | 1 per drug | At 4 Hz display rate |
| Max simultaneous drugs | 6 | Propofol + Midazolam + Fentanyl + Ketamine + 2 reversal |
| Computation per tick | < 0.1 ms | 6 drugs × 4 ODE evaluations × 4 RK4 stages |
| Memory per drug | ~64 bytes | 8 floats × 8 bytes |
| Numerical precision | Float64 | Standard JavaScript number type |

---

## Related Files

- [[02_PD_Model_and_Drug_Interactions]] — PD layer that consumes Ce values
- [[03_Drug_Library_and_Parameters]] — Drug-specific PK parameter tables
- [[04_Physiology_Pipeline]] — Physiological effects driven by PD output
- [[11_State_Management_and_Data_Flow]] — How PK state integrates into Zustand store
- [[12_Validation_and_Clinical_Accuracy]] — MDAPE validation results for PK engine

---

#pharmacokinetics #three-compartment #RK4 #effect-site #multi-drug #ke0 #plasma-concentration

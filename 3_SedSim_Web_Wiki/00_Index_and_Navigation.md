# SedSim — Master Index & Navigation

> **Source:** [github.com/Gengyveusa/sedsim](https://github.com/Gengyveusa/sedsim) | **Last updated:** 2026-03-26
> **Platform:** React SPA (Vite) | **Deployment:** GitHub Pages (177+ deployments)

---

## Vault Map of Contents (MOC)

| # | File | Covers |
|---|------|--------|
| 00 | [[00_Index_and_Navigation]] | This file — master index, repo structure, architecture overview |
| 01 | [[01_PK_Engine_Three_Compartment]] | 3-compartment PK model, RK4 solver, multi-drug tracking, effect-site ke0 |
| 02 | [[02_PD_Model_and_Drug_Interactions]] | Sigmoid Emax, Bouillon response surface, additive BIS + synergistic respiratory |
| 03 | [[03_Drug_Library_and_Parameters]] | All drugs: Propofol, Midazolam, Fentanyl, Ketamine, Naloxone, Flumazenil |
| 04 | [[04_Physiology_Pipeline]] | Respiratory, SpO2 cascade, cardiovascular, airway obstruction, EtCO2, BIS |
| 05 | [[05_Patient_Archetypes_and_Scenarios]] | 7 archetypes, covariate scaling, JSON scenarios, ScenarioEngine, BLS/ACLS |
| 06 | [[06_Monitor_Display_and_Waveforms]] | Canvas ECG/SpO2/Capno, alarm system, Web Audio, color palette, medical-grade UI |
| 07 | [[07_Drug_Administration_and_Interventions]] | DrugPanel, bolus/infusion, airway interventions, O2, reversal agents |
| 08 | [[08_AI_Integration_Millie_SimMaster]] | Claude API SSE, Millie the Mentor, SimMaster v4, multi-agent coordinator |
| 09 | [[09_Scoring_Assessment_Debrief]] | Safety/sedation/decision metrics, grading rubric, debrief timeline |
| 10 | [[10_Component_Architecture]] | All 44 React components, Dashboard layout, data flow, props |
| 11 | [[11_State_Management_and_Data_Flow]] | Zustand stores (6), slices, tick loop, atomic updates, data flow audit |
| 12 | [[12_Validation_and_Clinical_Accuracy]] | MDAPE results, Varvel criteria, Marsh/Minto/Greenblatt/Bouillon validation |
| 13 | [[13_LMS_Integration_and_Deployment]] | SCORM/xAPI, Canvas/Moodle/Blackboard, GitHub Pages, CI/CD, PWA |
| 14 | [[14_Education_and_Tutorial_System]] | educationModules, tutorialEngine, LearningPanel, TutorialMode, questionBank |
| 15 | [[15_Tech_Stack_and_Development_Guide]] | Dependencies, build setup, coding conventions, agent quick reference, phases |

---

## Repository Structure

```
sedsim/
├── public/
│   └── scenarios/              # JSON scenario definitions
├── src/
│   ├── components/
│   │   ├── dashboard/          # Main simulator layout
│   │   ├── monitor/            # Vital signs display + waveforms
│   │   ├── drugs/              # Drug administration panel
│   │   ├── ai/                 # Millie + SimMaster panels
│   │   ├── scoring/            # Grading + debrief
│   │   ├── education/          # Tutorial + learning modules
│   │   ├── lms/                # LMS configuration panel
│   │   ├── physiologyVisuals/  # EchoSim, OxyHb, FrankStarling
│   │   └── instructor/        # Instructor dashboard
│   ├── engines/
│   │   ├── pkEngine.ts         # 3-compartment PK solver
│   │   ├── pdEngine.ts         # PD response surface
│   │   ├── physiologyEngine.ts # Vital signs computation
│   │   └── scenarioEngine.ts   # State-machine scenario runner
│   ├── models/
│   │   ├── drugLibrary.ts      # Drug parameter definitions
│   │   └── patientArchetypes.ts# 7 patient archetypes
│   ├── stores/
│   │   ├── useSimStore.ts      # Master Zustand store
│   │   ├── useDrugStore.ts     # Drug administration state
│   │   ├── useVitalsStore.ts   # Computed vitals
│   │   ├── useAlarmStore.ts    # Unified alarm state
│   │   ├── useScenarioStore.ts # Scenario engine state
│   │   └── useAIStore.ts       # AI mentor state
│   ├── audio/
│   │   ├── conductor.ts        # Audio orchestration layer
│   │   └── spo2Tone.ts         # SpO2 pitch mapping
│   ├── scoring/
│   │   ├── metricsCollector.ts # Real-time metric tracking
│   │   └── gradingRubric.ts    # A/B/C/F grading logic
│   ├── validation/
│   │   └── pkValidation.test.ts# MDAPE automated tests
│   ├── lms/
│   │   ├── xapiClient.ts       # xAPI (Tin Can) statement emitter
│   │   └── scormWrapper.ts     # SCORM 1.2/2004 adapter
│   └── i18n/                   # Internationalization
├── docs/
│   ├── validation/             # PK/PD validation reports
│   └── data-flow-audit.md      # Zustand data flow documentation
├── .github/workflows/          # CI/CD pipelines
└── vite.config.ts
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      SEDSIM ARCHITECTURE                        │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────────┐ │
│  │ Drug     │   │ Scenario │   │ Patient  │   │ Intervention│ │
│  │ Admin    │   │ Engine   │   │ Archetype│   │ Panel       │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └──────┬──────┘ │
│       │              │              │                 │        │
│       ▼              ▼              ▼                 ▼        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ZUSTAND STORE (atomic tick update)          │   │
│  └────────────────────────┬────────────────────────────────┘   │
│                           │                                    │
│       ┌───────────────────┼───────────────────┐               │
│       ▼                   ▼                   ▼               │
│  ┌─────────┐       ┌───────────┐       ┌───────────┐         │
│  │ PK      │       │ PD        │       │ Physiology│         │
│  │ Engine  │──────→│ Engine    │──────→│ Engine    │         │
│  │ (RK4)   │       │ (Bouillon)│       │ (Vitals)  │         │
│  └─────────┘       └───────────┘       └─────┬─────┘         │
│                                               │               │
│       ┌───────────────────┼───────────────────┤               │
│       ▼                   ▼                   ▼               │
│  ┌─────────┐       ┌───────────┐       ┌───────────┐         │
│  │ Monitor │       │ Alarm     │       │ AI Mentor │         │
│  │ Display │       │ System    │       │ (Claude)  │         │
│  │ Canvas  │       │ Warnings  │       │ SSE Stream│         │
│  └─────────┘       └───────────┘       └───────────┘         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Scoring Engine → Event Logger → Debrief Timeline      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  xAPI / SCORM → LRS / LMS (Canvas, Moodle, Blackboard)│   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Simulation Tick Loop

```
Every 250ms (4 Hz):
  1. Read drug infusions + bolus queue
  2. Advance PK state (RK4 integration)     → plasma & effect-site concentrations
  3. Compute PD effects (Bouillon surface)   → fractional drug effects
  4. Compute physiology pipeline             → RR, SpO2, HR, BP, EtCO2, BIS
  5. Evaluate airway status                  → obstruction level
  6. Apply interventions                     → airway maneuvers, O2, fluids
  7. Evaluate alarms                         → EmergencyState classification
  8. Update Zustand store (single atomic write)
  9. Render monitor + waveforms (requestAnimationFrame)
 10. Log event if state change detected
```

---

## Route Map

| Route | Page | Status | Description |
|-------|------|--------|-------------|
| `/` | **Simulator** | ✅ Live | Main sedation simulator dashboard |
| `/tutorial` | **Tutorial Mode** | ✅ Live | Guided walkthrough with step highlights |
| `/scenarios` | **Scenario Browser** | ✅ Live | Browse + launch JSON scenarios |
| `/debrief` | **Post-Sim Debrief** | ✅ Live | Score breakdown, timeline, recommendations |
| `/education` | **Learning Modules** | ✅ Live | PK/PD education with quiz questions |
| `/instructor` | **Instructor Dashboard** | ✅ Live | Multi-student monitoring, session review |
| `/lms` | **LMS Settings** | ✅ Live | SCORM/xAPI endpoint configuration |
| `/settings` | **Sim Settings** | ✅ Live | Patient selection, difficulty, audio prefs |

---

## Cross-Reference Tags

#sedsim #index #MOC #architecture #navigation #site-map

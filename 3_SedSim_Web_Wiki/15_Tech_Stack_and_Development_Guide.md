# Tech Stack & Development Guide

> **Source:** `package.json`, `vite.config.ts`, `tsconfig.json`
> **Framework:** React 18 + TypeScript (strict) | **Build:** Vite 5
> **State:** Zustand 4 | **Testing:** Vitest | **Deployment:** GitHub Pages

---

## Overview

SedSim is a single-page application built with React and TypeScript, bundled by Vite, and deployed to GitHub Pages. The codebase enforces strict TypeScript, Zod runtime validation for external data (scenarios, LMS config), and a clear separation between simulation engines (pure functions) and UI components (pure consumers).

---

## Core Dependencies

### Production

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.3 | UI framework |
| `react-dom` | ^18.3 | DOM rendering |
| `zustand` | ^4.5 | State management (6 stores) |
| `zod` | ^3.23 | Runtime schema validation |
| `@anthropic-ai/sdk` | ^0.30 | Claude API (Millie + SimMaster) |
| `tincan` | ^1.3 | xAPI statement generation |
| `i18next` | ^23.x | Internationalization |
| `react-i18next` | ^14.x | React i18n bindings |

### Development

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.5 | Type checking (strict mode) |
| `vite` | ^5.4 | Build tool + dev server |
| `vitest` | ^2.0 | Unit testing framework |
| `eslint` | ^9.x | Linting |
| `@vitejs/plugin-react` | ^4.3 | React Fast Refresh |
| `vite-plugin-pwa` | ^0.20 | PWA/ServiceWorker generation |

---

## TypeScript Configuration

```jsonc
// tsconfig.json (strict mode)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,                    // ALL strict checks enabled
    "noUncheckedIndexedAccess": true,  // undefined on array/object access
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"],
      "@engines/*": ["./src/engines/*"],
      "@stores/*": ["./src/stores/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

---

## Project Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server (HMR, port 5173) |
| `build` | `tsc && vite build` | Type check + production build |
| `preview` | `vite preview` | Preview production build locally |
| `test` | `vitest` | Run test suite (watch mode) |
| `test:ci` | `vitest run --coverage` | CI test run with coverage |
| `test:validate` | `vitest run src/validation/` | PK/PD validation suite only |
| `lint` | `eslint src/` | Lint all source files |
| `typecheck` | `tsc --noEmit` | Type check without emit |

---

## Coding Conventions

### File Organization

```
Convention: one component/module per file, named exports preferred

  Engines:     src/engines/pkEngine.ts       → export function advancePK(...)
  Stores:      src/stores/useSimStore.ts     → export const useSimStore = create(...)
  Components:  src/components/monitor/HRDisplay.tsx → export function HRDisplay(...)
  Models:      src/models/drugLibrary.ts     → export const DRUG_LIBRARY = { ... }
  Tests:       co-located — pkEngine.test.ts next to pkEngine.ts
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Components | PascalCase | `HRDisplay`, `DrugPanel` |
| Stores | camelCase with `use` prefix | `useSimStore`, `useDrugStore` |
| Engines | camelCase | `pkEngine`, `pdEngine` |
| Types/Interfaces | PascalCase | `VitalSnapshot`, `DrugState` |
| Constants | SCREAMING_SNAKE | `MAX_DRUGS`, `ALARM_THRESHOLDS` |
| Files | camelCase (logic), PascalCase (components) | `pkEngine.ts`, `HRDisplay.tsx` |

### Engine Purity Rules

```
ENGINES must be pure functions:
  ✅ advancePK(state, params, dt) → newState
  ✅ computeVitals(effects, baselines, interventions) → vitals
  ✅ evaluateAlarms(vitals, thresholds) → alarms

  ❌ Engines must NOT:
     - Read from Zustand stores directly
     - Perform side effects (DOM, audio, network)
     - Maintain mutable state outside their arguments
     - Import React or component code

COMPONENTS must be pure consumers:
  ✅ Read from Zustand store via selectors
  ✅ Dispatch actions via store methods
  ✅ Render based on current state

  ❌ Components must NOT:
     - Call engine functions directly
     - Compute simulation state
     - Hold simulation state in useState/useRef
```

---

## Agent Quick Reference

A cheat sheet for AI coding agents working on the SedSim codebase:

### Key Files to Read First

| File | Why |
|------|-----|
| `src/stores/useSimStore.ts` | Understand the master state shape |
| `src/engines/pkEngine.ts` | Core PK solver (3-compartment + RK4) |
| `src/engines/pdEngine.ts` | Drug interaction model (Bouillon) |
| `src/engines/physiologyEngine.ts` | How vitals are computed |
| `src/models/drugLibrary.ts` | All drug parameters |
| `src/models/patientArchetypes.ts` | Patient definitions |
| `docs/data-flow-audit.md` | How data flows through the system |

### Common Tasks

| Task | Key Files | Notes |
|------|-----------|-------|
| Add a new drug | `drugLibrary.ts`, `pkEngine.ts`, `DrugPanel.tsx` | Add PK params, PD effects, UI row |
| Add a patient archetype | `patientArchetypes.ts`, `SettingsPanel.tsx` | Define baselines + modifiers |
| Add a scenario | `public/scenarios/*.json` | Must pass Zod validation |
| Modify vital computation | `physiologyEngine.ts` | Follow pipeline order |
| Add alarm threshold | `useAlarmStore.ts`, `AlarmBanner.tsx` | Update both store + display |
| Modify AI behavior | `src/components/ai/`, `useAIStore.ts` | Update system prompt |

### Architecture Invariants (Do Not Break)

```
1. One atomic Zustand update per tick — never split writes
2. Engines are pure functions — no side effects, no store access
3. Components are pure consumers — no engine calls
4. RK4 solver for PK — do not substitute Euler
5. Simulation tick at 4 Hz — 250ms intervals
6. MDAPE < 20% — all PK/PD changes must pass validation
7. Zod validation for all external JSON (scenarios, LMS config)
```

---

## Implementation Phases

### Phase 1: Core Stabilization

| Task | Description | Status |
|------|-------------|--------|
| TypeScript strict mode | Enable all strict compiler flags | ✅ Complete |
| Engine unit tests | pkEngine, pdEngine, physiologyEngine | ✅ Complete |
| Zustand store slices | 6 stores with typed interfaces | ✅ Complete |
| Zod validation | Scenario JSON + LMS config schemas | ✅ Complete |
| CI pipeline | Lint → Type check → Test → Validate → Build → Deploy | ✅ Complete |
| PK/PD validation | MDAPE < 20% for all drug models | ✅ Complete |

### Phase 2: Feature Completion

| Task | Description | Status |
|------|-------------|--------|
| BLS/ACLS scenario library | 4 emergency scenarios with state machines | ✅ Complete |
| Millie trigger system | Context-aware AI mentor with 60s window | ✅ Complete |
| Digital Twin coordinator | Multi-agent orchestration | ✅ Complete |
| Grading rubric | Safety + sedation + decision scoring | ✅ Complete |
| Debrief timeline | Interactive post-sim timeline with markers | ✅ Complete |
| Accessibility (a11y) | WCAG 2.1 AA compliance | 🔄 In progress |
| Physiology visuals | EchoSim, FrankStarling, OxyHb, Avatar | ✅ Complete |

### Phase 3: Polish & Scale

| Task | Description | Status |
|------|-------------|--------|
| i18n (multi-language) | English, Spanish, French, Mandarin | 🔄 In progress |
| LMS/SCORM integration | xAPI + SCORM 1.2/2004 | ✅ Complete |
| PWA offline support | ServiceWorker precaching | ✅ Complete |
| Mobile responsive | Touch-friendly drug panel + monitor | 🔜 Planned |
| Instructor dashboard | Multi-student monitoring + session review | ✅ Complete |
| A/B study protocol | Crossover trial support for research | 🔜 Planned |
| Session recording | Playback + export of sim sessions | ✅ Complete |

---

## Development Environment Setup

```bash
# Clone and install
git clone https://github.com/Gengyveusa/sedsim.git
cd sedsim
npm install

# Development
npm run dev          # Start dev server at localhost:5173

# Testing
npm test             # Watch mode
npm run test:ci      # CI mode with coverage
npm run test:validate # PK/PD validation only

# Build
npm run build        # Production build → dist/
npm run preview      # Preview production build

# Deploy (automatic via GitHub Actions on push to main)
git push origin main  # Triggers CI/CD → GitHub Pages
```

---

## Related Files

- [[00_Index_and_Navigation]] — Repository structure overview
- [[10_Component_Architecture]] — React component conventions
- [[11_State_Management_and_Data_Flow]] — Zustand store architecture
- [[12_Validation_and_Clinical_Accuracy]] — Validation test suite
- [[13_LMS_Integration_and_Deployment]] — Build + deploy pipeline

---

#tech-stack #react #typescript #vite #zustand #vitest #development #coding-conventions #phases #agent-reference

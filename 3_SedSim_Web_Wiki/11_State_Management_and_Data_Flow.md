# State Management & Data Flow

> **Source:** `src/stores/`, `docs/data-flow-audit.md`
> **Library:** Zustand 4.x | **Stores:** 6 specialized slices
> **Pattern:** Single atomic update per tick, components are pure consumers

---

## Overview

SedSim uses **Zustand** for state management with 6 specialized stores. The core architectural invariant is: **one atomic store update per simulation tick**. All engine computations complete before the store is written, ensuring components always see a consistent snapshot of simulation state.

---

## Store Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      ZUSTAND STORES                          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ useSimStore  │  │ useDrugStore │  │useVitalsStore│      │
│  │              │  │              │  │              │      │
│  │ • simTime    │  │ • drugStates │  │ • HR, SpO2   │      │
│  │ • isRunning  │  │ • bolusQueue │  │ • BP, RR     │      │
│  │ • speed      │  │ • infusions  │  │ • EtCO2, BIS │      │
│  │ • patient    │  │ • history    │  │ • waveforms  │      │
│  │ • scenario   │  │ • totalDoses │  │ • trends     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │useAlarmStore │  │useScenarioSt │  │ useAIStore   │      │
│  │              │  │              │  │              │      │
│  │ • activeAlarms│ │ • phase      │  │ • messages   │      │
│  │ • alarmHistory│ │ • objectives │  │ • streaming  │      │
│  │ • emergState │  │ • triggers   │  │ • context    │      │
│  │ • silenced   │  │ • events     │  │ • config     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Store Specifications

### 1. useSimStore (Master Simulation State)

```typescript
interface SimStore {
  // Time
  simTime: number;              // seconds since sim start
  isRunning: boolean;           // play/pause state
  speed: number;                // 1x, 2x, 4x multiplier
  tickInterval: NodeJS.Timer;   // setInterval reference

  // Patient
  patientArchetype: PatientArchetype;
  patientBaselines: VitalBaselines;

  // Scenario
  activeScenario: Scenario | null;
  scenarioPhase: string;

  // Session
  sessionId: string;            // unique session identifier
  sessionStartTime: Date;
  eventLog: SimEvent[];         // all logged events

  // Actions
  start: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setPatient: (archetype: PatientArchetype) => void;
  loadScenario: (scenario: Scenario) => void;
  logEvent: (event: SimEvent) => void;
}
```

### 2. useDrugStore (Drug Administration State)

```typescript
interface DrugStore {
  drugStates: Map<DrugId, {
    A1: number;              // Central compartment (mg)
    A2: number;              // Rapid peripheral (mg)
    A3: number;              // Slow peripheral (mg)
    Ce: number;              // Effect-site concentration
    Cp: number;              // Plasma concentration
    infusionRate: number;    // mg/min (0 if not running)
    totalDoseGiven: number;  // Cumulative mg
  }>;

  concentrationHistory: Map<DrugId, {
    timestamps: number[];
    cpValues: number[];
    ceValues: number[];
  }>;

  // Actions
  administerBolus: (drug: DrugId, doseMg: number) => void;
  startInfusion: (drug: DrugId, rateMcgKgMin: number) => void;
  stopInfusion: (drug: DrugId) => void;
  updatePKState: (drug: DrugId, state: PKState) => void;
}
```

### 3. useVitalsStore (Computed Vital Signs)

```typescript
interface VitalsStore {
  // Current values
  HR: number;
  SpO2: number;
  SBP: number;
  DBP: number;
  MAP: number;
  RR: number;
  EtCO2: number;
  BIS: number;

  // Derived states
  airwayObstruction: number;     // 0.0 – 1.0
  airwayPatency: number;         // 1.0 – 0.0 (inverse)
  emergencyState: EmergencyState;

  // Waveform data (ring buffers)
  ecgBuffer: Float32Array;       // 2048 samples
  plethBuffer: Float32Array;     // 2048 samples
  capnoBuffer: Float32Array;     // 2048 samples

  // Trends (downsampled for charts)
  vitalTrends: {
    timestamps: number[];
    HR: number[];
    SpO2: number[];
    SBP: number[];
    RR: number[];
    EtCO2: number[];
    BIS: number[];
  };

  // Actions
  updateVitals: (vitals: VitalSnapshot) => void;
  pushWaveformSample: (ecg: number, pleth: number, capno: number) => void;
}
```

### 4. useAlarmStore (Unified Alarm State)

```typescript
interface AlarmStore {
  activeAlarms: Alarm[];          // currently firing alarms
  alarmHistory: Alarm[];          // all past alarms
  emergencyState: EmergencyState; // NORMAL | WARNING | CRITICAL | ARREST
  silencedAlarms: Set<string>;    // user-silenced alarm IDs

  // Actions
  evaluateAlarms: (vitals: VitalSnapshot) => void;
  silenceAlarm: (alarmId: string) => void;
  acknowledgeAlarm: (alarmId: string) => void;
}

interface Alarm {
  id: string;
  vital: string;           // 'SpO2' | 'HR' | 'SBP' | 'RR' | 'EtCO2' | 'BIS'
  level: 'warning' | 'critical';
  value: number;
  threshold: number;
  startTime: number;
  acknowledged: boolean;
}
```

### 5. useScenarioStore (Scenario Engine State)

```typescript
interface ScenarioStore {
  scenario: Scenario | null;
  currentPhase: ScenarioPhase | null;
  phaseIndex: number;
  objectives: Objective[];
  completedObjectives: string[];
  scenarioEvents: ScenarioEvent[];
  isComplete: boolean;

  // Actions
  loadScenario: (scenario: Scenario) => void;
  advancePhase: () => void;
  completeObjective: (id: string) => void;
  triggerEvent: (event: ScenarioEvent) => void;
}
```

### 6. useAIStore (AI Mentor State)

```typescript
interface AIStore {
  messages: AIMessage[];
  isStreaming: boolean;
  currentStreamText: string;
  lastContextUpdate: number;
  config: AIConfig;

  // Actions
  addMessage: (message: AIMessage) => void;
  startStream: () => void;
  appendStreamDelta: (text: string) => void;
  endStream: () => void;
  updateContext: (context: SimContext) => void;
}
```

---

## Tick Loop — Atomic Update Pattern

```
┌─ Tick starts (every 250ms) ──────────────────────────────────────┐
│                                                                   │
│  1. READ current state (snapshot)                                 │
│     ├── drugStore.drugStates                                     │
│     ├── simStore.patientArchetype                                │
│     └── interventionState                                        │
│                                                                   │
│  2. COMPUTE all engines (pure functions, no store writes)        │
│     ├── pkEngine.advance(drugStates, dt)      → new PKStates     │
│     ├── pdEngine.compute(ceValues)             → fractionalEffects│
│     ├── physiologyEngine.compute(effects, patient, interventions)│
│     │   → { HR, SpO2, SBP, RR, EtCO2, BIS, airway, emergency } │
│     └── alarmEngine.evaluate(vitals)           → activeAlarms    │
│                                                                   │
│  3. WRITE single atomic update                                   │
│     ├── drugStore.updatePKState(...)                              │
│     ├── vitalsStore.updateVitals(...)                             │
│     ├── alarmStore.evaluateAlarms(...)                            │
│     └── simStore.simTime += dt                                   │
│                                                                   │
│  4. SIDE EFFECTS (non-blocking)                                  │
│     ├── eventLogger.checkAndLog(...)                             │
│     ├── metricsCollector.sample(...)                             │
│     └── scenarioEngine.checkTriggers(...)                        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Why Atomic Updates Matter

```
WRONG (race condition):
  vitalsStore.setHR(newHR);
  vitalsStore.setSpO2(newSpO2);
  // Component renders between these → sees inconsistent HR + old SpO2

RIGHT (atomic):
  vitalsStore.updateVitals({ HR: newHR, SpO2: newSpO2, ... });
  // Component sees ALL new values or ALL old values — never mixed
```

---

## Data Flow Audit

From `docs/data-flow-audit.md`:

### Flow 1: Drug Administration → Vital Signs

```
User clicks bolus → drugStore.administerBolus()
  → pkEngine reads drugStore (next tick)
  → pkEngine computes new Ce
  → pdEngine computes fractional effects
  → physiologyEngine computes new vitals
  → vitalsStore.updateVitals()
  → components re-render with new values

  Latency: 1 tick (250ms) from action to display
```

### Flow 2: Intervention → Physiology

```
User clicks jaw_thrust → interventionState.activate('jaw_thrust')
  → physiologyEngine reads active interventions (next tick)
  → airway obstruction reduced by 50%
  → RR, SpO2, EtCO2 recalculated
  → vitalsStore.updateVitals()

  Latency: 1 tick (250ms) from action to effect
```

### Flow 3: Alarm → AI Mentor

```
alarmStore.evaluateAlarms() detects SpO2 < 90%
  → alarmStore.activeAlarms updated
  → AlarmBanner component re-renders (red pulsing)
  → AI context collector includes alarm in next context push
  → Millie receives context (every 15 seconds or on critical event)
  → Millie generates response via SSE
  → useAIStore.messages updated
  → AIChatPanel re-renders

  Latency: 250ms (alarm display) + 0-15s (AI trigger) + ~1s (API response start)
```

---

## EmergencyState Computation

```
Computed every tick from vitalsStore:

function computeEmergencyState(vitals: VitalSnapshot): EmergencyState {
  if (vitals.HR === 0 || vitals.RR === 0):
    return ARREST;

  if (vitals.SpO2 < 90 || vitals.HR < 40 || vitals.HR > 140 ||
      vitals.SBP < 80 || vitals.RR < 5 || vitals.EtCO2 > 65):
    return CRITICAL;

  if (vitals.SpO2 < 94 || vitals.HR < 50 || vitals.HR > 120 ||
      vitals.SBP < 90 || vitals.RR < 8 || vitals.EtCO2 > 55):
    return WARNING;

  return NORMAL;
}
```

---

## Related Files

- [[01_PK_Engine_Three_Compartment]] — PK state written to drugStore
- [[04_Physiology_Pipeline]] — Vitals computed and written to vitalsStore
- [[06_Monitor_Display_and_Waveforms]] — AlarmStore driving alarm display
- [[10_Component_Architecture]] — Components consuming stores
- [[15_Tech_Stack_and_Development_Guide]] — Zustand configuration

---

#zustand #state-management #data-flow #atomic-update #tick-loop #stores #emergency-state

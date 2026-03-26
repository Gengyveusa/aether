# Component Architecture

> **Source:** `src/components/` | **Framework:** React 18+ with TypeScript
> **Total components:** 44 | **State management:** Zustand (pure consumers)
> **Layout:** Responsive dashboard with resizable panels

---

## Overview

SedSim's UI is built from 44 React components organized into 8 functional groups. All components are **pure Zustand consumers** — they read from the store and dispatch actions but contain zero simulation logic. The simulation engines run independently and write to the store; components simply render the latest state.

---

## Component Tree

```
<App>
├── <SimulatorDashboard>              // Main layout container
│   ├── <Header>                       // Timer, controls, settings
│   │   ├── <SimClock>                 // Simulation time display
│   │   ├── <SimControls>             // Play/pause/reset/speed
│   │   └── <AudioToggle>             // Mute/unmute + volume
│   │
│   ├── <MonitorPanel>                 // Left: vital signs monitor
│   │   ├── <WaveformCanvas>          // Canvas-rendered waveforms
│   │   │   ├── <ECGTrace>            // Green ECG waveform
│   │   │   ├── <SpO2Pleth>           // Cyan plethysmograph
│   │   │   └── <CapnoTrace>          // Yellow capnography
│   │   ├── <VitalNumerics>           // Large numeric readouts
│   │   │   ├── <HRDisplay>           // Heart rate + icon
│   │   │   ├── <SpO2Display>         // SpO2 percentage
│   │   │   ├── <BPDisplay>           // SBP/DBP (MAP)
│   │   │   ├── <RRDisplay>           // Respiratory rate
│   │   │   ├── <EtCO2Display>        // End-tidal CO2
│   │   │   └── <BISDisplay>          // BIS value + bar
│   │   ├── <AlarmBanner>             // Warning/critical display
│   │   └── <VitalCoherenceMonitor>   // Cross-checks vital trends
│   │
│   ├── <DrugPanel>                    // Right-top: drug controls
│   │   ├── <DrugRow>                  // Per-drug bolus buttons + Ce
│   │   │   ├── <BolusButton>         // Fixed-dose bolus buttons
│   │   │   └── <InfusionControls>    // Rate slider + start/stop
│   │   ├── <ReversalSection>         // Naloxone + Flumazenil
│   │   ├── <ConcentrationTrend>      // Cp/Ce time-series chart
│   │   └── <GhostDosePreview>        // Dotted preview overlay
│   │
│   ├── <InterventionPanel>            // Right-mid: airway + O2
│   │   ├── <AirwayButtons>           // Chin lift, jaw thrust, OPA, NPA
│   │   ├── <BagMaskButton>           // Momentary hold button
│   │   ├── <SuctionButton>           // 5-second momentary
│   │   ├── <O2DeliverySelector>      // Radio: room air → NRB
│   │   ├── <ObstructionBar>          // Visual obstruction level
│   │   └── <IVFluidButton>           // 250 mL bolus toggle
│   │
│   ├── <AIChatPanel>                  // Right-bottom: Millie
│   │   ├── <MessageBubble>           // Individual AI message
│   │   ├── <StreamingText>           // SSE progressive render
│   │   └── <AISettings>              // Verbosity, model, enable
│   │
│   └── <StatusBar>                    // Bottom: scenario info
│       ├── <PatientInfo>              // Archetype name + ASA + vitals summary
│       ├── <ScenarioProgress>         // Phase indicator + objectives
│       └── <EmergencyIndicator>       // Normal/Warning/Critical/Arrest badge
│
├── <TutorialOverlay>                  // Tutorial mode highlights
│   ├── <TutorialStep>                // Step-by-step guidance
│   ├── <HighlightBox>                // Spotlight on component
│   └── <TutorialNav>                 // Next/prev/skip
│
├── <DebriefView>                      // Post-sim analysis
│   ├── <ScoreCard>                   // A/B/C/F grade + breakdown
│   ├── <MetricBars>                  // Safety/sedation/decision bars
│   ├── <DebriefTimeline>             // Interactive event timeline
│   │   ├── <TimelineTrack>           // Vital trend overlay
│   │   ├── <DrugMarker>             // Clickable bolus/infusion markers
│   │   └── <EventMarker>            // Alarm + intervention markers
│   └── <Recommendations>            // AI-generated improvement tips
│
├── <PhysiologyVisuals>                // Educational physiology panels
│   ├── <EchoSim>                     // PV loop, EF, cardiac output
│   ├── <FrankStarlingCurve>          // Pressure-volume relationship
│   ├── <OxyHbCurve>                  // O2-Hb dissociation curve
│   ├── <PhysiologyAvatar>           // Visual patient representation
│   ├── <PrecordialStethoscope>      // Audio auscultation panel
│   └── <EEGPanel>                    // EEG / BIS visualization
│
├── <InstructorDashboard>              // /instructor route
│   ├── <StudentList>                 // Connected learners
│   ├── <SessionReview>              // Replay past sessions
│   ├── <LiveMonitorGrid>            // Multi-student vital tiles
│   └── <ABStudyControls>            // A/B crossover study config
│
├── <LMSPanel>                         // LMS configuration
│   ├── <EndpointConfig>              // LRS URL + auth
│   ├── <SCORMSettings>               // SCORM version + package
│   ├── <TestConnection>              // Connectivity test button
│   └── <StatementLog>                // Recent xAPI statements
│
├── <EducationPanel>                   // Learning modules
│   ├── <ModuleList>                  // Available education modules
│   ├── <LearningContent>            // Module content renderer
│   └── <QuizPanel>                   // Question bank + scoring
│
└── <SettingsPanel>                    // Application settings
    ├── <PatientSelector>             // Archetype dropdown
    ├── <DifficultySlider>            // Beginner → Advanced
    ├── <AudioPreferences>            // Volume, alarm sounds
    └── <DisplayOptions>              // Theme, layout, language
```

---

## Component Registry

### Monitor Components (10)

| Component | Store Slice | Update Frequency | Key Props |
|-----------|------------|-------------------|-----------|
| WaveformCanvas | vitalsStore | 60 fps (rAF) | width, height, traces[] |
| ECGTrace | vitalsStore.HR | 60 fps | hr, rhythm, color |
| SpO2Pleth | vitalsStore.SpO2 | 60 fps | spo2, hr, perfusion |
| CapnoTrace | vitalsStore.EtCO2 | 60 fps | etco2, rr, obstruction |
| HRDisplay | vitalsStore.HR | 4 Hz | value, alarmLevel |
| SpO2Display | vitalsStore.SpO2 | 4 Hz | value, alarmLevel |
| BPDisplay | vitalsStore.BP | 4 Hz | sbp, dbp, map |
| RRDisplay | vitalsStore.RR | 4 Hz | value, alarmLevel |
| EtCO2Display | vitalsStore.EtCO2 | 4 Hz | value, waveformShape |
| BISDisplay | vitalsStore.BIS | 4 Hz | value, trend |

### Drug Components (5)

| Component | Store Slice | Key Props |
|-----------|------------|-----------|
| DrugRow | drugStore[drugId] | drugId, Ce, Cp, boluses[] |
| BolusButton | drugStore | drug, dose, onClick |
| InfusionControls | drugStore.propofol | rate, isRunning |
| ConcentrationTrend | drugStore.history | timeRange, drugs[] |
| GhostDosePreview | drugStore + pkEngine | drug, proposedDose |

### Physiology Visual Components (6)

| Component | Description | Data Source |
|-----------|-------------|-------------|
| EchoSim | PV loop + ejection fraction + cardiac output | vitalsStore.cardiac |
| FrankStarlingCurve | Pressure-volume relationship visualization | vitalsStore.preload |
| OxyHbCurve | O2-Hemoglobin dissociation curve (live position) | vitalsStore.SpO2/PaO2 |
| PhysiologyAvatar | Visual patient: chest rise = RR, skin color = SpO2 | vitalsStore |
| PrecordialStethoscope | Audio auscultation (heart + breath sounds) | audioStore |
| EEGPanel | Raw EEG trace + BIS computation visualization | vitalsStore.BIS |

---

## Data Flow: Components as Pure Consumers

```
┌─────────────────┐
│  Simulation     │
│  Engines        │     Components NEVER call engine methods directly.
│  (PK/PD/Phys)   │     They read store state and dispatch actions.
└────────┬────────┘
         │ writes
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Zustand Store  │────→│  React          │
│  (single source │     │  Components     │
│   of truth)     │←────│  (dispatch      │
└─────────────────┘     │   actions only) │
                        └─────────────────┘
```

### Rendering Performance

| Technique | Purpose |
|-----------|---------|
| `React.memo()` | Prevents re-render when store slice unchanged |
| `useShallow()` | Zustand selector for minimal re-render |
| `requestAnimationFrame` | Canvas waveforms rendered outside React cycle |
| `useDeferredValue` | Non-critical displays (trends) deferred |
| `Canvas 2D` | Waveforms bypass DOM entirely |

---

## Related Files

- [[06_Monitor_Display_and_Waveforms]] — Monitor display specifications
- [[07_Drug_Administration_and_Interventions]] — Drug panel details
- [[08_AI_Integration_Millie_SimMaster]] — AI chat panel
- [[09_Scoring_Assessment_Debrief]] — Debrief view components
- [[11_State_Management_and_Data_Flow]] — Zustand stores consumed by components
- [[15_Tech_Stack_and_Development_Guide]] — React/TypeScript conventions

---

#components #react #dashboard #monitor #drug-panel #architecture #pure-consumers #canvas

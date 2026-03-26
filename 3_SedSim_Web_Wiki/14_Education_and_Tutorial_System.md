# Education & Tutorial System

> **Source:** `src/components/education/`, `src/engines/tutorialEngine.ts`
> **Modules:** PK/PD education series | **Tutorial:** Step-by-step guided walkthrough
> **Assessment:** Question bank with immediate feedback

---

## Overview

SedSim includes a comprehensive education system with three components:

1. **Education Modules** — Self-paced PK/PD learning content with embedded quiz questions
2. **Tutorial Engine** — Guided first-use walkthrough with component spotlighting
3. **Question Bank** — Assessment questions tied to learning objectives

These systems are integrated with the [[08_AI_Integration_Millie_SimMaster|Millie AI mentor]] for adaptive teaching and with the [[13_LMS_Integration_and_Deployment|LMS layer]] for competency tracking.

---

## Education Modules

### Module Registry

| # | Module Title | Topic | Prerequisites | Duration |
|---|-------------|-------|---------------|----------|
| 1 | **Introduction to Sedation** | Sedation continuum, ASA definitions, monitoring requirements | None | 10 min |
| 2 | **Pharmacokinetic Fundamentals** | Compartment models, distribution, elimination, half-life | Module 1 | 15 min |
| 3 | **Effect-Site & ke0** | Effect-site equilibration, hysteresis, clinical implications | Module 2 | 12 min |
| 4 | **Pharmacodynamics & Dose-Response** | Sigmoid Emax, EC50, Hill coefficient, therapeutic window | Module 2 | 15 min |
| 5 | **Drug Interactions** | Bouillon model, synergy vs additivity, safety implications | Modules 3, 4 | 15 min |
| 6 | **Propofol Pharmacology** | Marsh model, titration, side effects, recovery | Module 4 | 12 min |
| 7 | **Opioid Pharmacology** | Fentanyl/remifentanil, respiratory depression, context-sensitive half-time | Module 4 | 12 min |
| 8 | **Airway Management** | Obstruction, risk factors, interventions, BLS sequence | Module 1 | 15 min |
| 9 | **Monitoring Interpretation** | Waveform reading, alarm response, SpO2/EtCO2 correlation | Module 1 | 12 min |
| 10 | **Sedation Complications** | Oversedation, desaturation, hypotension, reversal agents | Modules 5–9 | 15 min |
| 11 | **Clinical Decision-Making** | Pre-assessment, titration strategies, recovery criteria | All above | 20 min |

### Module Structure

```
Each module follows a consistent structure:

┌─────────────────────────────────────────┐
│  📖 MODULE 4: Pharmacodynamics          │
│     & Dose-Response                     │
├─────────────────────────────────────────┤
│                                         │
│  Learning Objectives:                   │
│  □ Explain the sigmoid Emax model       │
│  □ Define EC50 and Hill coefficient     │
│  □ Interpret a dose-response curve      │
│  □ Identify therapeutic window          │
│                                         │
│  ── Content Sections ──                 │
│                                         │
│  1. What is Pharmacodynamics?           │
│     [text + interactive diagram]        │
│                                         │
│  2. The Sigmoid Emax Curve              │
│     [interactive: adjust EC50, γ]       │
│     [see effect on dose-response]       │
│                                         │
│  3. Therapeutic Window                  │
│     [visual: EC50_sedation vs           │
│      EC50_respiratory]                  │
│                                         │
│  ── Knowledge Check ──                  │
│                                         │
│  Q1: If EC50 for sedation is 3.4       │
│      mcg/mL and current Ce is 1.7,     │
│      what fraction of max effect...    │
│      ○ A) 25%  ○ B) 50%  ● C) ~33%    │
│      ✅ Correct! At Ce = EC50/2...      │
│                                         │
│  [← Previous Module] [Next Module →]   │
│  Progress: ████████░░ 80%              │
└─────────────────────────────────────────┘
```

---

## Tutorial Engine

### TutorialMode: First-Use Walkthrough

The tutorial engine provides a step-by-step guided tour of the simulator interface:

```
tutorialEngine.ts:

  steps: [
    {
      id: 'welcome',
      target: null,
      title: 'Welcome to SedSim',
      content: 'This simulator lets you practice sedation...',
      position: 'center'
    },
    {
      id: 'monitor',
      target: '#monitor-panel',
      title: 'Patient Monitor',
      content: 'These are the vital signs you\'ll be watching...',
      position: 'right',
      highlight: true    // spotlight effect on component
    },
    {
      id: 'ecg-trace',
      target: '#ecg-waveform',
      title: 'ECG Waveform',
      content: 'The green trace shows the heart rhythm...',
      position: 'bottom'
    },
    {
      id: 'drug-panel',
      target: '#drug-panel',
      title: 'Drug Administration',
      content: 'Click these buttons to give medications...',
      position: 'left',
      action: 'highlight-bolus-buttons'
    },
    // ... 15 more steps covering all interface elements
    {
      id: 'first-dose',
      target: '#propofol-50mg',
      title: 'Try Your First Dose',
      content: 'Click the 50mg propofol button to start...',
      position: 'left',
      waitForAction: 'bolus-propofol'   // waits for user to click
    }
  ]
```

### Tutorial Spotlight Effect

```
HighlightBox component:
  1. Full-screen semi-transparent overlay (#000000, opacity 0.7)
  2. "Hole" cut out around target component (CSS clip-path)
  3. Pulsing border on highlighted component
  4. Tooltip positioned relative to target (top/bottom/left/right)
  5. [Next] [Back] [Skip Tutorial] navigation

  CSS:
    .tutorial-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
    }
    .tutorial-spotlight {
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
      border: 2px solid #00ff88;
      animation: pulse 2s infinite;
    }
```

---

## Question Bank

### Question Types

| Type | Format | Scoring |
|------|--------|---------|
| Multiple Choice | 4 options, 1 correct | 1 point correct, 0 wrong |
| Multiple Select | 4+ options, 2+ correct | Partial credit |
| Numeric Entry | Free-form number | ±10% tolerance |
| Drag-and-Order | Sequence ordering | 1 point if fully correct |
| Clinical Scenario | Multi-part case-based | Weighted by part |

### Sample Questions

```
Module 5 (Drug Interactions):

Q1: [Multiple Choice]
A patient receives propofol (Ce = 2.5 mcg/mL) and fentanyl
(Ce = 1.0 ng/mL). Compared to propofol alone at the same Ce,
the RESPIRATORY depression is:

  A) About the same (additive)
  B) Less than expected (antagonistic)
  C) Greater than the sum of individual effects (synergistic)  ✅
  D) Unpredictable

Explanation: The Bouillon response surface model demonstrates
synergistic respiratory depression between hypnotics and opioids.
While BIS effects are approximately additive (β ≈ 0), respiratory
depression is synergistic (β > 0), meaning the combined effect
exceeds the sum of individual drug effects. This is the most
dangerous aspect of combined sedation.

Reference: [[02_PD_Model_and_Drug_Interactions]]
```

```
Module 8 (Airway Management):

Q2: [Drag-and-Order]
Order these airway interventions from FIRST to LAST when you
encounter airway obstruction during sedation:

  Correct order:
  1. Chin lift / head tilt
  2. Jaw thrust
  3. Oral/nasal airway insertion
  4. Bag-mask ventilation
  5. Call for help / activate emergency protocol

Reference: [[07_Drug_Administration_and_Interventions]]
```

---

## LearningPanel Component

```
<LearningPanel>
├── <ModuleList>              // Sidebar: module navigation
│   ├── <ModuleCard>          // Title + progress + status icon
│   └── <PrerequisiteCheck>   // Lock icon if prereqs not met
├── <LearningContent>         // Main: markdown + interactive
│   ├── <ContentSection>      // Text + diagrams
│   ├── <InteractiveDiagram>  // Adjustable PK/PD visualizations
│   └── <EmbeddedSim>         // Mini-simulator for demonstration
├── <QuizPanel>               // Bottom: knowledge check
│   ├── <QuestionRenderer>    // Renders question by type
│   ├── <AnswerFeedback>      // Correct/incorrect + explanation
│   └── <QuizScore>           // Running accuracy
└── <ProgressTracker>         // Overall education progress
    ├── <ModuleProgress>      // Per-module completion
    └── <CompetencyBadge>     // Earned on module completion
```

---

## Adaptive Learning Integration

```
Millie + Education integration:

  During simulation:
    if (learner makes error matching Module N content):
      Millie says: "This relates to what we covered in Module N —
                    remember the concept of [X]?"

  Post-simulation (debrief):
    if (safety score < 70):
      Recommend: "Review Module 8 (Airway Management) and
                  Module 10 (Sedation Complications)"

    if (sedation quality < 70):
      Recommend: "Review Module 4 (PD & Dose-Response) and
                  Module 5 (Drug Interactions)"

  xAPI tracking:
    Each module completion → xAPI "completed" statement
    Each quiz answer → xAPI "answered" statement
    Module recommendations → xAPI "recommended" statement
```

---

## Competency Framework

| Level | Modules Required | Sim Performance | Badge |
|-------|-----------------|-----------------|-------|
| **Novice** | Modules 1–3 | Any tutorial completion | Bronze |
| **Intermediate** | Modules 1–8 | Grade C or above on beginner scenario | Silver |
| **Proficient** | Modules 1–11 | Grade B or above on intermediate scenario | Gold |
| **Expert** | All modules + quiz 90% | Grade A on advanced scenario | Platinum |

---

## Related Files

- [[02_PD_Model_and_Drug_Interactions]] — PD concepts taught in modules 4–5
- [[05_Patient_Archetypes_and_Scenarios]] — Scenarios used in simulation exercises
- [[08_AI_Integration_Millie_SimMaster]] — Millie's adaptive teaching references modules
- [[09_Scoring_Assessment_Debrief]] — Scoring tied to learning objectives
- [[13_LMS_Integration_and_Deployment]] — Module completion tracked via xAPI

---

#education #tutorial #modules #question-bank #competency #learning-panel #adaptive #quiz

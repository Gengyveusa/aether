# AI Integration — Millie the Mentor & SimMaster

> **Source:** `src/components/ai/`, `src/stores/useAIStore.ts`
> **API:** Claude API via Server-Sent Events (SSE) streaming
> **Agents:** Millie (bedside mentor), SimMaster v4 (teaching strategist), Digital Twin Coordinator

---

## Overview

SedSim integrates three AI agents powered by the Claude API to provide real-time educational guidance during simulation:

1. **Millie the Mentor** — Socratic bedside instructor who speaks at critical moments
2. **SimMaster v4** — Higher-level teaching strategy engine managing 8 clinical patterns
3. **Digital Twin Coordinator** — Orchestrates multiple agent perspectives into coherent guidance

All AI communication uses **SSE (Server-Sent Events) streaming** for low-latency, progressive text rendering in the UI.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLAUDE API (SSE)                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │ Millie       │  │ SimMaster v4 │  │ Digital Twin  │ │
│  │ (Bedside)    │  │ (Strategy)   │  │ (Coordinator) │ │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘ │
│         │                 │                   │          │
│         └────────────┬────┴───────────────────┘          │
│                      ▼                                   │
│              Multi-Agent Router                          │
│              (priority + dedup)                          │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
              ┌────────────────┐
              │  AI Chat Panel │
              │  (streaming)   │
              └────────────────┘
```

---

## Millie the Mentor

### Personality & Pedagogical Style

| Attribute | Description |
|-----------|-------------|
| **Tone** | Warm, encouraging, Socratic |
| **Approach** | Asks questions before giving answers |
| **Voice** | Uses "we" language ("Let's think about what might happen...") |
| **Timing** | Speaks at critical events, learner errors, and teachable moments |
| **Silence** | Deliberately quiet during routine phases (avoids over-prompting) |

### Trigger Conditions

| Trigger Category | Specific Triggers | Millie Response Style |
|-----------------|-------------------|----------------------|
| **Critical event** | SpO2 < 90%, HR < 50, SBP < 80, apnea | Urgent but calm: "I notice the SpO2 is dropping — what's your next move?" |
| **Learner error** | Excessive dose, no pre-O2, delayed intervention | Gentle redirect: "That's a larger dose than usual — what were you aiming for?" |
| **Teachable moment** | Drug onset visible, synergy demonstrated, reversal needed | Socratic: "Look at how the Ce is rising — can you predict when we'll see the peak effect?" |
| **Positive reinforcement** | Correct titration, timely intervention, good airway management | Praise: "Nice work recognizing that early and acting on it." |
| **Scenario milestone** | Phase transition, objective completed | Progress update: "Great — the patient is now stable. What would you do differently next time?" |

### Context Window (Last 60 Seconds)

```
Millie receives a rolling context of the last 60 seconds:

{
  simTime: 245,
  vitals: {
    current: { HR: 58, SpO2: 91, SBP: 95, RR: 6, EtCO2: 52, BIS: 62 },
    trend_60s: [/* 240 data points at 4Hz */]
  },
  drugs: {
    activeConcentrations: { propofol_Ce: 3.8, fentanyl_Ce: 1.1 },
    recentBoluses: [{ drug: "fentanyl", dose: 75, time: 230 }],
    activeInfusions: [{ drug: "propofol", rate: 100, since: 120 }]
  },
  interventions: {
    active: ["nasal_cannula_4L"],
    recent: []
  },
  alarms: {
    active: [{ vital: "SpO2", level: "warning", value: 91 }]
  },
  events: [
    { time: 230, type: "bolus", detail: "fentanyl 75 mcg" },
    { time: 235, type: "alarm", detail: "RR warning < 8" },
    { time: 240, type: "alarm", detail: "SpO2 warning < 93%" }
  ],
  scenario: {
    currentPhase: "post-induction",
    objectives: ["Maintain SpO2 > 94%", "Titrate to BIS 65-85"]
  }
}
```

---

## SimMaster v4

### Teaching Strategy Engine

SimMaster operates at a **higher level** than Millie — it doesn't speak to the learner directly but instead:
1. Identifies which of 8 clinical patterns is currently active
2. Adjusts Millie's prompt to focus on the relevant teaching points
3. Manages scenario pacing (when to escalate, when to pause)
4. Evaluates learner performance in real-time

### 8 Clinical Patterns

| # | Pattern | Description | Teaching Focus |
|---|---------|-------------|----------------|
| 1 | **Titration** | Learner is actively dosing | Dose selection, effect-site targeting |
| 2 | **Observation** | Stable patient, monitoring | Vigilance, trend recognition |
| 3 | **Desaturation** | SpO2 declining | Airway assessment, O2 management, escalation |
| 4 | **Hypotension** | SBP dropping | Fluid resuscitation, vasopressor concepts |
| 5 | **Oversedation** | BIS < 50 or apnea | Dose reduction, reversal agent decision |
| 6 | **Undersedation** | BIS > 85, patient moving | Bolus vs infusion, anxiolysis |
| 7 | **Drug interaction** | Synergy becoming apparent | Bouillon model concepts, safety margins |
| 8 | **Recovery** | Post-procedure emergence | Monitoring during recovery, discharge criteria |

### SimMaster Decision Flow

```
Every 15 seconds:
  1. Classify current clinical pattern (1-8)
  2. Evaluate learner's recent actions
  3. Determine if teaching intervention needed:
     - Pattern unchanged + learner acting appropriately → SILENCE
     - Pattern changed → brief orientation prompt to Millie
     - Learner struggling → increase Millie's prompting frequency
     - Critical safety event → force immediate Millie alert
  4. Update Millie's system prompt with current teaching focus
  5. Adjust scenario pacing if applicable
```

---

## Digital Twin Coordinator

The Digital Twin acts as the **multi-agent orchestrator**:

```
Coordinator responsibilities:
  1. Prevent conflicting advice (Millie says X while SimMaster says Y)
  2. Manage turn-taking (only one AI speaks at a time)
  3. Maintain coherent "session narrative" across agents
  4. Forward physiological predictions to GhostDosePreview
  5. Log all AI interactions for debrief review
```

### Multi-Agent Message Flow

```
SimMaster:    "Pattern: desaturation. Focus: airway first, O2 second."
     │
     ▼
Coordinator:  "Millie should address airway. Suppress infusion advice."
     │
     ▼
Millie:       "The SpO2 is at 91% — before we adjust any drugs,
               let's check the airway. What do you see?"
     │
     ▼
Learner:      [performs jaw thrust]
     │
     ▼
Millie:       "Good instinct! The airway looks better. Now let's
               think about our oxygen delivery..."
```

---

## SSE Streaming Implementation

```
Claude API call:
  POST /v1/messages (stream: true)

  Headers:
    x-api-key: [user-provided or session key]
    anthropic-version: 2023-06-01
    Content-Type: application/json

  Response: Server-Sent Events
    event: content_block_delta
    data: {"type": "content_block_delta", "delta": {"text": "Let's"}}

    event: content_block_delta
    data: {"type": "content_block_delta", "delta": {"text": " think"}}

    event: message_stop
    data: {"type": "message_stop"}

  UI rendering:
    Each delta appended to chat panel in real-time
    Typewriter effect with 20ms character delay
    Auto-scroll to bottom on new content
```

---

## AI Chat Panel Layout

```
┌──────────────────────────────────────┐
│  🤖 MILLIE THE MENTOR                │
├──────────────────────────────────────┤
│                                      │
│  👩‍⚕️ Millie (2:30):                    │
│  "I see you've given 75 mcg of      │
│   fentanyl. With the propofol       │
│   already on board, let's watch     │
│   the respiratory rate closely —    │
│   why might that combination be     │
│   concerning?"                       │
│                                      │
│  👩‍⚕️ Millie (3:45):                    │
│  "Nice catch opening the airway!    │
│   The SpO2 is recovering. What      │
│   would you consider if it hadn't   │
│   improved?" ▌                       │
│                                      │
├──────────────────────────────────────┤
│  [Minimize] [Clear] [Settings ⚙]    │
└──────────────────────────────────────┘
```

---

## AI Configuration

| Setting | Default | Options |
|---------|---------|---------|
| AI mentor enabled | true | true / false |
| Mentor verbosity | Medium | Low / Medium / High |
| Auto-speak on critical | true | true / false |
| Model | claude-sonnet-4-6 | Any Claude model |
| Max tokens per response | 200 | 50–500 |
| Temperature | 0.7 | 0.0–1.0 |
| Context window | 60 seconds | 30–120 seconds |

---

## Related Files

- [[04_Physiology_Pipeline]] — Vital signs fed as context to AI
- [[06_Monitor_Display_and_Waveforms]] — Alarm events triggering Millie
- [[09_Scoring_Assessment_Debrief]] — AI interactions logged for debrief
- [[10_Component_Architecture]] — AIChatPanel component
- [[11_State_Management_and_Data_Flow]] — useAIStore Zustand slice
- [[05_Patient_Archetypes_and_Scenarios]] — Scenario phases triggering teaching points

---

#millie #simmaster #claude-api #SSE #multi-agent #digital-twin #socratic #teaching-strategy

# ElevenLabs Integration Plan — OVN Nexus

> **Status:** Planning Phase | **Last Updated:** March 16, 2026

This document outlines the full integration strategy for leveraging ElevenLabs' expanded multi-modal AI capabilities across the OVN Nexus platform. The goal: transform OVN Nexus from a content delivery platform into a fully interactive, AI-powered medical education experience.

---

## Vision

OVN Nexus becomes the first oral-vascular-neural medical education platform powered by:
- **Live conversational AI patient simulators** (ElevenAgents)
- **Cinematic AI-generated video case studies** (Image & Video API)
- **Multi-voice clinical dialogue narration** (Text to Dialogue)
- **Real-time speech transcription & analysis** (Scribe v2 Speech-to-Text)
- **AI-generated background music & sound FX** for immersive presentations (Music + Sound Effects)

---

## Phase 1: Perio-Immuno Deck — Enhanced Voiceover (CURRENT)

**Status:** In progress

### What We're Doing
Using the ElevenLabs Text-to-Speech API to narrate the Periodontal-Immunology slide deck with a professional clinical voice.

### API Used
- `POST /v1/text-to-speech/{voice_id}` — Create speech
- Model: `eleven_v3` (most expressive, emotionally rich)
- Voice: TBD — recommend a warm authoritative clinical voice

### Implementation
```typescript
import ElevenLabs from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabs({ apiKey: process.env.ELEVENLABS_API_KEY });

// Stream narration for each slide
const audio = await client.textToSpeech.stream(VOICE_ID, {
  text: slideNarrationText,
  model_id: 'eleven_v3',
  voice_settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.4,
    use_speaker_boost: true
  }
});
```

### Env Var
```
ELEVENLABS_API_KEY=<set in .env.local>
ELEVENLABS_VOICE_ID_NARRATOR=<narrator voice id>
```

---

## Phase 2: Multi-Voice Clinical Dialogue

**Priority:** High | **Complexity:** Low

### What We're Doing
Convert case presentation scripts into realistic multi-speaker conversations between clinician, patient, and specialist using the **Text to Dialogue** API.

### Use Cases
- Doctor-patient consultation dialogues for each module
- Interdisciplinary team discussions (Perio + Cardiology + Immunology)
- Patient narrating their own symptom history

### API Used
- `POST /v1/text-to-dialogue` — Convert list of text + voice_id pairs into multi-speaker audio
- Supports up to **10 unique voice IDs** per dialogue

### Implementation
```typescript
const dialogue = await client.textToDialogue.convert({
  model_id: 'eleven_v3',
  inputs: [
    {
      text: "Good morning. I've been noticing bleeding when I brush my teeth for the past few months.",
      voice_id: process.env.ELEVENLABS_VOICE_ID_PATIENT
    },
    {
      text: "How long exactly, and have you noticed any other symptoms — fatigue, joint pain, cardiovascular issues?",
      voice_id: process.env.ELEVENLABS_VOICE_ID_CLINICIAN
    },
    {
      text: "About six months. I did have a recent cardiac workup — elevated CRP, mild hypertension.",
      voice_id: process.env.ELEVENLABS_VOICE_ID_PATIENT
    }
  ]
});
```

### Env Vars to Add
```
ELEVENLABS_VOICE_ID_CLINICIAN=<voice id>
ELEVENLABS_VOICE_ID_PATIENT=<voice id>
ELEVENLABS_VOICE_ID_SPECIALIST=<voice id>
```

---

## Phase 3: ElevenAgents — Live Interactive Patient Simulator

**Priority:** High | **Complexity:** High | **Impact:** Transformational

### What We're Doing
Deploy a conversational AI patient agent that medical students and residents can interact with in real time. The agent responds as a patient with a specific periodontal-systemic condition, answering questions, describing symptoms, and reacting to clinical decisions.

### Architecture
```
Student (voice/text)
    |
    v
OVN Nexus Web Widget (ElevenLabs React SDK)
    |
    v
ElevenAgent (POST /v1/convai/agents/create)
  - System prompt: "You are a 52-year-old patient with Stage III periodontitis and Type 2 diabetes..."
  - Knowledge Base: RAG over periodontal + immunology literature (PDFs via /v1/convai/knowledge-base)
  - LLM: GPT-4o or custom (via OPENAI_API_KEY already configured)
  - Voice: Patient voice clone or library voice
    |
    v
Post-call webhook -> Supabase
  - Store transcript, student performance, conversation analysis
```

### Agent Types to Build
| Agent | Condition | Complexity |
|-------|-----------|------------|
| `perio-patient-basic` | Stage II Periodontitis, healthy systemic | Beginner |
| `perio-patient-diabetic` | Stage III Periodontitis + T2DM | Intermediate |
| `perio-patient-cardiac` | Stage IV Periodontitis + CVD risk | Advanced |
| `perio-patient-autoimmune` | Periodontitis + RA / lupus | Expert |

### API Used
- `POST /v1/convai/agents/create` — Create agent with conversation_config
- `POST /v1/convai/knowledge-base` — Upload perio/immuno PDFs for RAG
- `GET /v1/convai/agents/{agent_id}` — Retrieve agent config
- `POST /v1/convai/agents/{agent_id}/simulate-conversation` — Test agent
- ElevenLabs React SDK (`@elevenlabs/react`) — Web widget embed

### Knowledge Base Sources to Upload
- Periodontal disease classification (2017 World Workshop)
- Oral-systemic disease connections literature
- OVN proprietary case study PDFs
- Diagnostic protocol documents

### Env Vars to Add
```
ELEVENLABS_AGENT_ID_PERIO_BASIC=<agent id>
ELEVENLABS_AGENT_ID_PERIO_DIABETIC=<agent id>
ELEVENLABS_AGENT_ID_PERIO_CARDIAC=<agent id>
ELEVENLABS_AGENT_ID_PERIO_AUTOIMMUNE=<agent id>
```

---

## Phase 4: Speech-to-Text — Student Assessment Engine

**Priority:** Medium | **Complexity:** Medium

### What We're Doing
Use the **Scribe v2** model to transcribe and analyze student clinical presentations, oral assessments, and case discussions.

### Use Cases
- Student presents a case verbally → AI scores communication, clinical accuracy, differential diagnosis quality
- Record patient interaction simulations for faculty review
- Real-time transcription during interactive patient encounters

### API Used
- `POST /v1/speech-to-text` — Transcribe audio
- Model: `scribe_v2` (90+ language support, speaker diarization up to 32 speakers, word-level timestamps)

### Implementation
```typescript
const transcript = await client.speechToText.convert({
  audio: audioFile,
  model_id: 'scribe_v2',
  diarize: true, // Separate student vs patient voices
  num_speakers: 2,
  tag_audio_events: true,
  timestamps_granularity: 'word'
});

// Send transcript + timestamps to GPT-4o for clinical communication scoring
```

---

## Phase 5: AI Video Case Studies with Lip-Sync

**Priority:** Medium | **Complexity:** High | **Wow Factor:** Maximum

### What We're Doing
Generate cinematic video case presentations with talking patient avatars, clinical imagery, and synchronized AI-generated narration.

### Pipeline
```
Case Script (text)
    |
    v
Text-to-Speech (eleven_v3) → audio file
    |
    v
Image & Video API → Patient avatar video
    |
    v
Lip-sync API → Sync video to audio
    |
    v
Final .mp4 → Served via SUPABASE_MUSIC_BUCKET / video storage
    |
    v
Displayed in OVN Nexus video-pipeline module
```

### API Used
- `POST /v1/text-to-speech` — Generate narration audio
- `POST /v1/image-video/generate` — Generate patient avatar video (beta)
- Lip-sync model — Sync mouth movement to audio
- Model: `genmo_replay_v2` (cinematic) or `kling_v2_5_pro` (motion quality)

---

## Phase 6: Ambient Sound Design

**Priority:** Low | **Complexity:** Low

### What We're Doing
Add immersive clinical environment audio to presentations and patient simulation sessions.

### Use Cases
- Background dental office ambiance during patient simulations
- Dramatic musical underscore for case reveals
- Alert sounds for emergency scenarios

### API Used
- `POST /v1/sound-effects/generate` — Generate sound FX from text prompts
- `POST /v1/music/generate` — Generate background music

### Example Prompts
- `"quiet dental examination room, gentle background ventilation hum"`
- `"tense clinical moment, low strings building to resolution"`
- `"emergency alert tone, hospital setting"`

---

## npm Packages to Install

```bash
npm install @elevenlabs/elevenlabs-js @elevenlabs/react
```

---

## Environment Variables — Full Set

Update `.env.local` with:

```bash
# ElevenLabs — Core
ELEVENLABS_API_KEY=<already set>

# Voices
ELEVENLABS_VOICE_ID_NARRATOR=<narrator voice>
ELEVENLABS_VOICE_ID_CLINICIAN=<clinician voice>
ELEVENLABS_VOICE_ID_PATIENT=<patient voice>
ELEVENLABS_VOICE_ID_SPECIALIST=<specialist voice>

# Agents
ELEVENLABS_AGENT_ID_PERIO_BASIC=<tbd>
ELEVENLABS_AGENT_ID_PERIO_DIABETIC=<tbd>
ELEVENLABS_AGENT_ID_PERIO_CARDIAC=<tbd>
ELEVENLABS_AGENT_ID_PERIO_AUTOIMMUNE=<tbd>
```

---

## Implementation Roadmap

| Phase | Feature | Est. Effort | Priority |
|-------|---------|-------------|----------|
| 1 | Perio-Immuno deck voiceover | 1–2 days | NOW |
| 2 | Multi-voice dialogue for case studies | 2–3 days | Week 1 |
| 3 | ElevenAgents patient simulator (basic) | 1 week | Week 2 |
| 4 | Speech-to-text student assessment | 3–4 days | Week 3 |
| 3b | Additional patient agents (diabetic, cardiac, autoimmune) | 1 week | Week 3–4 |
| 5 | AI video case studies with lip-sync | 2 weeks | Month 2 |
| 6 | Ambient sound design | 1–2 days | Month 2 |

---

## References

- [ElevenLabs API Docs](https://elevenlabs.io/docs/api-reference/introduction)
- [ElevenAgents Overview](https://elevenlabs.io/docs/eleven-agents/overview)
- [Text to Dialogue API](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert)
- [Scribe v2 Speech-to-Text](https://elevenlabs.io/docs/overview/models#scribe-v2)
- [Image & Video Capability](https://elevenlabs.io/docs/overview/capabilities/image-video)
- [ElevenLabs React SDK](https://elevenlabs.io/docs/agents-platform/libraries/react)

# ElevenLabs Advanced Integration for OVN Nexus

This document covers the two advanced ElevenLabs integrations added to OVN Nexus:
1. **Voice Agents** — Real-time conversational AI for clinical simulations
2. **Text to Dialogue** — Multi-speaker scenario audio generation

---

## 1. Voice Agents (ElevenAgents)

### Overview
Voice Agents enable students to have real-time spoken conversations with AI-powered patient or tutor simulations. Built on ElevenLabs' ElevenAgents platform, powered by WebRTC/WebSocket.

### Architecture
- STT (Scribe v2) → LLM (GPT-4o or custom) → TTS (Eleven v3, 5k+ voices)
- Proprietary turn-taking model handles natural conversation timing
- Knowledge base with RAG for domain-specific clinical content

### Environment Variables
```
ELEVENLABS_API_KEY=your-key
ELEVENLABS_AGENT_ID=your-agent-id
```

### Setup Steps
1. Go to https://elevenlabs.io/app/agents and create a new agent
2. Set the **System Prompt** to define the patient/tutor persona
3. Set the **First Message** (e.g., "Hi, I'm a 45-year-old presenting with jaw pain...")
4. Upload clinical **Knowledge Base** documents (PDFs, case studies)
5. Select voice (use Eryn or Peter voice IDs already configured)
6. Copy the **Agent ID** to your `.env.local`

### API Route
See `app/api/voice-agent/signed-url/route.ts` — generates authenticated signed URLs for secure client connections.

### React Component
See `components/VoiceAgent.tsx` — drop-in React component using `@elevenlabs/react` SDK.

### Usage in OVN Nexus
```tsx
import { VoiceAgent } from '@/components/VoiceAgent';

// In a simulation page:
<VoiceAgent
  agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID}
  patientName="Mr. Johnson"
  scenario="Periapical abscess, right mandibular molar"
/>
```

### SDK Installation
```bash
npm install @elevenlabs/react
```

---

## 2. Text to Dialogue

### Overview
Text to Dialogue uses the **Eleven v3 model** to generate expressive, multi-speaker audio from scripted clinical scenario text. Ideal for pre-recorded case presentations, podcast-style lectures, and audiobook-style case studies.

> Note: Text to Dialogue is for pre-generated audio, NOT real-time conversations. For real-time, use Voice Agents above.

### Environment Variables
```
ELEVENLABS_API_KEY=your-key
ELEVENLABS_TEXT_TO_DIALOGUE_MODEL=eleven_v3
ELEVENLABS_VOICE_ID_ERYN=WuBPEavIaQB56EnsGvFh
ELEVENLABS_VOICE_ID_PETER=EapdDtSsMC291mjfSNe7
```

### Audio Tags (Eleven v3)
The model supports emotional audio tags inserted directly into text:

```
[concerned] Doctor, I've had this pain for three weeks now.
[reassuring] That's completely understandable. Let's take a look.
[wincing] Ah— it hurts when you press there.
[calmly] I'll be gentle. Can you rate the pain from one to ten?
```

Supported tag types:
- **Emotions**: `[sad]`, `[laughing]`, `[whispering]`, `[concerned]`, `[relieved]`
- **Audio events**: `[door opening]`, `[equipment beeping]`, `[typing]`
- **Direction**: `[clinical]`, `[urgent]`, `[calm]`
- **Interruptions**: Use `—` for cut-off speech

### API Route
See `app/api/text-to-dialogue/route.ts` — accepts a dialogue script with speaker assignments and returns audio.

### Dialogue Format
```typescript
interface DialogueTurn {
  speaker: 'doctor' | 'patient' | 'narrator';
  voiceId: string; // ElevenLabs voice ID
  text: string;    // Text with optional [audio tags]
}

interface DialogueRequest {
  turns: DialogueTurn[];
  outputFormat?: 'mp3_44100_128' | 'mp3_22050_32' | 'pcm_44100';
}
```

### Supported Languages
Eight v3 supports 70+ languages including Spanish, Mandarin, French, Arabic, Hindi — enabling multilingual clinical content generation.

---

## OVN Nexus Use Cases

| Feature | Technology | Use Case |
|---------|-----------|----------|
| Patient Simulator | Voice Agent | Students interview AI patient in real-time |
| Clinical Tutor | Voice Agent | Voice Q&A on anatomy, procedures, protocols |
| Case Presentation Audio | Text to Dialogue | Auto-generate narrated case studies |
| Multilingual Content | Text to Dialogue | Same case in 70+ languages |
| Procedure Walkthrough | Text to Dialogue | Step-by-step voiced surgical guides |

---

## Files Added

```
ovn-nexus/
├── app/api/
│   ├── voice-agent/
│   │   └── signed-url/
│   │       └── route.ts          # Secure signed URL endpoint
│   └── text-to-dialogue/
│       └── route.ts              # Dialogue generation endpoint
└── components/
    └── VoiceAgent.tsx            # React Voice Agent component
```

## References
- [ElevenAgents Docs](https://elevenlabs.io/docs/eleven-agents/overview)
- [Text to Dialogue Docs](https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue)
- [React SDK Docs](https://elevenlabs.io/docs/eleven-agents/libraries/react)
- [ElevenLabs API Reference](https://elevenlabs.io/docs/api-reference/introduction)

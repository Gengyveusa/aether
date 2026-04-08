# LMS Integration & Deployment

> **Source:** `src/lms/`, `.github/workflows/`, `vite.config.ts`
> **LMS standards:** xAPI (Tin Can) + SCORM 1.2/2004
> **Deployment:** GitHub Pages (177+ deployments) | **PWA:** ServiceWorker offline support

---

## Overview

SedSim integrates with Learning Management Systems via dual xAPI/SCORM support and deploys as a static site to GitHub Pages with Progressive Web App capabilities for offline use. The LMS integration enables tracking of learner performance, completion, and competency assessment within institutional learning platforms.

---

## xAPI (Tin Can) Integration

### xAPI Statement Structure

```json
{
  "actor": {
    "mbox": "mailto:learner@institution.edu",
    "name": "Jane Smith"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "en-US": "completed" }
  },
  "object": {
    "id": "https://sedsim.gengyveusa.com/scenarios/routine-colonoscopy",
    "definition": {
      "name": { "en-US": "Routine Colonoscopy Sedation Simulation" },
      "type": "http://adlnet.gov/expapi/activities/simulation"
    }
  },
  "result": {
    "score": {
      "scaled": 0.82,
      "raw": 82,
      "min": 0,
      "max": 100
    },
    "success": true,
    "completion": true,
    "duration": "PT15M32S",
    "extensions": {
      "https://sedsim.gengyveusa.com/xapi/safety-score": 78,
      "https://sedsim.gengyveusa.com/xapi/sedation-score": 88,
      "https://sedsim.gengyveusa.com/xapi/decision-score": 80,
      "https://sedsim.gengyveusa.com/xapi/grade": "B",
      "https://sedsim.gengyveusa.com/xapi/lowest-spo2": 88,
      "https://sedsim.gengyveusa.com/xapi/apnea-count": 1,
      "https://sedsim.gengyveusa.com/xapi/bis-target-time-pct": 72
    }
  },
  "context": {
    "extensions": {
      "https://sedsim.gengyveusa.com/xapi/patient-archetype": "ASA-III-CHF",
      "https://sedsim.gengyveusa.com/xapi/scenario-id": "colonoscopy-asa3-chf",
      "https://sedsim.gengyveusa.com/xapi/difficulty": "advanced"
    }
  },
  "timestamp": "2026-03-26T14:30:00Z"
}
```

### xAPI Verb Registry

| Verb | When Emitted | Data Included |
|------|-------------|---------------|
| `initialized` | Simulation loaded | Patient, scenario, settings |
| `attempted` | Simulation started | Start time, scenario ID |
| `interacted` | Drug administered | Drug, dose, sim time, vitals at time |
| `progressed` | Scenario phase advanced | Phase name, objectives completed |
| `completed` | Simulation finished | All scores, grade, duration |
| `scored` | Debrief viewed | Detailed metric breakdown |
| `passed` / `failed` | Grade determined | Pass threshold: C (60) or above |

### xAPI Client Implementation

```
xapiClient.ts:
  1. Construct statement per xAPI 1.0.3 spec
  2. Queue statements in localStorage (offline resilience)
  3. Batch send to LRS endpoint (POST /statements)
  4. Retry on failure (3 attempts, exponential backoff)
  5. Auth: Basic auth or OAuth token per LRS config
```

---

## SCORM Integration

### SCORM 1.2 Support

| API Call | SedSim Mapping |
|----------|---------------|
| `LMSInitialize()` | Session start, patient + scenario loaded |
| `LMSSetValue("cmi.core.score.raw", score)` | Final score (0–100) |
| `LMSSetValue("cmi.core.lesson_status", status)` | "passed" / "failed" / "completed" |
| `LMSSetValue("cmi.core.session_time", time)` | Simulation duration (HH:MM:SS) |
| `LMSSetValue("cmi.suspend_data", data)` | JSON-encoded session state (for resume) |
| `LMSCommit()` | Flush data to LMS |
| `LMSFinish()` | Session end |

### SCORM 2004 Support

| API Call | SedSim Mapping |
|----------|---------------|
| `Initialize("")` | Session start |
| `SetValue("cmi.score.scaled", scaled)` | Score as 0.0–1.0 |
| `SetValue("cmi.success_status", status)` | "passed" / "failed" |
| `SetValue("cmi.completion_status", status)` | "completed" / "incomplete" |
| `SetValue("cmi.objectives.n.score.scaled", score)` | Per-objective scores (safety, sedation, decision) |
| `Commit("")` | Flush |
| `Terminate("")` | Session end |

### SCORM Wrapper

```
scormWrapper.ts:
  - Auto-detects SCORM 1.2 vs 2004 API on window
  - Provides unified interface: init(), setScore(), setStatus(), commit(), finish()
  - Falls back gracefully if no SCORM API found (standalone mode)
  - Handles bookmark/resume via suspend_data
```

---

## LMS Platform Support

| LMS Platform | xAPI | SCORM 1.2 | SCORM 2004 | Tested |
|-------------|------|-----------|------------|--------|
| **Canvas** | ✅ via LRS plugin | ✅ | ✅ | ✅ Verified |
| **Moodle** | ✅ via Logstore | ✅ | ✅ | ✅ Verified |
| **Blackboard** | ✅ via LRS | ✅ | ✅ | ✅ Verified |
| **Brightspace (D2L)** | ✅ | ✅ | ✅ | Untested |
| **Standalone** | ✅ to any LRS | N/A | N/A | ✅ Default |

---

## LMS Configuration Panel

```
┌──────────────────────────────────────────────┐
│  📚 LMS INTEGRATION SETTINGS                 │
├──────────────────────────────────────────────┤
│                                              │
│  Protocol:  ○ xAPI (Tin Can)  ● SCORM 2004  │
│                                              │
│  ── xAPI Settings ──                         │
│  LRS Endpoint: [https://lrs.institution.edu] │
│  Auth Key:     [••••••••••••]                │
│  Auth Secret:  [••••••••••••]                │
│                                              │
│  ── SCORM Settings ──                        │
│  Version:      ○ 1.2  ● 2004                │
│  Package:      [Download SCORM Package]      │
│                                              │
│  [Test Connection]  ✅ Connected              │
│  [Save Settings]                             │
│                                              │
│  ── Recent Statements ──                     │
│  ✅ completed  routine-colonoscopy  B (82)   │
│  ✅ interacted  propofol 100mg     14:22:05  │
│  ✅ initialized scenario loaded    14:20:00  │
│                                              │
└──────────────────────────────────────────────┘
```

---

## GitHub Pages Deployment

### Deployment Pipeline

```
.github/workflows/deploy.yml:

  trigger: push to main branch

  steps:
    1. Checkout code
    2. Install dependencies (npm ci)
    3. Run linter (eslint)
    4. Run tests (vitest)
       └── Includes PK/PD validation suite
    5. Build production (vite build)
       └── Output: dist/
    6. Deploy to GitHub Pages
       └── gh-pages branch
    7. Post-deploy smoke test
       └── Verify page loads + critical assets
```

### Build Configuration

```typescript
// vite.config.ts
export default defineConfig({
  base: '/sedsim/',        // GitHub Pages subpath
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'zustand'],
          engines: ['./src/engines/pkEngine', './src/engines/pdEngine'],
          audio: ['./src/audio/conductor', './src/audio/spo2Tone']
        }
      }
    }
  },
  plugins: [react(), VitePWA(pwaConfig)]
});
```

### Deployment Stats

| Metric | Value |
|--------|-------|
| Total deployments | 177+ |
| Average build time | ~45 seconds |
| Bundle size (gzip) | ~280 KB |
| Lighthouse score | 95+ (Performance) |
| First Contentful Paint | < 1.2s |

---

## PWA / Offline Support

### ServiceWorker Strategy

```
ServiceWorker (via VitePWA):
  - Precache: all JS/CSS/HTML + scenario JSONs + audio assets
  - Runtime cache: Claude API responses (network-first, fallback to cache)
  - Offline fallback: full simulation works offline (AI features disabled)
  - Update prompt: "New version available" banner on next visit

  Cache strategy:
    Static assets: CacheFirst (immutable hashes)
    API calls: NetworkFirst (Claude API, LRS)
    Scenarios: StaleWhileRevalidate (update in background)
```

### Offline Capabilities

| Feature | Offline | Notes |
|---------|---------|-------|
| Simulation engine | ✅ Full | All PK/PD/physiology runs locally |
| Monitor display | ✅ Full | Canvas rendering, all waveforms |
| Drug administration | ✅ Full | All drugs and interventions |
| Scenarios | ✅ Full | Precached JSON scenarios |
| AI Mentor (Millie) | ❌ Disabled | Requires Claude API |
| LMS reporting | ⏳ Queued | Statements cached, sent on reconnect |
| Audio (SpO2/alarms) | ✅ Full | Web Audio API is local |

---

## CI/CD Pipeline

```
CI Pipeline (GitHub Actions):
  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
  │ Lint   │───→│ Type   │───→│ Unit   │───→│ Valid- │───→│ Build  │
  │ ESLint │    │ Check  │    │ Tests  │    │ ation  │    │ Vite   │
  └────────┘    │ tsc    │    │ Vitest │    │ MDAPE  │    └───┬────┘
                └────────┘    └────────┘    └────────┘        │
                                                              ▼
                                                        ┌────────┐
                                                        │ Deploy │
                                                        │ GH Pgs │
                                                        └────────┘
```

---

## Related Files

- [[09_Scoring_Assessment_Debrief]] — Scores exported via xAPI/SCORM
- [[12_Validation_and_Clinical_Accuracy]] — Validation tests in CI
- [[14_Education_and_Tutorial_System]] — Education modules tracked via LMS
- [[15_Tech_Stack_and_Development_Guide]] — Build tooling and CI setup

---

#LMS #xAPI #SCORM #Canvas #Moodle #Blackboard #GitHub-Pages #PWA #ServiceWorker #CI-CD #deployment

# Member Hub & Platform Features

> **Source:** ovnnexus.com — authenticated routes, signup flow, homepage feature descriptions
> **Status:** Partially live, partially under development

---

## Platform Overview

OVN Nexus is a **Next.js server-side rendered application** serving as both a public educational resource and an authenticated research/community platform for dental professionals and oral-systemic researchers.

---

## Authentication System

### Signup (`/signup`)

| Field | Type | Notes |
|-------|------|-------|
| **Full Name** | Text input | Required |
| **Email** | Email input | Required; account identifier |
| **Password** | Password input | Required |
| **Role** | Dropdown select | Role-based access control |

#### Inferred Roles
The role dropdown likely includes (based on platform description and target audience):
- **Clinician** — Practicing dental professional
- **Researcher** — Academic/institutional researcher
- **Biotech** — Industry professional (biotech/pharma)
- **Student** — Graduate/post-graduate learner

### Login (`/login`)
- Email + password authentication
- Redirects to member dashboard upon success
- "Don't have an account? Sign up" link

### Role-Based Access Control (RBAC)
- Public routes (homepage, education, science) accessible to all
- Authenticated routes (showcase, music, community features) require login
- Role-specific content/features likely differentiated (exact permissions not publicly documented)

---

## Authenticated Features

### 1. Showcase (`/showcase`) — LIVE

**Status:** Live, auth-gated
**Access:** Requires login

#### Content
- **Presentation gallery:** Browse scientific presentations including the 40-slide OVN Axis deck
- **Multiple presentation templates:**

| Template | Description |
|----------|-------------|
| **Documentary** | Narrative, evidence-focused storytelling |
| **Cinematic Dark** | High-impact visual design with dark theme |
| **Modern Minimal** | Clean, clinical, minimal aesthetic |
| **Science Journal** | Academic publication format |
| **Impact Story** | Accessible storytelling for broader audiences |

#### Video Pipeline Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────┐
│  Slide Deck  │──→  │ GPT-4o Vision │──→  │ ElevenLabs  │──→  │ Supabase  │
│  (source)    │     │ (narration    │     │ (voice      │     │ (storage  │
│              │     │  script)      │     │  synthesis)  │     │  & CDN)   │
└─────────────┘     └──────────────┘     └────────────┘     └──────────┘
                                               │
                                         ┌─────┴─────┐
                                         │   Music    │
                                         │ Synthesis  │
                                         │ (background│
                                         │   audio)   │
                                         └───────────┘
```

#### UX Features
- Narrator profile selection (multiple voice options)
- Teaching-style selectors (adjust presentation tone/approach)
- Video playback with synchronized slides

---

### 2. Music Studio (`/music`) — LIVE

**Status:** Live, auth-gated
**Access:** Requires login

#### Description
An integrated audio generation environment for creating educational content accompaniment. Specific features are auth-gated, but the architecture includes:

- **AI-generated background music** for presentations
- **Narrator voice synthesis** (ElevenLabs integration)
- **Style/mood selection** for audio output
- **Integration with showcase** for combined video+audio delivery

#### Technical Stack
- Audio generation: AI-powered music synthesis
- Voice: ElevenLabs API
- Storage: Supabase
- Playback: Web-based audio player

---

### 3. Member Dashboard — INFERRED

**Status:** Inferred from platform architecture (not directly observed)
**Evidence:** Role-based signup, authenticated routes, community features suggest a central dashboard

#### Likely Features
- Module progress tracking (education series completion)
- Contribution history (case discussions, biomarker data)
- Account settings and role management
- Navigation hub to all authenticated features
- Notification center for community activity

---

### 4. Community Hub — PARTIAL

**Status:** Partially live (education modules); other features coming soon
**Details:** See [[13_Community_Research_Portal]] for full breakdown

#### Components

| Feature | Status | Description |
|---------|--------|-------------|
| **Education Modules** | ✅ Live | 11 modules, 4 series, 54 pages — public access |
| **Case Discussions** | 🔜 Coming Soon | Share/discuss cases at periodontal-systemic intersection |
| **Biomarker Tracking** | 🔜 Coming Soon | De-identified aggregated data collection/access |

---

## Technical Architecture

### Frontend
- **Framework:** Next.js (React-based SSR/SSG)
- **Styling:** CSS modules (2dd7408f75665f38.css)
- **Build system:** Next.js automatic code splitting (chunks)

### Backend / Infrastructure (Inferred)
- **Authentication:** Custom email/password with role-based access
- **Database:** Supabase (confirmed for media storage; likely for user data)
- **AI Services:**
  - GPT-4o Vision — narration script generation from slides
  - ElevenLabs — voice synthesis
  - Music synthesis — AI-generated background audio
- **CDN/Storage:** Supabase storage for generated media assets

### Data Architecture

```
┌─────────────────────────────────────────┐
│              SUPABASE                    │
│                                         │
│  ┌─────────┐  ┌──────────┐  ┌────────┐ │
│  │  Users   │  │  Content  │  │ Media  │ │
│  │  & Roles │  │  & Modules│  │ Assets │ │
│  └─────────┘  └──────────┘  └────────┘ │
│                                         │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  Biomarker    │  │  Case Discussion │  │
│  │  Data (future)│  │  Data (future)   │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Platform Roadmap (Inferred)

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1** | Public content (homepage, education, science), auth system, basic signup | ✅ Complete |
| **Phase 2** | Showcase gallery, video pipeline, music studio | ✅ Live (auth-gated) |
| **Phase 3** | Case discussions, community interaction | 🔜 Coming Soon |
| **Phase 4** | Biomarker tracking dashboard, de-identified data aggregation | 🔜 Coming Soon |
| **Phase 5** | Research portal, data export, institutional partnerships | 📋 Planned (inferred) |

---

## Related Files

- [[00_Index_and_Navigation]] — Full site map and route structure
- [[13_Community_Research_Portal]] — Detailed community/research features
- [[11_Research_Presentation]] — Content delivered through showcase
- [[06_Education_Series_Overview]] — Education content accessible through hub

---

#member-hub #platform #authentication #showcase #music-studio #video-pipeline #supabase

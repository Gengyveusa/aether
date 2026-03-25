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

### 3. Dashboard — Research Backend (`/dashboard/*`) — LIVE

**Status:** Live, auth-gated
**Access:** Requires login — role-based visibility likely restricts advanced features to Researcher/Admin roles

The dashboard is the **operational backend** of the OVN research platform. It is not a simple profile page — it is a full-featured research workstation with AI/ML capabilities, knowledge graph exploration, and administrative tooling.

#### Full Research Portal Sidebar

```
/dashboard               ← Landing: 8 metric cards, 4 charts, activity feed
├── /clinics             ← Clinics Registry (multi-site management)
├── /patients            ← Patients Registry (de-identified cohort)
├── /biomarkers          ← Biomarkers (6 markers, samples, disease associations)
├── /experiments         ← Experiments Registry (studies + model systems)
├── /datasets            ← Datasets (Microbiome 16S, RNA-Seq, Proteomics, EV Cargo)
├── /papers              ← Papers Registry (literature + DOIs)
├── /trials              ← Trials Registry (clinical trials by phase/status)
├── /dashboard/ml        ← AI & Machine Learning Lab
├── /dashboard/lab       ← Knowledge Graph Explorer
└── /admin/keys          ← Research Access Key Management (admin only)
```

Full data registry schemas: [[15_Research_Portal_Backend]]

---

#### 3a. AI & Machine Learning Lab (`/dashboard/ml`) — LIVE

**Status:** Live, auth-gated
**Purpose:** Predictive analytics engine for oral-systemic disease risk stratification, clinical trial matching, and model lifecycle management

##### Risk Prediction Engine

The core feature of the ML Lab — a multi-disease risk prediction system that integrates periodontal clinical data with systemic biomarkers to generate composite risk scores.

**Input Feature Set:**

| Category | Features | Data Type |
|----------|----------|-----------|
| **Periodontal staging** | Stage I–IV, Grade A–C (2017 AAP/EFP classification) | Categorical |
| **Inflammatory biomarkers** | IL-6 (interleukin-6), TNF-α (tumor necrosis factor alpha), hsCRP (high-sensitivity C-reactive protein) | Continuous (pg/mL, mg/L) |
| **OMV-specific markers** | Circulating OMV load (experimental) | Continuous (emerging assay) |
| **Gingipain levels** | RgpA, RgpB, Kgp activity/concentration | Continuous (experimental) |

**Risk Prediction Targets:**

| Target | Relevance | OVN Axis Connection |
|--------|-----------|-------------------|
| **Cardiovascular risk** | ASCVD event probability | Periodontitis → endothelial dysfunction → vascular calcification ([[04_Five_Step_Cascade]] Steps 1–5) |
| **Neurodegeneration risk** | Alzheimer's/dementia trajectory | OMVs → neuroinflammation → microglial activation ([[03_OMV_Biology]]) |
| **Metabolic risk** | Insulin resistance / metabolic syndrome | Bidirectional inflammation loop ([[07_Series1_Diabetes_Oral_Health]]) |

**Model Architecture (Inferred):**

```
┌─────────────────────────────────────────────────────┐
│                 RISK PREDICTION ENGINE               │
│                                                     │
│  ┌──────────────┐    ┌──────────────┐              │
│  │ Clinical Data │    │  Biomarker    │              │
│  │ (perio stage, │    │  Data (IL-6,  │              │
│  │  grade, BOP)  │    │  TNF-α, hsCRP,│              │
│  └──────┬───────┘    │  OMV, gingipain│              │
│         │            └──────┬───────┘              │
│         └────────┬─────────┘                       │
│                  ▼                                  │
│         ┌────────────────┐                         │
│         │  Feature Engine │                         │
│         │  (normalization,│                         │
│         │   encoding,     │                         │
│         │   interaction   │                         │
│         │   terms)        │                         │
│         └───────┬────────┘                         │
│                 ▼                                   │
│    ┌────────────┼────────────┐                     │
│    ▼            ▼            ▼                     │
│ ┌──────┐  ┌──────────┐  ┌──────────┐             │
│ │ CVD   │  │ Neuro-   │  │ Metabolic │             │
│ │ Risk  │  │ degen    │  │ Risk      │             │
│ │ Score │  │ Risk     │  │ Score     │             │
│ └──────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────┘
```

**Clinical Significance:**
- Bridges the gap between Tier 1 biomarkers (hsCRP, IL-6) and Tier 3 experimental markers (OMVs, gingipains)
- Enables **risk stratification** — identify which periodontal patients warrant systemic co-management
- Supports the OVN Axis "measurement-first" strategy: quantify risk before claiming disease modification
- Integrates with [[09_Series3_Information_Collapse]] Module 50 (Clinical Biomarkers) for biomarker interpretation

##### Trial Matching Tab

**Purpose:** Connect platform members (researchers, clinicians, patients) with relevant clinical trials investigating oral-systemic connections.

**Anticipated Features:**

| Feature | Description |
|---------|-------------|
| **Trial database** | Curated registry of active oral-systemic clinical trials |
| **Eligibility matching** | Match patient profiles to trial inclusion/exclusion criteria |
| **Geographic filtering** | Filter trials by location/site |
| **Status tracking** | Recruiting, active, completed, results available |
| **Direct enrollment links** | Connect to ClinicalTrials.gov or sponsor portals |

**Research Value:**
- Accelerates enrollment for oral-systemic intervention studies
- Addresses critical research gap: prospective human causality data ([[02_Evidence_Tiers]] Tier 3 → Tier 1 promotion)
- Connects the OVN research community with formal clinical research infrastructure

##### Model Registry Tab

**Purpose:** Version control and lifecycle management for all ML models deployed on the platform.

**Anticipated Features:**

| Feature | Description |
|---------|-------------|
| **Model catalog** | All trained models with metadata (algorithm, training data, performance metrics) |
| **Version history** | Track model iterations as new training data arrives |
| **Performance metrics** | AUC-ROC, calibration curves, sensitivity/specificity per risk target |
| **Deployment status** | Development → Staging → Production pipeline |
| **Audit trail** | Who trained, validated, and approved each model version |
| **Data lineage** | Which datasets were used for training/validation |

**Technical Stack (Inferred):**

| Component | Technology |
|-----------|-----------|
| Model training | Python ML stack (scikit-learn, XGBoost, or PyTorch) |
| Model serving | API endpoint behind auth |
| Model registry | MLflow-style or custom Supabase-backed registry |
| Feature store | Biomarker + clinical data aggregation layer |
| Monitoring | Drift detection, performance degradation alerts |

---

#### 3b. Knowledge Graph Explorer (`/dashboard/lab`) — LIVE

**Status:** Live, auth-gated
**Purpose:** Interactive visualization and exploration of the OVN Axis knowledge graph — entity relationships, evidence networks, and research landscape mapping

##### Core Interface

The Knowledge Graph Explorer provides a **graph database frontend** for navigating the relationships between biological entities, diseases, biomarkers, interventions, and research findings in the oral-systemic domain.

##### Graph Metrics Dashboard

| Metric | Description | Purpose |
|--------|-------------|---------|
| **Total Edges** | Count of all relationships in the graph | Graph scale indicator |
| **Entity Types** | Count of distinct node categories | Ontology breadth |
| **Relationship Types** | Count of distinct edge categories | Semantic richness |

##### Entity Types (Anticipated)

| Entity Type | Examples | Role in OVN Axis |
|-------------|----------|-----------------|
| **Pathogen** | *P. gingivalis*, *F. nucleatum*, *T. denticola* | Source organisms for OMVs and virulence factors |
| **Virulence Factor** | Gingipains (RgpA, RgpB, Kgp), LPS, PPAD, fimbriae | OMV cargo components ([[03_OMV_Biology]]) |
| **Biomarker** | hsCRP, IL-6, TNF-α, OMV load | Measurable signals ([[09_Series3_Information_Collapse]] Module 50) |
| **Disease** | ASCVD, Alzheimer's, periodontitis, metabolic syndrome | Endpoint conditions |
| **Pathway** | TLR4 signaling, Drp1-dependent fission, complement cascade | Mechanistic routes ([[04_Five_Step_Cascade]]) |
| **Intervention** | SRP, gingipain inhibitors, periodontal surgery | Treatment modalities |
| **Cell Type** | Endothelial, VSMC, microglia, macrophage, epithelial | Target cells for OMV interaction |
| **Publication** | Research papers, meta-analyses, clinical trials | Evidence base |
| **Gene/Protein** | ICAM-1, VCAM-1, E-selectin, E-cadherin | Molecular targets |

##### Relationship Types (Anticipated)

| Relationship | Example | Semantic |
|-------------|---------|----------|
| **PRODUCES** | *P. gingivalis* → OMVs | Pathogen → vesicle |
| **CARRIES** | OMV → Gingipain | Vesicle → cargo |
| **ACTIVATES** | LPS → TLR4 | Ligand → receptor |
| **DISRUPTS** | Gingipain → E-cadherin | Protease → substrate |
| **ASSOCIATED_WITH** | Periodontitis → ASCVD | Disease → disease (Tier 1) |
| **CAUSES** (hypothesized) | OMV → mitochondrial dysfunction | Effector → mechanism (Tier 2–3) |
| **TREATS** | SRP → periodontitis | Intervention → disease |
| **MEASURES** | hsCRP → systemic inflammation | Biomarker → condition |
| **PUBLISHED_IN** | Finding → Journal | Evidence → source |

##### Filter Interface

| Filter | Options | Purpose |
|--------|---------|---------|
| **Source Type** | Filter edges by source entity type (e.g., show only Pathogen → * edges) | Focus exploration on specific entity categories |
| **Target Type** | Filter edges by target entity type (e.g., show only * → Disease edges) | Narrow to specific outcome categories |
| **Relationship Type** | Filter by edge semantics (e.g., only PRODUCES, ACTIVATES) | Explore specific interaction types |
| **Evidence Tier** | Filter by Tier 1/2/3 | Separate established from hypothetical connections |

##### Visualization

```
┌────────────────────────────────────────────────────────┐
│                KNOWLEDGE GRAPH EXPLORER                 │
│                                                        │
│     [Source Type ▼]  [Target Type ▼]  [Rel Type ▼]     │
│                                                        │
│            P. gingivalis                               │
│            ┌───┴───┐                                   │
│       PRODUCES   ASSOCIATED_WITH                       │
│            │         │                                 │
│          OMVs     Periodontitis                        │
│       ┌───┴───┐      │                                │
│    CARRIES  CROSSES  ASSOCIATED_WITH                   │
│       │      │         │                               │
│   Gingipains Endothelial  ASCVD                       │
│       │      barrier    Alzheimer's                    │
│    DISRUPTS    │       Metabolic syn.                  │
│       │     ACTIVATES                                  │
│   E-cadherin  │                                       │
│            Monocyte                                    │
│            adhesion                                    │
│                                                        │
│  Nodes: ███  Edges: ███  Types: ███                    │
└────────────────────────────────────────────────────────┘
```

##### Research Applications
- **Hypothesis generation:** Discover unexpected entity connections
- **Evidence mapping:** Visualize which claims are Tier 1 vs Tier 3
- **Literature navigation:** Trace claims back to source publications
- **Pathway exploration:** Follow mechanistic chains from pathogen → endpoint
- **Gap identification:** Find entities with few connections → research opportunities
- **Education support:** Interactive companion to [[06_Education_Series_Overview]] modules

---

#### 3c. Research Access Key Management (`/admin/keys`) — LIVE (Admin Only)

**Status:** Live, admin-gated (higher privilege than standard auth)
**Purpose:** Administrative interface for managing programmatic access to the OVN Nexus research platform and its data APIs

##### Key Generation

| Method | Description | Use Case |
|--------|-------------|----------|
| **UUID generation** | Auto-generate unique access key (UUID v4 format) | Standard researcher onboarding |
| **Custom key** | Admin-defined key string | Institutional partnerships, named integrations |

##### Access Grant by Email

| Feature | Description |
|---------|-------------|
| **Email-based provisioning** | Grant research API access by entering a user's email address |
| **Role binding** | Key inherits permissions from user's role (Clinician/Researcher/Biotech/Admin) |
| **Immediate activation** | Key is active upon generation — no approval queue (admin decision = approval) |

##### All Access Keys Table

| Column | Description |
|--------|-------------|
| **Key ID** | UUID or custom identifier |
| **User email** | Associated account |
| **Role** | User's platform role |
| **Created** | Timestamp of key generation |
| **Last used** | Most recent API call with this key |
| **Status** | Active / Revoked / Expired |
| **Permissions** | Scoped access level (read-only, read-write, admin) |

##### Administrative Controls (Inferred)

| Action | Description |
|--------|-------------|
| **Generate** | Create new UUID or custom key |
| **Grant** | Associate key with user email |
| **Revoke** | Deactivate a key immediately |
| **Audit** | View usage history per key |
| **Bulk operations** | Generate/revoke multiple keys for institutional onboarding |

##### Security Architecture

```
┌─────────────────────────────────────────────┐
│           ACCESS KEY LIFECYCLE               │
│                                             │
│  Admin generates key (UUID or custom)        │
│         │                                   │
│         ▼                                   │
│  Associates with user email + role           │
│         │                                   │
│         ▼                                   │
│  Key stored in Supabase (hashed)            │
│         │                                   │
│         ▼                                   │
│  User includes key in API requests           │
│  (Authorization header)                      │
│         │                                   │
│         ▼                                   │
│  API gateway validates key → checks role     │
│  → enforces scope → logs usage              │
│         │                                   │
│  Admin can revoke at any time               │
└─────────────────────────────────────────────┘
```

##### API Access Scope (Inferred)

| Scope | Endpoints | Who Gets This |
|-------|-----------|---------------|
| **Read — Education** | Education modules, public content | All authenticated users |
| **Read — Research** | Knowledge graph queries, aggregated biomarker data | Researchers, Biotech |
| **Read — ML** | Risk prediction scores, model metadata | Researchers |
| **Write — Data** | Submit biomarker data, case contributions | Clinicians, Researchers |
| **Admin** | Key management, user management, model registry | Admins only |

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

### Backend / Infrastructure
- **Authentication:** Custom email/password with role-based access + API key auth for programmatic access
- **Database:** Supabase (confirmed for media storage, user data, access keys, knowledge graph)
- **AI Services:**
  - GPT-4o Vision — narration script generation from slides
  - ElevenLabs — voice synthesis
  - Music synthesis — AI-generated background audio
  - ML Risk Prediction Engine — cardiovascular/neurodegeneration/metabolic risk scoring
- **Knowledge Graph:** Graph database or Supabase-backed entity-relationship store with typed edges
- **CDN/Storage:** Supabase storage for generated media assets
- **API Layer:** Key-authenticated REST API for programmatic research access

### Data Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        SUPABASE                           │
│                                                          │
│  ┌──────────┐  ┌───────────┐  ┌─────────┐  ┌─────────┐ │
│  │  Users    │  │  Content   │  │  Media   │  │  Access  │ │
│  │  & Roles  │  │  & Modules │  │  Assets  │  │  Keys    │ │
│  └──────────┘  └───────────┘  └─────────┘  └─────────┘ │
│                                                          │
│  ┌──────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Biomarker    │  │  Case Discussion │  │  Knowledge   │ │
│  │  Data         │  │  Data            │  │  Graph       │ │
│  └──────────────┘  └─────────────────┘  │  (Entities,  │ │
│                                          │   Edges,     │ │
│  ┌──────────────┐  ┌─────────────────┐  │   Types)     │ │
│  │  ML Model     │  │  Risk Prediction │  └─────────────┘ │
│  │  Registry     │  │  Scores & Logs   │                  │
│  └──────────────┘  └─────────────────┘                  │
└──────────────────────────────────────────────────────────┘
```

### Full Route Architecture

```
PUBLIC ROUTES
├── /                    Homepage
├── /education           Professional Education (11 modules)
├── /science             Research Presentation
├── /signup              Account Creation
└── /login               Authentication

AUTH-GATED ROUTES (Member Hub)
├── /showcase            Presentation Gallery + Video Pipeline
├── /music               Music Studio + Audio Generation
├── /community           Community Hub (partial)
│
RESEARCH PORTAL (Auth + Access Key)
├── /dashboard           Landing: 8 metrics, 4 charts, activity feed
├── /clinics             Clinics Registry (sites)
├── /patients            Patients Registry (cohort)
├── /biomarkers          Biomarkers (6 markers, samples, associations)
├── /experiments         Experiments Registry (studies)
├── /datasets            Datasets (16S, RNA-Seq, Proteomics, EV Cargo)
├── /papers              Papers Registry (literature)
├── /trials              Trials Registry (clinical trials)
├── /dashboard/ml        AI & ML Lab
│   ├── Risk Prediction Engine
│   ├── Trial Matching Tab
│   └── Model Registry Tab
└── /dashboard/lab       Knowledge Graph Explorer
    ├── Entity Relationship Visualization
    ├── Source/Target Type Filters
    └── Graph Metrics (Edges, Entity Types, Relationship Types)

ADMIN ROUTES (Elevated Privilege)
└── /admin
    └── /admin/keys      Research Access Key Management
        ├── UUID / Custom Key Generation
        ├── Email-Based Access Grants
        └── All Access Keys Table
```

---

## Platform Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1** | Public content (homepage, education, science), auth system, basic signup | ✅ Complete |
| **Phase 2** | Showcase gallery, video pipeline, music studio | ✅ Live (auth-gated) |
| **Phase 3** | AI & ML Lab (risk prediction, trial matching, model registry) | ✅ Live (auth-gated) |
| **Phase 4** | Knowledge Graph Explorer (entity relationships, filtering, metrics) | ✅ Live (auth-gated) |
| **Phase 5** | Admin tooling (research access keys, API provisioning) | ✅ Live (admin-gated) |
| **Phase 6** | Case discussions, community interaction | 🔜 Coming Soon |
| **Phase 7** | Biomarker tracking dashboard, de-identified data aggregation | 🔜 Coming Soon |
| **Phase 8** | Institutional partnerships, data export, federated research | 📋 Planned |

---

## Access Control Matrix

| Route | Public | Clinician | Researcher | Biotech | Admin |
|-------|--------|-----------|------------|---------|-------|
| `/`, `/education`, `/science` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/showcase`, `/music` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/ml` (view) | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/dashboard/ml` (train/deploy) | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/dashboard/lab` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/admin/keys` | ❌ | ❌ | ❌ | ❌ | ✅ |
| API (read) | ❌ | 🔑 | 🔑 | 🔑 | 🔑 |
| API (write) | ❌ | 🔑 | 🔑 | ❌ | 🔑 |

🔑 = Requires research access key (provisioned via `/admin/keys`)

---

## Related Files

- [[00_Index_and_Navigation]] — Full site map and route structure
- [[13_Community_Research_Portal]] — Detailed community/research features
- [[11_Research_Presentation]] — Content delivered through showcase
- [[06_Education_Series_Overview]] — Education content accessible through hub
- [[03_OMV_Biology]] — OMV/gingipain data that feeds the ML risk engine
- [[04_Five_Step_Cascade]] — Cascade model underlying risk prediction targets
- [[02_Evidence_Tiers]] — Tier system used in knowledge graph edge classification
- [[15_Research_Portal_Backend]] — Full research portal data registries (Clinics, Patients, Biomarkers, Experiments, Datasets, Papers, Trials)

---

#member-hub #platform #authentication #showcase #music-studio #video-pipeline #supabase #ml-lab #knowledge-graph #admin #access-keys #risk-prediction #research-portal

# Research Portal — Data Management Backend

> **Source:** ovnnexus.com — authenticated research portal (access-key gated)
> **Status:** Live | **Access:** Requires login + Research Access Key
> **Sidebar nav:** Dashboard, Clinics, Patients, Biomarkers, Experiments, Datasets, Papers, Trials, ML Models, Lab, Access Keys

---

## Portal Access Model

The Research Portal is **two-tier authenticated**:
1. **Login** (email + password) → grants access to `/dashboard` landing, education modules, showcase, music studio
2. **Research Access Key** → unlocks the full Research Portal sidebar (Clinics, Patients, Biomarkers, Experiments, Datasets, Papers, Trials)

```
Login (email/password)
    │
    ▼
/dashboard landing
├── 3 education module cards
├── Community "Coming Soon" notice
└── "Unlock Research Portal" ← ACCESS KEY INPUT FIELD
         │
         ▼ (valid key)
Full Research Portal Sidebar unlocked:
├── Dashboard (metrics + charts)
├── Clinics
├── Patients
├── Biomarkers
├── Experiments
├── Datasets
├── Papers
├── Trials
├── ML Models (/dashboard/ml)
├── Lab (/dashboard/lab)
└── Access Keys (/admin/keys — admin only)
```

Research access keys are provisioned by admins at `/admin/keys` — see [[12_Member_Hub_Platform]] Section 3c.

---

## Dashboard Landing (`/dashboard`) — LIVE

### Before Key Unlock

| Component | Description |
|-----------|-------------|
| **"Unlock Research Portal"** | Access key input field — gateway to full portal |
| **3 Education Module Cards** | Quick-access to education content (links to [[06_Education_Series_Overview]]) |
| **Community "Coming Soon"** | Placeholder notice for upcoming community features |

### After Key Unlock — Full Dashboard

#### 8 Metric Cards

| Metric | Description | Purpose |
|--------|-------------|---------|
| **Clinics** | Count of registered research clinics | Network scale |
| **Patients** | Count of enrolled patients | Study population size |
| **Samples** | Count of biological samples collected | Biospecimen inventory |
| **Experiments** | Count of active/completed experiments | Research activity |
| **Datasets** | Count of uploaded datasets | Data asset inventory |
| **Papers** | Count of tracked publications | Literature coverage |
| **Trials** | Count of clinical trials tracked | Trial pipeline |
| **Users** | Count of platform users (displayed as = 10) | Community size |

#### 4 Dashboard Charts

##### 1. Biomarker Trends (Line Chart)
- **Type:** Time-series line chart
- **Purpose:** Visualize longitudinal biomarker changes across the study population
- **Axes:** X = time, Y = biomarker values
- **Biomarkers tracked:** OMV Concentration, Gingipain Activity, IL-6, TNF-α, hsCRP, Nitric Oxide
- **Clinical value:** Track aggregate response to periodontal intervention over time
- **Connects to:** [[09_Series3_Information_Collapse]] Module 50 (Clinical Biomarkers)

##### 2. Periodontal Severity Distribution (Bar Chart)
- **Type:** Bar chart / histogram
- **Purpose:** Distribution of periodontal disease severity across enrolled patients
- **Categories:** Likely AAP/EFP staging (Stage I–IV) and grading (Grade A–C)
- **Clinical value:** Understand the severity profile of the study population
- **Connects to:** Risk Prediction Engine inputs ([[12_Member_Hub_Platform]] Section 3a)

##### 3. Disease Risk Profile (Radar Chart)
- **Type:** Radar/spider chart with 5 axes
- **Axes:**
  - **Cardiovascular** — ASCVD risk signals
  - **Neurological** — Neurodegeneration risk signals
  - **Metabolic** — Insulin resistance / metabolic syndrome signals
  - **Immune** — Systemic immune dysregulation signals
  - **Respiratory** — Pulmonary/respiratory risk signals
- **Purpose:** Multi-dimensional risk visualization per patient or aggregate
- **Clinical value:** Identifies which systemic domains are most at risk for a given periodontal profile
- **Connects to:** [[04_Five_Step_Cascade]] Step 5 (tissue-level endpoints), Risk Prediction Engine

```
                    Cardiovascular
                         ▲
                        / \
                       /   \
              Respiratory     Neurological
                     \       /
                      \     /
                       \   /
                Immune ──+── Metabolic
```

##### 4. Recent Activity Feed
- **Type:** Activity log / timeline
- **Content:** 5 most recent demo entries (platform events)
- **Purpose:** Real-time awareness of research portal activity
- **Events likely include:** New patient enrollment, sample collection, dataset upload, experiment status change, paper addition

---

## Clinics Registry (`/clinics`) — LIVE

**Purpose:** Multi-site clinic management for distributed oral-systemic research

### Data Table

| Column | Description | Data Type |
|--------|-------------|-----------|
| **Code** | Unique clinic identifier (e.g., CLINIC-001) | String (auto-generated) |
| **Name** | Clinic display name | String |
| **Institution** | Parent institution (university, hospital, VA) | String |
| **Country** | Geographic location | String |
| **Patients** | Count of enrolled patients at this clinic | Integer |
| **Samples** | Count of biological samples collected at this clinic | Integer |
| **Status** | Operational status (Active / Inactive / Pending) | Enum |

### Actions
- **+ Add Clinic** button — register a new research site

### Data Model

```
CLINIC
├── code (PK)
├── name
├── institution
├── country
├── status
│
├── patients[] ──→ PATIENT registry
└── samples[]  ──→ BIOMARKER sample tracking
```

### Research Context
Multi-site design enables:
- **Geographic diversity** in study populations
- **Institutional collaboration** (UCSF, SFVAMC, partner sites)
- **Standardized data collection** across sites via common schema
- **Regulatory compliance** — site-level tracking for IRB/ethics

---

## Patients Registry (`/patients`) — LIVE

**Purpose:** De-identified patient enrollment and demographic tracking for oral-systemic research

### Data Table

| Column | Description | Data Type | Clinical Relevance |
|--------|-------------|-----------|-------------------|
| **Code** | De-identified patient ID (e.g., PT-001) | String | HIPAA-compliant identifier |
| **Clinic** | Enrolling clinic (FK → Clinics) | String | Site attribution |
| **Age** | Patient age | Integer | Age-stratified risk analysis |
| **Sex** | Biological sex | Enum (M/F) | Sex-stratified analysis |
| **Smoking Status** | Current/Former/Never | Enum | Major periodontal risk cofactor |
| **Diabetes Status** | Type 1/Type 2/None/Pre-diabetic | Enum | Metabolic comorbidity — [[07_Series1_Diabetes_Oral_Health]] |
| **Enrolled Date** | Date of study enrollment | Date | Cohort temporal tracking |
| **Status** | Active / Withdrawn / Completed | Enum | Study participation status |

### Actions
- **+ Add Patient** button — enroll new patient at a clinic

### Risk Factor Integration

```
PATIENT DEMOGRAPHICS              ML RISK ENGINE
──────────────────                ──────────────
Age ──────────────────────────→  Feature input
Sex ──────────────────────────→  Feature input
Smoking Status ───────────────→  Major cofactor (periodontitis severity modifier)
Diabetes Status ──────────────→  Metabolic risk axis (bidirectional oral-systemic)
                                      │
Clinic assignment ────────────→  Site-level covariate (geographic/institutional variation)
                                      │
                                      ▼
                              Risk Prediction Engine
                              (/dashboard/ml)
```

### Connection to OVN Axis
- **Smoking status** amplifies periodontal disease severity, OMV production, and vascular damage
- **Diabetes status** creates bidirectional metabolic-oral feedback loop ([[07_Series1_Diabetes_Oral_Health]])
- Both are critical **confounders** that must be captured for valid oral-systemic analysis

---

## Biomarkers Registry (`/biomarkers`) — LIVE

**Purpose:** Central biomarker tracking, sample management, and disease-association mapping

### 6 Tracked Biomarkers

| # | Biomarker | Category | What It Measures | Evidence Tier |
|---|-----------|----------|-----------------|---------------|
| 1 | **OMV Concentration** | Primary marker | Vesicle quantification — circulating P. gingivalis OMV load | Tier 3 (experimental) |
| 2 | **Gingipain Activity** | Primary marker | Protease activity — RgpA/RgpB/Kgp enzymatic levels | Tier 3 (experimental) |
| 3 | **IL-6** | Inflammatory marker | Interleukin-6 — pro-inflammatory cytokine | Tier 1 (validated) |
| 4 | **TNF-α** | Inflammatory marker | Tumor necrosis factor alpha — inflammatory mediator | Tier 1 (validated) |
| 5 | **hsCRP** | Inflammatory marker | High-sensitivity C-reactive protein — systemic inflammation | Tier 1 (validated) |
| 6 | **Nitric Oxide** | Metabolic marker | NO levels — endothelial function / vascular health | Tier 2 (emerging) |

#### Biomarker Hierarchy

```
PRIMARY MARKERS (OVN-specific, Tier 3)
├── OMV Concentration ← Direct measure of the proposed effector ([[03_OMV_Biology]])
└── Gingipain Activity ← Direct measure of virulence cargo

INFLAMMATORY MARKERS (Systemic, Tier 1)
├── IL-6 ← Pro-inflammatory cytokine (established oral-systemic link)
├── TNF-α ← Inflammatory mediator (periodontal + systemic)
└── hsCRP ← Gold-standard systemic inflammation marker

METABOLIC MARKER (Vascular, Tier 2)
└── Nitric Oxide ← Endothelial function indicator
    (↓ NO = endothelial dysfunction = Step 1 of cascade)
```

### 4 Biomarker-Disease Association Cards

Mapping biomarkers to systemic disease targets — these correspond to the radar chart axes on the dashboard:

| Card | Biomarkers Involved | Disease Target | OVN Axis Connection |
|------|-------------------|----------------|-------------------|
| **Cardiovascular** | hsCRP, IL-6, Nitric Oxide, OMV | ASCVD, endothelial dysfunction | [[04_Five_Step_Cascade]] Steps 1–2 |
| **Neurological** | TNF-α, IL-6, Gingipain Activity | Neurodegeneration, Alzheimer's | [[03_OMV_Biology]] — microglial activation |
| **Metabolic** | hsCRP, Nitric Oxide, TNF-α | Insulin resistance, metabolic syndrome | [[07_Series1_Diabetes_Oral_Health]] |
| **Immune/Inflammatory** | IL-6, TNF-α, OMV Concentration | Systemic immune dysregulation | [[09_Series3_Information_Collapse]] — information collapse |

### Sample Tracking Table

| Column | Description | Data Type |
|--------|-------------|-----------|
| **Sample ID** | Unique sample identifier | String (auto-generated) |
| **Patient** | Associated patient (FK → Patients) | String |
| **Biomarker** | Which of the 6 biomarkers was measured | Enum |
| **Value** | Measured value | Float |
| **Unit** | Measurement unit (pg/mL, mg/L, μM, nM, etc.) | String |
| **Collection Date** | When sample was collected | Date |
| **Status** | Collected / Processing / Analyzed / Flagged | Enum |

### Data Flow

```
Sample Collection (Clinic)
    │
    ▼
Sample Tracking Table (/biomarkers)
    │
    ├──→ Biomarker Trends chart (dashboard)
    ├──→ Disease Association Cards (pattern matching)
    ├──→ Risk Prediction Engine (/dashboard/ml) — feature input
    └──→ Knowledge Graph (/dashboard/lab) — edge weight evidence
```

---

## Experiments Registry (`/experiments`) — LIVE

**Purpose:** Track research experiments across the OVN research network

### Data Table

| Column | Description | Data Type |
|--------|-------------|-----------|
| **Code** | Unique experiment identifier (e.g., EXP-001) | String |
| **Title** | Experiment name/description | String |
| **PI** | Principal Investigator | String |
| **Project** | Parent project or research grant | String |
| **Model System** | Experimental model (in vitro, animal, human, computational) | Enum/String |
| **Status** | Planning / Active / Completed / Published | Enum |
| **Start Date** | Experiment initiation date | Date |

### Model Systems (Anticipated)

| Model System | Description | OVN Axis Relevance |
|-------------|-------------|-------------------|
| **In vitro** | Cell culture (endothelial, VSMC, epithelial, microglial) | [[04_Five_Step_Cascade]] Steps 2–3 mechanistic studies |
| **Animal** | Mouse/rabbit models of P. gingivalis infection | Cascade validation, endpoint testing |
| **Human** | Clinical samples, observational studies | Biomarker validation, risk correlation |
| **Computational** | ML models, bioinformatics, knowledge graph analysis | Risk prediction, hypothesis generation |

### Connection to Research Portal

```
EXPERIMENT
├── PI ──→ Platform user
├── Project ──→ Research grant/initiative
├── Model System ──→ Determines applicable evidence tier
├── generates ──→ DATASETS
├── uses ──→ SAMPLES (from Biomarkers registry)
├── results in ──→ PAPERS
└── may inform ──→ TRIALS
```

---

## Datasets Registry (`/datasets`) — LIVE

**Purpose:** Manage and catalog research datasets generated by the OVN research network

### 4 Data Categories

| Category | Description | Data Type | OVN Axis Connection |
|----------|-------------|-----------|-------------------|
| **Microbiome 16S** | 16S rRNA gene sequencing — bacterial community composition | Amplicon sequencing | Biofilm composition ([[10_Series4_Biofilm_Architecture]]) — which species dominate |
| **RNA-Seq** | Transcriptomic profiling — host gene expression | Bulk/single-cell RNA-seq | Host response to OMVs — phenotypic reprogramming signatures |
| **Proteomics** | Protein-level quantification — virulence factors, host proteins | Mass spectrometry | Gingipain activity, LPS variants, host protein citrullination |
| **EV Cargo** | Extracellular vesicle cargo profiling — OMV and host EV contents | Vesicle isolation + multi-omics | [[03_OMV_Biology]] — direct measurement of OMV molecular cargo |

### Dataset Table
- Table with dataset entries (columns not fully specified but likely include: Dataset ID, Category, Experiment, Size, Upload Date, Status)

### Data Integration

```
                    DATASETS
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Microbiome 16S   RNA-Seq      Proteomics
        │              │              │
        └──────────────┼──────────────┘
                       │
                  EV Cargo
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   Knowledge Graph   ML Models    Papers
   (/dashboard/lab)  (/dashboard/ml) (/papers)
```

### Multi-Omics Strategy
The four data categories represent a **multi-omics approach** to characterizing the oral-systemic interface:
1. **16S** identifies WHO is there (microbial community)
2. **RNA-Seq** identifies WHAT the host is doing (gene expression response)
3. **Proteomics** identifies HOW the interaction works (protein-level mechanisms)
4. **EV Cargo** identifies WHAT is being transmitted (vesicle contents)

Together, these four layers provide the data needed to validate or refute the [[04_Five_Step_Cascade]] at each step.

---

## Papers Registry (`/papers`) — LIVE

**Purpose:** Literature tracking and citation management for oral-systemic research publications

### Data Table

| Column | Description | Data Type |
|--------|-------------|-----------|
| **Title** | Publication title | String |
| **Authors** | Author list | String |
| **Journal** | Publication venue | String |
| **DOI** | Digital Object Identifier (persistent link) | String (DOI format) |
| **Published Date** | Publication date | Date |
| **Keywords** | Subject tags | String array |

### Integration Points

| Connection | How Papers Link |
|-----------|----------------|
| **Knowledge Graph** | Papers are source nodes for evidence claims — "PUBLISHED_IN" relationship type |
| **Evidence Tiers** | Each paper supports claims at Tier 1/2/3 — [[02_Evidence_Tiers]] |
| **Experiments** | Papers are the output of completed experiments |
| **Education Modules** | Papers provide the evidence base for module content |
| **Biomarker claims** | Papers validate or refute biomarker-disease associations |

### Literature Landscape
The papers registry likely covers:
- Meta-analyses on periodontitis-ASCVD association (Tier 1)
- OMV biology and preclinical studies (Tier 2)
- *P. gingivalis* in Alzheimer's, cancer, and metabolic disease (Tier 2–3)
- Biomarker validation studies
- Clinical intervention trials (periodontal therapy → systemic outcomes)

---

## Trials Registry (`/trials`) — LIVE

**Purpose:** Track clinical trials investigating oral-systemic disease connections

### Data Table

| Column | Description | Data Type |
|--------|-------------|-----------|
| **Code** | Trial identifier (e.g., NCT number or internal code) | String |
| **Title** | Trial name | String |
| **Phase** | Clinical trial phase (Phase I/II/III/IV or Observational) | Enum |
| **Status** | Recruiting / Active / Completed / Terminated / Results Available | Enum |
| **Sponsor** | Sponsoring organization (university, company, government) | String |
| **Enrollment** | Number of participants (target or actual) | Integer |
| **Start Date** | Trial initiation date | Date |

### Connection to Trial Matching

```
TRIALS REGISTRY (/trials)          TRIAL MATCHING TAB (/dashboard/ml)
──────────────────────            ─────────────────────────────────
Manual trial tracking              Automated patient ↔ trial matching
(curated registry)                 (ML-powered eligibility analysis)
        │                                    │
        └────────── Both feed ──────────────┘
                        │
                        ▼
              Accelerated enrollment for
              oral-systemic intervention studies
```

### Trial Types (Anticipated)

| Trial Type | Example | Evidence Goal |
|-----------|---------|---------------|
| **Interventional** | Periodontal therapy → ASCVD biomarker endpoints | Tier 2 → Tier 1 causality evidence |
| **Observational** | Longitudinal periodontitis → dementia incidence | Tier 1 association strengthening |
| **Biomarker validation** | OMV/gingipain assay performance in clinical cohorts | Tier 3 → Tier 2 biomarker promotion |
| **Device/diagnostic** | Point-of-care salivary biomarker testing | Clinical translation |

---

## Complete Research Portal Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                   OVN NEXUS RESEARCH PORTAL                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    DASHBOARD                             │ │
│  │  8 Metric Cards │ 4 Charts │ Activity Feed              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  DATA REGISTRIES (CRUD interfaces)                           │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────┐  │
│  │  Clinics  │ │ Patients │ │ Biomarkers │ │ Experiments │  │
│  │  (sites)  │ │ (cohort) │ │ (samples)  │ │ (studies)   │  │
│  └─────┬────┘ └────┬─────┘ └─────┬──────┘ └──────┬──────┘  │
│        │           │             │                │          │
│        └───────────┴──────┬──────┴────────────────┘          │
│                           │                                  │
│  ┌──────────┐ ┌──────────┐│┌──────────┐                     │
│  │ Datasets │ │  Papers  │││  Trials  │                     │
│  │ (omics)  │ │ (lit.)   │││ (clinical│                     │
│  └─────┬────┘ └────┬─────┘│└────┬─────┘                     │
│        │           │      │     │                            │
│        └───────────┴──────┼─────┘                            │
│                           │                                  │
│  AI/ANALYTICS LAYER       ▼                                  │
│  ┌──────────────────┐ ┌──────────────────┐                   │
│  │  ML Models        │ │  Knowledge Graph  │                   │
│  │  (/dashboard/ml)  │ │  (/dashboard/lab) │                   │
│  │  • Risk Prediction│ │  • Entity Explorer│                   │
│  │  • Trial Matching │ │  • Edge Filters   │                   │
│  │  • Model Registry │ │  • Graph Metrics  │                   │
│  └──────────────────┘ └──────────────────┘                   │
│                                                              │
│  ADMIN                                                       │
│  ┌──────────────────┐                                        │
│  │  Access Keys      │                                        │
│  │  (/admin/keys)    │                                        │
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Entity Relationship Model

```
CLINIC ──1:N──→ PATIENT ──1:N──→ SAMPLE (Biomarker)
                   │                    │
                   │                    ▼
                   │              BIOMARKER VALUE
                   │              (6 tracked markers)
                   │
                   └──→ participates in ──→ TRIAL
                                              │
EXPERIMENT ──generates──→ DATASET             │
    │                      │                  │
    │                      ▼                  │
    └──results in──→ PAPER ──cites──→ PAPER   │
                      │                       │
                      └───────────────────────┘
                              │
                    All feed into:
                    • Knowledge Graph (entities + edges)
                    • ML Models (training data)
                    • Risk Prediction (feature inputs)
```

---

## Related Files

- [[12_Member_Hub_Platform]] — Auth system, showcase, music, ML Lab, Knowledge Graph, Admin Keys
- [[00_Index_and_Navigation]] — Complete site map with all portal routes
- [[03_OMV_Biology]] — OMV/gingipain biology underlying primary biomarkers
- [[04_Five_Step_Cascade]] — Cascade model connecting biomarkers to disease endpoints
- [[07_Series1_Diabetes_Oral_Health]] — Diabetes as patient registry cofactor
- [[09_Series3_Information_Collapse]] — Module 50 biomarker framework
- [[10_Series4_Biofilm_Architecture]] — Biofilm ecology underlying 16S dataset category
- [[02_Evidence_Tiers]] — Tier classification for biomarker/paper evidence
- [[13_Community_Research_Portal]] — Community features that feed portal data

---

#research-portal #dashboard #clinics #patients #biomarkers #experiments #datasets #papers #trials #registries #multi-omics #CRUD

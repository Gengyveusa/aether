# OVN Nexus — Master Index & Site Map

> **Source:** [ovnnexus.com](https://ovnnexus.com) | **Last crawl:** 2026-03-25
> **Platform:** Next.js SSR application | **Build:** MISsPthXcP7tic9yXeHNQ

---

## Vault Map of Contents (MOC)

| # | File | Covers |
|---|------|--------|
| 00 | [[00_Index_and_Navigation]] | This file — master index, site map, nav structure |
| 01 | [[01_OVN_Axis_Framework]] | Core scientific framework: the Oral-Vascular-Neural Axis |
| 02 | [[02_Evidence_Tiers]] | Three-tier epistemic hierarchy for all claims |
| 03 | [[03_OMV_Biology]] | Outer Membrane Vesicle biology, cargo, translocation |
| 04 | [[04_Five_Step_Cascade]] | Proposed 5-step OMV-driven pathogenic cascade |
| 05 | [[05_Clinical_Action_Guidelines]] | "Do Now" vs "Do Not Claim" clinical framework |
| 06 | [[06_Education_Series_Overview]] | All 4 series, 11 modules, 54 pages — syllabus |
| 07 | [[07_Series1_Diabetes_Oral_Health]] | Module 45 — Diabetes, saliva, caries |
| 08 | [[08_Series2_Oral_Pathogens_Systemic]] | Modules 46–47 — Pathogens & systemic disease |
| 09 | [[09_Series3_Information_Collapse]] | Modules 48–51 — Information theory of dysbiosis |
| 10 | [[10_Series4_Biofilm_Architecture]] | Modules 52–55 — Biofilm as information system |
| 11 | [[11_Research_Presentation]] | Full /science presentation — all slides & claims |
| 12 | [[12_Member_Hub_Platform]] | Auth, signup, roles, showcase, music studio |
| 13 | [[13_Community_Research_Portal]] | Case discussions, biomarker tracking, member features |
| 14 | [[14_Legal_Disclaimers_Attribution]] | Disclaimers, author credentials, institutional info |
| 15 | [[15_Research_Portal_Backend]] | Full research portal: Dashboard, Clinics, Patients, Biomarkers, Experiments, Datasets, Papers, Trials |

---

## Complete Site Map

### Public Routes (No Auth Required)

| Route | Page | Content |
|-------|------|---------|
| `/` | **Homepage** | Hero, stats, evidence tiers, OMV explainer, cascade, clinical guidelines, community preview, about |
| `/education` | **Professional Education** | 11 modules across 4 series (Modules 45–55), 54 total pages |
| `/science` | **Research Presentation** | Full scientific presentation — evidence tiers, OMV biology, 5-step cascade, clinical implications |
| `/signup` | **Create Account** | Registration form: Full Name, Email, Password, Role (dropdown) |
| `/login` | **Sign In** | Email + Password authentication gateway |

### Authenticated Routes (Member Hub — Auth Required)

| Route | Page | Status | Content |
|-------|------|--------|---------|
| `/showcase` | **Showcase** | ✅ Live | Presentation gallery, slide decks, video pipeline output |
| `/music` | **Music Studio** | ✅ Live | Audio generation, narrator profiles, teaching-style selectors |
| `/dashboard/ml` | **AI & ML Lab** | ✅ Live | Risk Prediction Engine (CVD/neuro/metabolic), Trial Matching, Model Registry |
| `/dashboard/lab` | **Knowledge Graph Explorer** | ✅ Live | Entity relationships, Total Edges/Entity Types/Relationship Types, Source/Target filters |
| `/community` | **Community Hub** | Partial | Case discussions (coming soon), member contributions |

### Research Portal Routes (Auth + Access Key Required)

| Route | Page | Status | Content |
|-------|------|--------|---------|
| `/dashboard` | **Dashboard Landing** | ✅ Live | 8 metric cards, 4 charts (Biomarker Trends, Perio Severity, Risk Radar, Activity), "Unlock Research Portal" key input |
| `/clinics` | **Clinics Registry** | ✅ Live | Table: Code/Name/Institution/Country/Patients/Samples/Status, +Add Clinic |
| `/patients` | **Patients Registry** | ✅ Live | Table: Code/Clinic/Age/Sex/Smoking/Diabetes/Enrolled/Status, +Add Patient |
| `/biomarkers` | **Biomarkers Registry** | ✅ Live | 6 tracked biomarkers, 4 Disease Association cards, Sample tracking table |
| `/experiments` | **Experiments Registry** | ✅ Live | Table: Code/Title/PI/Project/Model System/Status/Start Date |
| `/datasets` | **Datasets Registry** | ✅ Live | 4 categories (Microbiome 16S, RNA-Seq, Proteomics, EV Cargo), dataset table |
| `/papers` | **Papers Registry** | ✅ Live | Table: Title/Authors/Journal/DOI/Published Date/Keywords |
| `/trials` | **Trials Registry** | ✅ Live | Table: Code/Title/Phase/Status/Sponsor/Enrollment/Start Date |

### Admin Routes (Elevated Privilege)

| Route | Page | Status | Content |
|-------|------|--------|---------|
| `/admin/keys` | **Research Access Keys** | ✅ Live | UUID/custom key generation, email-based access grants, All Access Keys table |

### Navigation Structure

```
Header Nav:
├── Education          → /education
├── Showcase           → /showcase (auth-gated)
├── Music Studio       → /music (auth-gated)
├── Community          → #community (anchor on homepage)
├── About              → #about (anchor on homepage)
└── [Sign In / Sign Up] → /login, /signup

Research Portal Sidebar (auth + access key):
├── Dashboard          → /dashboard (metrics, charts, activity)
├── Clinics            → /clinics (site registry)
├── Patients           → /patients (cohort registry)
├── Biomarkers         → /biomarkers (6 markers, samples, associations)
├── Experiments        → /experiments (study registry)
├── Datasets           → /datasets (16S, RNA-Seq, Proteomics, EV Cargo)
├── Papers             → /papers (literature registry)
├── Trials             → /trials (clinical trial registry)
├── ML Models          → /dashboard/ml
│   ├── Risk Prediction Engine
│   ├── Trial Matching
│   └── Model Registry
├── Lab                → /dashboard/lab
│   ├── Knowledge Graph Explorer
│   └── Source/Target Filters
└── Access Keys        → /admin/keys (admin only)

Footer Nav:
├── Explore the Science → /science
├── Sign In             → /login
└── Sign Up             → /signup
```

---

## Platform Architecture

- **Framework:** Next.js with server-side rendering
- **Auth:** Email/password with RBAC + API key auth for programmatic access
- **Roles:** Clinician, Researcher, Biotech, Student (signup dropdown) + Admin (elevated)
- **Content delivery:** Static public pages + auth-gated interactive features
- **Video pipeline:** Slides → GPT-4o Vision → ElevenLabs narration → music synthesis → Supabase storage
- **ML/AI:** Risk Prediction Engine (periodontal staging + biomarkers → CVD/neuro/metabolic risk scores)
- **Knowledge Graph:** Entity-relationship explorer with typed edges and filterable graph metrics
- **API layer:** Key-authenticated research API (keys provisioned at `/admin/keys`)
- **Data layer:** Supabase (user data, media, knowledge graph, ML model registry, access keys)

---

## Cross-Reference Tags

#ovn-nexus #site-map #navigation #architecture #MOC

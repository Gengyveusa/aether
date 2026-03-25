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
| `/showcase` | **Showcase** | Live | Presentation gallery, slide decks, video pipeline output |
| `/music` | **Music Studio** | Live | Audio generation, narrator profiles, teaching-style selectors |
| `/community` | **Community Hub** | Partial | Case discussions (coming soon), member contributions |
| `/biomarkers` | **Biomarker Tracking** | Coming Soon | De-identified aggregated data, periodontal therapy → systemic biomarker changes |
| Dashboard | **Member Dashboard** | Inferred | Role-based access, module progress, contribution tracking |

### Navigation Structure

```
Header Nav:
├── Education          → /education
├── Showcase           → /showcase (auth-gated)
├── Music Studio       → /music (auth-gated)
├── Community          → #community (anchor on homepage)
├── About              → #about (anchor on homepage)
└── [Sign In / Sign Up] → /login, /signup

Footer Nav:
├── Explore the Science → /science
├── Sign In             → /login
└── Sign Up             → /signup
```

---

## Platform Architecture

- **Framework:** Next.js with server-side rendering
- **Auth:** Email/password with role-based access control
- **Roles:** Selectable at signup (dropdown) — likely: Clinician, Researcher, Biotech, Student
- **Content delivery:** Static public pages + auth-gated interactive features
- **Video pipeline:** Slides → GPT-4o Vision → ElevenLabs narration → music synthesis → Supabase storage
- **Data layer:** Supabase (inferred from showcase/music architecture)

---

## Cross-Reference Tags

#ovn-nexus #site-map #navigation #architecture #MOC

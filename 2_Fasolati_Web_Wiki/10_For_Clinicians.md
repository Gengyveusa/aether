# For Clinicians

> **Source:** fasolati.life -- For Clinicians section (Maxoral, Pilot Program, Engine UI, Distribution)
> **Audience:** Periodontists, oral surgeons, general dentists, DSO network operators
> **Position:** Professional-channel products, clinical workflow integration, and pilot program

---

## Overview

The For Clinicians section of fasolati.life addresses dental professionals who want to integrate the Fasolati therapeutic cascade into their clinical practice. Four components are presented:

1. **Maxoral Professional Line** -- Rx-grade formulations
2. **Launch Engine UI** -- Biomarker dashboard and protocol management
3. **Pilot Program** -- Wire oral exams + gut protocols into one engine
4. **Distribution & Channels** -- DSO integration and supply chain

---

## 1. Maxoral Professional Line

> "Rx-grade formulations for in-office application"

Maxoral is the **prescription-strength** brand of Fasolati products distributed exclusively through the professional dental channel.

| Property | Detail |
|----------|--------|
| **Brand** | Maxoral |
| **Grade** | Rx-grade (prescription required) |
| **Formulations** | Higher enzyme concentrations, full phage payloads (when cleared), extended-release tray application |
| **Target practitioners** | Periodontists, oral surgeons, DSO clinics |
| **Distribution** | Henry Schein, Patterson, Benco |

### Maxoral vs Fasolati OTC

| Feature | Maxoral (Rx) | Fasolati (OTC) |
|---------|-------------|----------------|
| Enzyme concentration | Higher | OTC-optimized |
| Phage payload | Full (when regulatory cleared) | Not available |
| Application format | Extended-release tray (professional) | Rinse + consumer gel |
| Dispensing | Professional in-office | D2C, Amazon, pharmacy |
| Revenue model | Per-procedure (high margin) | Subscription (recurring) |

---

## 2. Launch Engine UI -- Clinician Dashboard

> "Biomarker dashboard and protocol management"

The Fasolati Engine ([[06_Fasolati_Engine_Platform]]) includes a **clinician-facing dashboard** that provides:

| Feature | Description |
|---------|-------------|
| **Patient vector scores** | View each patient's three-vector scores (Oral Ecology, Gut Integrity, Systemic Inflammation) |
| **Biomarker trends** | Track hs-CRP, zonulin, calprotectin, and other markers over time |
| **Protocol management** | Review and adjust SciAgent-generated protocols for each patient |
| **Treatment response** | See how patient vectors respond to Lytica/Loria interventions |
| **Alerts** | Flag patients whose inflammatory markers are trending adversely |

### Clinical Workflow Integration

```
PATIENT VISIT
     │
     ├── Periodontal exam → Data enters Vector 1 (Oral Ecology)
     │
     ├── Lab review (hs-CRP, etc.) → Data enters Vector 3 (Systemic)
     │
     ├── Gut biomarker review → Data enters Vector 2 (Gut Integrity)
     │
     ▼
FASOLATI ENGINE (Clinician View)
     │
     ├── Three-vector score display
     ├── SciAgent protocol recommendation
     ├── Lytica intervention decision (if indicated)
     ├── Loria maintenance prescription
     └── Gut Stack recommendation (if indicated)
     │
     ▼
PATIENT RECEIVES
     ├── In-office Lytica treatment (if Stage III-IV perio)
     ├── Loria daily rinse prescription/subscription
     ├── Gut Restoration Stack recommendation
     └── Fasolati Engine consumer access (ongoing monitoring)
```

---

## 3. Pilot Program

> "Wire oral exams + gut protocols into one engine"

The pilot program invites clinicians to integrate Fasolati into their practice as early adopters.

| Aspect | Detail |
|--------|--------|
| **Concept** | Connect periodontal clinical data with gut biomarkers and systemic inflammation tracking in a single platform |
| **Value to clinician** | First-mover advantage in oral-systemic integrated care; access to Engine UI before general availability |
| **Value to Fasolati** | Clinical validation data; real-world protocol refinement; early DSO relationship building |
| **How to join** | Contact form on fasolati.life with "Clinician" role selected ([[15_Partner_and_Affiliate_Portal]]) |

---

## 4. Distribution & Channels

> "DSO integration, Henry Schein, Patterson, Benco"

### Supply Chain Partners

| Partner | Type | Role |
|---------|------|------|
| **Henry Schein** | Dental distributor | Largest dental supply distributor -- Maxoral product fulfillment |
| **Patterson Dental** | Dental distributor | Major dental supply network -- Maxoral product fulfillment |
| **Benco Dental** | Dental distributor | Regional/national dental supply -- Maxoral product fulfillment |
| **DSO Networks** | Dental service organizations | Multi-site deployment of the full therapeutic cascade |

### DSO Integration Model

```
DSO NETWORK
┌─────────────────────────────────────────┐
│                                         │
│  Clinic A        Clinic B    Clinic C   │
│  ┌──────────┐   ┌────────┐  ┌────────┐ │
│  │ Lytica   │   │ Lytica │  │ Lytica │ │
│  │ in-office│   │ in-off │  │ in-off │ │
│  │          │   │        │  │        │ │
│  │ Loria Rx │   │ Loria  │  │ Loria  │ │
│  │ dispense │   │ disp.  │  │ disp.  │ │
│  └────┬─────┘   └───┬────┘  └───┬────┘ │
│       │             │           │       │
│       └──────┬──────┘           │       │
│              └──────┬───────────┘       │
│                     ▼                   │
│         ┌──────────────────┐            │
│         │ Fasolati Engine  │            │
│         │ (Network View)   │            │
│         │                  │            │
│         │ All patient      │            │
│         │ vectors, trends, │            │
│         │ protocol outcomes│            │
│         └──────────────────┘            │
│                                         │
│  Revenue:                               │
│  - Lytica per-procedure (high margin)   │
│  - Loria subscription (recurring)       │
│  - Engine SaaS (platform fee)           │
└─────────────────────────────────────────┘
```

---

## Related Files

- [[08_Therapeutic_Cascade_and_Distribution]] -- Full distribution architecture and therapeutic protocol
- [[03_Lytica_Biofilm_Intervention]] -- Maxoral's primary intervention product
- [[04_Loria_Molecular_Purification]] -- Daily maintenance product (both channels)
- [[06_Fasolati_Engine_Platform]] -- The Engine powering the clinician dashboard
- [[12_Investor_Deep_Dive]] -- DSO partnership as growth strategy
- [[15_Partner_and_Affiliate_Portal]] -- How to join the pilot program

---

#clinicians #maxoral #pilot-program #DSO #distribution #henry-schein #patterson #benco #engine-UI #professional

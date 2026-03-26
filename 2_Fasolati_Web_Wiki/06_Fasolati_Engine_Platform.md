# Fasolati Engine -- Three-Vector Scoring Platform

> **Source:** fasolati.life -- Platform section, Science section
> **Status:** Beta Access
> **Type:** AI-driven health operating system with three-vector inflammatory scoring

---

## Overview

> "Not advice, an engine. Not a product line, a node network."

The Fasolati Engine is a **personal inflammation operating system** that integrates data from both origin nodes (mouth and gut) and correlates them with systemic inflammatory markers. It uses the **SciAgent AI** ([[07_SciAgent_AI_Architecture]]) to build a personalized inflammatory model and write daily protocol orders.

---

## Three-Vector Scoring Model

The Engine scores health across three vectors. Vectors 1 and 2 are the **inputs** (origin nodes). Vector 3 is the **output** (systemic effect).

### Vector 1: Oral Ecology

> "Aggregates clinical periodontal data, microbiome composition from salivary diagnostics, and daily self-reported data. SciAgent AI weights these into a composite score reflecting real-time oral inflammatory potential -- how much systemic inflammation your mouth is currently generating."

| Data Source | Type | Example Inputs |
|-------------|------|---------------|
| **Clinical periodontal data** | Professional assessment | Pocket depths, attachment levels, bleeding on probing, staging/grading |
| **Microbiome composition** | Salivary diagnostics | Pathogen load (*P. gingivalis*, *T. forsythia*, *A. actinomycetemcomitans*), commensal diversity |
| **Self-reported data** | Daily user input | Bleeding gums, sensitivity, oral rinse adherence, diet factors |

### Vector 2: Gut Integrity

> "Tracks barrier function through biomarkers (zonulin, calprotectin, LPS-binding protein), microbiome diversity metrics, and daily input data. Reflects the gut's capacity to contain its microbial load -- a direct measure of endotoxin leakage into systemic circulation."

| Data Source | Type | Example Inputs |
|-------------|------|---------------|
| **Barrier function biomarkers** | Lab work | Zonulin, calprotectin, LPS-binding protein |
| **Microbiome diversity metrics** | Testing | Species richness, Shannon diversity index, keystone species abundance |
| **Daily input data** | User-reported | Diet, GI symptoms, supplement adherence, stool quality |

### Vector 3: Systemic Inflammation Control

> "The output metric. Integrates hs-CRP trends, wearable-derived HRV and sleep data, and available lab work. SciAgent correlates oral and gut vector changes with systemic inflammatory response, building a personalized model."

| Data Source | Type | Example Inputs |
|-------------|------|---------------|
| **hs-CRP trends** | Lab work (serial) | High-sensitivity C-reactive protein trajectory over time |
| **Wearable data** | Continuous monitoring | Heart rate variability (HRV), sleep quality, resting heart rate |
| **Lab work** | Periodic testing | HbA1c, lipid panels, additional inflammatory markers |

---

## Scoring Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    FASOLATI ENGINE                          │
│                                                            │
│   VECTOR 1              VECTOR 2              VECTOR 3     │
│   Oral Ecology          Gut Integrity         Systemic     │
│   ┌──────────┐         ┌──────────┐         ┌──────────┐  │
│   │ Perio    │         │ Zonulin  │         │ hs-CRP   │  │
│   │ Microbiome│         │ Calprot. │         │ HRV      │  │
│   │ Self-rpt │         │ LPS-BP   │         │ Sleep    │  │
│   │          │         │ Diversity │         │ Labs     │  │
│   └────┬─────┘         └────┬─────┘         └────┬─────┘  │
│        │                    │                     │        │
│        └────────────┬───────┘                     │        │
│                     ▼                             │        │
│              ┌─────────────┐                      │        │
│              │  SciAgent   │◄─────────────────────┘        │
│              │  AI Engine  │                                │
│              │             │                                │
│              │ Correlates  │                                │
│              │ V1 + V2     │                                │
│              │ changes     │                                │
│              │ with V3     │                                │
│              │ response    │                                │
│              └──────┬──────┘                                │
│                     ▼                                      │
│         ┌─────────────────────┐                            │
│         │  DAILY PROTOCOL     │                            │
│         │  ORDERS             │                            │
│         │                     │                            │
│         │  What to rinse      │                            │
│         │  What to swallow    │                            │
│         │  What to avoid      │                            │
│         │  When to retest     │                            │
│         └─────────────────────┘                            │
└────────────────────────────────────────────────────────────┘
```

---

## Subscription Details

| Property | Detail |
|----------|--------|
| **Status** | Beta Access |
| **Includes** | Engine access, protocol updates, priority access to new products |
| **Data connections** | Labs, wearables, oral exam data |
| **AI component** | SciAgent builds personal inflammatory model, writes daily protocol orders |
| **Access** | Request Beta Access via fasolati.life |

---

## Engine + Products Integration

| Engine Vector | Matched Products | Protocol Type |
|--------------|-----------------|---------------|
| Vector 1 (Oral) | Lytica ([[03_Lytica_Biofilm_Intervention]]) + Loria ([[04_Loria_Molecular_Purification]]) | Rinse frequency, intervention timing, maintenance schedule |
| Vector 2 (Gut) | Magisnat, Biolumen, Monch Monch ([[05_Gut_Restoration_Stack]]) | Supplement protocol, dietary guidance, prebiotic dosing |
| Vector 3 (Systemic) | All products + behavioral | Retest intervals, clinician referrals, lifestyle adjustments |

---

## Related Files

- [[07_SciAgent_AI_Architecture]] -- The AI engine powering the Fasolati Engine
- [[02_Origin_Node_Framework]] -- The two-node framework scored by the Engine
- [[01_Inflammation_Thesis]] -- The problem the Engine measures and tracks
- [[03_Lytica_Biofilm_Intervention]] -- Product matched to Vector 1 (intervention)
- [[04_Loria_Molecular_Purification]] -- Product matched to Vector 1 (maintenance)
- [[05_Gut_Restoration_Stack]] -- Products matched to Vector 2
- [[11_Shop_and_Products]] -- Engine subscription details

---

#fasolati-engine #three-vector #scoring #platform #SciAgent #AI #protocols #oral-ecology #gut-integrity #systemic-inflammation

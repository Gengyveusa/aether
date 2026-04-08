# SciAgent AI -- Inside the Black Box

> **Source:** fasolati.life -- Science section ("Inside the Black Box"), 5-part transparency disclosure
> **Type:** Clinical reasoning engine fine-tuned for oral-systemic health
> **Position:** The AI backbone of the Fasolati Engine

---

## Overview

> "Not a chatbot. A clinical reasoning engine trained on the science of inflammation."

SciAgent is the AI component that powers the Fasolati Engine ([[06_Fasolati_Engine_Platform]]). The site dedicates five transparency sections to explaining how it works, what it knows, how it verifies, how it personalizes, and how it handles data.

---

## 01 -- The Brain: What Powers SciAgent

> "SciAgent is built on a large language model -- the same class of AI behind the most advanced reasoning systems in the world -- but fine-tuned specifically for oral-systemic health. Think of the base model as a medical school graduate: broad knowledge, strong reasoning. Our fine-tuning is the residency -- years of specialized training in the exact pathways that connect your mouth, your gut, and your systemic inflammation."

### Architecture Components

| Component | Function |
|-----------|----------|
| **Foundation Model** | State-of-the-art LLM provides the reasoning backbone |
| **Domain Fine-Tuning** | Specialized training in oral-systemic health: periodontal pathology, gut barrier dynamics, inflammatory cascades, biomarker interpretation, pharmacology |
| **Constrained Outputs** | SciAgent can **only** recommend interventions from the Fasolati product ecosystem |
| **Explainable Reasoning** | Every recommendation comes with a "why" |

```
┌──────────────────────────────────────────────┐
│              SCIAGENT ARCHITECTURE            │
│                                              │
│  ┌────────────────────┐                      │
│  │  Foundation Model   │ (General reasoning)  │
│  └─────────┬──────────┘                      │
│            ▼                                 │
│  ┌────────────────────┐                      │
│  │  Domain Fine-Tuning │ (Oral-systemic       │
│  │                      │  specialization)     │
│  └─────────┬──────────┘                      │
│            ▼                                 │
│  ┌────────────────────┐                      │
│  │  Output Constraints │ (Fasolati ecosystem  │
│  │                      │  interventions only) │
│  └─────────┬──────────┘                      │
│            ▼                                 │
│  ┌────────────────────┐                      │
│  │  Explainable        │ (Every recommendation│
│  │  Reasoning Layer    │  includes rationale)  │
│  └────────────────────┘                      │
└──────────────────────────────────────────────┘
```

---

## 02 -- The Education: Where It Learned What It Knows

> "Trained on peer-reviewed science. Not internet health forums. Not sponsored content."

### Knowledge Sources

| Source Category | Content |
|----------------|---------|
| **Clinical Literature** | Thousands of peer-reviewed papers on periodontitis, gut permeability, inflammatory biomarkers, microbiome ecology, and the oral-systemic connection |
| **Biomarker Databases** | Reference ranges, population distributions, and clinical significance thresholds for hs-CRP, HbA1c, zonulin, calprotectin, LPS-binding protein |
| **Product Pharmacology** | Deep knowledge of every Fasolati formulation -- mechanisms, dosing, interactions, contraindications, expected response curves |
| **Clinical Practice Guidelines** | Current treatment guidelines from the AAP (American Academy of Periodontology), AGA (American Gastroenterological Association), and EFP (European Federation of Periodontology) |

---

## 03 -- The Fact-Check: How It Verifies Everything

> "Every recommendation runs through three layers of verification before it reaches you."

### Three-Layer Verification Architecture

| Layer | Name | Mechanism |
|-------|------|-----------|
| **Layer 1** | Evidence Match | Every claim is cross-referenced against source literature. If SciAgent says "hs-CRP above 3.0 correlates with increased cardiovascular risk," it must cite the specific studies. |
| **Layer 2** | Clinical Guardrails | Rule-based safety checks catch anything outside established parameters. Dosing limits, contraindication flags, interaction warnings -- **hard-coded, not learned**. |
| **Layer 3** | Confidence Scoring | Every recommendation carries a confidence score. High confidence: act on it. Medium: SciAgent explains the uncertainty. Low: it flags the question for your clinician instead of guessing. |

```
User Query / Data Input
         │
         ▼
┌─────────────────────┐
│  LAYER 1            │
│  Evidence Match     │──→  Cross-reference against source literature
│                     │      Must cite specific studies
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  LAYER 2            │
│  Clinical Guardrails│──→  Hard-coded safety checks
│                     │      Dosing limits, contraindications, interactions
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  LAYER 3            │
│  Confidence Scoring │──→  High: act   Medium: explain uncertainty
│                     │      Low: route to clinician
└─────────┬───────────┘
          ▼
   Verified Recommendation
   (with rationale + confidence)
```

### Behavioral Guarantees

| Guarantee | Description |
|-----------|-------------|
| **Never Invents** | SciAgent cannot fabricate studies or statistics |
| **Never Overreaches** | If data suggests something outside its scope, it routes to your doctor |
| **Always Auditable** | Every recommendation is logged with its reasoning chain |

---

## 04 -- Your Model: How It Learns You

> "The longer you use Fasolati, the smarter your personal model becomes."

### Personalization Timeline

| Period | Phase | What Happens |
|--------|-------|-------------|
| **Week 1** | Baseline | SciAgent ingests initial data and sets starting protocols based on population evidence |
| **Weeks 2-4** | Response Mapping | SciAgent begins tracking how your body responds to protocols |
| **Months 2-3** | Pattern Recognition | SciAgent starts identifying your unique patterns -- what triggers flares, what accelerates improvement |
| **Month 4+** | Predictive Protocols | SciAgent begins anticipating inflammatory events proactively, adjusting protocols before symptoms appear |
| **Ongoing** | Continuous Refinement | Your model never stops learning from new data |

### Personalization Diagram

```
TIME →

Week 1          Weeks 2-4        Months 2-3       Month 4+
BASELINE        RESPONSE MAP      PATTERNS         PREDICTIVE
┌─────────┐    ┌─────────────┐   ┌────────────┐   ┌──────────────┐
│Population│ →  │ Track YOUR  │ → │ Identify   │ → │ Anticipate   │
│ evidence │    │ responses   │   │ YOUR unique│   │ inflammatory │
│ defaults │    │ to protocols│   │ triggers & │   │ events before│
│          │    │             │   │ patterns   │   │ they occur   │
└─────────┘    └─────────────┘   └────────────┘   └──────────────┘
```

---

## 05 -- Your Data: What Happens to Your Information

> "Your health data is yours. Period."

### Data Protections

| Protection | Detail |
|-----------|--------|
| **Encrypted at Rest** | AES-256 encryption standard |
| **Never Sold** | Data never sold, rented, or shared with advertisers, insurance companies, or employers |
| **You Control It** | Export complete health record anytime. Delete data anytime. Pause collection anytime. |
| **De-identified Research** | Anonymized and de-identified patterns contribute to population-level research -- individual data does not |

---

## Related Files

- [[06_Fasolati_Engine_Platform]] -- The platform SciAgent powers
- [[01_Inflammation_Thesis]] -- The scientific framework SciAgent reasons about
- [[03_Lytica_Biofilm_Intervention]] -- Product SciAgent prescribes for active intervention
- [[04_Loria_Molecular_Purification]] -- Product SciAgent prescribes for daily maintenance
- [[05_Gut_Restoration_Stack]] -- Products SciAgent prescribes for gut restoration
- [[14_Legal_Disclaimers_Attribution]] -- Data protection and legal context

---

#SciAgent #AI #black-box #transparency #verification #personalization #clinical-reasoning #AES-256 #data-privacy

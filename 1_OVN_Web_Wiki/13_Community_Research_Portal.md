# Community & Research Portal

> **Source:** ovnnexus.com — homepage community section, platform architecture
> **Status:** Education live; Case Discussions and Biomarker Tracking coming soon

---

## Mission Statement

> "OVN Nexus is a professional community and research platform for clinicians who want to stay current on the oral-systemic connection and contribute to the science."

> "Join Dental Professionals Building the Evidence Base"

---

## Three Pillars of Community

### 1. Education Modules — LIVE ✅

**Status:** Available now (public access, no auth required)
**Content:** 11 modules, 4 series, 54 pages
**Access route:** `/education`

> "Curated, evidence-tiered content on the oral-vascular-neural axis — written for clinicians, not just researchers."

#### Key Design Principles
- Written for **clinicians**, not just researchers — practical clinical language
- All claims tagged to [[02_Evidence_Tiers]]
- Authored by a single credentialed authority (S.T. Connelly)
- Derived from the *Oral Health Bulletin* newsletter — established publication channel
- Full syllabus: [[06_Education_Series_Overview]]

---

### 2. Case Discussions — COMING SOON 🔜

**Status:** Announced, not yet launched
**Access:** Will require authentication

> "Share and discuss cases where periodontal findings intersected with systemic disease presentations."

#### Anticipated Features

| Feature | Description |
|---------|-------------|
| **Case submission** | Structured format for presenting clinical cases with periodontal + systemic components |
| **Discussion threads** | Peer commentary and analysis |
| **Evidence tier tagging** | Claims in discussions tagged to Tier 1/2/3 framework |
| **De-identification** | Patient data de-identified per HIPAA/privacy requirements |
| **Cross-referencing** | Link cases to relevant education modules and scientific evidence |
| **Expert moderation** | Clinical and scientific review of submitted cases |

#### Expected Case Format
```
CASE PRESENTATION
├── Patient demographics (de-identified)
├── Periodontal findings
│   ├── Probing depths, BOP, radiographic bone loss
│   ├── Periodontal diagnosis and stage/grade
│   └── Microbiological data (if available)
├── Systemic findings
│   ├── Cardiovascular, metabolic, neurological status
│   ├── Biomarkers (hsCRP, IL-6, etc.)
│   └── Relevant medical history
├── Intervention
│   ├── Periodontal treatment provided
│   └── Medical co-management details
├── Outcomes
│   ├── Periodontal response
│   ├── Biomarker changes
│   └── Systemic outcome observations
└── Discussion
    ├── Evidence tier classification of observations
    └── Open questions for community
```

#### Clinical Value
- Build **real-world evidence base** for oral-systemic connections
- Identify **patterns** across multiple cases that single practitioners cannot see
- Create **teaching cases** for education module integration
- Develop **clinical intuition** for when periodontal findings warrant systemic investigation

---

### 3. Biomarker Tracking — COMING SOON 🔜

**Status:** Announced, not yet launched
**Access:** Will require authentication

> "Contribute to and access aggregated, de-identified data linking periodontal therapy to systemic biomarker changes."

#### Anticipated Architecture

```
INDIVIDUAL CLINICIAN                    AGGREGATED PLATFORM
┌─────────────────┐                    ┌──────────────────────┐
│ Patient case     │                    │ De-identified dataset │
│ ┌──────────────┐│    Contribute →     │                      │
│ │ Pre-treatment ││ ──────────────→    │ N = hundreds/thousands│
│ │ biomarkers    ││                    │ of pre/post treatment │
│ └──────────────┘│                    │ biomarker pairs       │
│ ┌──────────────┐│                    │                      │
│ │ Treatment     ││                    │ Statistical analysis  │
│ │ provided      ││                    │ ├── Mean Δ hsCRP     │
│ └──────────────┘│                    │ ├── Mean Δ IL-6      │
│ ┌──────────────┐│    ← Access        │ ├── Stratified by    │
│ │ Post-treatment││ ◄──────────────    │ │   treatment type   │
│ │ biomarkers    ││                    │ ├── Stratified by    │
│ └──────────────┘│                    │ │   disease severity  │
│                  │                    │ └── Trend analysis   │
└─────────────────┘                    └──────────────────────┘
```

#### Data Points (Anticipated)

**Pre-Treatment:**
| Category | Measures |
|----------|----------|
| **Periodontal** | Probing depths, BOP %, radiographic bone loss, diagnosis stage/grade |
| **Inflammatory** | hsCRP, IL-6 (Tier 1 biomarkers) |
| **Metabolic** | HbA1c, fasting glucose (if diabetic comorbidity) |
| **Vascular** | Endothelial function (if available) |

**Treatment:**
| Category | Details |
|----------|---------|
| **Type** | SRP, surgical, regenerative, combination |
| **Adjuncts** | Antimicrobials, probiotics, systemic antibiotics |
| **Duration** | Treatment timeline |

**Post-Treatment (3–6 months):**
| Category | Measures |
|----------|----------|
| **Periodontal** | Same measures as pre-treatment |
| **Inflammatory** | Same biomarkers — track Δ change |
| **Metabolic** | Same measures — track Δ change |

#### Research Value
- **Prospective data collection** at scale — addresses key research gap
- **Real-world evidence** complementing RCTs
- **Stratified analysis** — which patients/treatments show most biomarker improvement?
- **Hypothesis generation** — identify unexpected patterns for formal research
- **Validation data** for Tier 2→Tier 1 biomarker promotion

---

## Living Document Philosophy

> "This Platform Is a Living Document. OVN Nexus is continuously evolving, shaped by the clinicians and researchers who use it. We welcome your feedback and suggestions as we build new features to strengthen your educational experience — so you can deliver the highest standard of care to your patients."

### Implications
- Platform features will evolve based on community input
- Content is updated as evidence advances
- Community members are co-creators, not passive consumers
- Feedback loops between case discussions → education content → research priorities

---

## Research Backend Integration

The Community & Research Portal connects directly to the platform's authenticated research backend tools. These are not standalone features — they form an integrated research pipeline.

### Data Flow: Community → Research Backend

```
COMMUNITY INPUT                    RESEARCH BACKEND
─────────────────                  ────────────────────────────

Case Discussions ──────────→ Knowledge Graph Explorer
(clinical observations)         (/dashboard/lab)
                                ├── New entity relationships
                                ├── Edge validation
                                └── Evidence tier tagging

Biomarker Tracking ────────→ AI & ML Lab
(pre/post treatment data)       (/dashboard/ml)
                                ├── Risk Prediction Engine training data
                                ├── Model validation cohorts
                                └── Feature importance analysis

Both ──────────────────────→ Trial Matching
                                (/dashboard/ml → Trial Matching tab)
                                ├── Patient eligibility signals
                                ├── Site identification
                                └── Enrollment acceleration
```

### How Community Data Feeds the ML Lab

| Community Source | ML Lab Consumer | Value |
|-----------------|----------------|-------|
| Biomarker pre/post pairs | Risk Prediction Engine training | Real-world outcome data for model calibration |
| Case discussions with systemic outcomes | Feature engineering | Discover new predictive features beyond standard biomarkers |
| Periodontal staging data | Staging → risk score mapping | Quantify risk gradient across AAP stages |
| Longitudinal follow-up | Model validation | Prospective performance evaluation |

### How Community Data Feeds the Knowledge Graph

| Community Source | Knowledge Graph Consumer | Value |
|-----------------|------------------------|-------|
| Case observations ("periodontal patient also had X") | New entity-edge candidates | Hypothesis generation from clinical pattern recognition |
| Biomarker correlation data | Edge weight evidence | Strengthen or weaken relationship confidence |
| Treatment outcome reports | Intervention → outcome edges | Map which interventions affect which endpoints |

---

## Member Contribution Model

### How Members Contribute
1. **Learn:** Complete education modules, stay current
2. **Discuss:** Submit and comment on clinical cases (coming soon)
3. **Track:** Contribute pre/post-treatment biomarker data (coming soon)
4. **Explore:** Navigate the knowledge graph to discover research connections ([[12_Member_Hub_Platform]])
5. **Predict:** Use the ML risk prediction engine for patient risk stratification ([[12_Member_Hub_Platform]])
6. **Match:** Connect patients with relevant clinical trials via the Trial Matching tab
7. **Feedback:** Shape platform development through suggestions

### What Members Get
1. **Evidence-tiered education** grounded in latest oral-systemic research
2. **Peer community** of dental professionals interested in oral-systemic connections
3. **Aggregated data access** — see patterns across many clinicians' experiences
4. **Clinical tools** — showcase presentations, video pipeline, music studio for patient/peer education
5. **Research participation** — contribute to the evidence base without running formal trials
6. **AI-powered risk scoring** — ML-based cardiovascular/neurodegeneration/metabolic risk predictions
7. **Knowledge graph access** — explore entity relationships across the oral-systemic research landscape
8. **API access** — programmatic research access via provisioned API keys (request from admin)

---

## Related Files

- [[12_Member_Hub_Platform]] — Platform architecture, ML Lab, Knowledge Graph, Admin tools
- [[06_Education_Series_Overview]] — Education module system (Pillar 1)
- [[09_Series3_Information_Collapse]] — Module 50 on biomarkers (connects to Pillar 3)
- [[05_Clinical_Action_Guidelines]] — Clinical framework that community applies
- [[14_Legal_Disclaimers_Attribution]] — Data privacy and ethical considerations
- [[03_OMV_Biology]] — OMV/gingipain features used in ML risk prediction
- [[02_Evidence_Tiers]] — Tier system used in knowledge graph edge classification

---

#community #research-portal #case-discussions #biomarker-tracking #living-document #member-contributions #ml-integration #knowledge-graph

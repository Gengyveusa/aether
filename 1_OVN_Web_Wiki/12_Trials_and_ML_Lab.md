# Clinical Trials & AI/ML Lab

> Routes: `/trials`, `/dashboard/ml`, `/dashboard/lab`

---

## Overview

This file covers three advanced research tools on OVN Nexus: the **Clinical Trials** registry with precision enrichment, the **AI & ML Lab** with risk prediction and trial matching, and the **Knowledge Graph Explorer** for navigating entity relationships across the platform's data.

---

## Clinical Trials

> Route: `/trials`
> Tagline: "Clinical Trials" with precision trial enrichment using biomarker profiles

### Trials Data Table

| Column | Description | Example |
|--------|-------------|---------|
| **Code** | Unique trial identifier | `TRL-001` |
| **Title** | Full trial title | `OMV Reduction Following Intensive Periodontal Therapy` |
| **Phase** | Clinical trial phase | `Phase I` / `Phase II` / `Phase III` / `Phase IV` |
| **Status** | Trial status | `Recruiting` / `Active` / `Completed` / `Suspended` |
| **Sponsor** | Sponsoring institution | `UCSF` / `GengyeUSA` |
| **Enrollment** | Target and current enrollment | `50/100` |
| **Start Date** | Trial initiation date | `2024-06-01` |

### Precision Trial Enrichment

The key differentiator of the OVN Nexus trials system is **biomarker-driven trial enrichment**. Rather than enrolling patients based solely on diagnosis, the system uses biomarker profiles from [[10_Biomarker_Engine]] to:

- Identify patients most likely to respond to interventions (high OMV load + elevated inflammatory markers)
- Stratify enrollment by disease risk profile (cardiovascular, neurodegenerative, autoimmune)
- Reduce trial noise by excluding patients with confounding biomarker patterns
- Enable adaptive trial designs that adjust enrollment criteria based on interim biomarker data

---

## AI & ML Lab

> Route: `/dashboard/ml`
> Tagline: "AI & ML Lab"

### Risk Prediction Engine

The AI Risk Prediction Engine computes individualized disease risk scores using a combination of clinical and biomarker data:

**Input Variables**:

| Category | Variables |
|----------|-----------|
| **Clinical** | Periodontal staging (Healthy through Stage IV) |
| **Inflammatory markers** | IL-6, TNF-α, hsCRP |
| **Primary markers** | OMV Concentration, Gingipain Activity |

**Output Risk Scores**:

| Risk Domain | Description | Key Input Drivers |
|-------------|-------------|-------------------|
| **Cardiovascular** | Probability of ASCVD-related events | Periodontal staging + hsCRP + IL-6 + OMV Conc |
| **Neurodegeneration** | Risk of neurodegenerative trajectory | OMV Conc + Gingipain Activity + TNF-α |
| **Metabolic** | Metabolic syndrome and endothelial dysfunction risk | hsCRP + IL-6 + Nitric Oxide (from [[10_Biomarker_Engine]]) |

The risk scores feed into the Disease Risk Profile radar chart on [[07_Dashboard_Analytics]].

### Trial Matching Tab

An automated system that matches patients from [[09_Patient_Registry]] to eligible clinical trials based on:

- Current biomarker profiles
- Periodontal staging
- Demographics (age, sex)
- Risk factor status (smoking, diabetes)
- Geographic proximity (clinic location from [[08_Clinics_Registry]])

### Model Registry Tab

A management interface for machine learning models deployed on the platform:

| Field | Description |
|-------|-------------|
| Model name | Descriptive identifier |
| Model type | Algorithm family (e.g., gradient boosting, neural network, logistic regression) |
| Training data | Source dataset from [[11_Experiments_Datasets_Papers]] |
| Performance metrics | AUC, sensitivity, specificity, calibration |
| Deployment status | Development / Staging / Production / Retired |
| Version | Semantic versioning |

---

## Knowledge Graph Explorer

> Route: `/dashboard/lab`
> Tagline: "Knowledge Graph Explorer"

### Overview

A visual and queryable interface for exploring entity relationships across the entire OVN Nexus data platform. The Knowledge Graph connects publications, biomarkers, pathogens, diseases, experiments, and clinical findings into a navigable network.

### Graph Metrics

| Metric | Description |
|--------|-------------|
| **Total Edges** | Number of relationships in the graph |
| **Entity Types** | Categories of nodes (e.g., Paper, Biomarker, Pathogen, Disease, Experiment, Gene) |
| **Relationship Types** | Categories of edges (e.g., "is associated with", "targets", "measures", "causes", "treats") |

### Filters

- **Source Type** — filter edges originating from a specific entity type
- **Target Type** — filter edges pointing to a specific entity type
- Combined filtering enables focused exploration (e.g., "show all Biomarker → Disease relationships")

### Data Sources

The Knowledge Graph aggregates entities from:
- Publications indexed in [[11_Experiments_Datasets_Papers#Publications & Knowledge Graph]]
- Biomarkers defined in [[10_Biomarker_Engine]]
- Pathogens and mechanisms from [[04_Science_OVN_Axis_and_OMVs]]
- Experiments and datasets from [[11_Experiments_Datasets_Papers]]

---

## Cross-References

- Biomarker data powering risk models: [[10_Biomarker_Engine]]
- Patient profiles for trial matching: [[09_Patient_Registry]]
- Clinic locations for geographic matching: [[08_Clinics_Registry]]
- Dashboard risk visualization: [[07_Dashboard_Analytics]]
- Publications feeding the Knowledge Graph: [[11_Experiments_Datasets_Papers]]
- Scientific framework: [[04_Science_OVN_Axis_and_OMVs]]

---

**Links**: [[00_Vault_Index]] | [[10_Biomarker_Engine]] | [[09_Patient_Registry]] | [[07_Dashboard_Analytics]] | [[11_Experiments_Datasets_Papers]]

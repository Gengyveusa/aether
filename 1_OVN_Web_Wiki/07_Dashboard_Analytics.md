# Dashboard Analytics

> Route: `/dashboard`

---

## Overview

The research dashboard is the central analytics hub for OVN Nexus. It provides a real-time overview of platform activity, research data, and key biomarker trends. Access requires a valid research portal key (see [[06_Member_Hub_Landing]]).

---

## 8 Metric Cards

The top of the dashboard displays eight summary metric cards showing platform-wide counts:

| Metric | Description | Demo Value |
|--------|-------------|------------|
| **Clinics** | Total registered research clinics | — |
| **Patients** | Total de-identified patient records | — |
| **Samples** | Total biological samples tracked | — |
| **Experiments** | Total registered experiments | — |
| **Datasets** | Total datasets in the Data Lake | — |
| **Papers** | Total publications indexed | — |
| **Trials** | Total clinical trials tracked | — |
| **Users** | Total platform users | 10 |

Each card links to its corresponding registry or management page.

---

## 4 Visualization Charts

### 1. Biomarker Trends (Line Chart)

Tracks three key biomarkers over time (January through June):

| Biomarker | Type | Significance |
|-----------|------|-------------|
| **OMV Concentration** | Primary | Direct measure of bacterial vesicle load |
| **IL-6** | Inflammatory | Pro-inflammatory cytokine, systemic inflammation marker |
| **hsCRP** | Inflammatory | High-sensitivity C-reactive protein, cardiovascular risk marker |

This chart visualizes the trajectory of these markers across the patient population, enabling clinicians to observe trends following periodontal interventions. See [[10_Biomarker_Engine]] for full biomarker details.

### 2. Periodontal Severity Distribution (Bar Chart)

Displays the distribution of patients across periodontal staging categories:

| Stage | Description |
|-------|-------------|
| **Healthy** | No clinical attachment loss |
| **Stage I** | Early periodontitis, 1–2 mm attachment loss |
| **Stage II** | Moderate periodontitis, 3–4 mm attachment loss |
| **Stage III** | Severe periodontitis with potential for tooth loss |
| **Stage IV** | Advanced periodontitis with extensive tooth loss and masticatory dysfunction |

### 3. Disease Risk Profile (Radar Chart)

A multi-axis radar chart plotting computed risk scores across three domains:

- **Cardiovascular** — risk derived from inflammatory markers + periodontal staging
- **Neurodegeneration** — risk incorporating BBB-related biomarkers and OMV load
- **Autoimmune** — risk factoring PPAD-related citrullination markers

This visualization connects directly to the AI Risk Prediction Engine in [[12_Trials_and_ML_Lab]].

### 4. Recent Activity Feed

A chronological feed showing the 5 most recent platform events (demo data):

- New patient enrollments
- Sample submissions
- Experiment status changes
- Dataset uploads
- Publication additions

---

## Navigation

From the dashboard, members can access all research tools:

- [[08_Clinics_Registry]] — Manage clinics
- [[09_Patient_Registry]] — View/add patients
- [[10_Biomarker_Engine]] — Biomarker analysis
- [[11_Experiments_Datasets_Papers]] — Experiments, data, publications
- [[12_Trials_and_ML_Lab]] — Trials and ML tools

---

**Links**: [[00_Vault_Index]] | [[06_Member_Hub_Landing]] | [[10_Biomarker_Engine]] | [[12_Trials_and_ML_Lab]]

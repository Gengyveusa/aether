# Biomarker Engine

> Route: `/biomarkers`
> Tagline: "Biomarker Engine"

---

## Overview

The Biomarker Engine is the analytical core of the OVN Nexus research platform. It tracks **6 key biomarkers** across patient samples, maps biomarker-disease associations, and provides sample-level tracking for research workflows. This is where the scientific claims of the OVN Axis framework meet measurable laboratory data.

---

## 6 Tracked Biomarkers

### Primary Biomarkers

| Biomarker | Category | What It Measures | Relevance to OVN Axis |
|-----------|----------|-----------------|----------------------|
| **OMV Concentration** | Primary | Quantity of bacterial outer membrane vesicles in circulation | Direct measure of the oral-systemic bacterial vesicle load — the initiating factor in the 5-step cascade |
| **Gingipain Activity** | Primary | Enzymatic activity of *P. gingivalis* cysteine proteases | Measures the functional virulence payload delivered by OMVs; gingipains drive barrier disruption (Step 1) and mitochondrial dysfunction (Step 2) |

### Inflammatory Biomarkers

| Biomarker | Category | What It Measures | Relevance to OVN Axis |
|-----------|----------|-----------------|----------------------|
| **IL-6** (Interleukin-6) | Inflammatory | Pro-inflammatory cytokine levels | Key mediator of systemic inflammatory response; elevated in periodontitis; improves with periodontal treatment (Established evidence tier) |
| **TNF-α** (Tumor Necrosis Factor-alpha) | Inflammatory | Pro-inflammatory cytokine levels | Drives macrophage activation and phenotypic reprogramming (Step 3); central to NF-κB inflammatory signaling |
| **hsCRP** (high-sensitivity C-reactive protein) | Inflammatory | Systemic inflammatory burden | Gold-standard clinical marker of cardiovascular inflammation risk; responsive to periodontal therapy (Established evidence tier) |

### Metabolic Biomarker

| Biomarker | Category | What It Measures | Relevance to OVN Axis |
|-----------|----------|-----------------|----------------------|
| **Nitric Oxide** | Metabolic | Endothelial nitric oxide production | Marker of endothelial function; reduced NO indicates endothelial dysfunction — a key endpoint of OMV-driven vascular damage |

---

## 4 Biomarker-Disease Associations

The engine maps biomarker patterns to disease risk profiles:

| Association | Key Biomarkers | Mechanism |
|-------------|---------------|-----------|
| **Cardiovascular Risk** | hsCRP ↑, IL-6 ↑, NO ↓, OMV Conc ↑ | Systemic inflammation + endothelial dysfunction → atherosclerotic progression |
| **Neurodegenerative Risk** | OMV Conc ↑, Gingipain Activity ↑, TNF-α ↑ | OMV BBB penetration + gingipain-mediated neuronal damage + neuroinflammation |
| **Autoimmune Risk** | TNF-α ↑, IL-6 ↑, Gingipain Activity ↑ | PPAD-driven protein citrullination + chronic inflammatory activation |
| **Metabolic Risk** | hsCRP ↑, NO ↓, IL-6 ↑ | Endothelial dysfunction + systemic inflammation → metabolic syndrome features |

These associations feed directly into the AI Risk Prediction Engine in [[12_Trials_and_ML_Lab]].

---

## Sample Tracking Table

The biomarker engine includes a sample management interface:

| Column | Description | Example |
|--------|-------------|---------|
| **Sample ID** | Unique sample identifier | `SMP-0001` |
| **Patient** | Linked patient code (see [[09_Patient_Registry]]) | `PAT-0001` |
| **Clinic** | Originating clinic (see [[08_Clinics_Registry]]) | `CLN-001` |
| **Collection Date** | When the sample was obtained | `2024-04-10` |
| **Type** | Sample type (blood, saliva, GCF, tissue) | `Blood` |
| **Status** | Processing status | `Collected` / `Processing` / `Analyzed` / `Archived` |
| **Biomarker Results** | Link to individual biomarker readings | View results |

---

## Integration with Dashboard

The Biomarker Trends line chart on [[07_Dashboard_Analytics]] pulls data from this engine, plotting OMV Concentration, IL-6, and hsCRP trajectories over time. The Disease Risk Profile radar chart also derives its axes from the biomarker-disease associations defined here.

---

## Cross-References

- Dashboard visualizations: [[07_Dashboard_Analytics]]
- Patient records linked to samples: [[09_Patient_Registry]]
- Clinics where samples originate: [[08_Clinics_Registry]]
- AI risk prediction using these biomarkers: [[12_Trials_and_ML_Lab]]
- Science behind biomarker selection: [[04_Science_OVN_Axis_and_OMVs]]
- Education on biomarker-relevant pathways: [[02_Education_Oral_Health_Bulletin]]

---

**Links**: [[00_Vault_Index]] | [[07_Dashboard_Analytics]] | [[09_Patient_Registry]] | [[12_Trials_and_ML_Lab]] | [[04_Science_OVN_Axis_and_OMVs]]

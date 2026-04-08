# Experiments, Datasets & Papers

> Routes: `/experiments`, `/datasets`, `/papers`

---

## Overview

This file covers three interconnected research management tools on OVN Nexus: the **Experiment Registry** for tracking research studies, the **Data Lake** for managing multi-omics datasets, and the **Publications & Knowledge Graph** for indexing literature. Together they form the research data backbone of the platform.

---

## Experiment Registry

> Route: `/experiments`
> Tagline: "Experiment Registry"

### Experiment Data Table

| Column | Description | Example |
|--------|-------------|---------|
| **Code** | Unique experiment identifier | `EXP-001` |
| **Title** | Descriptive experiment title | `OMV Dose-Response in Endothelial Cells` |
| **PI** | Principal Investigator | `S.T. Connelly` |
| **Project** | Parent project or grant | `OVN Axis Validation Study` |
| **Model System** | Experimental model used | `In vitro` / `Animal` / `Clinical` / `Computational` |
| **Status** | Current experiment status | `Planning` / `Active` / `Completed` / `Published` |
| **Start Date** | Experiment initiation date | `2024-01-15` |

### Actions

- **+ New Experiment** — register a new experiment with all required metadata
- **Edit** — modify experiment details
- **Link datasets** — associate datasets from the Data Lake
- **Link publications** — connect resulting papers

### Relationship to Other Registries

Experiments draw patients from [[09_Patient_Registry]], use samples tracked in [[10_Biomarker_Engine]], and generate datasets stored in the Data Lake (below).

---

## Data Lake

> Route: `/datasets`
> Tagline: "Data Lake"

### Supported Data Types

The Data Lake is designed to handle multi-omics research data central to OVN Axis investigations:

| Data Type | Description | Relevance |
|-----------|-------------|-----------|
| **Microbiome 16S** | 16S rRNA gene sequencing for microbial community profiling | Identifies oral pathogen abundance and community composition; maps dysbiosis patterns (see [[02_Education_Oral_Health_Bulletin#Series 3 Information Collapse]]) |
| **RNA-Seq** | Whole-transcriptome sequencing | Captures host gene expression changes in response to OMV challenge; identifies differentially expressed inflammatory pathways |
| **Proteomics** | Mass spectrometry-based protein quantification | Measures gingipain activity, cytokine levels, and protein citrullination directly |
| **EV Cargo Analysis** | Extracellular vesicle content profiling | Characterizes OMV payloads (proteins, lipids, nucleic acids) and host-derived EV signaling molecules (Step 4 of cascade) |

### Dataset Data Table

| Column | Description | Example |
|--------|-------------|---------|
| **Name** | Dataset name | `UCSF_16S_Cohort_2024` |
| **Type** | Data type (see above) | `Microbiome 16S` |
| **Format** | File format | `FASTQ` / `CSV` / `H5AD` / `mzML` |
| **Size** | Storage size | `2.3 GB` |
| **Rows** | Number of records/samples | `1,250` |
| **Experiment** | Linked experiment (see registry above) | `EXP-001` |
| **Access** | Access control level | `Public` / `Restricted` / `Private` |
| **Status** | Processing status | `Raw` / `Processed` / `QC Passed` / `Published` |

---

## Publications & Knowledge Graph

> Route: `/papers`
> Tagline: "Publications & Knowledge Graph"

### Publication Data Table

| Column | Description | Example |
|--------|-------------|---------|
| **Title** | Full publication title | `Outer Membrane Vesicles from P. gingivalis Induce Endothelial Dysfunction` |
| **Authors** | Author list | `Connelly ST, et al.` |
| **Journal** | Publication venue | `Journal of Periodontal Research` |
| **DOI** | Digital Object Identifier | `10.1111/jper.xxxxx` |
| **Published** | Publication date | `2024-06-01` |
| **Keywords** | Indexed keywords for graph linking | `OMV, P. gingivalis, endothelial, OVN Axis` |

### Knowledge Graph Integration

The publications section feeds into the **Knowledge Graph** — a network of relationships between papers, biomarkers, pathogens, diseases, and experiments. This graph is explored via the Knowledge Graph Explorer in [[12_Trials_and_ML_Lab#Knowledge Graph Explorer]].

Keywords serve as graph nodes, connecting papers to:
- Biomarkers tracked in [[10_Biomarker_Engine]]
- Pathogens discussed in [[04_Science_OVN_Axis_and_OMVs]]
- Disease endpoints from the 5-step cascade
- Experiments in the registry above

---

## Cross-References

- Patient data feeding experiments: [[09_Patient_Registry]]
- Biomarker data from samples: [[10_Biomarker_Engine]]
- Knowledge Graph Explorer: [[12_Trials_and_ML_Lab]]
- Education series using this research: [[02_Education_Oral_Health_Bulletin]]
- Dashboard experiment count: [[07_Dashboard_Analytics]]

---

**Links**: [[00_Vault_Index]] | [[09_Patient_Registry]] | [[10_Biomarker_Engine]] | [[12_Trials_and_ML_Lab]] | [[07_Dashboard_Analytics]]

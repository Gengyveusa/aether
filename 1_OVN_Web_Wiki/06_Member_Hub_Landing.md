# Member Hub Landing

> Route: `/hub`

---

## Overview

The Member Hub is the **gateway to the entire research backend** of OVN Nexus. This is the section that was entirely missed in the original vault — it contains the dashboard, registries, biomarker engine, experiment tracking, ML lab, and administrative tools that make up the bulk of the platform's functionality.

---

## Welcome Dashboard

Upon accessing `/hub`, members see a welcome screen with:

1. **Platform introduction** — brief orientation to OVN Nexus as a research and education network
2. **"Unlock Research Portal"** — a prominently displayed access key input field where members enter their research access key (see [[13_Admin_and_Access_Keys]]) to gain access to the full backend
3. **Education module cards** — three featured modules:

| Card | Topic | Description |
|------|-------|-------------|
| 1 | **Periodontitis & Systemic Inflammation** | Overview of how periodontal disease creates systemic inflammatory burden |
| 2 | **Outer Membrane Vesicles (OMVs)** | Introduction to OMV biology and their role as disease mediators |
| 3 | **OVN Axis Working Model** | The integrated oral-vascular-neural framework |

These cards link to the full education content in [[02_Education_Oral_Health_Bulletin]].

---

## Research Portal Access

The research portal is locked behind an access key system:

- Members must enter a valid **access key** (UUID or custom string) in the input field
- Keys are generated and managed by administrators via [[13_Admin_and_Access_Keys]]
- Access can also be granted by email invitation
- Once unlocked, members gain access to the full suite of research tools:
  - [[07_Dashboard_Analytics]] — Platform metrics and visualizations
  - [[08_Clinics_Registry]] — Research clinic management
  - [[09_Patient_Registry]] — De-identified patient records
  - [[10_Biomarker_Engine]] — Biomarker tracking and disease associations
  - [[11_Experiments_Datasets_Papers]] — Experiments, Data Lake, Publications
  - [[12_Trials_and_ML_Lab]] — Clinical Trials, AI Risk Prediction, Knowledge Graph

---

## Community Section

The hub includes a **Community** area currently marked as **"Coming Soon"**. Planned features include:

- Case discussion boards for sharing real-world oral-systemic clinical findings
- Peer-to-peer knowledge exchange
- Collaborative research opportunities
- Feedback mechanisms for platform improvement

---

## External Link: omvs.io

The hub prominently links to **omvs.io**, a companion website that serves as an additional resource for OMV-related research and education content.

---

## Cross-References

- Full research dashboard: [[07_Dashboard_Analytics]]
- Access key management: [[13_Admin_and_Access_Keys]]
- Education modules: [[02_Education_Oral_Health_Bulletin]]
- Homepage and platform overview: [[01_Home_OVN_Axis_and_Platform]]

---

**Links**: [[00_Vault_Index]] | [[07_Dashboard_Analytics]] | [[13_Admin_and_Access_Keys]] | [[02_Education_Oral_Health_Bulletin]]

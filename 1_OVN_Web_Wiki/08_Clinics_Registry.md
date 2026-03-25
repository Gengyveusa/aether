# Clinics Registry

> Route: `/clinics`
> Tagline: "Manage research clinics and data collection sites"

---

## Overview

The Clinics Registry is the foundational organizational layer of the OVN Nexus research infrastructure. Every patient record, biological sample, and experiment is tied to a registered research clinic. This page provides a management interface for adding, editing, and monitoring clinical data collection sites.

---

## Clinic Data Table

The registry displays a sortable, filterable table with the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| **Code** | Unique alphanumeric identifier for the clinic | `CLN-001` |
| **Name** | Human-readable clinic name | `UCSF Periodontal Research Center` |
| **Institution** | Parent institution or hospital system | `University of California, San Francisco` |
| **Country** | Geographic location | `United States` |
| **Patients** | Count of enrolled patients at this site | `45` |
| **Samples** | Count of biological samples collected | `128` |
| **Status** | Operational status | `Active` / `Inactive` / `Pending` |

---

## Actions

- **+ Add Clinic** button — opens a form to register a new research clinic with all required fields
- **Edit** — modify existing clinic details
- **View patients** — drill into [[09_Patient_Registry]] filtered by clinic
- **View samples** — drill into [[10_Biomarker_Engine]] filtered by clinic

---

## Data Relationships

```
Clinic (1) → (many) Patients → (many) Samples → (many) Biomarker Results
                               → (many) Experiments
```

The clinic is the top-level entity in the research data hierarchy. All downstream data (patients, samples, experiments, datasets) references back to the originating clinic.

---

## Cross-References

- Patient records by clinic: [[09_Patient_Registry]]
- Samples and biomarkers: [[10_Biomarker_Engine]]
- Experiments linked to clinics: [[11_Experiments_Datasets_Papers]]
- Dashboard metrics (clinic count): [[07_Dashboard_Analytics]]

---

**Links**: [[00_Vault_Index]] | [[09_Patient_Registry]] | [[10_Biomarker_Engine]] | [[07_Dashboard_Analytics]]

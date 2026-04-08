# Patient Registry

> Route: `/patients`
> Tagline: "De-identified patient records for research"

---

## Overview

The Patient Registry stores de-identified patient records for oral-systemic research. All records are stripped of personally identifiable information in compliance with research ethics and privacy regulations. Each patient is linked to a registered clinic (see [[08_Clinics_Registry]]) and can have associated biological samples and biomarker results.

---

## Patient Data Table

The registry displays a sortable, filterable table with the following columns:

| Column | Description | Example Values |
|--------|-------------|----------------|
| **Code** | Unique de-identified patient identifier | `PAT-0001` |
| **Clinic** | Originating research clinic (links to [[08_Clinics_Registry]]) | `CLN-001` |
| **Age** | Patient age at enrollment | `55` |
| **Sex** | Biological sex | `M` / `F` |
| **Smoking** | Smoking status | `Current` / `Former` / `Never` |
| **Diabetes** | Diabetes status | `Type 1` / `Type 2` / `None` |
| **Enrolled** | Date of enrollment | `2024-03-15` |
| **Status** | Record status | `Active` / `Completed` / `Withdrawn` |

---

## Actions

- **+ Add Patient** button — opens a form to register a new de-identified patient record
- **Edit** — modify existing patient details
- **View samples** — see all biological samples for this patient
- **View biomarkers** — drill into [[10_Biomarker_Engine]] for this patient's biomarker results

---

## Key Risk Factor Fields

The registry captures two critical risk factors that are central to the OVN Axis research framework:

### Smoking Status
Smoking is a major confounding variable in periodontal-systemic research. It independently increases both periodontal disease severity and cardiovascular risk, making it essential to record for proper statistical adjustment in analyses.

### Diabetes Status
The bidirectional relationship between diabetes and periodontal disease is well-established (see [[02_Education_Oral_Health_Bulletin#Series 1 Diabetes & Oral Health]]). Capturing diabetes status enables stratified analysis of biomarker responses to periodontal treatment.

---

## De-Identification Standards

All patient records in the registry are de-identified:
- No names, dates of birth, or social security numbers
- Age recorded as integer (not date of birth)
- Clinic codes used instead of facility names in patient-facing views
- Geographic information limited to clinic-level (country)

---

## Data Relationships

```
Patient → belongs to → Clinic
Patient → has many → Samples → has many → Biomarker Results
Patient → participates in → Experiments
Patient → eligible for → Clinical Trials (via Trial Matching)
```

---

## Cross-References

- Originating clinics: [[08_Clinics_Registry]]
- Biomarker results per patient: [[10_Biomarker_Engine]]
- Experiment participation: [[11_Experiments_Datasets_Papers]]
- Trial matching based on patient profiles: [[12_Trials_and_ML_Lab]]
- Dashboard patient count: [[07_Dashboard_Analytics]]
- Diabetes & oral health education: [[02_Education_Oral_Health_Bulletin]]

---

**Links**: [[00_Vault_Index]] | [[08_Clinics_Registry]] | [[10_Biomarker_Engine]] | [[12_Trials_and_ML_Lab]]

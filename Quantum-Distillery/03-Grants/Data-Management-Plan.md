---
status: "📝 Draft"
category: "grant"
type: "DMP"
due: "2026-04-06"
priority: "P1-High"
tags: [data-management, ARPA-H, Delphi, submission]
created: "2026-03-23"
updated: "2026-03-23"
---
# 📊 DATA MANAGEMENT PLAN

> [!info] Required supporting document for ARPA-H Delphi submission.

## Data Types & Sources

- **Probius QES spectral data** (vibrational spectra, fluorescence lifetime curves) — raw .csv and processed .json
- **Clinical metadata** (demographics, diagnosis, staging) — REDCap database, de-identified
- **QPI scores** (calculated from spectral data) — derived dataset, .csv
- **ScienceClaw swarm artifacts** (literature summaries, candidate analyses) — Markdown in Obsidian vault
- **Lanzara lab ultrafast spectroscopy data** (pump-probe time traces) — raw .hdf5

## Data Standards & Formats

- **Spectral data:** JCAMP-DX format for interoperability
- **Clinical data:** CDISC/CDASH standards where applicable
- **Metadata:** Dublin Core + custom ontology for quantum biology terms
- **Version control:** Git (all code, analysis scripts, vault content)

## Storage & Backup

- **Primary:** UCB Box Enterprise (HIPAA-compliant, encrypted at rest)
- **Backup:** UCSF secure research storage (daily automated sync)
- **Code/scripts:** GitHub private repository
- **Vault content:** Git-versioned Obsidian vault (current repo)

## Access & Sharing

- **Raw spectral data:** Available to team members via UCB Box shared folders
- **De-identified datasets:** Published to Zenodo/Dryad upon manuscript acceptance
- **QPI model code:** Open-sourced on GitHub after first publication
- **Swarm artifacts:** Internal only (may contain pre-publication hypotheses)
- **Embargo:** 12 months post-collection before public release

## Retention

- All data retained minimum 7 years per federal requirements
- Clinical data retained per UCSF IRB protocol specifications
- Spectral data archived in long-term cold storage after project completion

## Ethical & Legal Considerations

- All human subjects data collected under IRB-approved protocol (see [[04-Experiments/IRB-Biosafety-Pathway]])
- HIPAA de-identification applied before any data sharing
- No personally identifiable information in shared datasets
- AI-generated artifacts (ScienceClaw) clearly labeled as machine-generated

## Links

- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]
- [[04-Experiments/Probius-QES-Protocol]]
- [[04-Experiments/IRB-Biosafety-Pathway]]
- [[00-Flight-Deck/Submission-Package-Checklist]]

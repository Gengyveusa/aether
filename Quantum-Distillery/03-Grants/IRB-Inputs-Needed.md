---
status: "🟡 Awaiting Input"
category: "grant"
type: "IRB-memo"
due: "2026-04-01"
priority: "P0-Critical"
tags: [IRB, regulatory, ARPA-H, Delphi, compliance]
created: "2026-03-23"
updated: "2026-03-23"
---
# 📋 IRB INPUTS NEEDED

> [!warning] BLOCKER: No IRB protocol number or submission date exists. This document captures all inputs required to draft the IRB application.

## Study Objective

**Working title:** "Quantum Protection Index: Label-Free Spectroscopic Biomarkers for Cancer Detection and Aging Quantification"

**Primary objective:** Validate Probius QES-derived metabolite signatures (NADH, FAD, GSH, ATP) as composite biomarkers for cancer detection and biological aging quantification using the Quantum Protection Index (QPI).

**Secondary objectives:**
- Establish healthy reference ranges for QES spectral signatures
- Correlate QPI scores with clinical cancer staging and chronological/biological age
- Cross-validate QES measurements against ultrafast spectroscopy ground truth (Lanzara lab)

## Sample Source

| Source | Type | Volume | Processing |
|---|---|---|---|
| Finger-stick capillary blood | Plasma (after centrifugation) | 2–4 µL per test | Point-of-care or lab processing |
| Venous blood (optional) | Plasma | 5 mL draw → multiple aliquots | Standard phlebotomy |
| UCSF Biobank (retrospective) | Archived plasma | Existing samples | Already collected under prior IRB |

## Clinical Site(s)

| Site | Role | IRB of Record | Status |
|---|---|---|---|
| UCSF Clinical Research Center | Primary recruitment, sample collection | UCSF IRB | TBD — needs submission |
| UCB (Lanzara Lab) | Spectroscopy measurements only (no patient contact) | UCB CPHS | TBD — may be exempt (no human contact) |

## Participant Population

### Cohorts

| Cohort | N | Age Range | Description |
|---|---|---|---|
| Healthy controls | 50 | 20–85 | Age-stratified: 10 per decade (20s, 30s, 40s, 50s, 60s+) |
| Cancer cohort | 30 | 18+ | Mixed solid tumors; matched tumor/normal pairs |
| Aging cohort (Y2) | 100 | 25–85 | Prospective; longitudinal follow-up planned |
| Clinical pilot (Y3) | 200 | 18+ | Blinded evaluation cohort |

### Inclusion Criteria

- Age ≥ 18 years
- Able to provide informed consent
- Cancer cohort: confirmed histological diagnosis
- Healthy controls: no active cancer diagnosis, no immunosuppressive therapy

### Exclusion Criteria

- Unable to provide informed consent
- Active systemic infection at time of sample collection
- Anticoagulant therapy that contraindicates finger-stick (assess case-by-case)
- Prior participation in this study (for cross-sectional cohorts)
- Pregnancy (for initial validation cohorts — may be included in expanded pilot)

## Consent Pathway

- **Written informed consent** for all prospective participants
- **Broad consent** for biospecimen storage and future unspecified research use
- **HIPAA authorization** for access to relevant medical records (cancer staging, demographics)
- Consent forms in English; additional languages per UCSF CTSI translation services
- **Waiver of consent** sought for retrospective biobank samples (already collected under prior protocol)

## Specimen Handling

- All specimens handled under BSL-2 universal precautions
- Samples de-identified at point of collection using study ID codes
- Linking key maintained by Clinical Coordinator in UCSF-secured REDCap
- Specimens stored at -80°C at UCSF until measurement
- After QES measurement: residual specimens archived or destroyed per protocol

## De-identification Workflow

```
Participant → Consent → Assign Study ID → Collect Sample (labeled with Study ID only)
→ Clinical data extracted to REDCap (de-identified) → Sample to QES measurement
→ Spectral data linked to Study ID only → No PII in analysis datasets
```

- HIPAA Safe Harbor method applied to all shared datasets
- Linking key access restricted to Clinical Coordinator and PI

## Data Storage

| Data Type | Storage Location | Encryption | Access |
|---|---|---|---|
| Consent forms (paper) | UCSF locked filing cabinet | N/A | Clinical Coordinator |
| REDCap clinical data | UCSF REDCap (HIPAA-compliant) | At rest + in transit | Study team only |
| QES spectral data | UCB Box Enterprise | AES-256 at rest | PI, Postdoc 1 |
| Linking key | UCSF REDCap (separate project) | At rest + in transit | Clinical Coordinator, PI |

## Risk Level

- **Determination:** Minimal risk
- **Category:** Expedited review, Category 2 (collection of blood by finger stick or venipuncture)
- **Risks:** Minor discomfort from finger-stick; potential bruising; breach of confidentiality (mitigated by de-identification)
- **Benefits:** No direct benefit to participants; potential societal benefit from biomarker development

## Anticipated Submission Date

| Milestone | Target Date | Status |
|---|---|---|
| Draft IRB protocol | April 1, 2026 | **Not started — needs PI input** |
| PI review of protocol | April 3, 2026 | Pending |
| Submit to UCSF IRB | April 2026 (post-Delphi) | Planned |
| Submit to UCB CPHS (if needed) | April 2026 | Planned |
| Anticipated approval | June 2026 | Estimated (aligns with Y1 start) |

## Decisions Required This Week

1. **PI name for protocol** — Who is the PI of record at UCSF? (Needed for IRB application)
2. **UCSF clinical partner** — Name the faculty collaborator who will serve as site PI at UCSF
3. **Retrospective biobank access** — Do we have an existing IRB protocol covering UCSF biobank samples, or do we need a new application?
4. **UCB IRB scope** — Does Lanzara's lab work on de-identified samples require UCB CPHS approval, or is it exempt?
5. **Consent form template** — Use UCSF CTSI standard template or custom?
6. **Biospecimen banking** — Do we want broad consent for future unspecified research, or study-specific consent only?
7. **Compensation** — What participant compensation amount? ($25–50 per visit is typical for finger-stick studies)
8. **Pregnancy exclusion** — Confirm exclusion for initial cohorts; plan for inclusion in Y3 pilot?
9. **Submission timing** — Submit IRB before or after Delphi decision? (If before: April; if after: may delay Y1 start)

## Links

- [[04-Experiments/IRB-Biosafety-Pathway]]
- [[04-Experiments/Sample-Handling-SOP]]
- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]
- [[03-Grants/Solution-Summary-Gap-List]]

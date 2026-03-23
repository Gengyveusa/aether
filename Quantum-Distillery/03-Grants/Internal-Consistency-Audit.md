---
status: "🟢 Active"
category: "grant"
type: "audit"
due: "2026-03-29"
priority: "P1-High"
tags: [audit, consistency, grant, ARPA-H, Delphi]
created: "2026-03-23"
updated: "2026-03-23"
---
# 🔍 INTERNAL CONSISTENCY AUDIT

> Cross-document audit of all grant-facing materials in the Quantum Distillery vault.

## 1. Institution Names

| Entity | Variations Found | Canonical Form | Files Affected |
|---|---|---|---|
| UC Berkeley | "UCB", "UCB Physics" | **UCB** (University of California, Berkeley) | Consistent ✅ |
| UCSF | "UCSF" | **UCSF** (University of California, San Francisco) | Consistent ✅ |
| MIT | "MIT DMSE", "MIT CSAIL/CEE", "MIT" | **Inconsistent** ⚠️ | Solution Summary header vs Page 4 vs Collaboration Tracker |

**Finding:** Buehler's department is listed as:
- **"MIT DMSE"** — Solution Summary header (line 15), Collaboration Tracker title
- **"MIT CSAIL/CEE"** — Solution Summary Page 4 (lines 172, 192)
- **"MIT"** — Budget, DMP, various

**Resolution:** Normalize to **"MIT DMSE"** (Department of Materials Science and Engineering) across all documents. Buehler's primary appointment is DMSE; CSAIL is a secondary affiliation. Use "MIT DMSE" in formal grant text, "MIT" in shorthand references.

## 2. PI / Co-PI Naming

| Person | Role Variations | Canonical | Files Affected |
|---|---|---|---|
| PI | "[Name]", "PI" | **[Name] — PLACEHOLDER** ⚠️ | Solution Summary, Mission Overview, Sprint Planner |
| Alessandra Lanzara | "Lanzara", "Co-PI: Alessandra Lanzara", "Alessandra Lanzara (UCB Physics)" | Consistent ✅ | — |
| Markus Buehler | "Collaborator" (header) vs "Co-PI" (Page 4) | **Inconsistent** ⚠️ | Solution Summary |
| UCSF Clinical Partner | "Clinical Partners", "Clinical Partner (UCSF)" — no name | **PLACEHOLDER** ⚠️ | Solution Summary Page 4 |

**Finding:** Buehler is called "Collaborator" in the Solution Summary header (line 15) but "Co-PI" in Page 4 section headers (line 172). These have different grant implications.

**Resolution:** Decide Buehler's formal role — Collaborator vs Co-PI — and normalize. If Co-PI, he needs a biosketch and budget justification. If Collaborator, adjust Page 4 header.

## 3. Program Name References

| Reference | Variations | Canonical |
|---|---|---|
| ARPA-H program | "ARPA-H Delphi", "ARPA-H DELPHI", "ARPA-H Delphi Open BAA" | **ARPA-H Delphi** |
| Submission type | "Solution Summary", "6-Page Solution Summary" | **Solution Summary (6 pages)** |

**Status:** Mostly consistent. Normalize "DELPHI" → "Delphi" in Mission Overview.

## 4. Candidate Names

| Candidate | Variations | Status |
|---|---|---|
| GSH | "GSH", "GSH (Glutathione)", "GSH Redox Defense" | Consistent ✅ |
| NADH | "NADH", "NADH Redox State" | Consistent ✅ |
| Complex I | "Complex I", "Complex I (NADH Dehydrogenase)", "Complex I Activity" | QPI Model links to `Complex-I-Activity` but file is `Complex-I-NADH-Dehydrogenase` ⚠️ |
| NRF2 | "NRF2", "NRF2 (Antioxidant Master)" | Consistent ✅ |
| FAD | "FAD", "FAD (Flavoprotein State)" | Consistent ✅ |

**Finding:** QPI Model note links to `[[02-Candidates/Complex-I-Activity]]` but the actual file is `02-Candidates/Complex-I-NADH-Dehydrogenase.md`. Broken wikilink.

## 5. Timeline Dates

| Date/Milestone | Solution Summary | Sprint Planner | Aviation Checklist | IRB Pathway | Consistent? |
|---|---|---|---|---|---|
| Submission deadline | April 8, 2026 | April 8, 2026 | April 8, 2026 | — | ✅ |
| IRB submission | "Q2 Y3" (Page 3) | — | — | April 2026 | **Mismatch** ⚠️ |
| Countdown | — | "T-minus 17 days" | "T-minus 17 days" | — | Stale (was correct on Mar 22) |

**Finding:** The Solution Summary milestone table shows IRB approval at Q2 Y3 (for the clinical pilot), but the IRB Pathway note targets April 2026 for initial submission. These are different IRBs/phases — but this should be clarified to avoid confusion.

**Finding:** "T-minus 17 days" countdown is stale — was set on March 22. As of March 23, it should be T-minus 16. Consider making countdown dynamic via Dataview or accept it as a snapshot.

## 6. QPI Terminology

| Term | Solution Summary | QPI Model | Consistent? |
|---|---|---|---|
| QPI formula variables | `w_1, w_2, w_3, w_4` | `α, β, γ, δ` (new section) + `w_1…w_4` (original) | **Dual notation** ⚠️ |
| QPI interpretation | `QPI > 0` cancer, `QPI < 0` aging | `0.8–1.0` optimal, `<0.2` critical | **Two different scales** ⚠️ |
| QPI scoring | Signed axis (-∞ to +∞) | Normalized 0–1 scale | **Conflicting** ⚠️ |

**Finding — CRITICAL:** The Solution Summary and original QPI Model define QPI on a **signed axis** (positive = cancer, negative = aging, zero = homeostasis). But the new Mathematical Specification section defines QPI on a **0–1 normalized scale** (0.8–1.0 = healthy, <0.2 = critical). These are fundamentally different scales.

**Resolution:** Reconcile. Options:
- (A) QPI is 0–1 normalized, with cancer showing values >1.0 (amplification) — aligns with new spec
- (B) QPI is signed, with the 0–1 table being a separate "QPI Health Score" derived from the raw QPI
- Recommend option (A) and update the Solution Summary formula description to match.

## 7. QES / Probius Terminology

| Term | Usage | Consistent? |
|---|---|---|
| "Probius QES" | Used throughout | ✅ |
| "Quantum Emission Spectroscopy" | Seeding prompt, some notes | ✅ |
| "label-free vibrational spectroscopy" | Solution Summary | ✅ |
| Sample volume | "2–4 µL" everywhere | ✅ |

## 8. ScienceClaw Naming

| Term | Variations | Files |
|---|---|---|
| Platform name | "ScienceClaw × Infinite", "ScienceClaw x Infinite" | × vs x inconsistency ⚠️ |
| Folder | `05-Swarm/` | Consistent ✅ |

**Finding:** Minor — "×" (multiplication sign) vs "x" (letter x). Normalize to "×" (Unicode ×) in formal documents.

## 9. Broken Wikilinks

| Link | In File | Issue |
|---|---|---|
| `[[05-Swarm-Intelligence/ScienceClaw-Agent-Profile]]` | Solution Summary (Appendix D) | Folder is `05-Swarm/`, not `05-Swarm-Intelligence/` |
| `[[02-Candidates/Complex-I-Activity]]` | QPI Model | File is `Complex-I-NADH-Dehydrogenase` |
| `[[03-Grants/Executive-Summary]]` | Solution Summary Links | File is `Exec-Summary-ARPA-H-NSF` |

## Summary of Required Actions

| # | Issue | Severity | Action | Status |
|---|---|---|---|---|
| 1 | Buehler dept: DMSE vs CSAIL/CEE | P1 | Normalized to **MIT CEE** (primary appointment) with cross-appointment note | **Resolved** ✅ |
| 2 | Buehler role: Collaborator vs Co-PI | P1 | Standardized as **Co-PI** across all grant-facing docs | **Resolved** ✅ |
| 3 | QPI dual scale (signed vs 0–1) | **P0** | Adopted **0–1 normalized scale** as canonical; >1.0 = cancer amplification; updated Solution Summary + QPI Model | **Resolved** ✅ |
| 4 | QPI variable names (w vs α) | P1 | Normalized to **α, β, γ, δ** notation throughout | **Resolved** ✅ |
| 5 | Broken wikilink: 05-Swarm-Intelligence | P1 | Fixed to `05-Swarm/` (Phase 13) | **Resolved** ✅ |
| 6 | Broken wikilink: Complex-I-Activity | P1 | Fixed to `Complex-I-NADH-Dehydrogenase` (Phase 13) | **Resolved** ✅ |
| 7 | Broken wikilink: Executive-Summary | P2 | Fixed to `Exec-Summary-ARPA-H-NSF` (Phase 13) | **Resolved** ✅ |
| 8 | ScienceClaw × vs x | P2 | Normalized to **×** (Unicode) in Agent Profile | **Resolved** ✅ |
| 9 | T-minus countdown stale | P2 | Updated to T-minus 16 in Aviation Checklist | **Resolved** ✅ |
| 10 | IRB timeline ambiguity | P1 | Clarified in IRB-Inputs-Needed.md — initial IRB April 2026, pilot IRB Q2 Y3 | **Resolved** ✅ |
| 11 | PI name placeholder | P0 | Standardized to `[PI: TBD — requires human input]` across all files | **Mitigated** (awaiting PI) |

## Links

- [[03-Grants/ARPA-H-Delphi-Solution-Summary]]
- [[03-Grants/Solution-Summary-Gap-List]]
- [[01-Core-Thesis/Quantum-Protection-Index-QPI-Model]]
- [[00-Flight-Deck/Red-Team-Review-Checklist]]

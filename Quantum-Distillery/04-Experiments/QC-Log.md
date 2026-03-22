---
status: "Active"
category: "experiments"
type: "log"
due:
priority: "P1-High"
cancer-signature:
aging-signature:
proteins: []
swarm-artifact-id:
tags: [experiment, QC, quality-control, probius]
created: "2026-03-22"
updated: "2026-03-22"
---

# QC Log — Probius QES Quality Control

---

## QC Standards Reference

| Standard | NADH (μM) | FAD (μM) | ATP (μM) | GSH (μM) | Source |
|---|---|---|---|---|---|
| **QC-Low** | 5.0 ± 0.5 | 1.0 ± 0.1 | 10 ± 1.0 | 50 ± 5.0 | Probius Cat# QC-L-001 |
| **QC-Mid** | 50 ± 5.0 | 10 ± 1.0 | 100 ± 10 | 500 ± 50 | Probius Cat# QC-M-001 |
| **QC-High** | 500 ± 50 | 100 ± 10 | 1000 ± 100 | 5000 ± 500 | Probius Cat# QC-H-001 |

### Acceptance Criteria
- All values within **±2 SD** of target
- Triplicate CV < 10%
- Westgard rules: 1-3s reject, 2-2s reject, R-4s reject
- **If ANY QC fails**: recalibrate → rerun → if still fails, STOP and contact Probius

---

## Session Log Template

| Date | Operator | Strip Lot | QC Level | NADH | FAD | ATP | GSH | Result | Notes |
|---|---|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | Initials | LOT-XXX | Low/Mid/High | value | value | value | value | PASS/FAIL | |

---

## QC Session Records

### Session 001 — Instrument Validation
| Date | Operator | Strip Lot | QC Level | NADH | FAD | ATP | GSH | Result | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 2026-03-22 | — | — | — | — | — | — | — | PENDING | Awaiting QES reader delivery |

---

## Dataview: QC Sessions

```dataview
TABLE date AS "Date", status AS "Result", tags AS "Tags"
FROM "04-Experiments"
WHERE contains(tags, "QC")
SORT date DESC
```

---

## Trending Notes

Track QC drift over time:
- Plot NADH QC-Mid values by session (Levey-Jennings chart)
- Flag any systematic drift (>1 SD shift over 5+ sessions)
- Monthly recalibration with fresh QC lot
- Archive QC data in `Assets/data/qc-archive/` for audit trail

---

## Links

- [[Probius-QES-Protocol]]
- [[Lanzara-Pump-Probe-Protocol]]
- [[Mission-Overview]]

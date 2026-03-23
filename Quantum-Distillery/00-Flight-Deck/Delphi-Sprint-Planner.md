---
status: "🟢 Active"
category: "dashboard"
type: "sprint-planner"
due: "2026-04-08"
priority: "P0-Critical"
tags: [dashboard, sprint, arpa-h, delphi]
created: "2026-03-22"
updated: "2026-03-22"
---
# 🚀 ARPA-H DELPHI SPRINT PLANNER

> [!danger] DEADLINE: APRIL 8, 2026
> **T-MINUS 17 DAYS**
> All systems converge on a single 6-page Solution Summary submission.

## Sprint Schedule

| Week | Dates | Deliverables | Owner |
|---|---|---|---|
| **Week 1** | Mar 22–28 | Complete Core Thesis review; finalize candidate shortlist top 5; draft Solution Summary pages 1–3 | PI |
| **Week 2** | Mar 29–Apr 4 | Draft Solution Summary pages 4–6; collect Lanzara preliminary data; run QES calibration samples; internal review with Lanzara | PI + Lanzara |
| **Week 3** | Apr 5–7 | Final polish; format check 6-page limit; Co-PI sign-off | PI + Lanzara |
| **🔴 Apr 8** | **Apr 8** | **SUBMIT** | PI |

## Daily Checklist — Week 1 (Mar 22–28)

### Mon Mar 22
- [ ] Review Core Thesis note — verify 4 architectures documented
- [ ] Confirm 10 candidates have cancer/aging signatures

### Tue Mar 23
- [ ] Select top 5 candidates for Delphi narrative
- [ ] Outline Solution Summary pages 1–3

### Wed Mar 24
- [ ] Draft Page 1: Problem & Vision
- [ ] Draft Page 2: Technical Approach

### Thu Mar 25
- [ ] Draft Page 3: Preliminary Data
- [ ] Compile evidence table for top 5 candidates

### Fri Mar 26
- [ ] Internal review of pages 1–3
- [ ] Send draft to Lanzara for feedback

### Sat–Sun Mar 27–28
- [ ] Incorporate Lanzara feedback
- [ ] Buffer / catch-up

> [!warning] BLOCKERS
> - [ ] Lanzara preliminary data — awaiting lab schedule confirmation
> - [ ] QES calibration samples — need sample procurement
> - [ ] Co-PI availability for final review window (Apr 5–7)

## All Items Due Before Submission

```dataview
TABLE
  status AS "Status",
  due AS "Due",
  priority AS "Priority"
FROM ""
WHERE due < date("2026-04-09")
SORT due ASC
```

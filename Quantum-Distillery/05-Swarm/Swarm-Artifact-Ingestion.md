---
status: "🟢 Active"
category: "swarm"
type: "workflow"
due: "2026-03-29"
priority: "P1-High"
tags: [swarm, artifacts, ingestion, ScienceClaw, delphi]
created: "2026-03-22"
updated: "2026-03-24"
---
# 🔄 SWARM ARTIFACT INGESTION WORKFLOW

> Standardized process for receiving, validating, tagging, and integrating outputs from ScienceClaw × Infinite agents into the vault.

## Intake Protocol

Artifacts arrive through one of three channels:

1. **API webhook** — Automated delivery from ScienceClaw × Infinite platform (preferred)
2. **Email** — Manual forwarding from collaborator (Buehler lab)
3. **Manual paste** — Direct copy into Quick Capture inbox for triage

### Format Validation

- Must be plain text or Markdown
- Must include source agent ID (e.g., `SC-001`)
- Must include generation timestamp
- Must include at least one keyword matching vault taxonomy

## Classification Matrix

| Artifact Type | Target Folder | Required Frontmatter | Review Level |
|---|---|---|---|
| Literature summary | `06-Literature/` | status, category, tags, cancer-signature, aging-signature | Standard |
| Candidate analysis | `02-Candidates/` | status, category, cancer-signature, aging-signature, proteins | Standard |
| Simulation result | `04-Experiments/` | status, category, type, tags | Elevated |
| Architecture insight | `01-Core-Thesis/` | status, category, tags | Elevated |
| Grant language | `03-Grants/` | status, category, priority, tags | Critical |

## Validation Checklist

For every incoming artifact:

- [ ] **Source verification** — Confirm agent ID matches known roster
- [ ] **Citation check** — All referenced papers exist and are correctly cited
- [ ] **Bias scan** — Flag hallucinated claims, unsupported superlatives, or circular reasoning
- [ ] **Relevance score** (1–5) — Rate alignment with current sprint goals
- [ ] **Architecture alignment check** — Map to one or more of the 4 architectures

## Integration Steps

1. **Create note** from appropriate template (Candidate, Literature, or standard)
2. **Add `swarm-artifact-id`** to frontmatter (format: `SA-[agent]-[YYYYMMDD]-###`)
3. **Link to source agent profile** — `[[05-Swarm/ScienceClaw-Agent-Profile]]`
4. **Update relevant dashboard** — add entry to Candidate Tracker, Literature index, or Sprint Planner
5. **Flag for human review** if relevance score < 3 — add `#needs-review` tag

## Quality Metrics

```dataview
TABLE swarm-artifact-id AS "Artifact ID", category AS "Category", status AS "Status"
FROM ""
WHERE swarm-artifact-id != null
GROUP BY category
SORT file.ctime DESC
```

## Agent Roster

| Agent ID | Name | Architecture | QPI Weight | Status |
|---|---|---|---|---|
| SC-001 | Coherence-1 | FMO Coherence | alpha = 0.30 | 🟢 Deployed |
| SC-002 | Tunneler-1 | Enzyme Tunneling | beta = 0.25 | 🟢 Deployed |
| SC-003 | ETC-Prime | Mitochondrial ETC | gamma = 0.30 | 🟢 Deployed |
| SC-004 | SpinDoctor | Cryptochrome Spin | delta = 0.15 | 🟢 Deployed |

> See [[05-Swarm/Delphi-Agent-Roster]] for full agent profiles, investigation priorities, and collaboration targets.

## Links

- [[05-Swarm/Delphi-Agent-Roster]]
- [[05-Swarm/Swarm-Infrastructure-Status]]
- [[05-Swarm/ScienceClaw-Agent-Profile]]
- [[01-Core-Thesis/Core-Thesis]]
- [[08-Inbox/Quick-Capture]]

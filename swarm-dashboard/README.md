# Quantum Distillery — Swarm Monitor

> LCARS-themed real-time dashboard for monitoring and controlling Quantum Distillery AI swarm agents.

![LCARS Dashboard](https://img.shields.io/badge/theme-LCARS%20Star%20Trek-FF9900?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Static HTML](https://img.shields.io/badge/static%20export-available-66FF66?style=for-the-badge)

---

## Quick Start

### Option A — Static HTML (No Server Required)

Open `swarm-dashboard.html` directly in any modern browser:

```bash
# macOS
open swarm-dashboard/swarm-dashboard.html

# Linux
xdg-open swarm-dashboard/swarm-dashboard.html

# Windows
start swarm-dashboard\swarm-dashboard.html
```

The static file is fully self-contained — all CSS, JavaScript, and demo data are embedded inline.

---

### Option B — Next.js Development Server

```bash
cd swarm-dashboard
npm install
npm run dev
# → http://localhost:3000
```

---

### Option C — Deploy to Vercel

```bash
cd swarm-dashboard
npx vercel --prod
```

Or connect the repository in the [Vercel dashboard](https://vercel.com/new) and set the root directory to `swarm-dashboard/`.

**Required environment variable:**

| Variable | Description |
|---|---|
| `SWARM_WEBHOOK_SECRET` | Bearer token for securing the `/api/webhooks/ingest` endpoint (optional) |

> **Vercel secret setup:** The `vercel.json` references `@swarm_webhook_secret`. Before deploying, add this secret via the Vercel CLI: `vercel secrets add swarm_webhook_secret your-secret-value`, or set it in the Vercel project dashboard under Settings → Environment Variables.

---

## Architecture

```
swarm-dashboard/
├── swarm-dashboard.html          # Self-contained static export (single file, no server needed)
├── vercel.json                   # Vercel deployment configuration
├── README.md                     # This file
│
│   ── Next.js source (swarm-dashboard-standalone branch) ──
├── package.json
├── next.config.js
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main dashboard page
│   │   ├── layout.tsx
│   │   ├── globals.css           # LCARS CSS variables & animations
│   │   └── api/
│   │       ├── agents/           # GET active agent roster
│   │       ├── artifacts/        # GET artifact feed
│   │       ├── logs/             # GET system logs
│   │       ├── qpi/              # GET QPI time-series
│   │       ├── seed/             # POST seeding prompt generator
│   │       └── webhooks/ingest/  # POST webhook receiver
│   ├── components/
│   │   ├── LCARSHeader.tsx       # Animated header with live stardate clock
│   │   ├── AgentCard.tsx         # Per-agent status card with activate/pause/seed
│   │   ├── SwarmStats.tsx        # Top stats bar (6 KPIs)
│   │   ├── QPIChart.tsx          # SVG chart for Quantum Protection Index
│   │   ├── ArtifactFeed.tsx      # Scrollable artifact ingestion feed
│   │   ├── BiomarkerTracker.tsx  # Evidence bars per biomarker candidate
│   │   ├── QueryTracker.tsx      # Priority query completion tracker
│   │   ├── IngestionPipeline.tsx # Pipeline stage indicator
│   │   ├── ArtifactSubmitForm.tsx# Manual artifact submission form
│   │   └── SeedingPromptPanel.tsx# Master prompt generator
│   └── lib/
│       ├── swarm-data.ts         # Mock data, types, QPI generator
│       └── artifact-parser.ts    # YAML/JSON artifact parser
└── ...
```

> **Note:** `swarm-dashboard.html` is a complete standalone export of the dashboard. The Next.js source files (listed above) are available on the `swarm-dashboard-standalone` branch and are required only for the full server-side deployment with live API routes.

---

## Dashboard Features

| Panel | Description |
|---|---|
| **LCARS Header** | Live clock, stardate, and mission designation |
| **Swarm Stats** | Active agents, total artifacts, avg evidence score, uptime, deadline countdown |
| **Agent Roster** | Per-agent cards with status, targets, evidence score, and Activate/Pause/Seed controls |
| **QPI Monitor** | 48-hour Quantum Protection Index chart with FMO/Tunnel/ETC/Spin sub-indices |
| **Ingestion Pipeline** | Visual pipeline stages from webhook receive to vault write |
| **Artifact Feed** | Scrollable real-time artifact feed with relevance scores and signatures |
| **Biomarker Tracker** | Evidence bar chart per biomarker candidate with cancer/aging signal indicators |
| **Priority Queries** | Query completion tracker with paper counts |
| **Webhook Config** | Live webhook configuration and connection panel |
| **Activity Log** | Timestamped system log |

---

## Webhook API

### Endpoint

```
POST /api/webhooks/ingest
```

### Authentication (optional)

```
Authorization: Bearer <SWARM_WEBHOOK_SECRET>
```

### Payload Formats

#### Structured JSON

```json
{
  "agentId": "SC-001",
  "artifacts": [
    {
      "title": "NADH redox state in cancer metabolism",
      "type": "literature-summary",
      "targetFolder": "06-Literature",
      "relevanceScore": 5,
      "architectureAlignment": ["FMO coherence", "ETC quantum transfer"],
      "status": "ingested",
      "cancerSignature": "NADH amplified in 83% of solid tumors",
      "agingSignature": "NADH:NAD+ ratio inverts with age"
    }
  ]
}
```

#### Raw YAML Text

```json
{
  "text": "---\ntitle: NADH redox state\ntype: literature-summary\n...",
  "agentId": "SC-001"
}
```

### Response

```json
{
  "ok": true,
  "ingested": 1,
  "artifactIds": ["SA-SC001-20260327-001"]
}
```

### Artifact Types

| Type | Description |
|---|---|
| `literature-summary` | Peer-reviewed paper summary |
| `candidate-analysis` | Biomarker candidate evaluation |
| `architecture-insight` | Quantum architecture finding |
| `grant-language` | ARPA-H/grant narrative fragment |
| `simulation-result` | Computational simulation output |

### Agent Identifiers

| ID | Agent | Platform |
|---|---|---|
| `SC-001` | ScienceClaw x Infinite | MIT Buehler Lab |
| `SC-002` | DeepMine Quantum | Quantum Distillery |
| `SC-003` | GrantForge AI | Quantum Distillery |

---

## QPI Formula

```
QPI = α·A_FMO + β·A_TUNNEL + γ·A_ETC + δ·A_SPIN

α = 0.30  (FMO quantum coherence)
β = 0.25  (enzyme tunneling efficiency)
γ = 0.30  (ETC quantum transfer)
δ = 0.15  (cryptochrome spin coherence)

Thresholds:
  QPI ≥ 0.75 → STRONG signal
  QPI ≥ 0.65 → MODERATE signal
  QPI < 0.55 → WEAK signal
```

---

## LCARS Theme

The dashboard uses the Star Trek LCARS (Library Computer Access/Retrieval System) aesthetic:

| Variable | Color | Use |
|---|---|---|
| `--lcars-orange` | `#FF9900` | Primary accent, headers, rails |
| `--lcars-gold` | `#FFCC66` | Body text, panel labels |
| `--lcars-green` | `#66FF66` | Active/success states |
| `--lcars-amber` | `#FFCC00` | Idle/warning states |
| `--lcars-cyan` | `#99CCFF` | Info, secondary values |
| `--lcars-blue` | `#9999FF` | Architecture annotations |
| `--lcars-purple` | `#CC99CC` | Header corners, spin index |
| `--lcars-red` | `#CC6666` | Error/offline states |

---

## Local SQLite Persistence (Next.js app only)

The Next.js server-side app uses SQLite (`better-sqlite3`) for artifact persistence. The database file is created automatically at `./swarm.db` on first run.

> The static HTML version (`swarm-dashboard.html`) uses in-memory state only — data resets on page reload. For persistent storage, use the full Next.js deployment.

---

## Contributing

1. Fork the repository
2. Work from `swarm-dashboard-standalone` branch
3. Run `npm run dev` for live development
4. Submit a pull request with your changes

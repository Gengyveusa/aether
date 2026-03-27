// Swarm data types and simulated state for the Quantum Distillery dashboard

export interface SwarmAgent {
  id: string;
  name: string;
  platform: string;
  status: "active" | "idle" | "seeding" | "error" | "offline";
  mission: string;
  targets: string[];
  constraints: string;
  artifactsProduced: number;
  lastActivity: string;
  uptimeHours: number;
  queriesCompleted: number;
  totalQueries: number;
  evidenceScore: number;
}

export interface SwarmArtifact {
  id: string;
  agentId: string;
  type: "literature-summary" | "candidate-analysis" | "architecture-insight" | "grant-language" | "simulation-result";
  targetFolder: string;
  title: string;
  relevanceScore: number;
  architectureAlignment: string[];
  status: "ingested" | "validating" | "review" | "flagged" | "rejected";
  timestamp: string;
  cancerSignature: string;
  agingSignature: string;
}

export interface BiomarkerCandidate {
  name: string;
  symbol: string;
  architectureLink: string;
  qpiWeight: number;
  weightRank: number;
  cancerSignal: "amplified" | "elevated" | "variable";
  agingSignal: "decohered" | "declined" | "impaired";
  evidenceLevel: number;
  papersFound: number;
  transform: string;
  status: "validated" | "in-progress" | "pending";
}

export interface QPIReading {
  timestamp: string;
  qpi: number;
  fmo: number;
  tunnel: number;
  etc: number;
  spin: number;
}

export const AGENTS: SwarmAgent[] = [
  {
    id: "SC-001",
    name: "ScienceClaw x Infinite",
    platform: "MIT Buehler Lab",
    status: "active",
    mission: "Mine quantum biology + oncology + geroscience for opposing cancer/aging signatures across 4 architectures",
    targets: ["NADH", "FAD", "ATP", "GSH"],
    constraints: "Peer-reviewed, 2015-2026, evidence score >= 0.6",
    artifactsProduced: 23,
    lastActivity: new Date().toISOString(),
    uptimeHours: 127.4,
    queriesCompleted: 5,
    totalQueries: 7,
    evidenceScore: 0.78,
  },
  {
    id: "SC-002",
    name: "DeepMine Quantum",
    platform: "Quantum Distillery",
    status: "idle",
    mission: "Cross-validate QPI model predictions against published cohort datasets",
    targets: ["Complex I", "CoQ10", "CytC"],
    constraints: "Human studies only, 2018-2026",
    artifactsProduced: 0,
    lastActivity: "—",
    uptimeHours: 0,
    queriesCompleted: 0,
    totalQueries: 5,
    evidenceScore: 0,
  },
  {
    id: "SC-003",
    name: "GrantForge AI",
    platform: "Quantum Distillery",
    status: "offline",
    mission: "Generate and refine ARPA-H Delphi submission language from vault artifacts",
    targets: ["ARPA-H Delphi", "Grant Language"],
    constraints: "Must reference vault citations only",
    artifactsProduced: 0,
    lastActivity: "—",
    uptimeHours: 0,
    queriesCompleted: 0,
    totalQueries: 3,
    evidenceScore: 0,
  },
];

export const ARTIFACTS: SwarmArtifact[] = [
  {
    id: "SA-SC001-20260325-001",
    agentId: "SC-001",
    type: "literature-summary",
    targetFolder: "06-Literature",
    title: "NADH/FAD ratio changes in breast cancer tissue via FLIM (2023)",
    relevanceScore: 5,
    architectureAlignment: ["FMO coherence", "ETC quantum transfer"],
    status: "ingested",
    timestamp: "2026-03-25T14:23:00Z",
    cancerSignature: "Elevated NADH free/bound ratio; enhanced coherence lifetime",
    agingSignature: "Decreased FAD fluorescence in aged controls",
  },
  {
    id: "SA-SC001-20260325-002",
    agentId: "SC-001",
    type: "candidate-analysis",
    targetFolder: "02-Candidates",
    title: "GSH/GSSG redox ratio as plasma biomarker for colorectal cancer",
    relevanceScore: 4,
    architectureAlignment: ["Enzyme tunneling"],
    status: "validating",
    timestamp: "2026-03-25T15:10:00Z",
    cancerSignature: "GSH depletion with GSSG accumulation in tumor microenvironment",
    agingSignature: "Gradual GSH decline with age correlates with tunneling efficiency loss",
  },
  {
    id: "SA-SC001-20260325-003",
    agentId: "SC-001",
    type: "architecture-insight",
    targetFolder: "01-Core-Thesis",
    title: "Cryptochrome CRY1 overexpression in hepatocellular carcinoma",
    relevanceScore: 4,
    architectureAlignment: ["Cryptochrome spin coherence"],
    status: "ingested",
    timestamp: "2026-03-25T16:45:00Z",
    cancerSignature: "CRY1 amplification drives aberrant circadian signaling",
    agingSignature: "CRY2 decline in aged liver tissue",
  },
  {
    id: "SA-SC001-20260324-001",
    agentId: "SC-001",
    type: "literature-summary",
    targetFolder: "06-Literature",
    title: "Complex I dysfunction in Parkinson's and aging: meta-analysis",
    relevanceScore: 5,
    architectureAlignment: ["ETC quantum transfer"],
    status: "ingested",
    timestamp: "2026-03-24T09:30:00Z",
    cancerSignature: "Complex I hyperactivity in glioblastoma",
    agingSignature: "Progressive Complex I decline >60y with impaired electron tunneling",
  },
  {
    id: "SA-SC001-20260324-002",
    agentId: "SC-001",
    type: "literature-summary",
    targetFolder: "06-Literature",
    title: "Probius QES validation: NADH fluorescence lifetime in human plasma",
    relevanceScore: 5,
    architectureAlignment: ["FMO coherence", "ETC quantum transfer"],
    status: "ingested",
    timestamp: "2026-03-24T11:15:00Z",
    cancerSignature: "Discriminates cancer plasma from healthy with AUC 0.82",
    agingSignature: "Age-dependent signal decay correlates with NAD+ decline",
  },
  {
    id: "SA-SC001-20260323-001",
    agentId: "SC-001",
    type: "candidate-analysis",
    targetFolder: "02-Candidates",
    title: "ATP energy charge as metabolic health indicator across cancer types",
    relevanceScore: 3,
    architectureAlignment: ["ETC quantum transfer", "Enzyme tunneling"],
    status: "review",
    timestamp: "2026-03-23T10:00:00Z",
    cancerSignature: "Warburg effect elevates glycolytic ATP production",
    agingSignature: "Mitochondrial ATP output declines with age",
  },
  {
    id: "SA-SC001-20260323-002",
    agentId: "SC-001",
    type: "grant-language",
    targetFolder: "03-Grants",
    title: "ARPA-H Delphi innovation narrative: quantum biology angle",
    relevanceScore: 4,
    architectureAlignment: ["FMO coherence", "Enzyme tunneling", "ETC quantum transfer", "Cryptochrome spin coherence"],
    status: "ingested",
    timestamp: "2026-03-23T14:30:00Z",
    cancerSignature: "—",
    agingSignature: "—",
  },
];

export const BIOMARKERS: BiomarkerCandidate[] = [
  {
    name: "NADH Redox State",
    symbol: "NADH",
    architectureLink: "ETC + Tunneling",
    qpiWeight: 0.30,
    weightRank: 2,
    cancerSignal: "amplified",
    agingSignal: "declined",
    evidenceLevel: 0.85,
    papersFound: 8,
    transform: "log-ratio",
    status: "validated",
  },
  {
    name: "FAD Flavoprotein State",
    symbol: "FAD",
    architectureLink: "Cryptochrome + ETC",
    qpiWeight: 0.15,
    weightRank: 3,
    cancerSignal: "elevated",
    agingSignal: "declined",
    evidenceLevel: 0.72,
    papersFound: 5,
    transform: "z-score",
    status: "in-progress",
  },
  {
    name: "ATP Energy Charge",
    symbol: "ATP",
    architectureLink: "ETC + Tunneling",
    qpiWeight: 0.10,
    weightRank: 4,
    cancerSignal: "variable",
    agingSignal: "declined",
    evidenceLevel: 0.60,
    papersFound: 4,
    transform: "log-ratio",
    status: "in-progress",
  },
  {
    name: "GSH Redox Defense",
    symbol: "GSH",
    architectureLink: "ALL (Keystone)",
    qpiWeight: 0.25,
    weightRank: 1,
    cancerSignal: "amplified",
    agingSignal: "decohered",
    evidenceLevel: 0.90,
    papersFound: 11,
    transform: "log-ratio",
    status: "validated",
  },
  {
    name: "Complex I (NADH Dehydrogenase)",
    symbol: "CI",
    architectureLink: "ETC quantum transfer",
    qpiWeight: 0.10,
    weightRank: 5,
    cancerSignal: "amplified",
    agingSignal: "impaired",
    evidenceLevel: 0.68,
    papersFound: 6,
    transform: "z-score",
    status: "in-progress",
  },
  {
    name: "Coenzyme Q10",
    symbol: "CoQ10",
    architectureLink: "ETC quantum transfer",
    qpiWeight: 0.05,
    weightRank: 7,
    cancerSignal: "elevated",
    agingSignal: "declined",
    evidenceLevel: 0.55,
    papersFound: 3,
    transform: "z-score",
    status: "pending",
  },
  {
    name: "Cytochrome C",
    symbol: "CytC",
    architectureLink: "ETC quantum transfer",
    qpiWeight: 0.03,
    weightRank: 8,
    cancerSignal: "elevated",
    agingSignal: "declined",
    evidenceLevel: 0.50,
    papersFound: 2,
    transform: "z-score",
    status: "pending",
  },
  {
    name: "NRF2 Antioxidant Master",
    symbol: "NRF2",
    architectureLink: "Enzyme tunneling",
    qpiWeight: 0.01,
    weightRank: 9,
    cancerSignal: "amplified",
    agingSignal: "declined",
    evidenceLevel: 0.45,
    papersFound: 2,
    transform: "z-score",
    status: "pending",
  },
  {
    name: "SIRT3 Mitochondrial Sirtuin",
    symbol: "SIRT3",
    architectureLink: "ETC + Tunneling",
    qpiWeight: 0.01,
    weightRank: 6,
    cancerSignal: "variable",
    agingSignal: "declined",
    evidenceLevel: 0.48,
    papersFound: 3,
    transform: "z-score",
    status: "pending",
  },
];

// Simulated QPI time-series data
export function generateQPITimeSeries(hours: number = 48): QPIReading[] {
  const readings: QPIReading[] = [];
  const now = Date.now();
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now - i * 3600000).toISOString();
    const base = 0.72;
    const noise = () => (Math.random() - 0.5) * 0.08;
    const fmo = 0.30 + noise();
    const tunnel = 0.25 + noise();
    const etc_ = 0.30 + noise();
    const spin = 0.15 + noise();
    readings.push({
      timestamp: t,
      qpi: +(base + noise()).toFixed(3),
      fmo: +fmo.toFixed(3),
      tunnel: +tunnel.toFixed(3),
      etc: +etc_.toFixed(3),
      spin: +spin.toFixed(3),
    });
  }
  return readings;
}

// Priority queries for SC-001
export const PRIORITY_QUERIES = [
  { id: 1, query: "NADH/FAD ratio changes in cancer vs healthy tissue (2020-2026)", status: "completed" as const, papers: 8 },
  { id: 2, query: "GSH/GSSG redox state as cancer biomarker in blood/plasma", status: "completed" as const, papers: 11 },
  { id: 3, query: "Complex I dysfunction in aging (human studies preferred)", status: "completed" as const, papers: 6 },
  { id: 4, query: "Cryptochrome CRY1/CRY2 expression in cancer tissue vs normal", status: "completed" as const, papers: 4 },
  { id: 5, query: "Probius QES or similar quantum emission spectroscopy validation", status: "completed" as const, papers: 2 },
  { id: 6, query: "Competing quantum biology diagnostic platforms", status: "in-progress" as const, papers: 1 },
  { id: 7, query: "ARPA-H Delphi program requirements and funded examples", status: "pending" as const, papers: 0 },
];

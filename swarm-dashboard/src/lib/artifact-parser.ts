// Parses YAML-formatted artifact text from any agent source into a SwarmArtifact
import type { SwarmArtifact } from "./swarm-data";

const VALID_TYPES: SwarmArtifact["type"][] = [
  "literature-summary",
  "candidate-analysis",
  "architecture-insight",
  "grant-language",
  "simulation-result",
];

const FOLDER_MAP: Record<string, string> = {
  "06-Literature": "06-Literature",
  "02-Candidates": "02-Candidates",
  "01-Core-Thesis": "01-Core-Thesis",
  "03-Grants": "03-Grants",
  "04-Experiments": "04-Experiments",
};

const VALID_ARCHITECTURES = [
  "FMO coherence",
  "Enzyme tunneling",
  "ETC quantum transfer",
  "Cryptochrome spin coherence",
];

export interface ParsedArtifact {
  artifact: SwarmArtifact;
  rawYaml: string;
  warnings: string[];
  isValid: boolean;
}

export function parseArtifactYaml(text: string, sourceAgentId?: string): ParsedArtifact {
  const warnings: string[] = [];
  const now = new Date().toISOString();

  // Extract YAML frontmatter if present
  let yamlBlock = text;
  const fmMatch = text.match(/^---\s*\n([\s\S]*?)\n---/);
  if (fmMatch) {
    yamlBlock = fmMatch[1];
  }

  // Parse key-value pairs from YAML-like text
  const getValue = (key: string): string => {
    const re = new RegExp(`^${key}:\\s*(.+)$`, "mi");
    const match = yamlBlock.match(re) || text.match(re);
    return match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  };

  const getList = (key: string): string[] => {
    const raw = getValue(key);
    if (!raw) return [];
    // Handle [item1, item2] or - item format
    if (raw.startsWith("[")) {
      return raw.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    }
    // Handle multi-line list
    const listRe = new RegExp(`${key}:\\s*\\n((?:\\s*-\\s*.+\\n?)*)`, "mi");
    const listMatch = text.match(listRe);
    if (listMatch) {
      return listMatch[1].split("\n").filter((l) => l.trim().startsWith("-")).map((l) => l.replace(/^\s*-\s*/, "").trim());
    }
    return [raw];
  };

  // Extract fields
  const artifactId = getValue("swarm-artifact-id") || getValue("artifact-id") || `SA-${sourceAgentId || "UNKNOWN"}-${Date.now()}`;
  const agentId = sourceAgentId || getValue("agent-id") || artifactId.split("-")[1] || "UNKNOWN";
  const rawType = getValue("artifact-type") || getValue("type") || "";
  const rawFolder = getValue("target-folder") || getValue("folder") || "";
  const relevanceStr = getValue("relevance-score") || getValue("relevance") || "3";
  const architectures = getList("architecture-alignment") || getList("architectures");

  // Validate type
  let type: SwarmArtifact["type"] = "literature-summary";
  if (VALID_TYPES.includes(rawType as SwarmArtifact["type"])) {
    type = rawType as SwarmArtifact["type"];
  } else if (rawType) {
    warnings.push(`Unknown artifact type "${rawType}", defaulting to literature-summary`);
  } else {
    warnings.push("No artifact-type specified, defaulting to literature-summary");
  }

  // Validate folder
  let targetFolder = FOLDER_MAP[rawFolder] || "";
  if (!targetFolder) {
    // Infer from type
    const typeToFolder: Record<string, string> = {
      "literature-summary": "06-Literature",
      "candidate-analysis": "02-Candidates",
      "architecture-insight": "01-Core-Thesis",
      "grant-language": "03-Grants",
      "simulation-result": "04-Experiments",
    };
    targetFolder = typeToFolder[type] || "06-Literature";
    if (rawFolder) warnings.push(`Unknown folder "${rawFolder}", inferred ${targetFolder} from type`);
  }

  // Validate relevance score
  const relevanceScore = Math.min(5, Math.max(1, parseInt(relevanceStr, 10) || 3));

  // Validate architectures
  const validArchitectures = architectures.filter((a) => {
    const match = VALID_ARCHITECTURES.find((va) => va.toLowerCase() === a.toLowerCase());
    if (!match && a) warnings.push(`Unknown architecture "${a}"`);
    return !!match;
  });
  if (validArchitectures.length === 0) {
    warnings.push("No valid architecture alignment found");
  }

  // Extract title (look for markdown heading or title field)
  const titleMatch = text.match(/^#+\s+(.+)$/m);
  const title = getValue("title") || (titleMatch ? titleMatch[1] : "Untitled artifact");

  // Extract cancer/aging signatures
  const cancerSig = getValue("cancer-signature") || extractSection(text, "Cancer Signature") || "";
  const agingSig = getValue("aging-signature") || extractSection(text, "Aging Signature") || "";

  // Validate agent ID format
  if (agentId === "UNKNOWN") {
    warnings.push("No agent ID found — artifact source unverified");
  }

  const artifact: SwarmArtifact = {
    id: artifactId,
    agentId,
    type,
    targetFolder,
    title,
    relevanceScore,
    architectureAlignment: validArchitectures.length > 0 ? validArchitectures : ["Unclassified"],
    status: relevanceScore < 3 ? "review" : "validating",
    timestamp: now,
    cancerSignature: cancerSig,
    agingSignature: agingSig,
  };

  return {
    artifact,
    rawYaml: text,
    warnings,
    isValid: warnings.length <= 2 && agentId !== "UNKNOWN",
  };
}

function extractSection(text: string, heading: string): string {
  const re = new RegExp(`(?:^|\\n)\\*?\\*?${heading}\\*?\\*?:?\\s*(.+)`, "i");
  const match = text.match(re);
  return match ? match[1].trim() : "";
}

// Generate the seeding prompt for any agent, making it agent-agnostic
export function generateSeedingPrompt(agentId: string, agentName: string, customQueries?: string[]): string {
  const defaultQueries = [
    "Search for papers showing NADH/FAD ratio changes in cancer vs healthy tissue (2020-2026)",
    "Search for papers on GSH/GSSG redox state as cancer biomarker in blood/plasma",
    "Search for evidence of Complex I dysfunction in aging (human studies preferred)",
    "Search for cryptochrome CRY1/CRY2 expression in cancer tissue vs normal",
    "Search for Probius QES or similar quantum emission spectroscopy validation studies",
    "Search for competing quantum biology diagnostic platforms or vibrational spectroscopy for cancer detection",
    "Search for ARPA-H Delphi program requirements, review criteria, and funded project examples",
  ];

  const queries = customQueries && customQueries.length > 0 ? customQueries : defaultQueries;

  return `# QUANTUM DISTILLERY SWARM AGENT — ${agentName} (${agentId})

You are a research agent deployed for the Quantum Distillery project. Your mission is to mine scientific literature and generate structured research artifacts.

## Core Thesis

Cancer amplifies and aging decoheres the same 4 quantum protection architectures:

1. **FMO coherence** (NADH/FAD energy transfer)
2. **Enzyme tunneling** (GSH redox, hydrogen transfer)
3. **Mitochondrial ETC quantum electron/proton transfer** (Complex I, CoQ10, CytC)
4. **Cryptochrome spin coherence** (radical pair mechanism)

## Your Queries

${queries.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## OUTPUT FORMAT — CRITICAL

For EACH paper or finding, produce a structured artifact in this EXACT format:

\`\`\`yaml
swarm-artifact-id: ${agentId}-[YYYYMMDD]-[NNN]
agent-id: ${agentId}
artifact-type: literature-summary | candidate-analysis | architecture-insight
target-folder: 06-Literature | 02-Candidates | 01-Core-Thesis
relevance-score: 1-5
architecture-alignment: [FMO coherence, Enzyme tunneling, ETC quantum transfer, Cryptochrome spin coherence]
title: "Full title of artifact"
cancer-signature: "One-line cancer finding"
aging-signature: "One-line aging finding"
\`\`\`

Then include: Authors, Journal/Year, Key Findings (3-4 bullets), QPI Relevance.

## Quality Filters

- Prefer human studies over animal/in-vitro
- Prefer 2020-2026 publications
- Minimum relevance score 3 for inclusion
- Flag contradictory evidence explicitly
- Always note sample size and study design

## IMPORTANT

Produce MULTIPLE artifacts per response. Each artifact must have its own YAML block. Use the exact field names above so they can be automatically parsed.`;
}

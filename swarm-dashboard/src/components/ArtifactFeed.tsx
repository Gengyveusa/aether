"use client";

import { useEffect, useState, useRef } from "react";
import type { SwarmArtifact } from "@/lib/swarm-data";
import { ARTIFACTS } from "@/lib/swarm-data";

const TYPE_COLORS: Record<SwarmArtifact["type"], string> = {
  "literature-summary": "text-lcars-cyan border-lcars-cyan/30",
  "candidate-analysis": "text-lcars-green border-lcars-green/30",
  "architecture-insight": "text-lcars-purple border-lcars-purple/30",
  "grant-language": "text-lcars-gold border-lcars-gold/30",
  "simulation-result": "text-lcars-orange border-lcars-orange/30",
};

const STATUS_BADGE: Record<SwarmArtifact["status"], { color: string; label: string }> = {
  ingested: { color: "bg-lcars-green/20 text-lcars-green", label: "INGESTED" },
  validating: { color: "bg-lcars-cyan/20 text-lcars-cyan animate-pulse", label: "VALIDATING" },
  review: { color: "bg-lcars-amber/20 text-lcars-amber", label: "REVIEW" },
  flagged: { color: "bg-lcars-red/20 text-lcars-red", label: "FLAGGED" },
  rejected: { color: "bg-gray-500/20 text-gray-400", label: "REJECTED" },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function RelevanceBar({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-4 rounded-sm ${
            i <= score ? "bg-lcars-orange" : "bg-lcars-orange/15"
          }`}
        />
      ))}
    </div>
  );
}

export default function ArtifactFeed() {
  const [artifacts, setArtifacts] = useState<SwarmArtifact[]>(ARTIFACTS);
  const [filter, setFilter] = useState<string>("all");
  const feedRef = useRef<HTMLDivElement>(null);

  // Simulate new artifacts arriving
  useEffect(() => {
    const newArtifactTemplates: Partial<SwarmArtifact>[] = [
      {
        type: "literature-summary",
        targetFolder: "06-Literature",
        title: "Quantum tunneling rates in human liver Complex I: age-dependent decline",
        relevanceScore: 4,
        architectureAlignment: ["Enzyme tunneling", "ETC quantum transfer"],
        cancerSignature: "Preserved tunneling efficiency in hepatocellular carcinoma",
        agingSignature: "30% decline in tunneling rate >70y",
      },
      {
        type: "candidate-analysis",
        targetFolder: "02-Candidates",
        title: "CoQ10 supplementation restores ETC quantum efficiency in aged mice",
        relevanceScore: 3,
        architectureAlignment: ["ETC quantum transfer"],
        cancerSignature: "No significant effect on tumor models",
        agingSignature: "Partial restoration of electron transfer rates",
      },
      {
        type: "architecture-insight",
        targetFolder: "01-Core-Thesis",
        title: "Radical pair mechanism in human retinal cryptochrome: first direct measurement",
        relevanceScore: 5,
        architectureAlignment: ["Cryptochrome spin coherence"],
        cancerSignature: "Unknown",
        agingSignature: "Spin coherence lifetime decreases with age",
      },
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= newArtifactTemplates.length) {
        idx = 0; // Loop
      }
      const template = newArtifactTemplates[idx];
      const now = new Date();
      const newArtifact: SwarmArtifact = {
        id: `SA-SC001-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${String(artifacts.length + 1).padStart(3, "0")}`,
        agentId: "SC-001",
        type: template.type!,
        targetFolder: template.targetFolder!,
        title: template.title!,
        relevanceScore: template.relevanceScore!,
        architectureAlignment: template.architectureAlignment!,
        status: "validating",
        timestamp: now.toISOString(),
        cancerSignature: template.cancerSignature!,
        agingSignature: template.agingSignature!,
      };

      setArtifacts((prev) => [newArtifact, ...prev]);
      idx++;
    }, 15000); // New artifact every 15s

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = filter === "all" ? artifacts : artifacts.filter((a) => a.type === filter);

  const typeFilters = [
    { key: "all", label: "ALL" },
    { key: "literature-summary", label: "LITERATURE" },
    { key: "candidate-analysis", label: "CANDIDATES" },
    { key: "architecture-insight", label: "ARCHITECTURE" },
    { key: "grant-language", label: "GRANTS" },
  ];

  return (
    <div className="lcars-panel p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase">
          Artifact Ingestion Feed
        </h2>
        <span className="text-lcars-cyan text-xs">{artifacts.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {typeFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2 py-0.5 text-[10px] rounded border uppercase tracking-wider transition-colors ${
              filter === f.key
                ? "bg-lcars-orange/20 text-lcars-orange border-lcars-orange/40"
                : "text-lcars-gold/40 border-lcars-gold/10 hover:border-lcars-gold/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div ref={feedRef} className="artifact-feed flex-1 overflow-y-auto space-y-2 max-h-[500px]">
        {filtered.map((artifact, i) => {
          const statusBadge = STATUS_BADGE[artifact.status];
          return (
            <div
              key={artifact.id}
              className={`p-3 rounded border border-lcars-orange/10 bg-black/30 hover:bg-lcars-panel-light transition-all duration-300 ${
                i === 0 ? "animate-fade-in" : ""
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[artifact.type]}`}>
                  {artifact.type.replace("-", " ").toUpperCase()}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadge.color}`}>
                  {statusBadge.label}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-lcars-gold text-xs font-bold leading-tight mb-1.5">
                {artifact.title}
              </h4>

              {/* Metadata */}
              <div className="flex items-center justify-between text-[10px] text-lcars-gold/40">
                <span>{artifact.id}</span>
                <RelevanceBar score={artifact.relevanceScore} />
              </div>

              {/* Architecture tags */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {artifact.architectureAlignment.map((a) => (
                  <span key={a} className="text-[9px] px-1 py-0.5 bg-lcars-blue/10 text-lcars-blue/70 rounded">
                    {a}
                  </span>
                ))}
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                <div>
                  <span className="text-lcars-red/60">CANCER: </span>
                  <span className="text-lcars-gold/50">{artifact.cancerSignature}</span>
                </div>
                <div>
                  <span className="text-lcars-blue/60">AGING: </span>
                  <span className="text-lcars-gold/50">{artifact.agingSignature}</span>
                </div>
              </div>

              <div className="text-[9px] text-lcars-gold/30 mt-1.5 text-right">
                {formatTime(artifact.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

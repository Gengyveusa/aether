"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

interface ArtifactFeedProps {
  refreshTrigger?: number; // increment to force refresh from DB
}

export default function ArtifactFeed({ refreshTrigger }: ArtifactFeedProps) {
  const [artifacts, setArtifacts] = useState<SwarmArtifact[]>(ARTIFACTS);
  const [filter, setFilter] = useState<string>("all");
  const [isLive, setIsLive] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch artifacts from the database
  const fetchArtifacts = useCallback(async () => {
    try {
      const res = await fetch(`/api/artifacts?type=${filter}`);
      if (res.ok) {
        const data = await res.json();
        if (data.artifacts && data.artifacts.length > 0) {
          setArtifacts(data.artifacts);
        }
      }
    } catch {
      // Fallback to static data on error
    }
  }, [filter]);

  // Initial load + periodic polling
  useEffect(() => {
    fetchArtifacts();

    if (isLive) {
      const interval = setInterval(fetchArtifacts, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [fetchArtifacts, isLive]);

  // Refresh when triggered by parent (e.g., after manual submission)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchArtifacts();
    }
  }, [refreshTrigger, fetchArtifacts]);

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              isLive
                ? "bg-lcars-green/20 text-lcars-green border-lcars-green/30"
                : "text-lcars-gold/30 border-lcars-gold/10"
            }`}
          >
            {isLive ? "LIVE" : "PAUSED"}
          </button>
          <span className="text-lcars-cyan text-xs">{artifacts.length} total</span>
        </div>
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
              key={artifact.id + "-" + i}
              className={`p-3 rounded border border-lcars-orange/10 bg-black/30 hover:bg-lcars-panel-light transition-all duration-300 ${
                i === 0 ? "animate-fade-in" : ""
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[artifact.type] || "text-lcars-gold border-lcars-gold/30"}`}>
                  {artifact.type.replace(/-/g, " ").toUpperCase()}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${statusBadge?.color || "bg-gray-500/20 text-gray-400"}`}>
                  {statusBadge?.label || artifact.status.toUpperCase()}
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
              {(artifact.cancerSignature || artifact.agingSignature) && (
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div>
                    <span className="text-lcars-red/60">CANCER: </span>
                    <span className="text-lcars-gold/50">{artifact.cancerSignature || "—"}</span>
                  </div>
                  <div>
                    <span className="text-lcars-blue/60">AGING: </span>
                    <span className="text-lcars-gold/50">{artifact.agingSignature || "—"}</span>
                  </div>
                </div>
              )}

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

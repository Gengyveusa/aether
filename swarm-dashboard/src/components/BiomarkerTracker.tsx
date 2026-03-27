"use client";

import { BIOMARKERS } from "@/lib/swarm-data";

const STATUS_COLORS = {
  validated: "text-lcars-green border-lcars-green/30 bg-lcars-green/10",
  "in-progress": "text-lcars-amber border-lcars-amber/30 bg-lcars-amber/10",
  pending: "text-gray-400 border-gray-500/30 bg-gray-500/10",
};

const SIGNAL_COLORS = {
  amplified: "text-lcars-red",
  elevated: "text-lcars-orange",
  variable: "text-lcars-amber",
  decohered: "text-lcars-blue",
  declined: "text-lcars-cyan",
  impaired: "text-lcars-purple",
};

export default function BiomarkerTracker() {
  return (
    <div className="lcars-panel p-4">
      <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase mb-4">
        Biomarker Candidates
      </h2>

      <div className="space-y-2">
        {BIOMARKERS.map((bm) => (
          <div
            key={bm.symbol}
            className="p-3 rounded border border-lcars-orange/10 bg-black/30 hover:bg-lcars-panel-light transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lcars-orange font-bold text-sm">{bm.symbol}</span>
                <span className="text-lcars-gold/60 text-xs">{bm.name}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase ${STATUS_COLORS[bm.status]}`}>
                {bm.status}
              </span>
            </div>

            {/* Architecture & Weight */}
            <div className="flex items-center justify-between text-[10px] mb-2">
              <span className="text-lcars-blue/70">{bm.architectureLink}</span>
              <span className="text-lcars-gold/50">
                QPI Weight: <span className="text-lcars-gold font-bold">{(bm.qpiWeight * 100).toFixed(0)}%</span>
                <span className="text-lcars-gold/30 ml-1">(Rank #{bm.weightRank})</span>
              </span>
            </div>

            {/* Evidence bar */}
            <div className="mb-2">
              <div className="flex justify-between text-[10px] text-lcars-gold/40 mb-0.5">
                <span>EVIDENCE</span>
                <span>{(bm.evidenceLevel * 100).toFixed(0)}% ({bm.papersFound} papers)</span>
              </div>
              <div className="h-1.5 bg-lcars-panel rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${bm.evidenceLevel * 100}%`,
                    background: bm.evidenceLevel > 0.7
                      ? "var(--lcars-green)"
                      : bm.evidenceLevel > 0.5
                      ? "var(--lcars-amber)"
                      : "var(--lcars-red)",
                  }}
                />
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <span className="text-lcars-gold/40">CANCER: </span>
                <span className={SIGNAL_COLORS[bm.cancerSignal]}>{bm.cancerSignal}</span>
              </div>
              <div>
                <span className="text-lcars-gold/40">AGING: </span>
                <span className={SIGNAL_COLORS[bm.agingSignal]}>{bm.agingSignal}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

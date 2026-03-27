"use client";

import { useEffect, useState } from "react";

interface PipelineStage {
  name: string;
  count: number;
  color: string;
  icon: string;
}

export default function IngestionPipeline() {
  const [stages, setStages] = useState<PipelineStage[]>([
    { name: "INTAKE", count: 3, color: "bg-lcars-cyan", icon: ">>" },
    { name: "VALIDATE", count: 2, color: "bg-lcars-amber", icon: "??" },
    { name: "CLASSIFY", count: 1, color: "bg-lcars-purple", icon: "##" },
    { name: "INTEGRATE", count: 4, color: "bg-lcars-green", icon: "++" },
    { name: "REVIEW", count: 1, color: "bg-lcars-red", icon: "!!" },
  ]);

  // Simulate pipeline flow
  useEffect(() => {
    const interval = setInterval(() => {
      setStages((prev) =>
        prev.map((s) => ({
          ...s,
          count: Math.max(0, s.count + Math.floor(Math.random() * 3) - 1),
        }))
      );
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const totalInPipeline = stages.reduce((s, st) => s + st.count, 0);

  return (
    <div className="lcars-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase">
          Ingestion Pipeline
        </h2>
        <span className="text-lcars-cyan text-xs">{totalInPipeline} in pipeline</span>
      </div>

      <div className="flex items-center gap-1">
        {stages.map((stage, i) => (
          <div key={stage.name} className="flex items-center flex-1">
            <div className="flex-1 text-center">
              <div className={`mx-auto w-10 h-10 rounded-lg ${stage.color}/20 border border-current flex items-center justify-center mb-1 ${stage.color.replace("bg-", "text-")}`}>
                <span className="text-sm font-bold">{stage.count}</span>
              </div>
              <div className="text-[9px] text-lcars-gold/40 uppercase tracking-wider">{stage.name}</div>
            </div>
            {i < stages.length - 1 && (
              <div className="text-lcars-orange/30 text-xs mx-1">&raquo;</div>
            )}
          </div>
        ))}
      </div>

      {/* Classification breakdown */}
      <div className="mt-4 grid grid-cols-5 gap-1">
        {[
          { label: "LIT", folder: "06-Literature", count: 11, color: "text-lcars-cyan" },
          { label: "CAND", folder: "02-Candidates", count: 9, color: "text-lcars-green" },
          { label: "ARCH", folder: "01-Core-Thesis", count: 3, color: "text-lcars-purple" },
          { label: "GRANT", folder: "03-Grants", count: 2, color: "text-lcars-gold" },
          { label: "EXP", folder: "04-Experiments", count: 1, color: "text-lcars-orange" },
        ].map((cat) => (
          <div key={cat.label} className="text-center p-1 rounded bg-black/30 border border-lcars-orange/5">
            <div className={`text-sm font-bold ${cat.color}`}>{cat.count}</div>
            <div className="text-[8px] text-lcars-gold/30 uppercase">{cat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

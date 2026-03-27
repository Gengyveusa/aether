"use client";

import { useEffect, useState } from "react";
import type { SwarmAgent } from "@/lib/swarm-data";

interface SwarmStatsProps {
  agents: SwarmAgent[];
}

export default function SwarmStats({ agents }: SwarmStatsProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const activeAgents = agents.filter((a) => a.status === "active").length;
  const totalArtifacts = agents.reduce((sum, a) => sum + a.artifactsProduced, 0);
  const avgEvidence = agents.filter((a) => a.evidenceScore > 0).reduce((sum, a, _, arr) => sum + a.evidenceScore / arr.length, 0);
  const totalUptime = agents.reduce((sum, a) => sum + a.uptimeHours, 0);

  const stats = [
    { label: "ACTIVE AGENTS", value: `${activeAgents}/${agents.length}`, color: activeAgents > 0 ? "text-lcars-green" : "text-lcars-red" },
    { label: "ARTIFACTS", value: totalArtifacts.toString(), color: "text-lcars-cyan" },
    { label: "AVG EVIDENCE", value: `${(avgEvidence * 100).toFixed(0)}%`, color: avgEvidence > 0.7 ? "text-lcars-green" : "text-lcars-amber" },
    { label: "TOTAL UPTIME", value: `${totalUptime.toFixed(0)}h`, color: "text-lcars-gold" },
    { label: "DELPHI DUE", value: "12 DAYS", color: "text-lcars-red" },
    { label: "SWARM STATUS", value: activeAgents > 0 ? "NOMINAL" : "STANDBY", color: activeAgents > 0 ? "text-lcars-green" : "text-lcars-amber" },
  ];

  return (
    <div className="grid grid-cols-6 gap-2">
      {stats.map((s, i) => (
        <div key={s.label} className="lcars-panel p-3 text-center">
          <div className={`text-xl font-bold ${s.color}`}>
            {s.value}
          </div>
          <div className="text-[9px] text-lcars-gold/40 uppercase tracking-widest mt-1">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

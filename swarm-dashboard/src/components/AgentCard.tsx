"use client";

import { useState } from "react";
import type { SwarmAgent } from "@/lib/swarm-data";

const STATUS_COLORS: Record<SwarmAgent["status"], string> = {
  active: "text-lcars-green bg-lcars-green/10 border-lcars-green/30",
  idle: "text-lcars-amber bg-lcars-amber/10 border-lcars-amber/30",
  seeding: "text-lcars-cyan bg-lcars-cyan/10 border-lcars-cyan/30",
  error: "text-lcars-red bg-lcars-red/10 border-lcars-red/30",
  offline: "text-gray-500 bg-gray-500/10 border-gray-500/30",
};

const STATUS_DOT: Record<SwarmAgent["status"], string> = {
  active: "bg-lcars-green",
  idle: "bg-lcars-amber",
  seeding: "bg-lcars-cyan",
  error: "bg-lcars-red",
  offline: "bg-gray-500",
};

interface AgentCardProps {
  agent: SwarmAgent;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onSeed: (id: string) => void;
  onSelect: (agent: SwarmAgent) => void;
  isSelected: boolean;
}

export default function AgentCard({ agent, onActivate, onDeactivate, onSeed, onSelect, isSelected }: AgentCardProps) {
  const [hovering, setHovering] = useState(false);
  const progress = agent.totalQueries > 0 ? (agent.queriesCompleted / agent.totalQueries) * 100 : 0;

  return (
    <div
      className={`lcars-panel p-4 cursor-pointer transition-all duration-300 ${
        isSelected ? "ring-1 ring-lcars-orange" : ""
      } ${hovering ? "bg-lcars-panel-light" : ""}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => onSelect(agent)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${STATUS_DOT[agent.status]} ${agent.status === "active" ? "animate-pulse" : ""}`} />
          <span className="text-lcars-orange font-bold text-lg tracking-wider">{agent.id}</span>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded border uppercase tracking-widest ${STATUS_COLORS[agent.status]}`}>
          {agent.status}
        </span>
      </div>

      {/* Name & Platform */}
      <h3 className="text-lcars-gold text-sm font-bold mb-1">{agent.name}</h3>
      <p className="text-lcars-cyan/60 text-xs mb-3">{agent.platform}</p>

      {/* Mission */}
      <p className="text-lcars-gold/70 text-xs leading-relaxed mb-3 line-clamp-2">{agent.mission}</p>

      {/* Targets */}
      <div className="flex flex-wrap gap-1 mb-3">
        {agent.targets.map((t) => (
          <span key={t} className="px-2 py-0.5 bg-lcars-orange/10 text-lcars-orange text-[10px] rounded border border-lcars-orange/20">
            {t}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <div className="text-lcars-cyan text-lg font-bold">{agent.artifactsProduced}</div>
          <div className="text-[10px] text-lcars-gold/50 uppercase">Artifacts</div>
        </div>
        <div>
          <div className="text-lcars-gold text-lg font-bold">{agent.uptimeHours.toFixed(0)}h</div>
          <div className="text-[10px] text-lcars-gold/50 uppercase">Uptime</div>
        </div>
        <div>
          <div className="text-lcars-green text-lg font-bold">{(agent.evidenceScore * 100).toFixed(0)}%</div>
          <div className="text-[10px] text-lcars-gold/50 uppercase">Evidence</div>
        </div>
      </div>

      {/* Query Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] text-lcars-gold/50 mb-1">
          <span>QUERIES</span>
          <span>{agent.queriesCompleted}/{agent.totalQueries}</span>
        </div>
        <div className="h-1.5 bg-lcars-panel rounded-full overflow-hidden">
          <div
            className="h-full bg-lcars-orange rounded-full transition-all duration-1000 progress-glow"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
        {agent.status === "offline" || agent.status === "idle" ? (
          <>
            <button
              onClick={() => onSeed(agent.id)}
              className="flex-1 px-3 py-1.5 bg-lcars-cyan/20 text-lcars-cyan text-xs rounded border border-lcars-cyan/30 hover:bg-lcars-cyan/30 transition-colors uppercase tracking-wider"
            >
              Seed
            </button>
            <button
              onClick={() => onActivate(agent.id)}
              className="flex-1 px-3 py-1.5 bg-lcars-green/20 text-lcars-green text-xs rounded border border-lcars-green/30 hover:bg-lcars-green/30 transition-colors uppercase tracking-wider"
            >
              Activate
            </button>
          </>
        ) : agent.status === "active" ? (
          <button
            onClick={() => onDeactivate(agent.id)}
            className="flex-1 px-3 py-1.5 bg-lcars-red/20 text-lcars-red text-xs rounded border border-lcars-red/30 hover:bg-lcars-red/30 transition-colors uppercase tracking-wider"
          >
            Pause
          </button>
        ) : agent.status === "seeding" ? (
          <div className="flex-1 text-center text-lcars-cyan text-xs animate-pulse py-1.5">
            INITIALIZING...
          </div>
        ) : (
          <button
            onClick={() => onActivate(agent.id)}
            className="flex-1 px-3 py-1.5 bg-lcars-amber/20 text-lcars-amber text-xs rounded border border-lcars-amber/30 hover:bg-lcars-amber/30 transition-colors uppercase tracking-wider"
          >
            Restart
          </button>
        )}
      </div>
    </div>
  );
}

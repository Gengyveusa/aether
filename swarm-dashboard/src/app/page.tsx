"use client";

import { useState, useCallback } from "react";
import LCARSHeader from "@/components/LCARSHeader";
import AgentCard from "@/components/AgentCard";
import ArtifactFeed from "@/components/ArtifactFeed";
import BiomarkerTracker from "@/components/BiomarkerTracker";
import QPIChart from "@/components/QPIChart";
import QueryTracker from "@/components/QueryTracker";
import SwarmStats from "@/components/SwarmStats";
import IngestionPipeline from "@/components/IngestionPipeline";
import ArtifactSubmitForm from "@/components/ArtifactSubmitForm";
import SeedingPromptPanel from "@/components/SeedingPromptPanel";
import { AGENTS, type SwarmAgent } from "@/lib/swarm-data";

type TabKey = "overview" | "biomarkers" | "queries" | "ingest";

export default function SwarmDashboard() {
  const [agents, setAgents] = useState<SwarmAgent[]>(AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<SwarmAgent | null>(AGENTS[0]);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [log, setLog] = useState<string[]>([
    `[${new Date().toISOString().slice(11, 19)}] SWARM MONITOR INITIALIZED`,
    `[${new Date().toISOString().slice(11, 19)}] SC-001 ScienceClaw x Infinite — STATUS: ACTIVE`,
    `[${new Date().toISOString().slice(11, 19)}] Monitoring 7 priority queries...`,
    `[${new Date().toISOString().slice(11, 19)}] Webhook endpoint ready: /api/webhooks/ingest`,
  ]);

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toISOString().slice(11, 19)}] ${msg}`, ...prev].slice(0, 50));
  }, []);

  const handleActivate = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addLog(`ACTIVATING agent ${id}...`);
          setTimeout(() => {
            setAgents((p) =>
              p.map((ag) =>
                ag.id === id ? { ...ag, status: "active" as const, lastActivity: new Date().toISOString() } : ag
              )
            );
            addLog(`Agent ${id} is now ACTIVE`);
          }, 2000);
          return { ...a, status: "seeding" as const };
        }
        return a;
      })
    );
  }, [addLog]);

  const handleDeactivate = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "idle" as const } : a))
    );
    addLog(`Agent ${id} PAUSED`);
  }, [addLog]);

  const handleSeed = useCallback((id: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          addLog(`SEEDING agent ${id} with master prompt...`);
          setTimeout(() => {
            setAgents((p) =>
              p.map((ag) =>
                ag.id === id ? { ...ag, status: "idle" as const } : ag
              )
            );
            addLog(`Agent ${id} SEEDED — ready to activate`);
          }, 3000);
          return { ...a, status: "seeding" as const };
        }
        return a;
      })
    );
  }, [addLog]);

  const handleSelect = useCallback((agent: SwarmAgent) => {
    setSelectedAgent(agent);
  }, []);

  const handleArtifactSubmitted = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "OVERVIEW" },
    { key: "ingest", label: "INGEST" },
    { key: "biomarkers", label: "BIOMARKERS" },
    { key: "queries", label: "QUERIES" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <LCARSHeader />

      {/* LCARS side rail + content */}
      <div className="flex flex-1">
        {/* Left rail */}
        <div className="w-12 flex flex-col gap-1 mr-2">
          <div className="flex-1 bg-lcars-orange rounded-bl-2xl" />
          <div className="h-16 bg-lcars-gold" />
          <div className="h-12 bg-lcars-purple" />
          <div className="h-8 bg-lcars-blue" />
          <div className="flex-1 bg-lcars-orange lcars-elbow-bl" />
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* Stats bar */}
          <SwarmStats agents={agents} />

          {/* Tab navigation */}
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs tracking-[0.2em] uppercase rounded-t transition-colors ${
                  activeTab === tab.key
                    ? "bg-lcars-orange/20 text-lcars-orange border-b-2 border-lcars-orange"
                    : "text-lcars-gold/40 hover:text-lcars-gold/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-12 gap-4">
              {/* Agent cards */}
              <div className="col-span-4 space-y-4">
                <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase">
                  Agent Roster
                </h2>
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onActivate={handleActivate}
                    onDeactivate={handleDeactivate}
                    onSeed={handleSeed}
                    onSelect={handleSelect}
                    isSelected={selectedAgent?.id === agent.id}
                  />
                ))}
              </div>

              {/* Center: QPI + Pipeline */}
              <div className="col-span-4 space-y-4">
                <QPIChart />
                <IngestionPipeline />
              </div>

              {/* Right: Artifact Feed */}
              <div className="col-span-4">
                <ArtifactFeed refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}

          {activeTab === "ingest" && (
            <div className="grid grid-cols-12 gap-4">
              {/* Left: Submit + Seed */}
              <div className="col-span-5 space-y-4">
                <ArtifactSubmitForm onSubmitted={handleArtifactSubmitted} onLog={addLog} />

                {/* Webhook info panel */}
                <div className="lcars-panel p-4">
                  <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase mb-2">
                    Webhook Endpoint
                  </h2>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-black/40 rounded border border-lcars-orange/10 font-mono">
                      <div className="text-lcars-cyan">POST /api/webhooks/ingest</div>
                    </div>
                    <div className="text-lcars-gold/50 leading-relaxed">
                      Point ScienceClaw, Claude, or any agent&apos;s webhook output at this endpoint.
                      Accepts raw YAML text or structured JSON.
                    </div>
                    <div className="p-2 bg-black/40 rounded border border-lcars-orange/10 font-mono text-[10px]">
                      <div className="text-lcars-gold/40 mb-1"># Raw YAML mode:</div>
                      <div className="text-lcars-green">curl -X POST /api/webhooks/ingest \</div>
                      <div className="text-lcars-green pl-2">-H &quot;Content-Type: application/json&quot; \</div>
                      <div className="text-lcars-green pl-2">-d &apos;&#123;&quot;text&quot;: &quot;...yaml...&quot;, &quot;agentId&quot;: &quot;SC-001&quot;&#125;&apos;</div>
                      <div className="text-lcars-gold/40 mt-2 mb-1"># Structured JSON mode:</div>
                      <div className="text-lcars-green">curl -X POST /api/webhooks/ingest \</div>
                      <div className="text-lcars-green pl-2">-H &quot;Content-Type: application/json&quot; \</div>
                      <div className="text-lcars-green pl-2">-d &apos;&#123;&quot;artifacts&quot;: [&#123;...&#125;]&#125;&apos;</div>
                    </div>
                    <div className="text-lcars-gold/40 text-[10px]">
                      Set <span className="text-lcars-amber">SWARM_WEBHOOK_SECRET</span> env var for Bearer token auth.
                    </div>
                  </div>
                </div>
              </div>

              {/* Center: Seeding prompt */}
              <div className="col-span-4">
                <SeedingPromptPanel onLog={addLog} />
              </div>

              {/* Right: Live feed */}
              <div className="col-span-3">
                <ArtifactFeed refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}

          {activeTab === "biomarkers" && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7">
                <BiomarkerTracker />
              </div>
              <div className="col-span-5">
                <QPIChart />
              </div>
            </div>
          )}

          {activeTab === "queries" && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7">
                <QueryTracker />
              </div>
              <div className="col-span-5">
                <ArtifactFeed refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}

          {/* Activity Log */}
          <div className="lcars-panel p-4">
            <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase mb-2">
              System Log
            </h2>
            <div className="font-mono text-[11px] space-y-0.5 max-h-32 overflow-y-auto artifact-feed">
              {log.map((entry, i) => (
                <div
                  key={i}
                  className={`${i === 0 ? "text-lcars-green" : "text-lcars-gold/40"} transition-colors`}
                >
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <footer className="flex items-stretch gap-0 mt-2">
        <div className="w-12 bg-lcars-orange" />
        <div className="flex-1 bg-lcars-orange h-2 self-end" />
        <div className="bg-lcars-panel px-6 py-1 flex items-center gap-4">
          <span className="text-lcars-gold/40 text-[10px] tracking-widest">QUANTUM DISTILLERY v1.1</span>
          <span className="text-lcars-cyan/40 text-[10px]">ARPA-H DELPHI SUBMISSION</span>
          <span className="text-lcars-green/40 text-[10px]">WEBHOOK: /api/webhooks/ingest</span>
        </div>
        <div className="flex-1 bg-lcars-gold h-2 self-end" />
        <div className="w-24 bg-lcars-purple lcars-bracket-right h-6" />
      </footer>
    </div>
  );
}

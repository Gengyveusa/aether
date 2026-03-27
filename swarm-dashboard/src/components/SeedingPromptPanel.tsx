"use client";

import { useState } from "react";

interface SeedingPromptPanelProps {
  onLog?: (msg: string) => void;
}

export default function SeedingPromptPanel({ onLog }: SeedingPromptPanelProps) {
  const [agentId, setAgentId] = useState("SC-001");
  const [agentName, setAgentName] = useState("ScienceClaw x Infinite");
  const [customQueries, setCustomQueries] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const agentPresets: Record<string, string> = {
    "SC-001": "ScienceClaw x Infinite",
    "SC-002": "DeepMine Quantum",
    "SC-003": "GrantForge AI",
    "CLAUDE": "Claude Research Agent",
    "GPT": "GPT Research Agent",
    "CUSTOM": "Custom Agent",
  };

  const generatePrompt = async () => {
    setLoading(true);
    try {
      const queries = customQueries.trim()
        ? customQueries.split("\n").filter((q) => q.trim())
        : undefined;

      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, agentName, queries }),
      });
      const data = await res.json();
      setPrompt(data.prompt);
      onLog?.(`Generated seeding prompt for ${agentId} (${agentName})`);
    } catch {
      // Fallback: generate locally
      setPrompt(`Error fetching prompt from API. Use the default seeding prompt from 05-Swarm/ScienceClaw-Seeding-Prompt.md`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onLog?.(`Seeding prompt copied to clipboard for ${agentId}`);
    } catch {
      // Fallback for non-HTTPS
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="lcars-panel p-4">
      <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase mb-3">
        Seeding Prompt Generator
      </h2>

      <p className="text-lcars-gold/50 text-xs mb-3 leading-relaxed">
        Generate a seeding prompt to initialize any AI agent for Quantum Distillery research.
        Copy the prompt into Claude, ChatGPT, ScienceClaw, or any research agent. Then paste the output back into the Submit Artifact form.
      </p>

      {/* Agent selector */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Agent ID</label>
          <select
            value={agentId}
            onChange={(e) => {
              setAgentId(e.target.value);
              setAgentName(agentPresets[e.target.value] || "");
              setPrompt(null);
            }}
            className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
          >
            {Object.entries(agentPresets).map(([id, name]) => (
              <option key={id} value={id}>{id} — {name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Agent Name</label>
          <input
            type="text"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
          />
        </div>
      </div>

      {/* Custom queries */}
      <div className="mb-3">
        <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">
          Custom Queries (optional — one per line, leave blank for default 7)
        </label>
        <textarea
          value={customQueries}
          onChange={(e) => { setCustomQueries(e.target.value); setPrompt(null); }}
          rows={4}
          placeholder={`Search for papers on NADH/FAD ratio in cancer...\nSearch for GSH redox biomarkers...\n(Leave blank to use the standard 7 priority queries)`}
          className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-2 text-lcars-gold text-xs font-mono focus:outline-none focus:border-lcars-orange/60 resize-y"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={generatePrompt}
        disabled={loading}
        className={`w-full py-2 rounded text-xs uppercase tracking-widest font-bold transition-all mb-3 ${
          loading
            ? "bg-lcars-cyan/20 text-lcars-cyan animate-pulse"
            : "bg-lcars-cyan/20 text-lcars-cyan border border-lcars-cyan/30 hover:bg-lcars-cyan/30"
        }`}
      >
        {loading ? "GENERATING..." : "GENERATE SEEDING PROMPT"}
      </button>

      {/* Generated prompt */}
      {prompt && (
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-lcars-gold/50 uppercase tracking-wider">Generated Prompt</span>
            <button
              onClick={copyToClipboard}
              className={`px-3 py-1 text-[10px] rounded border uppercase tracking-wider transition-all ${
                copied
                  ? "bg-lcars-green/20 text-lcars-green border-lcars-green/40"
                  : "text-lcars-gold/50 border-lcars-gold/20 hover:text-lcars-gold hover:border-lcars-gold/40"
              }`}
            >
              {copied ? "COPIED!" : "COPY TO CLIPBOARD"}
            </button>
          </div>
          <div className="bg-black/50 border border-lcars-orange/20 rounded p-3 max-h-64 overflow-y-auto artifact-feed">
            <pre className="text-lcars-gold/70 text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
              {prompt}
            </pre>
          </div>

          {/* Usage instructions */}
          <div className="mt-2 p-2 rounded border border-lcars-amber/20 bg-lcars-amber/5">
            <div className="text-lcars-amber text-[10px] font-bold uppercase tracking-wider mb-1">How to use</div>
            <ol className="text-lcars-gold/50 text-[10px] space-y-0.5 list-decimal list-inside">
              <li>Copy this prompt</li>
              <li>Paste into Claude, ChatGPT, ScienceClaw, or any AI agent</li>
              <li>Let the agent run the queries and produce YAML artifacts</li>
              <li>Copy the agent&apos;s full output</li>
              <li>Paste into the <span className="text-lcars-orange">Submit Artifact</span> form (Paste YAML mode)</li>
              <li>The parser will auto-detect and ingest all artifacts</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

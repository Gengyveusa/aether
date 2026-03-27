"use client";

import { useState } from "react";

interface SubmitResult {
  success: boolean;
  summary?: { total: number; ingested: number; duplicates: number; needsReview: number };
  results?: Array<{ id: string; title: string; status: string; warnings: string[] }>;
  error?: string;
}

interface ArtifactSubmitFormProps {
  onSubmitted?: () => void;
  onLog?: (msg: string) => void;
}

export default function ArtifactSubmitForm({ onSubmitted, onLog }: ArtifactSubmitFormProps) {
  const [mode, setMode] = useState<"paste" | "structured">("paste");
  const [rawText, setRawText] = useState("");
  const [agentId, setAgentId] = useState("SC-001");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);

  // Structured mode fields
  const [title, setTitle] = useState("");
  const [artifactType, setArtifactType] = useState("literature-summary");
  const [relevance, setRelevance] = useState(3);
  const [architectures, setArchitectures] = useState<string[]>([]);
  const [cancerSig, setCancerSig] = useState("");
  const [agingSig, setAgingSig] = useState("");

  const handlePasteSubmit = async () => {
    if (!rawText.trim()) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/webhooks/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, agentId, source: "manual" }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        onLog?.(`MANUAL INGEST: ${data.summary.ingested} artifact(s) from ${agentId}`);
        onSubmitted?.();
        if (data.summary.ingested > 0) setRawText("");
      }
    } catch {
      setResult({ success: false, error: "Failed to submit" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStructuredSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/webhooks/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artifacts: [{
            agentId,
            type: artifactType,
            title,
            relevanceScore: relevance,
            architectureAlignment: architectures,
            cancerSignature: cancerSig,
            agingSignature: agingSig,
          }],
          source: "manual",
        }),
      });
      const data = await res.json();
      setResult(data);
      if (data.success) {
        onLog?.(`MANUAL INGEST: "${title}" from ${agentId}`);
        onSubmitted?.();
        setTitle("");
        setCancerSig("");
        setAgingSig("");
      }
    } catch {
      setResult({ success: false, error: "Failed to submit" });
    } finally {
      setSubmitting(false);
    }
  };

  const allArchitectures = ["FMO coherence", "Enzyme tunneling", "ETC quantum transfer", "Cryptochrome spin coherence"];

  const toggleArch = (arch: string) => {
    setArchitectures((prev) =>
      prev.includes(arch) ? prev.filter((a) => a !== arch) : [...prev, arch]
    );
  };

  return (
    <div className="lcars-panel p-4">
      <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase mb-3">
        Submit Artifact
      </h2>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-4">
        <button
          onClick={() => setMode("paste")}
          className={`px-3 py-1 text-xs rounded uppercase tracking-wider transition-colors ${
            mode === "paste"
              ? "bg-lcars-orange/20 text-lcars-orange border border-lcars-orange/40"
              : "text-lcars-gold/40 border border-lcars-gold/10 hover:border-lcars-gold/30"
          }`}
        >
          Paste YAML / Raw Output
        </button>
        <button
          onClick={() => setMode("structured")}
          className={`px-3 py-1 text-xs rounded uppercase tracking-wider transition-colors ${
            mode === "structured"
              ? "bg-lcars-orange/20 text-lcars-orange border border-lcars-orange/40"
              : "text-lcars-gold/40 border border-lcars-gold/10 hover:border-lcars-gold/30"
          }`}
        >
          Structured Form
        </button>
      </div>

      {/* Agent ID selector */}
      <div className="mb-3">
        <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Source Agent ID</label>
        <select
          value={agentId}
          onChange={(e) => setAgentId(e.target.value)}
          className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
        >
          <option value="SC-001">SC-001 — ScienceClaw x Infinite</option>
          <option value="SC-002">SC-002 — DeepMine Quantum</option>
          <option value="SC-003">SC-003 — GrantForge AI</option>
          <option value="MANUAL">MANUAL — Human Entry</option>
          <option value="CLAUDE">CLAUDE — Claude AI Agent</option>
          <option value="GPT">GPT — OpenAI Agent</option>
        </select>
      </div>

      {mode === "paste" ? (
        <>
          <div className="mb-3">
            <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">
              Paste agent output (YAML blocks auto-detected)
            </label>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              rows={12}
              placeholder={`Paste the full AI agent output here. YAML blocks like:

\`\`\`yaml
swarm-artifact-id: SC-001-20260327-001
artifact-type: literature-summary
target-folder: 06-Literature
relevance-score: 4
architecture-alignment: [FMO coherence, ETC quantum transfer]
title: "Paper title here"
cancer-signature: "Finding..."
aging-signature: "Finding..."
\`\`\`

...will be automatically parsed and ingested.`}
              className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-2 text-lcars-gold text-xs font-mono focus:outline-none focus:border-lcars-orange/60 resize-y"
            />
          </div>

          <button
            onClick={handlePasteSubmit}
            disabled={submitting || !rawText.trim()}
            className={`w-full py-2 rounded text-xs uppercase tracking-widest font-bold transition-all ${
              submitting
                ? "bg-lcars-cyan/20 text-lcars-cyan animate-pulse"
                : "bg-lcars-green/20 text-lcars-green border border-lcars-green/30 hover:bg-lcars-green/30"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {submitting ? "PARSING & INGESTING..." : "INGEST ARTIFACTS"}
          </button>
        </>
      ) : (
        <>
          {/* Title */}
          <div className="mb-2">
            <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper or finding title"
              className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
            />
          </div>

          {/* Type + Relevance */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Type</label>
              <select
                value={artifactType}
                onChange={(e) => setArtifactType(e.target.value)}
                className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
              >
                <option value="literature-summary">Literature Summary</option>
                <option value="candidate-analysis">Candidate Analysis</option>
                <option value="architecture-insight">Architecture Insight</option>
                <option value="grant-language">Grant Language</option>
                <option value="simulation-result">Simulation Result</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Relevance (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setRelevance(n)}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
                      n <= relevance
                        ? "bg-lcars-orange/30 text-lcars-orange border border-lcars-orange/40"
                        : "bg-black/30 text-lcars-gold/20 border border-lcars-gold/10"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Architecture alignment */}
          <div className="mb-2">
            <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Architecture Alignment</label>
            <div className="flex flex-wrap gap-1">
              {allArchitectures.map((arch) => (
                <button
                  key={arch}
                  onClick={() => toggleArch(arch)}
                  className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                    architectures.includes(arch)
                      ? "bg-lcars-blue/20 text-lcars-blue border-lcars-blue/40"
                      : "text-lcars-gold/30 border-lcars-gold/10 hover:border-lcars-gold/30"
                  }`}
                >
                  {arch}
                </button>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Cancer Signature</label>
              <input
                type="text"
                value={cancerSig}
                onChange={(e) => setCancerSig(e.target.value)}
                placeholder="Cancer finding..."
                className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
              />
            </div>
            <div>
              <label className="text-[10px] text-lcars-gold/50 uppercase tracking-wider block mb-1">Aging Signature</label>
              <input
                type="text"
                value={agingSig}
                onChange={(e) => setAgingSig(e.target.value)}
                placeholder="Aging finding..."
                className="w-full bg-black/50 border border-lcars-orange/20 rounded px-3 py-1.5 text-lcars-gold text-xs focus:outline-none focus:border-lcars-orange/60"
              />
            </div>
          </div>

          <button
            onClick={handleStructuredSubmit}
            disabled={submitting || !title.trim()}
            className={`w-full py-2 rounded text-xs uppercase tracking-widest font-bold transition-all ${
              submitting
                ? "bg-lcars-cyan/20 text-lcars-cyan animate-pulse"
                : "bg-lcars-green/20 text-lcars-green border border-lcars-green/30 hover:bg-lcars-green/30"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {submitting ? "SUBMITTING..." : "SUBMIT ARTIFACT"}
          </button>
        </>
      )}

      {/* Result feedback */}
      {result && (
        <div className={`mt-3 p-2 rounded border text-xs ${
          result.success ? "border-lcars-green/30 bg-lcars-green/5" : "border-lcars-red/30 bg-lcars-red/5"
        }`}>
          {result.success ? (
            <>
              <div className="text-lcars-green font-bold mb-1">
                {result.summary!.ingested} ingested, {result.summary!.duplicates} duplicates, {result.summary!.needsReview} needs review
              </div>
              {result.results?.map((r) => (
                <div key={r.id} className="text-lcars-gold/60 mb-0.5">
                  <span className="text-lcars-cyan">{r.id}</span>: {r.title}
                  {r.warnings.length > 0 && (
                    <span className="text-lcars-amber ml-1">({r.warnings.join("; ")})</span>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-lcars-red">{result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}

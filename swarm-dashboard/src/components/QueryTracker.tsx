"use client";

import { PRIORITY_QUERIES } from "@/lib/swarm-data";

const STATUS_ICON: Record<string, { icon: string; color: string }> = {
  completed: { icon: "//", color: "text-lcars-green" },
  "in-progress": { icon: ">>", color: "text-lcars-amber animate-pulse" },
  pending: { icon: "..", color: "text-gray-500" },
};

export default function QueryTracker() {
  const completed = PRIORITY_QUERIES.filter((q) => q.status === "completed").length;
  const total = PRIORITY_QUERIES.length;
  const totalPapers = PRIORITY_QUERIES.reduce((sum, q) => sum + q.papers, 0);

  return (
    <div className="lcars-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase">
          Priority Queries
        </h2>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-lcars-green">{completed}/{total} complete</span>
          <span className="text-lcars-cyan">{totalPapers} papers</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-lcars-panel rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-lcars-orange to-lcars-green rounded-full transition-all duration-1000 progress-glow"
          style={{ width: `${(completed / total) * 100}%` }}
        />
      </div>

      <div className="space-y-2">
        {PRIORITY_QUERIES.map((q) => {
          const st = STATUS_ICON[q.status];
          return (
            <div
              key={q.id}
              className={`flex items-start gap-3 p-2 rounded border transition-colors ${
                q.status === "completed"
                  ? "border-lcars-green/10 bg-lcars-green/5"
                  : q.status === "in-progress"
                  ? "border-lcars-amber/20 bg-lcars-amber/5"
                  : "border-gray-800 bg-black/20"
              }`}
            >
              <span className={`font-mono text-xs mt-0.5 ${st.color}`}>{st.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${
                  q.status === "completed" ? "text-lcars-gold/70" : q.status === "in-progress" ? "text-lcars-gold" : "text-lcars-gold/40"
                }`}>
                  <span className="text-lcars-orange/50 mr-1">Q{q.id}.</span>
                  {q.query}
                </p>
              </div>
              {q.papers > 0 && (
                <span className="text-[10px] text-lcars-cyan/60 whitespace-nowrap mt-0.5">
                  {q.papers} papers
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

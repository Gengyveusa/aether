"use client";

import { useEffect, useState } from "react";
import { generateQPITimeSeries, type QPIReading } from "@/lib/swarm-data";

function MiniSparkline({ data, color, label, value }: { data: number[]; color: string; label: string; value: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 0.01;
  const height = 32;
  const width = 120;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex items-center gap-3">
      <div className="w-16">
        <div className="text-[10px] uppercase tracking-wider" style={{ color }}>{label}</div>
        <div className="text-sm font-bold" style={{ color }}>{value.toFixed(3)}</div>
      </div>
      <svg width={width} height={height} className="opacity-80">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function QPIChart() {
  const [readings, setReadings] = useState<QPIReading[]>([]);

  useEffect(() => {
    setReadings(generateQPITimeSeries(48));

    const interval = setInterval(() => {
      setReadings((prev) => {
        const noise = () => (Math.random() - 0.5) * 0.08;
        const newReading: QPIReading = {
          timestamp: new Date().toISOString(),
          qpi: +(0.72 + noise()).toFixed(3),
          fmo: +(0.30 + noise()).toFixed(3),
          tunnel: +(0.25 + noise()).toFixed(3),
          etc: +(0.30 + noise()).toFixed(3),
          spin: +(0.15 + noise()).toFixed(3),
        };
        return [...prev.slice(1), newReading];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (readings.length === 0) return null;

  const latest = readings[readings.length - 1];
  const qpiValues = readings.map((r) => r.qpi);
  const min = Math.min(...qpiValues);
  const max = Math.max(...qpiValues);
  const range = max - min || 0.01;

  // Main chart
  const chartH = 120;
  const chartW = 500;
  const mainPoints = readings.map((r, i) => {
    const x = (i / (readings.length - 1)) * chartW;
    const y = chartH - ((r.qpi - min) / range) * chartH;
    return `${x},${y}`;
  }).join(" ");

  // Threshold lines
  const thresholds = [
    { value: 0.8, label: "OPTIMAL", color: "#66FF66" },
    { value: 0.6, label: "MILD", color: "#FFCC00" },
    { value: 0.4, label: "MODERATE", color: "#FF9900" },
  ];

  // QPI score interpretation
  let qpiColor = "#CC6666";
  let qpiLabel = "CRITICAL";
  if (latest.qpi >= 0.8) { qpiColor = "#66FF66"; qpiLabel = "OPTIMAL"; }
  else if (latest.qpi >= 0.6) { qpiColor = "#FFCC00"; qpiLabel = "MILD DECOHERENCE"; }
  else if (latest.qpi >= 0.4) { qpiColor = "#FF9900"; qpiLabel = "MODERATE"; }
  else if (latest.qpi >= 0.2) { qpiColor = "#CC6666"; qpiLabel = "SEVERE"; }

  return (
    <div className="lcars-panel p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lcars-orange font-bold text-sm tracking-[0.2em] uppercase">
          QPI Composite Score
        </h2>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: qpiColor }}>{latest.qpi.toFixed(3)}</div>
          <div className="text-[10px] tracking-widest" style={{ color: qpiColor }}>{qpiLabel}</div>
        </div>
      </div>

      {/* Main chart */}
      <div className="relative mb-4 p-2 bg-black/40 rounded border border-lcars-orange/10">
        <svg width="100%" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none" className="overflow-visible">
          {/* Threshold lines */}
          {thresholds.map((t) => {
            const y = chartH - ((t.value - min) / range) * chartH;
            if (y < 0 || y > chartH) return null;
            return (
              <g key={t.label}>
                <line x1={0} y1={y} x2={chartW} y2={y} stroke={t.color} strokeWidth="0.5" strokeDasharray="4,4" opacity={0.3} />
                <text x={chartW - 4} y={y - 3} fill={t.color} fontSize="6" textAnchor="end" opacity={0.5}>
                  {t.label} ({t.value})
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <polygon
            points={`0,${chartH} ${mainPoints} ${chartW},${chartH}`}
            fill="url(#qpiGradient)"
            opacity={0.2}
          />

          {/* Line */}
          <polyline
            points={mainPoints}
            fill="none"
            stroke={qpiColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Endpoint dot */}
          <circle
            cx={chartW}
            cy={chartH - ((latest.qpi - min) / range) * chartH}
            r="3"
            fill={qpiColor}
            className="animate-pulse"
          />

          <defs>
            <linearGradient id="qpiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={qpiColor} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-between text-[9px] text-lcars-gold/30 mt-1">
          <span>-48h</span>
          <span>-36h</span>
          <span>-24h</span>
          <span>-12h</span>
          <span>NOW</span>
        </div>
      </div>

      {/* Architecture sub-indices */}
      <div className="grid grid-cols-2 gap-3">
        <MiniSparkline
          data={readings.slice(-20).map((r) => r.fmo)}
          color="#FF9900"
          label="A_FMO"
          value={latest.fmo}
        />
        <MiniSparkline
          data={readings.slice(-20).map((r) => r.tunnel)}
          color="#66FF66"
          label="A_TUNNEL"
          value={latest.tunnel}
        />
        <MiniSparkline
          data={readings.slice(-20).map((r) => r.etc)}
          color="#9999FF"
          label="A_ETC"
          value={latest.etc}
        />
        <MiniSparkline
          data={readings.slice(-20).map((r) => r.spin)}
          color="#CC99CC"
          label="A_SPIN"
          value={latest.spin}
        />
      </div>

      {/* QPI Formula */}
      <div className="mt-4 p-2 bg-black/40 rounded border border-lcars-orange/10 text-center">
        <div className="text-[10px] text-lcars-gold/40 mb-1">QPI = a*A_FMO + b*A_TUNNEL + g*A_ETC + d*A_SPIN</div>
        <div className="text-[10px] text-lcars-gold/60">
          <span className="text-lcars-orange">a=0.30</span>{" "}
          <span className="text-lcars-green">b=0.25</span>{" "}
          <span className="text-lcars-blue">g=0.30</span>{" "}
          <span className="text-lcars-purple">d=0.15</span>
        </div>
      </div>
    </div>
  );
}

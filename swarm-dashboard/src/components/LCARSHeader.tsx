"use client";

import { useEffect, useState } from "react";

export default function LCARSHeader() {
  const [time, setTime] = useState("");
  const [stardate, setStardate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
      // Stardate: year + day fraction
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const day = diff / 86400000;
      setStardate(`${now.getFullYear() - 1900}.${day.toFixed(1)}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative">
      {/* Top bar */}
      <div className="flex items-stretch gap-0">
        {/* Left elbow */}
        <div className="w-48 bg-lcars-orange lcars-elbow-tl flex items-center justify-center py-3 px-6">
          <span className="text-black font-bold text-sm tracking-widest">LCARS 47</span>
        </div>
        {/* Thin connecting bar */}
        <div className="flex-1 bg-lcars-orange h-3 self-start" />
        {/* Title area */}
        <div className="bg-lcars-panel border-t-[3px] border-lcars-orange flex-shrink-0 px-8 py-2 flex items-center gap-6">
          <h1 className="text-lcars-gold font-lcars text-3xl tracking-[0.2em] uppercase">
            Quantum Distillery
          </h1>
          <span className="text-lcars-cyan text-lg tracking-widest">SWARM MONITOR</span>
        </div>
        {/* Right bar */}
        <div className="flex-1 bg-lcars-gold h-3 self-start" />
        <div className="w-32 bg-lcars-purple lcars-bracket-top-right py-3 px-4 flex flex-col items-end justify-center">
          <span className="text-black text-xs font-bold tracking-wider">{time}</span>
          <span className="text-black text-[10px] opacity-70">SD {stardate}</span>
        </div>
      </div>

      {/* Side rail */}
      <div className="flex">
        <div className="w-12 bg-lcars-orange" />
        <div className="w-2" />
        <div className="flex-1 h-1 bg-lcars-orange/20 self-center" />
      </div>
    </header>
  );
}

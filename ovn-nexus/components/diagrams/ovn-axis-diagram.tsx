"use client";

export function OvnAxisDiagram() {
  return (
    <figure
      role="img"
      aria-label="The Oral-Vascular-Neural Axis: diagram showing how oral microbes send signals through the bloodstream to affect the heart, brain, and immune system"
      className="mx-auto w-full max-w-xl"
    >
      <svg
        viewBox="0 0 520 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Mouth node */}
        <rect x="170" y="16" width="180" height="56" rx="28" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="260" y="50" textAnchor="middle" className="fill-foreground text-[15px] font-semibold" fontFamily="inherit">
          Mouth
        </text>
        <text x="260" y="64" textAnchor="middle" className="fill-muted-foreground text-[10px]" fontFamily="inherit">
          Oral Microbes &amp; OMVs
        </text>

        {/* Arrow: Mouth → Bloodstream */}
        <line x1="260" y1="72" x2="260" y2="118" className="stroke-primary/60" strokeWidth="2" strokeDasharray="6 3" />
        <polygon points="253,114 260,126 267,114" className="fill-primary/60" />

        {/* Bloodstream node */}
        <rect x="150" y="128" width="220" height="56" rx="28" className="fill-primary/10 stroke-primary" strokeWidth="2" />
        <text x="260" y="161" textAnchor="middle" className="fill-foreground text-[15px] font-semibold" fontFamily="inherit">
          Bloodstream
        </text>
        <text x="260" y="176" textAnchor="middle" className="fill-muted-foreground text-[10px]" fontFamily="inherit">
          Inflammatory Signaling
        </text>

        {/* Three branching arrows */}
        {/* Left arrow → Heart */}
        <path d="M200 184 L100 240" className="stroke-primary/50" strokeWidth="2" strokeDasharray="6 3" />
        <polygon points="95,234 96,246 107,238" className="fill-primary/50" />

        {/* Center arrow → Brain */}
        <line x1="260" y1="184" x2="260" y2="240" className="stroke-primary/50" strokeWidth="2" strokeDasharray="6 3" />
        <polygon points="253,236 260,248 267,236" className="fill-primary/50" />

        {/* Right arrow → Immune System */}
        <path d="M320 184 L420 240" className="stroke-primary/50" strokeWidth="2" strokeDasharray="6 3" />
        <polygon points="413,238 424,246 425,234" className="fill-primary/50" />

        {/* Heart node */}
        <rect x="30" y="248" width="140" height="56" rx="28" className="fill-primary/5 stroke-primary/70" strokeWidth="1.5" />
        <text x="100" y="278" textAnchor="middle" className="fill-foreground text-[14px] font-semibold" fontFamily="inherit">
          Heart
        </text>
        <text x="100" y="293" textAnchor="middle" className="fill-muted-foreground text-[10px]" fontFamily="inherit">
          Cardiovascular Disease
        </text>

        {/* Brain node */}
        <rect x="190" y="248" width="140" height="56" rx="28" className="fill-primary/5 stroke-primary/70" strokeWidth="1.5" />
        <text x="260" y="278" textAnchor="middle" className="fill-foreground text-[14px] font-semibold" fontFamily="inherit">
          Brain
        </text>
        <text x="260" y="293" textAnchor="middle" className="fill-muted-foreground text-[10px]" fontFamily="inherit">
          Neurodegeneration
        </text>

        {/* Immune System node */}
        <rect x="350" y="248" width="140" height="56" rx="28" className="fill-primary/5 stroke-primary/70" strokeWidth="1.5" />
        <text x="420" y="278" textAnchor="middle" className="fill-foreground text-[14px] font-semibold" fontFamily="inherit">
          Immune System
        </text>
        <text x="420" y="293" textAnchor="middle" className="fill-muted-foreground text-[10px]" fontFamily="inherit">
          Systemic Inflammation
        </text>

        {/* Connecting bracket / label at bottom */}
        <line x1="80" y1="326" x2="440" y2="326" className="stroke-primary/30" strokeWidth="1.5" />
        <line x1="80" y1="318" x2="80" y2="326" className="stroke-primary/30" strokeWidth="1.5" />
        <line x1="260" y1="318" x2="260" y2="326" className="stroke-primary/30" strokeWidth="1.5" />
        <line x1="440" y1="318" x2="440" y2="326" className="stroke-primary/30" strokeWidth="1.5" />

        {/* Label */}
        <rect x="130" y="346" width="260" height="44" rx="8" className="fill-primary/8 stroke-primary/40" strokeWidth="1" />
        <text x="260" y="372" textAnchor="middle" className="fill-primary text-[14px] font-bold" fontFamily="inherit">
          The Oral-Vascular-Neural Axis
        </text>
        <text x="260" y="385" textAnchor="middle" className="fill-muted-foreground text-[10px]" fontFamily="inherit">
          A framework for studying oral-systemic disease
        </text>
      </svg>
      <figcaption className="sr-only">
        The Oral-Vascular-Neural Axis: oral microbes release inflammatory signals
        that travel through the bloodstream to affect the heart, brain, and immune system.
      </figcaption>
    </figure>
  );
}

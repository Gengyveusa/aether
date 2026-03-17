"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { CinematicPlayer, VideoData } from "@/components/video/video-player";
import { TemplatePicker } from "@/components/video/template-picker";
import { AmbientMusicEngine } from "@/lib/video/ambient-music";

// ── Perio Immuno Presentation Data ───────────────────────────────────────────
// "Gingival Immunity v2.0: The Wiring Diagram"
// Full 40-slide presentation with narration scripts and slide images.

const SLIDE_BASE = "/slides/perio-immuno";
const PRESENTATION_ID = "gingival-immunity-v2";

const PERIO_IMMUNO_SLIDES: VideoData["slides"] = [
  {
    index: 0,
    title: "Gingival Immunity v2.0: The Wiring Diagram",
    body: "A molecularly resolved, spatially aware, dynamically modeled layered control architecture. Because your gingiva is smarter than your thermostat.",
    imageUrl: `${SLIDE_BASE}/1_.png`,
    duration: 10,
  },
  {
    index: 1,
    title: "What This Presentation Is About",
    body: "This deck reframes gingival immunity not as a simple fight-infection system, but as a sophisticated layered control architecture — complete with sensors, controllers, actuators, and failure modes. Think of it like an industrial control system: not just a smoke alarm, but a full SCADA network for your gum tissue.",
    imageUrl: `${SLIDE_BASE}/2_What-This-Presentation-Is-About.png`,
    duration: 14,
  },
  {
    index: 2,
    title: "System Architecture: What We Are Mapping",
    body: "Eight interconnected layers form the complete architecture: System Objective, Innate Sensor Layer, Innate-to-Adaptive Handoff, Adaptive Amplifier Layer, Periodontal Homeostasis, Disease as Failure Mode, Spatial and Single-Cell Control Layer, and Therapeutic Leverage Points. Each layer equals sensors, controllers, actuators, and failure triggers.",
    imageUrl: `${SLIDE_BASE}/3_.png`,
    duration: 15,
  },
  {
    index: 3,
    title: "How to Read This Deck",
    body: "This agenda is a functional map of a biological control system. Each of the eight layers represents a distinct module with its own sensors, controllers, actuators, and failure triggers. By the end, you will be able to trace a signal from a bacterial surface molecule all the way through to bone loss — or to resolution. Each layer builds on the last. If you understand the handoffs, you understand the disease.",
    imageUrl: `${SLIDE_BASE}/4_How-to-Read-This-Deck.png`,
    duration: 16,
  },
  {
    index: 4,
    title: "What Is This System Actually Trying to Do?",
    body: "Maintain tissue integrity setpoint. Not sterilize. Tolerate colonization. Detect dangerous shifts. The system balances three priorities: speed through innate PRR to NF-kappa-B signaling, precision through adaptive clonal expansion, and collateral minimization through efferocytosis and specialized pro-resolving mediators. It is a negotiator, not a bouncer.",
    imageUrl: `${SLIDE_BASE}/5_.png`,
    duration: 14,
  },
  {
    index: 5,
    title: "The Core Insight: Tolerance, Not Sterility",
    body: "Most immune systems are taught as kill everything foreign. The gingival immune system breaks that rule. Its actual goal is homeostatic coexistence — maintaining a stable tissue environment in the presence of a permanent, dense microbial community. Failure is not just not enough immunity — it is also too much, too long, in the wrong direction.",
    imageUrl: `${SLIDE_BASE}/6_The-Core-Insight-Tolerance-Not-Sterility.png`,
    duration: 15,
  },
  {
    index: 6,
    title: "Innate Layer: The Fast Sensor-Effector Grid",
    body: "The barrier module uses junctional keratinocytes with TLR2/4, NOD1/2, and NLRP3 sensors. Fusobacterium triggers TLR2/NALP2, producing human beta-defensins and CXCL8. The routing module directs mastication damage through epithelial IL-6 to homeostatic Th17 setpoint. IL-8 and ICAM-1 gradients direct neutrophils into the sulcus. This is damage-driven, not purely commensal-driven.",
    imageUrl: `${SLIDE_BASE}/7_.png`,
    duration: 16,
  },
  {
    index: 7,
    title: "Why the Innate Layer Is the First Line of Logic",
    body: "The innate immune layer in the gingiva is not just a blunt alarm — it is a pattern-recognition grid that distinguishes between harmless commensals and dangerous pathogens using molecular sensors: TLRs, NODs, and NLRP3. Speed matters here. The innate layer responds in minutes to hours — long before adaptive immunity can act.",
    imageUrl: `${SLIDE_BASE}/8_Why-the-Innate-Layer-Is-the-First-Line-of-Logic.png`,
    duration: 14,
  },
  {
    index: 8,
    title: "Innate Layer: Effectors, Setpoint & Resolution",
    body: "Key effectors include neutrophils, dendritic cells, macrophages, and CD81-positive fibroblasts that secrete C3 to drive the C3aR1-neutrophil recruitment circuit. The oral setpoint is maintained by mastication IL-6 plus stromal signals driving basal Th17 tone and antimicrobial activity. The resolution module uses efferocytosis to trigger IL-10, TGF-beta, and specialized pro-resolving mediators that suppress IL-23 and IL-17.",
    imageUrl: `${SLIDE_BASE}/9_.png`,
    duration: 16,
  },
  {
    index: 9,
    title: "The Innate Effector Cycle: Act, Then Stand Down",
    body: "Activation is only half the story. The innate immune system must also resolve — returning to baseline after a threat is cleared. This resolution is not passive; it is an actively programmed process driven by specialized pro-resolving mediators and efferocytosis. Resolution is not the absence of inflammation — it is a distinct, active biological program.",
    imageUrl: `${SLIDE_BASE}/10_The-Innate-Effector-Cycle-Act-Then-Stand-Down.png`,
    duration: 14,
  },
  {
    index: 10,
    title: "The Handoff: Innate Instructs Adaptive",
    body: "The dendritic cell is the relay station between innate and adaptive immunity. DC maturation upregulates MHC-II and CD80/86. Cytokine imprinting through IL-12, IL-23, and IL-6 shapes the adaptive response. Without maturation, adaptive priming aborts entirely. Epithelial and stromal instruction via IL-1, IL-6, and IL-23 shapes the bias — Th17 versus Treg at the crossroads.",
    imageUrl: `${SLIDE_BASE}/11_.png`,
    duration: 15,
  },
  {
    index: 11,
    title: "The Bridge That Shapes Everything Downstream",
    body: "The innate-to-adaptive handoff is arguably the most consequential decision point in the entire gingival immune system. Dendritic cells are the key translators — they read the innate signal and instruct T cells on what kind of adaptive response to mount. DCs do not just present antigen — they vote on the type of war to fight.",
    imageUrl: `${SLIDE_BASE}/12_The-Bridge-That-Shapes-Everything-Downstream.png`,
    duration: 14,
  },
  {
    index: 12,
    title: "Adaptive Layer: The Slow, Precise, Amplifiable System",
    body: "The adaptive system uses V(D)J recombination and affinity maturation for clonal precision. The core balance is Th17 effector versus Treg versus T-follicular-helper. On the B-cell side, class switching leads to plasma cells that are major RANKL sources but also produce IL-35 and IL-37 regulatory signals. The adaptive layer reinforces protection or locks in destruction. It is the amplifier with a volume knob.",
    imageUrl: `${SLIDE_BASE}/13_.png`,
    duration: 16,
  },
  {
    index: 13,
    title: "Adaptive Immunity: Precision Over Speed",
    body: "Where the innate system is fast and broad, the adaptive system is slow, specific, and amplifiable. It uses V(D)J recombination and affinity maturation to generate exquisitely targeted responses — and immunological memory to respond faster next time. When properly calibrated, it provides targeted pathogen control. When dysregulated, it drives the chronic, tissue-destructive inflammation that defines periodontitis.",
    imageUrl: `${SLIDE_BASE}/14_Adaptive-Immunity-Precision-Over-Speed.png`,
    duration: 15,
  },
  {
    index: 14,
    title: "Th17 Plasticity: The Plot Twist Nobody Expected",
    body: "Not all Th17 cells are villains. Gingival Th17 cells expressing ROR-gamma-t are relatively stable and drive IL-17A, RANKL, and MMPs — leading to bone loss if unchecked. But a draining lymph node Th17 subset undergoes IL-6-driven plasticity, downregulating ROR-gamma-t and upregulating Bcl6 and CXCR5, converting to T-follicular-helper-like cells that drive protective IgG1 and IgG2c and restrict oral biomass.",
    imageUrl: `${SLIDE_BASE}/15_.png`,
    duration: 16,
  },
  {
    index: 15,
    title: "Divergent Fates of Th17 Cells",
    body: "Th17 cells exist on a spectrum from homeostatic to pathological. The cytokine milieu, microbiota composition, and metabolic cues drive plasticity between these states. The homeostatic Th17 state protects through balanced immune surveillance, while the pathological state drives tissue destruction through unchecked inflammation. Understanding these environmental factors enables therapeutic intervention.",
    imageUrl: `${SLIDE_BASE}/16_.png`,
    duration: 13,
  },
  {
    index: 16,
    title: "Periodontal Homeostasis: What Normal Actually Looks Like",
    body: "The junctional epithelium maintains constant neutrophil transit with innate-dominant signaling and PD-L1-positive immunosuppression. The sulcular epithelium runs adaptive and tertiary-lymphoid-structure-like surveillance with T-cell predominance. The stromal zone houses a fibroblast-ILC3-neutrophil circuit. Inflammation is not absent — it is spatially organized and purposeful.",
    imageUrl: `${SLIDE_BASE}/17_.png`,
    duration: 15,
  },
  {
    index: 17,
    title: "Gingival Immunological Homeostasis: A Balanced Defense",
    body: "A visualization of controlled immune cell transit and dynamic molecular signaling in a healthy gingiva, emphasizing constant surveillance rather than inactivity. Health is not silence — it is a carefully orchestrated conversation between immune cells, stromal cells, and the resident microbiome.",
    imageUrl: `${SLIDE_BASE}/18_.png`,
    duration: 12,
  },
  {
    index: 18,
    title: "Periodontal Disease: Six-Step Failure Cascade",
    body: "Step A: Ecologic shift — increased biomass and inflammophilic community. Step B: Innate uncoupling — P. gingivalis exploits C5aR-TLR2 crosstalk to block phagocytosis while preserving NF-kappa-B. Step C: Adaptive amplification with failed plasticity. Step D: Tissue execution through MMP-8/9 collagenolysis and RANKL-driven osteoclastogenesis. Step E: Spatial reorganization. Step F: Regulatory and resolution failure.",
    imageUrl: `${SLIDE_BASE}/19_.png`,
    duration: 18,
  },
  {
    index: 19,
    title: "How the System Breaks: A Step-by-Step Failure Analysis",
    body: "Periodontitis is not a sudden event — it is a progressive failure cascade where each step amplifies the next. The transition from gingivitis to periodontitis represents a phase transition — from a reversible inflammatory state to a self-reinforcing positive-feedback loop. Once the loop is established, removing the trigger alone is often insufficient to restore homeostasis. Each step is a potential intervention point — but earlier is always better.",
    imageUrl: `${SLIDE_BASE}/20_How-the-System-Breaks-A-Step-by-Step-Failure-Analysis.png`,
    duration: 16,
  },
  {
    index: 20,
    title: "P. gingivalis: The Saboteur in Chief",
    body: "P. gingivalis exploits C5aR plus TLR2 crosstalk to activate Mal-PI3K, which blocks neutrophil phagocytosis. It degrades MyD88 to disarm the bactericidal killing program. But NF-kappa-B is preserved, sustaining proinflammatory cytokine output. The net effect: inflammation without clearance — the entire dysbiotic community protected under one keystone pathogen. It does not hide from the immune system. It redirects it.",
    imageUrl: `${SLIDE_BASE}/21_.png`,
    duration: 16,
  },
  {
    index: 21,
    title: "Why P. gingivalis Is a Keystone Pathogen",
    body: "Porphyromonas gingivalis is not the most abundant bacterium in the periodontal pocket — but it is the most strategically dangerous. It functions as a keystone pathogen: a low-abundance organism that disproportionately disrupts the entire immune ecosystem. Its sabotage toolkit includes gingipains, C5aR-TLR2 crosstalk, FimA fimbriae, and a weak lipid A variant LPS. P. gingivalis does not want you dead — it wants you inflamed. Inflammation is its food source.",
    imageUrl: `${SLIDE_BASE}/22_Why-P-gingivalis-Is-a-Keystone-Pathogen.png`,
    duration: 17,
  },
  {
    index: 22,
    title: "Neutrophils: Firewall AND Liability",
    body: "In their protective homeostatic role, neutrophils perform IL-17-directed sulcular transit, PRR-mediated clearance, and efferocytosis-linked SPM release. In their pathologic hyperactivated state, they release NETs that trigger histone alarmins, amplify Th17, secrete tissue collagenase, and cause ROS-mediated bystander damage. Too few neutrophils means bone loss. Too many dysregulated neutrophils also means bone loss. The dose, context, and resolution competency determine which face the neutrophil shows.",
    imageUrl: `${SLIDE_BASE}/23_.png`,
    duration: 17,
  },
  {
    index: 23,
    title: "Neutrophils: The Most Misunderstood Cell in Periodontics",
    body: "Neutrophils are the most abundant immune cells in the gingival sulcus — and the most paradoxical. They are essential for homeostasis and central to pathology. The neutrophil is not inherently good or bad. Its behavior is entirely context-dependent. In health, it is a disciplined, targeted effector. In disease, it becomes a poorly regulated, tissue-destructive force. A neutrophil that cannot stop is more dangerous than no neutrophil at all.",
    imageUrl: `${SLIDE_BASE}/24_Neutrophils-The-Most-Misunderstood-Cell-in-Periodontics.png`,
    duration: 16,
  },
  {
    index: 24,
    title: "B-Lineage Cells: Destruction, Regulation, and Biomass Control",
    body: "B cells have three faces. The destructive face: RANKL-positive B cells and plasma cells drive osteoclastogenesis. The regulatory face: subset plasma cells produce IL-35 and IL-37 with context-dependent local regulatory outputs. The biomass controller: T-follicular-helper-supported germinal center output drives IgG1 and IgG2c that restricts oral microbial load. B cells are not just bystanders — they are bone destroyers, immune brakes, and microbial wardens simultaneously.",
    imageUrl: `${SLIDE_BASE}/25_.png`,
    duration: 16,
  },
  {
    index: 25,
    title: "B Cells: More Than Antibody Factories",
    body: "B cells and plasma cells have long been associated with late-stage periodontal disease — but their roles are far more complex than simple antibody production. They are active participants in bone destruction, immune regulation, and microbial biomass control. Targeting B cells in periodontitis is not straightforward — you risk eliminating the protective alongside the destructive.",
    imageUrl: `${SLIDE_BASE}/26_B-Cells-More-Than-Antibody-Factories.png`,
    duration: 14,
  },
  {
    index: 26,
    title: "Resident Stromal Cells: The Underrated Decision-Makers",
    body: "Junctional keratinocytes constitutively produce keratokines including CXCL1/3/8, IL-36-gamma, and G-CSF, with PD-L1-positive innate immunosuppression. Sulcular keratinocytes bias toward adaptive and tertiary-lymphoid-structure-like signaling environments. CD81-positive fibroblasts secrete C3 for C3aR1-driven neutrophil recruitment, with SASP in senescent subsets sustaining chronic influx. 2024 to 2026 atlases confirm: stromal cells define immune geography, not just scaffold.",
    imageUrl: `${SLIDE_BASE}/27_.png`,
    duration: 16,
  },
  {
    index: 27,
    title: "Stromal Cells: The Immune System's Hidden Infrastructure",
    body: "Immune cells get most of the attention — but the resident stromal cells of the gingiva are not passive bystanders. They are active immune regulators that shape every aspect of the local response. In disease, stromal reprogramming can lock the tissue into a pro-inflammatory state even after the microbial trigger is reduced. Treat the stroma, not just the immune cells — stromal reprogramming is a key driver of chronicity.",
    imageUrl: `${SLIDE_BASE}/28_Stromal-Cells-The-Immune-Systems-Hidden-Infrastructure.png`,
    duration: 15,
  },
  {
    index: 28,
    title: "Spatial & Single-Cell Control Layer (2024–2026 Atlas Data)",
    body: "Three microniche zones define the immune geography. The periJK zone is innate-heavy with CXCL8, IL-1-alpha/beta, G-CSF, PD-L1-positive immunosuppression, and is neutrophil and macrophage dense. The periSK zone is adaptive and TLS-like, enriched in T-cells and DCs with B-cell accumulation in disease. The stromal base houses fibroblast subsets including C3-positive and SASP-positive that drive spatial neutrophil positioning. Immune geography is not random — it is tissue-encoded.",
    imageUrl: `${SLIDE_BASE}/29_.png`,
    duration: 17,
  },
  {
    index: 29,
    title: "Why Location Matters: The Spatial Immune Architecture",
    body: "Single-cell RNA sequencing and spatial transcriptomics have transformed our understanding of gingival immunity. The tissue is a collection of distinct microniches, each with its own cellular composition, signaling logic, and disease vulnerability. The same cell type behaves differently depending on where it sits in the tissue. You cannot understand the immune response without knowing where in the tissue it is happening.",
    imageUrl: `${SLIDE_BASE}/30_Why-Location-Matters-The-Spatial-Immune-Architecture.png`,
    duration: 14,
  },
  {
    index: 30,
    title: "Dynamical Systems View: Health vs. Disease Attractors",
    body: "Health is a stable negative-feedback equilibrium maintained by efferocytosis, specialized pro-resolving mediators, IgG biomass control, and balanced RANKL/OPG. Periodontitis is a bistable attractor where inflammation drives dysbiosis, which drives more inflammation, with failed Th17 plasticity leading to unchecked biomass and more RANKL. The switch trigger is mastication setting initial conditions, with P. gingivalis virulence flipping the bistable switch. Restoring health means escaping the disease attractor well, not just dampening one cytokine.",
    imageUrl: `${SLIDE_BASE}/31_.png`,
    duration: 18,
  },
  {
    index: 31,
    title: "Thinking in Attractors: Why Disease Is Hard to Reverse",
    body: "The dynamical systems framework offers a powerful lens for understanding why periodontitis is so difficult to treat. Health and disease are not simply more or less inflammation — they are distinct stable states, or attractors, in a high-dimensional biological space. Removing bacteria alone may not be enough to escape the disease attractor. Therapeutic success requires shifting the attractor landscape — not just reducing the trigger. You cannot treat a phase transition with a linear intervention.",
    imageUrl: `${SLIDE_BASE}/32_Thinking-in-Attractors-Why-Disease-Is-Hard-to-Reverse.png`,
    duration: 16,
  },
  {
    index: 32,
    title: "The Master Mnemonic: Eight-Stage Control Loop",
    body: "Barrier. Sensing through PRR. Routing through gradients. Containment through neutrophils and efferocytosis. Instruction through DC handoff. Clonal amplification. Plasticity from Th17 to T-follicular-helper. Resolution through SPMs and efferocytosis. Periodontitis equals checkpoint failures at Containment plus Resolution plus Protective Plasticity. Eight steps. Three failure points. One disease.",
    imageUrl: `${SLIDE_BASE}/33_.png`,
    duration: 15,
  },
  {
    index: 33,
    title: "The Eight-Stage Loop: Your Mental Model for Gingival Immunity",
    body: "The eight-stage control loop is a mnemonic architecture — a way to hold the entire gingival immune system in your head as a single coherent narrative. Each stage maps to a biological module, and together they form a complete input-process-output-feedback system. If you can walk through this loop from memory, you can reconstruct the entire immunology of the gingiva — from first bacterial contact to bone loss or resolution. Master the loop, and the details will organize themselves around it.",
    imageUrl: `${SLIDE_BASE}/34_The-Eight-Stage-Loop-Your-Mental-Model-for-Gingival-Immunity.png`,
    duration: 16,
  },
  {
    index: 34,
    title: "Therapeutic Leverage Points: Engineering the Controller",
    body: "Four leverage quadrants emerge. Complement intervention: C5aR antagonism or C3 inhibition reduces TNF, IL-1-beta, IL-6, IL-17 and protects bone. SPM analogs: RvE1 and LXA4 restore efferocytosis and suppress the IL-23/IL-17 feedforward loop. Context-selective IL-17/23 modulation preserves homeostatic neutrophil routing while targeting pathologic amplification. Plasticity enhancement promotes Th17-to-Tfh conversion and stabilizes the Treg phenotype. Not broad antimicrobials. Targeted checkpoint restoration on the same layered architecture.",
    imageUrl: `${SLIDE_BASE}/35_.png`,
    duration: 18,
  },
  {
    index: 35,
    title: "From Biology to Therapy: Where to Pull the Levers",
    body: "Understanding the control architecture of gingival immunity directly reveals where and how to intervene. Each module in the system is a potential therapeutic target, and the most promising interventions are those that restore homeostatic logic rather than simply suppressing inflammation. The future of periodontal therapy is precision immunomodulation: restoring the system's ability to self-regulate, resolve, and maintain its homeostatic setpoint. The best therapeutic target is the one that restores the system's own control logic — not the one that overrides it.",
    imageUrl: `${SLIDE_BASE}/36_From-Biology-to-Therapy-Where-to-Pull-the-Levers.png`,
    duration: 16,
  },
  {
    index: 36,
    title: "One-Sentence Synthesis (Worth Memorizing)",
    body: "Periodontitis is the self-reinforcing positive-feedback trap when clearance plus resolution plus Th17-to-Tfh checkpoints fail — locking the system into dysbiosis, uncoupled inflammation, stromal C3/neutrophil circuits, lymphocyte RANKL, MMP proteolysis, and osteoclast-driven bone loss. Innate equals fast sensor-containment. Adaptive equals slow clonal precision-and-plasticity. Disease equals the attractor you cannot escape with antibiotics alone.",
    imageUrl: `${SLIDE_BASE}/37_.png`,
    duration: 16,
  },
  {
    index: 37,
    title: "Unpacking the Synthesis Sentence",
    body: "Self-reinforcing positive-feedback trap: once established, the disease state sustains itself. Clearance fails because P. gingivalis has subverted the killing machinery. Resolution fails because SPM production is insufficient and efferocytosis is impaired. Th17 regulation fails because the IL-23/IL-17 axis is dysregulated. All fail simultaneously — and it is the convergence of all three that tips the system into the disease attractor. One sentence. Three failure modes. One disease. This is the architecture of periodontitis.",
    imageUrl: `${SLIDE_BASE}/38_Unpacking-the-Synthesis-Sentence.png`,
    duration: 17,
  },
  {
    index: 38,
    title: "Where To Go From Here",
    body: "Three paths forward. Zoom into a layer: full pathway diagrams for C5aR-TLR2 crosstalk, Th17-to-Tfh switch, or SPM signaling cascades. Systems modeling: dynamical ODE models of the bistable attractor, parameterized from 2024 to 2026 atlas datasets, to identify tipping points for intervention. Translational design: trial readout mapping to control architecture layers, with biomarker selection aligned to checkpoint identity. The wiring diagram is complete. Now decide which wire to pull.",
    imageUrl: `${SLIDE_BASE}/39_.png`,
    duration: 15,
  },
  {
    index: 39,
    title: "Your Next Steps: Deepening the Architecture",
    body: "This deck has given you the wiring diagram. Now it is time to zoom in, go deeper, and connect the biology to clinical practice. Three paths forward: zoom into a layer at the pathway level, connect each failure mode to a clinical presentation, and follow the frontier of 2024 to 2026 spatial atlas data. The architecture you have learned is a scaffold — not a ceiling. The best immunologists are the ones who never stop asking: but what controls that?",
    imageUrl: `${SLIDE_BASE}/40_Your-Next-Steps-Deepening-the-Architecture.png`,
    duration: 15,
  },
];

const TEMPLATE_STYLES: Record<string, VideoData["template"]> = {
  documentary: {
    preset: "documentary",
    style: {
      backgroundColor: "#0a0a0a",
      textColor: "#f5f5f0",
      accentColor: "#c9a84c",
      fontFamily: "Georgia, serif",
      overlayOpacity: 0.4,
    },
    timing: {
      introDurationSec: 5,
      outroDurationSec: 6,
      transitionDurationSec: 1.5,
    },
    music: { volume: 0.15 },
  },
  "cinematic-dark": {
    preset: "cinematic-dark",
    style: {
      backgroundColor: "#000000",
      textColor: "#ffffff",
      accentColor: "#3b82f6",
      fontFamily: "'Inter', sans-serif",
      overlayOpacity: 0.55,
    },
    timing: {
      introDurationSec: 5,
      outroDurationSec: 6,
      transitionDurationSec: 1.2,
    },
    music: { volume: 0.2 },
  },
  "modern-minimal": {
    preset: "modern-minimal",
    style: {
      backgroundColor: "#fafafa",
      textColor: "#1a1a1a",
      accentColor: "#2563eb",
      fontFamily: "'Inter', sans-serif",
      overlayOpacity: 0.05,
    },
    timing: {
      introDurationSec: 3,
      outroDurationSec: 4,
      transitionDurationSec: 0.8,
    },
    music: { volume: 0.1 },
  },
  "science-journal": {
    preset: "science-journal",
    style: {
      backgroundColor: "#f8f6f0",
      textColor: "#2d2d2d",
      accentColor: "#16a34a",
      fontFamily: "Georgia, serif",
      overlayOpacity: 0.1,
    },
    timing: {
      introDurationSec: 4,
      outroDurationSec: 5,
      transitionDurationSec: 1.0,
    },
    music: { volume: 0.12 },
  },
  "impact-story": {
    preset: "impact-story",
    style: {
      backgroundColor: "#0f172a",
      textColor: "#f1f5f9",
      accentColor: "#ef4444",
      fontFamily: "'Inter', sans-serif",
      overlayOpacity: 0.5,
    },
    timing: {
      introDurationSec: 3,
      outroDurationSec: 5,
      transitionDurationSec: 0.6,
    },
    music: { volume: 0.25 },
  },
};

// Voice config per template — these map to ElevenLabs voices when key is set,
// falls back to OpenAI voices automatically via the API route.
const TEMPLATE_VOICE: Record<string, { voiceId: string; speed: number }> = {
  documentary: { voiceId: "onyx", speed: 0.95 },       // → ElevenLabs George
  "cinematic-dark": { voiceId: "echo", speed: 0.9 },   // → ElevenLabs Roger
  "modern-minimal": { voiceId: "nova", speed: 1.0 },   // → ElevenLabs Aria
  "science-journal": { voiceId: "alloy", speed: 0.92 }, // → ElevenLabs Sarah
  "impact-story": { voiceId: "fable", speed: 1.05 },   // → ElevenLabs Eryn
};

// ── Per-Slide Status Tracking ───────────────────────────────────────────────

type SlideAudioStatus = "pending" | "generating" | "success" | "failed" | "stored";

interface SlideAudioState {
  status: SlideAudioStatus;
  audioUrl?: string;      // blob URL (transient) or CDN URL (persistent)
  error?: string;
  retries?: number;
  provider?: string;
  persistent?: boolean;   // true if stored in Supabase
}

type NarrationStatus = "idle" | "generating" | "ready" | "error";

export function ShowcaseContent() {
  const [selectedTemplate, setSelectedTemplate] = useState("cinematic-dark");
  const [narrationStatus, setNarrationStatus] = useState<NarrationStatus>("idle");
  const [slideStates, setSlideStates] = useState<Record<number, SlideAudioState>>({});
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const musicEngineRef = useRef<AmbientMusicEngine | null>(null);

  const voice = TEMPLATE_VOICE[selectedTemplate] || TEMPLATE_VOICE["cinematic-dark"];
  const templateMusic = TEMPLATE_STYLES[selectedTemplate]?.music;

  // Computed stats
  const readyCount = Object.values(slideStates).filter(
    (s) => s.status === "success" || s.status === "stored"
  ).length;
  const failedCount = Object.values(slideStates).filter((s) => s.status === "failed").length;
  const generatingCount = Object.values(slideStates).filter((s) => s.status === "generating").length;
  const progress = PERIO_IMMUNO_SLIDES.length > 0
    ? Math.round(((readyCount + failedCount) / PERIO_IMMUNO_SLIDES.length) * 100)
    : 0;

  // ── Check for pre-stored audio on mount ─────────────────────────────────
  useEffect(() => {
    checkStoredAudio();
  }, []);

  const checkStoredAudio = useCallback(async () => {
    try {
      const res = await fetch(`/api/video/store?presentationId=${PRESENTATION_ID}`);
      if (!res.ok) return;
      const data = await res.json();

      if (data.slides && data.slides.length > 0) {
        const stored: Record<number, SlideAudioState> = {};
        for (const slide of data.slides) {
          if (slide.index >= 0) {
            stored[slide.index] = {
              status: "stored",
              audioUrl: slide.url,
              persistent: true,
              provider: "stored",
            };
          }
        }
        setSlideStates(stored);
        if (Object.keys(stored).length === PERIO_IMMUNO_SLIDES.length) {
          setNarrationStatus("ready");
        }
      }
    } catch {
      // No stored audio — that's fine
    }
  }, []);

  // ── Music engine ────────────────────────────────────────────────────────
  useEffect(() => {
    musicEngineRef.current = new AmbientMusicEngine();
    return () => { musicEngineRef.current?.stop(); };
  }, []);

  useEffect(() => {
    if (musicPlaying && musicEngineRef.current) {
      musicEngineRef.current.stop();
      const t = setTimeout(() => {
        musicEngineRef.current?.start(selectedTemplate, templateMusic?.volume ?? 0.15);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [selectedTemplate]);

  const toggleMusic = useCallback(() => {
    if (!musicEngineRef.current) return;
    if (musicPlaying) {
      musicEngineRef.current.stop();
      setMusicPlaying(false);
    } else {
      musicEngineRef.current.start(selectedTemplate, templateMusic?.volume ?? 0.15);
      setMusicPlaying(true);
    }
  }, [musicPlaying, selectedTemplate, templateMusic?.volume]);

  // ── Generate Narration (slide-by-slide with retry) ──────────────────────
  const generateNarration = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setNarrationStatus("generating");

    // Only generate slides that don't already have stored audio
    const slidesToGenerate = PERIO_IMMUNO_SLIDES.filter((slide) => {
      const state = slideStates[slide.index];
      return !state || state.status === "failed" || state.status === "pending";
    });

    // Mark all pending slides as pending in state
    const newStates = { ...slideStates };
    for (const slide of slidesToGenerate) {
      newStates[slide.index] = { status: "pending" };
    }
    setSlideStates({ ...newStates });

    for (const slide of slidesToGenerate) {
      if (controller.signal.aborted) return;

      // Mark as generating
      newStates[slide.index] = { status: "generating" };
      setSlideStates({ ...newStates });

      try {
        const res = await fetch("/api/video/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: slide.body,
            voiceId: voice.voiceId,
            speed: voice.speed,
            slideIndex: slide.index,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const provider = res.headers.get("X-TTS-Provider") || "unknown";
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        newStates[slide.index] = {
          status: "success",
          audioUrl: blobUrl,
          provider,
          persistent: false,
        };
        setSlideStates({ ...newStates });

        // Store to Supabase in background (fire-and-forget)
        storeAudioInBackground(blob, slide.index);

      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Retry once on rate-limit (429) or server errors
        const status = (err as { status?: number }).status;
        if (status === 429 || (status && status >= 500)) {
          await new Promise((r) => setTimeout(r, 2000));
          try {
            const retry = await fetch("/api/video/tts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: slide.body, voiceId: voice.voiceId, speed: voice.speed }),
              signal: controller.signal,
            });
            if (retry.ok) {
              const blob = await retry.blob();
              newStates[slide.index] = URL.createObjectURL(blob);
            }
          } catch (retryErr) {
            if ((retryErr as Error).name === "AbortError") return;
            console.error(`TTS retry failed for slide slide.indexi}:`, retryErr);
          }
        } else {
          console.error(`TTS failed for slide ${slide.index}:`, err);
        }
      }
      // Small delay to avoid rate-limiting
      await new Promise((r) => setTimeout(r, 150));

        newStates[slide.index] = {
          status: "failed",
          error: (err as Error).message,
        };
        setSlideStates({ ...newStates });
      }
    }

    // Final status
    const finalReady = Object.values(newStates).filter(
      (s) => s.status === "success" || s.status === "stored"
    ).length;
    const finalFailed = Object.values(newStates).filter((s) => s.status === "failed").length;

    if (finalReady === 0) {
      setNarrationStatus("error");
    } else {
      setNarrationStatus("ready");
    }
  
    if (finalFailed > 0) {
      console.warn(`[Showcase] ${finalFailed} slides failed generation. Use "Retry Failed" to re-attempt.`);
    }
  }, [voice.voiceId, voice.speed, slideStates]);

  // ── Store audio to Supabase (background) ────────────────────────────────
  const storeAudioInBackground = useCallback(async (blob: Blob, slideIndex: number) => {
    try {
      const buffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
      );

      const res = await fetch("/api/video/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64: base64,
          slideIndex,
          presentationId: PRESENTATION_ID,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSlideStates((prev) => ({
          ...prev,
          [slideIndex]: {
            ...prev[slideIndex],
            status: "stored",
            audioUrl: data.url, // Replace blob URL with persistent CDN URL
            persistent: true,
          },
        }));
      }
    } catch {
      // Non-critical — blob URL still works for playback
    }
  }, []);

  // ── Retry failed slides only ────────────────────────────────────────────
  const retryFailed = useCallback(async () => {
    // Reset failed slides to pending, then re-run
    setSlideStates((prev) => {
      const updated = { ...prev };
      for (const [idx, state] of Object.entries(updated)) {
        if (state.status === "failed") {
          updated[Number(idx)] = { status: "pending" };
        }
      }
      return updated;
    });
    // Small delay then re-trigger
    setTimeout(() => generateNarration(), 100);
  }, [generateNarration]);

  const cancelNarration = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setNarrationStatus(readyCount > 0 ? "ready" : "idle");
  }, [readyCount]);

  // ── Merge audio URLs into slide data ────────────────────────────────────
  const slidesWithAudio = PERIO_IMMUNO_SLIDES.map((slide) => {
    const state = slideStates[slide.index];
    return {
      ...slide,
      audioUrl: state?.audioUrl,
    };
  });

  const videoData: VideoData = {
    title: "Gingival Immunity v2.0",
    subtitle: "The Wiring Diagram — A Molecularly Resolved Control Architecture",
    author: "S. Thaddeus Connelly, DDS, MD, PhD, FACS",
    slides: slidesWithAudio,
    template: TEMPLATE_STYLES[selectedTemplate],
  };

  return (
    <div className="space-y-10">
      {/* Video Player */}
      <div data-cinematic-player className="rounded-xl overflow-hidden shadow-2xl">
        <CinematicPlayer
          key={`${selectedTemplate}-${narrationStatus}`}
          data={videoData}
          className="w-full"
        />
      </div>

      {/* Audio Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Narration Controls */}
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
              AI Voice Narration
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate spoken narration for all 40 slides using ElevenLabs
              (falls back to OpenAI if no ElevenLabs key).
              Voice: <strong>{voice.voiceId}</strong> at {voice.speed}x.
            </p>
          </div>

          {/* Status bar */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {readyCount} ready
            </span>
            {failedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {failedCount} failed
              </span>
            )}
            {generatingCount > 0 && (
              <span className="inline-flex items-center gap-1 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {generatingCount} generating
              </span>
            )}
            <span className="text-muted-foreground ml-auto">
              {readyCount}/{PERIO_IMMUNO_SLIDES.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {narrationStatus === "generating" && (
              <button
                onClick={cancelNarration}
                className="px-3 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={generateNarration}
              disabled={narrationStatus === "generating"}
              className="px-5 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              style={{
                backgroundColor:
                  readyCount === PERIO_IMMUNO_SLIDES.length ? "#16a34a" :
                  narrationStatus === "generating" ? "#6366f1" : "#3b82f6",
                color: "#ffffff",
              }}
            >
              {narrationStatus === "idle" && readyCount === 0 && "Generate All Narration"}
              {narrationStatus === "idle" && readyCount > 0 && readyCount < PERIO_IMMUNO_SLIDES.length && `Generate Remaining (${PERIO_IMMUNO_SLIDES.length - readyCount} slides)`}
              {narrationStatus === "generating" && `Generating... ${progress}%`}
              {narrationStatus === "ready" && readyCount === PERIO_IMMUNO_SLIDES.length && "All 40 Slides Ready"}
              {narrationStatus === "ready" && readyCount < PERIO_IMMUNO_SLIDES.length && `${readyCount}/${PERIO_IMMUNO_SLIDES.length} Ready`}
              {narrationStatus === "error" && "Retry Generation"}
            </button>
            {failedCount > 0 && narrationStatus !== "generating" && (
              <button
                onClick={retryFailed}
                className="px-3 py-2 text-sm rounded-lg transition-colors"
                style={{ backgroundColor: "#ef4444", color: "#ffffff" }}
              >
                Retry {failedCount} Failed
              </button>
            )}
          </div>

          {/* Progress bar */}
          {narrationStatus === "generating" && (
            <div className="mt-3">
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {narrationStatus === "ready" && (
            <p className="text-xs text-muted-foreground mt-3">
              Press play above — narration syncs with each slide automatically.
            </p>
          )}
        </div>

        {/* Ambient Music Controls */}
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <svg className="h-5 w-5 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              Ambient Background Music
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Synthesized ambient pad matched to each template&apos;s mood.
              Plays continuously while you watch.
            </p>
          </div>
          <button
            onClick={toggleMusic}
            className="px-5 py-2.5 text-sm font-medium rounded-lg transition-colors w-full"
            style={{
              backgroundColor: musicPlaying ? "#7c3aed" : "#8b5cf6",
              color: "#ffffff",
            }}
          >
            {musicPlaying ? "Stop Background Music" : "Start Background Music"}
          </button>
          <p className="text-xs text-muted-foreground mt-3">
            {musicPlaying
              ? `Playing ambient pad for "${selectedTemplate}" template. Change template to hear a different mood.`
              : "Click to start — each of the 5 templates has a unique harmonic signature."}
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Choose a Style</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Select a cinematic template to change the visual style, voice, and music.
          Each template is a complete audiovisual identity.
        </p>
        <TemplatePicker
          selected={selectedTemplate}
          onChange={(t) => {
            setSelectedTemplate(t);
            // Clear non-persistent audio when template changes (different voice)
            if (narrationStatus === "ready" || narrationStatus === "error") {
              const hasPersistedAudio = Object.values(slideStates).some((s) => s.persistent);
              if (!hasPersistedAudio) {
                // Revoke blob URLs
                Object.values(slideStates).forEach((s) => {
                  if (s.audioUrl && !s.persistent) URL.revokeObjectURL(s.audioUrl);
                });
                setSlideStates({});
                setNarrationStatus("idle");
              }
            }
          }}
        />
      </div>

      {/* Slide Index with Per-Slide Status */}
      <div className="rounded-xl border bg-card p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">40 Slides — Full Presentation</h3>
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdmin ? "Hide Details" : "Show Generation Details"}
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          Each slide shows its audio generation status. Green = ready, red = failed, gray = pending.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {PERIO_IMMUNO_SLIDES.map((slide) => {
            const state = slideStates[slide.index];
            const statusColor =
              state?.status === "success" || state?.status === "stored" ? "bg-green-500" :
              state?.status === "failed" ? "bg-red-500" :
              state?.status === "generating" ? "bg-blue-500 animate-pulse" :
              "bg-gray-300";

            return (
              <div key={slide.index} className="rounded-lg bg-muted/50 p-3">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-muted-foreground shrink-0">
                    {String(slide.index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-medium flex-1">{slide.title}</span>
                  <span className={`shrink-0 w-2 h-2 rounded-full mt-1 ${statusColor}`} />
                </div>
                {showAdmin && state && (
                  <div className="mt-2 pl-7 text-[10px] text-muted-foreground space-y-0.5">
                    <div>Status: <span className="font-medium">{state.status}</span></div>
                    {state.provider && <div>Provider: {state.provider}</div>}
                    {state.persistent && <div className="text-green-600">Stored in CDN</div>}
                    {state.error && <div className="text-red-500">{state.error}</div>}
                    {state.retries !== undefined && state.retries > 0 && (
                      <div>Retries: {state.retries}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pipeline info */}
      <div className="rounded-xl border bg-card p-8">
        <h3 className="text-lg font-semibold mb-3">About the Video Pipeline</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          This video was generated from a PowerPoint presentation using the OVN Nexus
          Video Pipeline. The pipeline extracts slide content, generates AI narration,
          adds cinematic background music, and renders the final video with animated
          transitions — all from a single .pptx file.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">AI Voice</div>
            <div className="text-muted-foreground">
              ElevenLabs (primary) or OpenAI TTS generates natural narration per-slide with retry and persistent storage
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">AI Music</div>
            <div className="text-muted-foreground">
              Cinematic ambient pads synthesized in-browser, matched to each template&apos;s harmonic signature
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">Persistent Storage</div>
            <div className="text-muted-foreground">
              Generated audio is stored to Supabase CDN — once generated, it loads instantly on revisit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

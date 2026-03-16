"use client";

import React, { useState } from "react";
import { CinematicPlayer, VideoData } from "@/components/video/video-player";
import { TemplatePicker } from "@/components/video/template-picker";

// ── Perio Immuno Presentation Data ───────────────────────────────────────────
// "Gingival Immunity v2.0: The Wiring Diagram"
// Full 40-slide presentation with narration scripts and slide images.

const SLIDE_BASE = "/slides/perio-immuno";

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

export function ShowcaseContent() {
  const [selectedTemplate, setSelectedTemplate] = useState("cinematic-dark");

  const videoData: VideoData = {
    title: "Gingival Immunity v2.0",
    subtitle: "The Wiring Diagram — A Molecularly Resolved Control Architecture",
    author: "S. Thaddeus Connelly, DDS, MD, PhD, FACS",
    slides: PERIO_IMMUNO_SLIDES,
    template: TEMPLATE_STYLES[selectedTemplate],
  };

  return (
    <div className="space-y-10">
      {/* Video Player */}
      <div data-cinematic-player className="rounded-xl overflow-hidden shadow-2xl">
        <CinematicPlayer
          key={selectedTemplate}
          data={videoData}
          className="w-full"
        />
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
          onChange={setSelectedTemplate}
        />
      </div>

      {/* Slide index */}
      <div className="rounded-xl border bg-card p-8">
        <h3 className="text-lg font-semibold mb-4">40 Slides — Full Presentation</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This cinematic presentation covers the complete architecture of gingival immunity,
          from the system objective through eight interconnected layers to therapeutic leverage points.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {PERIO_IMMUNO_SLIDES.map((slide) => (
            <div key={slide.index} className="rounded-lg bg-muted/50 p-3">
              <span className="font-mono text-muted-foreground">
                {String(slide.index + 1).padStart(2, "0")}
              </span>{" "}
              <span className="font-medium">{slide.title}</span>
            </div>
          ))}
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
              OpenAI TTS or ElevenLabs generates natural narration from slide content
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">AI Music</div>
            <div className="text-muted-foreground">
              Cinematic background scores generated to match each template mood
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">Reusable Template</div>
            <div className="text-muted-foreground">
              Drop any .pptx file into the pipeline to generate a new cinematic video
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

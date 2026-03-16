"use client";

import React, { useState } from "react";
import { CinematicPlayer, VideoData } from "@/components/video/video-player";
import { TemplatePicker } from "@/components/video/template-picker";

// ── Demo Data ────────────────────────────────────────────────────────────────
// This serves as both the demo and as a template for future presentations.
// When the pipeline runs on a real PPTX, it generates this same data structure.

const DEMO_SLIDES: VideoData["slides"] = [
  {
    index: 0,
    title: "The Mouth-Body Connection",
    body: "Oral microbes release inflammatory signals that travel through the bloodstream and nervous system to influence the heart, brain, and immune system.",
    duration: 8,
  },
  {
    index: 1,
    title: "The OVN Axis Framework",
    body: "The Oral-Vascular-Neural (OVN) Axis is a scientific framework for studying how periodontal pathogens drive systemic inflammation across three interconnected pathways.",
    duration: 9,
  },
  {
    index: 2,
    title: "Outer Membrane Vesicles (OMVs)",
    body: "OMVs are nanoscale particles (20–250 nm) shed by gram-negative bacteria like P. gingivalis. Unlike planktonic bacteria, OMVs can cross epithelial barriers and deliver concentrated virulence cargo to host cells at distant sites.",
    duration: 11,
  },
  {
    index: 3,
    title: "Step 1: Barrier Disruption",
    body: "OMVs breach the periodontal epithelium and enter systemic circulation, carrying gingipains, LPS, and fimbriae past the body's first line of defense.",
    duration: 8,
  },
  {
    index: 4,
    title: "Step 2: Mitochondrial Dysfunction",
    body: "Virulence cargo impairs mitochondrial respiration in target cells, shifting energy metabolism and triggering oxidative stress cascades.",
    duration: 8,
  },
  {
    index: 5,
    title: "Step 3: Phenotypic Reprogramming",
    body: "Host cells shift toward a pro-inflammatory, pro-remodeling phenotype — a fundamental change in cellular behavior driven by the OMV payload.",
    duration: 9,
  },
  {
    index: 6,
    title: "Step 4: Secondary EV Signals",
    body: "Reprogrammed cells shed their own extracellular vesicles, amplifying the inflammatory signal and extending its reach to distant tissues.",
    duration: 8,
  },
  {
    index: 7,
    title: "Step 5: Tissue Endpoints",
    body: "Cumulative effects manifest as vascular, neural, or oncological pathology — the downstream consequences of chronic oral microbial exposure.",
    duration: 9,
  },
  {
    index: 8,
    title: "The Scale of the Problem",
    body: "32% of global deaths from cardiovascular disease. 1 in 6 cancer deaths involve pathways under investigation. ~1 billion projected dementia cases by 2050.",
    duration: 10,
  },
  {
    index: 9,
    title: "What Clinicians Can Do Today",
    body: "Treat periodontitis as a systemic health issue. Capture periodontal status in cardiometabolic histories. Anticipate biomarker improvement after periodontal therapy.",
    duration: 9,
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
      introDurationSec: 4,
      outroDurationSec: 5,
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
      overlayOpacity: 0.6,
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
    title: "The OVN Axis",
    subtitle: "How Oral Microbes Drive Systemic Disease",
    author: "S. Thaddeus Connelly, DDS, MD, PhD, FACS",
    slides: DEMO_SLIDES,
    template: TEMPLATE_STYLES[selectedTemplate],
  };

  return (
    <div className="space-y-10">
      {/* Video Player */}
      <div data-cinematic-player className="rounded-xl overflow-hidden shadow-2xl">
        <CinematicPlayer
          key={selectedTemplate} // re-mount on template change
          data={videoData}
          className="w-full"
        />
      </div>

      {/* Template Selector */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Choose a Style</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Select a cinematic template to change the visual style. Each template defines
          colors, typography, animations, voice, and music.
        </p>
        <TemplatePicker
          selected={selectedTemplate}
          onChange={setSelectedTemplate}
        />
      </div>

      {/* Info section */}
      <div className="rounded-xl border bg-card p-8">
        <h3 className="text-lg font-semibold mb-3">About This Feature</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          The OVN Nexus Video Pipeline converts PowerPoint presentations into
          cinematic videos with AI-generated voice narration and background music.
          Upload any .pptx file and choose a template to create a professional
          video for your presentations, conferences, or educational content.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">AI Voice</div>
            <div className="text-muted-foreground">
              OpenAI TTS or ElevenLabs generates natural narration from slide notes
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">AI Music</div>
            <div className="text-muted-foreground">
              Cinematic background scores generated to match each template style
            </div>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="font-semibold mb-1">5 Templates</div>
            <div className="text-muted-foreground">
              Documentary, Cinematic Dark, Modern Minimal, Science Journal, Impact Story
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

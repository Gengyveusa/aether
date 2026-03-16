"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

// ── Template Picker Component ────────────────────────────────────────────────
// Lets users choose a cinematic style for their video.

interface TemplateDef {
  id: string;
  name: string;
  description: string;
  preview: {
    bg: string;
    text: string;
    accent: string;
  };
}

const TEMPLATE_OPTIONS: TemplateDef[] = [
  {
    id: "documentary",
    name: "Documentary",
    description: "Ken Burns pans, warm tones, authoritative narration",
    preview: { bg: "#0a0a0a", text: "#f5f5f0", accent: "#c9a84c" },
  },
  {
    id: "cinematic-dark",
    name: "Cinematic Dark",
    description: "Dramatic reveals, deep blacks, bold typography",
    preview: { bg: "#000000", text: "#ffffff", accent: "#3b82f6" },
  },
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    description: "Clean, Apple-style with smooth slide-ins",
    preview: { bg: "#fafafa", text: "#1a1a1a", accent: "#2563eb" },
  },
  {
    id: "science-journal",
    name: "Science Journal",
    description: "Academic feel, paper backgrounds, clinical precision",
    preview: { bg: "#f8f6f0", text: "#2d2d2d", accent: "#16a34a" },
  },
  {
    id: "impact-story",
    name: "Impact Story",
    description: "Bold colors, fast cuts, emotional storytelling",
    preview: { bg: "#0f172a", text: "#f1f5f9", accent: "#ef4444" },
  },
];

interface TemplatePickerProps {
  selected: string;
  onChange: (templateId: string) => void;
}

export function TemplatePicker({ selected, onChange }: TemplatePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TEMPLATE_OPTIONS.map((template) => {
        const isSelected = selected === template.id;

        return (
          <button
            key={template.id}
            onClick={() => onChange(template.id)}
            className={`relative rounded-xl border-2 p-1 text-left transition-all ${
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
          >
            {/* Mini preview */}
            <div
              className="rounded-lg p-6 mb-2 aspect-video flex flex-col justify-end"
              style={{ backgroundColor: template.preview.bg }}
            >
              <div
                className="w-8 h-0.5 mb-2 rounded"
                style={{ backgroundColor: template.preview.accent }}
              />
              <div
                className="text-sm font-bold"
                style={{ color: template.preview.text }}
              >
                Sample Title
              </div>
              <div
                className="text-xs mt-1 opacity-60"
                style={{ color: template.preview.text }}
              >
                Subtitle text here
              </div>
            </div>

            <div className="px-2 pb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{template.name}</h3>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {template.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export { TEMPLATE_OPTIONS };
export type { TemplateDef };

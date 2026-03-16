"use client";

import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SUNO_CREATE_URL } from "@/lib/music/constants";
import type { SunoPrompt } from "@/lib/music/types";

interface PromptCardProps {
  prompt: SunoPrompt;
  className?: string;
}

export function PromptCard({ prompt, className }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenInSuno = async () => {
    await navigator.clipboard.writeText(prompt.prompt);
    setCopied(true);
    window.open(SUNO_CREATE_URL, "_blank", "noopener,noreferrer");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span className="text-xs font-bold text-primary">Prompt {prompt.id}</span>
          <p className="text-xs text-muted-foreground mt-0.5">{prompt.description}</p>
        </div>
      </div>

      <p className="text-sm bg-muted/50 rounded-md p-3 font-mono leading-relaxed">
        {prompt.prompt}
      </p>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {prompt.style_tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy Prompt"}
        </button>
        <button
          onClick={handleOpenInSuno}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Open in Suno
        </button>
      </div>
    </div>
  );
}

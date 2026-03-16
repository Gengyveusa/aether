#!/usr/bin/env tsx
/**
 * OVN Nexus — Video Pipeline CLI
 *
 * Converts a PowerPoint presentation into a cinematic video
 * with AI-generated narration and background music.
 *
 * Usage:
 *   npx tsx video-pipeline/run.ts --input ./presentation.pptx --template cinematic-dark
 *   npx tsx video-pipeline/run.ts --input ./presentation.pptx --template documentary --title "My Title"
 *
 * Options:
 *   --input, -i       Path to .pptx file (required)
 *   --template, -t    Template preset (default: "cinematic-dark")
 *   --title            Video title (default: from PPTX)
 *   --subtitle         Video subtitle
 *   --author           Author name
 *   --output, -o      Output directory (default: ./video-output)
 *   --list-templates   List available templates and exit
 *
 * Environment variables:
 *   OPENAI_API_KEY       Required for AI voice narration
 *   ELEVENLABS_API_KEY   Alternative voice provider
 *   SUNO_API_KEY         For AI music generation
 *   MUBERT_API_KEY       Alternative music provider
 *
 * Prerequisites:
 *   - LibreOffice (for slide image extraction)
 *   - FFmpeg (for video rendering)
 *   - pdftoppm or ImageMagick (for PDF→PNG conversion)
 */

import { runPipeline } from "../lib/video/pipeline";
import { getTemplate, listTemplates, TEMPLATES } from "../lib/video/templates";
import type { AnimationPreset, PipelineInput } from "../lib/video/types";

async function main() {
  const args = process.argv.slice(2);

  // Parse CLI arguments
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--list-templates") {
      printTemplates();
      process.exit(0);
    }
    if (arg.startsWith("--")) {
      const key = arg.replace(/^--/, "");
      flags[key] = args[++i] || "";
    } else if (arg.startsWith("-")) {
      const key = arg.replace(/^-/, "");
      flags[key] = args[++i] || "";
    }
  }

  const inputPath = flags.input || flags.i;
  const templateId = (flags.template || flags.t || "cinematic-dark") as AnimationPreset;
  const outputDir = flags.output || flags.o || "./video-output";
  const title = flags.title || "";
  const subtitle = flags.subtitle || "";
  const author = flags.author || "";

  if (!inputPath) {
    console.error("Error: --input (-i) is required. Provide a path to a .pptx file.\n");
    console.error("Usage: npx tsx video-pipeline/run.ts --input ./presentation.pptx\n");
    console.error("Run with --list-templates to see available styles.");
    process.exit(1);
  }

  // Validate template
  if (!(templateId in TEMPLATES)) {
    console.error(`Error: Unknown template "${templateId}"\n`);
    printTemplates();
    process.exit(1);
  }

  const template = getTemplate(templateId);

  console.log("╔══════════════════════════════════════════════════════════════╗");
  console.log("║           OVN Nexus — Video Pipeline                       ║");
  console.log("╚══════════════════════════════════════════════════════════════╝");
  console.log();
  console.log(`  Input:    ${inputPath}`);
  console.log(`  Template: ${template.name} (${templateId})`);
  console.log(`  Output:   ${outputDir}`);
  console.log(`  Voice:    ${template.voice.provider} / ${template.voice.voiceId}`);
  console.log(`  Music:    ${template.music.provider} — ${template.music.style.slice(0, 50)}...`);
  console.log();

  // Check for API keys
  if (!process.env.OPENAI_API_KEY && template.voice.provider === "openai") {
    console.warn("⚠  OPENAI_API_KEY not set — voice narration will use estimated durations");
  }
  if (!process.env.SUNO_API_KEY && template.music.provider === "suno") {
    console.warn("⚠  SUNO_API_KEY not set — music will use a placeholder track");
  }

  const input: PipelineInput = {
    pptxPath: inputPath,
    template,
    outputDir,
    title,
    subtitle,
    author,
  };

  try {
    const output = await runPipeline(input, (step, progress) => {
      const bar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));
      process.stdout.write(`\r  [${bar}] ${progress}% — ${step}`);
      if (progress === 100) console.log();
    });

    console.log();
    console.log("✓ Pipeline complete!");
    console.log();
    console.log(`  Video:     ${output.videoPath}`);
    console.log(`  Thumbnail: ${output.thumbnailPath}`);
    console.log(`  Duration:  ${Math.round(output.durationMs / 1000)}s`);
    console.log(`  Slides:    ${output.slides.length}`);
    console.log();
    console.log("  Composition config saved to: composition.json");
    console.log("  Use this config with Remotion for full cinematic rendering.");
    console.log();
  } catch (err) {
    console.error("\n✗ Pipeline failed:", err);
    process.exit(1);
  }
}

function printTemplates() {
  const templates = listTemplates();
  console.log("Available templates:\n");
  for (const t of templates) {
    console.log(`  ${t.id.padEnd(20)} ${t.name}`);
    console.log(`  ${"".padEnd(20)} ${t.description}\n`);
  }
}

main();

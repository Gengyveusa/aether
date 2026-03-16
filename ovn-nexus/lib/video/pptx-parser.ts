import { SlideData } from "./types";

// ── PPTX Parser ──────────────────────────────────────────────────────────────
// Extracts slide content (titles, body text, speaker notes) from a .pptx file.
// Uses JSZip + XML parsing since PPTX is a ZIP of XML files.
//
// For image extraction, LibreOffice headless is used to render slides as PNGs.

interface ParsedPptx {
  slides: SlideData[];
  title: string;
  slideCount: number;
}

/**
 * Parse a PPTX file and extract slide content.
 * This runs server-side (Node.js) during the pipeline.
 */
export async function parsePptx(pptxPath: string): Promise<ParsedPptx> {
  const JSZip = (await import("jszip")).default;
  const fs = await import("fs");
  const path = await import("path");

  const buffer = fs.readFileSync(pptxPath);
  const zip = await JSZip.loadAsync(buffer);

  // Find all slide XML files (slide1.xml, slide2.xml, ...)
  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] ?? "0");
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] ?? "0");
      return numA - numB;
    });

  const slides: SlideData[] = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const slideXml = await zip.file(slideFiles[i])!.async("string");

    // Extract text from slide XML
    const { title, body } = extractSlideText(slideXml);

    // Extract speaker notes if available
    const notesFile = `ppt/notesSlides/notesSlide${i + 1}.xml`;
    let notes = "";
    if (zip.file(notesFile)) {
      const notesXml = await zip.file(notesFile)!.async("string");
      notes = extractNotesText(notesXml);
    }

    slides.push({
      index: i,
      title: title || `Slide ${i + 1}`,
      body,
      notes,
      duration: 0, // calculated later based on narration length
    });
  }

  // Determine presentation title from first slide
  const presentationTitle = slides[0]?.title || path.basename(pptxPath, ".pptx");

  return {
    slides,
    title: presentationTitle,
    slideCount: slides.length,
  };
}

/**
 * Extract slide images using LibreOffice headless conversion.
 * Each slide is rendered as a high-resolution PNG.
 */
export async function extractSlideImages(
  pptxPath: string,
  outputDir: string
): Promise<string[]> {
  const { execSync } = await import("child_process");
  const fs = await import("fs");
  const path = await import("path");

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Use LibreOffice to convert PPTX to PNG images
  // This renders each slide as a separate image file
  try {
    execSync(
      `libreoffice --headless --convert-to png --outdir "${outputDir}" "${pptxPath}"`,
      { timeout: 120000 }
    );
  } catch {
    // Fallback: try soffice command
    execSync(
      `soffice --headless --convert-to png --outdir "${outputDir}" "${pptxPath}"`,
      { timeout: 120000 }
    );
  }

  // LibreOffice outputs a single PNG for the first slide when using --convert-to png
  // For multi-slide, we need PDF intermediate then convert
  const pdfPath = pptxPath.replace(/\.pptx?$/i, ".pdf");

  // Convert PPTX → PDF first
  try {
    execSync(
      `libreoffice --headless --convert-to pdf --outdir "${outputDir}" "${pptxPath}"`,
      { timeout: 120000 }
    );
  } catch {
    execSync(
      `soffice --headless --convert-to pdf --outdir "${outputDir}" "${pptxPath}"`,
      { timeout: 120000 }
    );
  }

  const outputPdf = path.join(outputDir, path.basename(pptxPath).replace(/\.pptx?$/i, ".pdf"));

  // Then convert each PDF page to PNG using pdftoppm or ImageMagick
  try {
    execSync(
      `pdftoppm -png -r 300 "${outputPdf}" "${path.join(outputDir, "slide")}"`,
      { timeout: 120000 }
    );
  } catch {
    // Fallback to ImageMagick
    execSync(
      `convert -density 300 "${outputPdf}" "${path.join(outputDir, "slide-%03d.png")}"`,
      { timeout: 120000 }
    );
  }

  // Collect generated slide images
  const images = fs
    .readdirSync(outputDir)
    .filter((f: string) => /^slide.*\.png$/i.test(f))
    .sort()
    .map((f: string) => path.join(outputDir, f));

  return images;
}

// ── Internal XML text extraction ─────────────────────────────────────────────

function extractSlideText(xml: string): { title: string; body: string } {
  // Extract all text runs from the slide XML
  const textRuns = extractTextRuns(xml);

  // The first substantial text element is usually the title
  let title = "";
  const bodyParts: string[] = [];

  // Look for title shape (ph type="title" or "ctrTitle")
  const titleMatch = xml.match(
    /<p:sp>[\s\S]*?<p:ph[^>]*type="(?:title|ctrTitle)"[\s\S]*?<\/p:sp>/
  );
  if (titleMatch) {
    title = extractTextFromShape(titleMatch[0]);
  }

  // Look for body/content shapes
  const bodyMatches = xml.match(
    /<p:sp>[\s\S]*?<p:ph[^>]*type="(?:body|subTitle|obj)"[\s\S]*?<\/p:sp>/g
  );
  if (bodyMatches) {
    for (const match of bodyMatches) {
      const text = extractTextFromShape(match);
      if (text) bodyParts.push(text);
    }
  }

  // If no typed shapes found, fall back to all text
  if (!title && textRuns.length > 0) {
    title = textRuns[0];
    bodyParts.push(...textRuns.slice(1));
  }

  return {
    title: title.trim(),
    body: bodyParts.join("\n").trim(),
  };
}

function extractNotesText(xml: string): string {
  const runs = extractTextRuns(xml);
  // Filter out slide number placeholders
  return runs
    .filter((r) => !/^\d+$/.test(r.trim()) && r.trim().length > 0)
    .join(" ")
    .trim();
}

function extractTextRuns(xml: string): string[] {
  const texts: string[] = [];
  const regex = /<a:t>([\s\S]*?)<\/a:t>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const text = match[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    if (text.trim()) texts.push(text);
  }
  return texts;
}

function extractTextFromShape(shapeXml: string): string {
  const texts = extractTextRuns(shapeXml);
  return texts.join(" ").trim();
}

/**
 * Generate narration script from slide data.
 * Uses speaker notes if available, otherwise creates a script from slide content.
 */
export function generateNarrationScript(slides: SlideData[]): string[] {
  return slides.map((slide) => {
    // Prefer speaker notes — they're written as narration
    if (slide.notes && slide.notes.length > 20) {
      return slide.notes;
    }

    // Build narration from slide content
    const parts: string[] = [];

    if (slide.title) {
      parts.push(slide.title + ".");
    }

    if (slide.body) {
      // Clean up bullet points into flowing narration
      const sentences = slide.body
        .split(/[\n•\-]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      parts.push(...sentences);
    }

    return parts.join(" ") || `Slide ${slide.index + 1}.`;
  });
}

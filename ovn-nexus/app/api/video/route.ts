import { NextRequest, NextResponse } from "next/server";
import { listTemplates } from "@/lib/video/templates";

// ── Video API ────────────────────────────────────────────────────────────────
// GET  /api/video          — list available templates
// POST /api/video          — create a new video project (pipeline trigger)

export async function GET() {
  const templates = listTemplates();

  return NextResponse.json({
    templates,
    status: "ready",
    capabilities: {
      voice: {
        providers: ["openai", "elevenlabs"],
        requiresApiKey: true,
      },
      music: {
        providers: ["suno", "mubert", "custom"],
        requiresApiKey: true,
      },
      rendering: {
        methods: ["ffmpeg", "remotion"],
        output: ["mp4", "webm"],
      },
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateId, title, subtitle, author } = body;

    if (!templateId) {
      return NextResponse.json(
        { error: "templateId is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "title is required" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Accept a PPTX file upload (via multipart form or presigned URL)
    // 2. Queue the pipeline job
    // 3. Return a project ID for status polling

    const projectId = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      projectId,
      status: "queued",
      message: "Video pipeline job created. Use GET /api/video/[id] to check status.",
      config: {
        templateId,
        title,
        subtitle,
        author,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

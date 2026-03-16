import { NextRequest, NextResponse } from "next/server";
import { getMusicRequests, getMusicVersions, getPublishedTracks } from "@/lib/music/store";
import type { MusicPublished } from "@/lib/music/types";

// POST /api/music/[id]/publish — publish an approved version

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { version_id, title, description, license_type, attached_to_type, attached_to_id } = body;

    if (!version_id) {
      return NextResponse.json({ error: "version_id is required" }, { status: 400 });
    }

    const requests = getMusicRequests();
    const request = requests.find((r) => r.id === params.id);
    if (!request) {
      return NextResponse.json({ error: "Music request not found" }, { status: 404 });
    }

    const versions = getMusicVersions();
    const version = versions.find((v) => v.id === version_id && v.request_id === params.id);
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    const published: MusicPublished = {
      id: crypto.randomUUID(),
      request_id: params.id,
      version_id,
      title: title || request.title,
      description: description || null,
      license_type: license_type || "internal",
      attached_to_type: attached_to_type || null,
      attached_to_id: attached_to_id || null,
      cover_image_url: version.cover_image_url,
      genre: request.genre,
      mood: request.mood,
      tags: request.tags,
      play_count: 0,
      download_count: 0,
      published_by: "demo-user",
      published_at: now,
      created_at: now,
      updated_at: now,
    };

    getPublishedTracks().push(published);

    // Update request status
    request.status = "published";
    request.updated_at = now;

    return NextResponse.json({
      data: published,
      message: "Track published successfully",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

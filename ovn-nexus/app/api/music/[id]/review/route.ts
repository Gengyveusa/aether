import { NextRequest, NextResponse } from "next/server";
import { musicReviewSchema } from "@/lib/music/validations";
import { getMusicRequests, getMusicVersions } from "@/lib/music/store";

// POST /api/music/[id]/review — review a version (rate, select, approve)

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const parsed = musicReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const versions = getMusicVersions();
    const version = versions.find(
      (v) => v.id === parsed.data.version_id && v.request_id === params.id
    );

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const now = new Date().toISOString();

    if (parsed.data.rating !== undefined) version.rating = parsed.data.rating;
    if (parsed.data.review_notes !== undefined) version.review_notes = parsed.data.review_notes;
    if (parsed.data.is_selected !== undefined) {
      // Deselect other versions when selecting one
      if (parsed.data.is_selected) {
        versions
          .filter((v) => v.request_id === params.id && v.id !== version.id)
          .forEach((v) => (v.is_selected = false));
      }
      version.is_selected = parsed.data.is_selected;
    }

    version.reviewed_by = "demo-user";
    version.reviewed_at = now;
    version.updated_at = now;

    // If a version is selected, move request to "review" status
    const requests = getMusicRequests();
    const request = requests.find((r) => r.id === params.id);
    if (request && version.is_selected && request.status === "generated") {
      request.status = "review";
      request.updated_at = now;
    }

    return NextResponse.json({ data: version });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

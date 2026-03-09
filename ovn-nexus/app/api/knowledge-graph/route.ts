// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { knowledgeGraphEdgeSchema } from "@/lib/validations/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const sourceType = searchParams.get("source_type");
  const sourceId = searchParams.get("source_id");
  const targetType = searchParams.get("target_type");
  const limit = parseInt(searchParams.get("limit") || "100");

  let query = supabase
    .from("knowledge_graph_edges")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sourceType) query = query.eq("source_type", sourceType);
  if (sourceId) query = query.eq("source_id", sourceId);
  if (targetType) query = query.eq("target_type", targetType);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const parsed = knowledgeGraphEdgeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const insertData = { ...parsed.data, created_by: user?.id };

  const { data, error } = await supabase.from("knowledge_graph_edges").insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

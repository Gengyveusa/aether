// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { datasetSchema } from "@/lib/validations/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const datasetType = searchParams.get("type");
  const accessLevel = searchParams.get("access_level");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("datasets")
    .select("*, profiles!datasets_uploaded_by_fkey(full_name), experiments(experiment_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (datasetType) query = query.eq("dataset_type", datasetType);
  if (accessLevel) query = query.eq("access_level", accessLevel);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count, limit, offset });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const parsed = datasetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const insertData = { ...parsed.data, uploaded_by: user?.id };

  const { data, error } = await supabase.from("datasets").insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

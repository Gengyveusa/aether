// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { trialSchema } from "@/lib/validations/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const phase = searchParams.get("phase");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("clinical_trials")
    .select("*, institutions(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("status", status);
  if (phase) query = query.eq("phase", phase);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count, limit, offset });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const parsed = trialSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const insertData = { ...parsed.data, pi_id: user?.id };

  const { data, error } = await supabase.from("clinical_trials").insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

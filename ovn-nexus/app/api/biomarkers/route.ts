import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { biomarkerSchema } from "@/lib/validations/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patient_id");
  const visitId = searchParams.get("visit_id");
  const sampleType = searchParams.get("sample_type");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("biomarkers")
    .select("*, patients(patient_code), visits(visit_type, visit_date)", { count: "exact" })
    .order("sample_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (patientId) query = query.eq("patient_id", patientId);
  if (visitId) query = query.eq("visit_id", visitId);
  if (sampleType) query = query.eq("sample_type", sampleType);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count, limit, offset });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const parsed = biomarkerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  const insertData = { ...parsed.data, created_by: user?.id };

  const { data, error } = await supabase.from("biomarkers").insert(insertData).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

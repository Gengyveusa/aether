// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { patientSchema } from "@/lib/validations/schemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const clinicId = searchParams.get("clinic_id");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let query = supabase
    .from("patients")
    .select("*, clinics(name, clinic_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (clinicId) query = query.eq("clinic_id", clinicId);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data, count, limit, offset });
}

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const body = await request.json();
  const parsed = patientSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase.from("patients").insert(parsed.data).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}

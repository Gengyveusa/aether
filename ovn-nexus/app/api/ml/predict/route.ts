// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { computeRiskScore, type PredictionInput } from "@/lib/ml/pipeline";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { patient_id, visit_id } = body;

  if (!patient_id || !visit_id) {
    return NextResponse.json({ error: "patient_id and visit_id are required" }, { status: 400 });
  }

  // Fetch patient data
  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("*")
    .eq("id", patient_id)
    .single();

  if (patientError || !patient) {
    return NextResponse.json({ error: "Patient not found" }, { status: 404 });
  }

  // Fetch visit data
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select("*")
    .eq("id", visit_id)
    .single();

  if (visitError || !visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  // Fetch latest biomarkers for this visit
  const { data: biomarkerData } = await supabase
    .from("biomarkers")
    .select("*")
    .eq("visit_id", visit_id)
    .order("sample_date", { ascending: false })
    .limit(1)
    .single();

  const input: PredictionInput = {
    patient: {
      age: patient.age,
      sex: patient.sex,
      smoking_status: patient.smoking_status,
      diabetes_status: patient.diabetes_status,
    },
    visit: {
      periodontal_stage: visit.periodontal_stage,
      bleeding_index: visit.bleeding_index,
      tooth_loss: visit.tooth_loss,
    },
    biomarkers: {
      omv_concentration: biomarkerData?.omv_concentration ?? null,
      gingipain_activity: biomarkerData?.gingipain_activity ?? null,
      il6: biomarkerData?.il6 ?? null,
      tnf_alpha: biomarkerData?.tnf_alpha ?? null,
      hscrp: biomarkerData?.hscrp ?? null,
      nitric_oxide: biomarkerData?.nitric_oxide ?? null,
    },
  };

  const riskScore = computeRiskScore(input);

  // Store prediction
  await supabase.from("ml_predictions").insert({
    model_id: body.model_id || null,
    patient_id,
    input_data: input,
    prediction: riskScore,
    confidence: riskScore.confidence,
  });

  return NextResponse.json({
    patient_id,
    visit_id,
    risk_score: riskScore,
    computed_at: new Date().toISOString(),
  });
}

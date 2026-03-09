// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { matchPatientToTrialCriteria } from "@/lib/ml/pipeline";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { trial_id } = body;

  if (!trial_id) {
    return NextResponse.json({ error: "trial_id is required" }, { status: 400 });
  }

  // Fetch trial with biomarker criteria
  const { data: trial, error: trialError } = await supabase
    .from("clinical_trials")
    .select("*")
    .eq("id", trial_id)
    .single();

  if (trialError || !trial) {
    return NextResponse.json({ error: "Trial not found" }, { status: 404 });
  }

  const criteria = trial.biomarker_criteria as Record<string, { min?: number; max?: number }>;
  if (!criteria || Object.keys(criteria).length === 0) {
    return NextResponse.json({ error: "Trial has no biomarker criteria defined" }, { status: 400 });
  }

  // Fetch latest biomarkers for all active patients
  const { data: latestBiomarkers } = await supabase
    .from("biomarkers")
    .select("*, patients!inner(id, patient_code, clinic_id, is_active)")
    .eq("patients.is_active", true)
    .order("sample_date", { ascending: false });

  // De-duplicate to latest per patient
  const patientBiomarkers = new Map<string, typeof latestBiomarkers extends (infer T)[] | null ? T : never>();
  for (const b of latestBiomarkers || []) {
    if (!patientBiomarkers.has(b.patient_id)) {
      patientBiomarkers.set(b.patient_id, b);
    }
  }

  // Match patients
  const matches = [];
  for (const [patientId, biomarker] of patientBiomarkers) {
    const result = matchPatientToTrialCriteria(biomarker, criteria);
    if (result.score > 0.5) {
      matches.push({
        patient_id: patientId,
        patient_code: (biomarker.patients as { patient_code: string }).patient_code,
        match_score: result.score,
        matches: result.matches,
        matched_criteria: result.matchedCriteria,
      });
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.match_score - a.match_score);

  // Store matches
  for (const match of matches.slice(0, 100)) {
    await supabase.from("trial_patient_matches").upsert({
      trial_id,
      patient_id: match.patient_id,
      match_score: match.match_score,
      matching_criteria: { matched: match.matched_criteria },
      status: "potential",
    }, { onConflict: "trial_id,patient_id" });
  }

  return NextResponse.json({
    trial_id,
    trial_code: trial.trial_code,
    total_candidates: matches.length,
    top_matches: matches.slice(0, 20),
  });
}

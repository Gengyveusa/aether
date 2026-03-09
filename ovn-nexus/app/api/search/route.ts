import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  const searchTerm = `%${q}%`;

  const [patients, experiments, datasets, papers, trials] = await Promise.all([
    supabase.from("patients").select("id, patient_code, clinic_id").ilike("patient_code", searchTerm).limit(5),
    supabase.from("experiments").select("id, experiment_code, title").or(`title.ilike.${searchTerm},experiment_code.ilike.${searchTerm}`).limit(5),
    supabase.from("datasets").select("id, name, dataset_type").ilike("name", searchTerm).limit(5),
    supabase.from("papers").select("id, title, doi").ilike("title", searchTerm).limit(5),
    supabase.from("clinical_trials").select("id, trial_code, title").or(`title.ilike.${searchTerm},trial_code.ilike.${searchTerm}`).limit(5),
  ]);

  return NextResponse.json({
    patients: patients.data || [],
    experiments: experiments.data || [],
    datasets: datasets.data || [],
    papers: papers.data || [],
    trials: trials.data || [],
  });
}

// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { MlLabClient } from "./client";

export default async function MlLabPage() {
  const supabase = createServerSupabaseClient();

  const [modelsRes, predictionsRes, trialsRes, patientsRes, visitsRes] = await Promise.all([
    supabase
      .from("ml_models")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("ml_predictions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("clinical_trials")
      .select("id, trial_code, title, phase, status, target_enrollment, current_enrollment")
      .eq("status", "recruiting")
      .order("created_at", { ascending: false }),
    supabase
      .from("patients")
      .select("id, patient_code")
      .eq("is_active", true)
      .order("patient_code")
      .limit(200),
    supabase
      .from("visits")
      .select("id, patient_id, visit_type, visit_date, visit_number")
      .order("visit_date", { ascending: false })
      .limit(500),
  ]);

  return (
    <MlLabClient
      models={modelsRes.data || []}
      predictionCount={predictionsRes.count ?? 0}
      recruitingTrials={trialsRes.data || []}
      patients={patientsRes.data || []}
      visits={visitsRes.data || []}
    />
  );
}

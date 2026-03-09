import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "platform";

  if (type === "platform") {
    const [clinics, patients, biomarkers, experiments, datasets, papers, trials] = await Promise.all([
      supabase.from("clinics").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("patients").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("biomarkers").select("id", { count: "exact", head: true }),
      supabase.from("experiments").select("id", { count: "exact", head: true }),
      supabase.from("datasets").select("id", { count: "exact", head: true }),
      supabase.from("papers").select("id", { count: "exact", head: true }),
      supabase.from("clinical_trials").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      total_clinics: clinics.count ?? 0,
      total_patients: patients.count ?? 0,
      total_samples: biomarkers.count ?? 0,
      total_experiments: experiments.count ?? 0,
      total_datasets: datasets.count ?? 0,
      total_papers: papers.count ?? 0,
      total_trials: trials.count ?? 0,
    });
  }

  if (type === "biomarker_summary") {
    const { data, error } = await supabase
      .from("biomarkers")
      .select("sample_type, omv_concentration, gingipain_activity, il6, tnf_alpha, hscrp, nitric_oxide");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const summary: Record<string, { count: number; avg_omv: number; avg_il6: number; avg_hscrp: number }> = {};
    for (const row of data || []) {
      const st = row.sample_type;
      if (!summary[st]) summary[st] = { count: 0, avg_omv: 0, avg_il6: 0, avg_hscrp: 0 };
      summary[st].count++;
      if (row.omv_concentration) summary[st].avg_omv += row.omv_concentration;
      if (row.il6) summary[st].avg_il6 += row.il6;
      if (row.hscrp) summary[st].avg_hscrp += row.hscrp;
    }
    for (const st of Object.keys(summary)) {
      const c = summary[st].count;
      summary[st].avg_omv /= c;
      summary[st].avg_il6 /= c;
      summary[st].avg_hscrp /= c;
    }

    return NextResponse.json(summary);
  }

  if (type === "periodontal") {
    const { data, error } = await supabase
      .from("visits")
      .select("periodontal_stage, bleeding_index, tooth_loss")
      .not("periodontal_stage", "is", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const dist: Record<string, { count: number; total_bleeding: number; total_tooth_loss: number }> = {};
    for (const row of data || []) {
      const stage = row.periodontal_stage!;
      if (!dist[stage]) dist[stage] = { count: 0, total_bleeding: 0, total_tooth_loss: 0 };
      dist[stage].count++;
      if (row.bleeding_index) dist[stage].total_bleeding += row.bleeding_index;
      if (row.tooth_loss) dist[stage].total_tooth_loss += row.tooth_loss;
    }

    const result = Object.entries(dist).map(([stage, v]) => ({
      stage,
      count: v.count,
      avg_bleeding: v.total_bleeding / v.count,
      avg_tooth_loss: v.total_tooth_loss / v.count,
    }));

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown analytics type" }, { status: 400 });
}

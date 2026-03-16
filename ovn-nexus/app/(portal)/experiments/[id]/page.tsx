// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { notFound } from "next/navigation";
import { ExperimentDetailClient } from "./client";

export default async function ExperimentDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: experiment, error } = await supabase
    .from("experiments")
    .select("*, profiles!experiments_pi_id_fkey(id, full_name, email), projects(id, name)")
    .eq("id", params.id)
    .single();

  if (error || !experiment) {
    notFound();
  }

  const { data: datasets } = await supabase
    .from("datasets")
    .select("id, name, dataset_type, format, file_size_bytes, row_count, processing_status, created_at")
    .eq("experiment_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <ExperimentDetailClient
      experiment={experiment}
      datasets={datasets ?? []}
    />
  );
}

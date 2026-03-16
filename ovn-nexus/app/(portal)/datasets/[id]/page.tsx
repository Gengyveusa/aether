// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { notFound } from "next/navigation";
import { DatasetDetailClient } from "./client";

export default async function DatasetDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: dataset, error } = await supabase
    .from("datasets")
    .select("*, profiles!datasets_uploaded_by_fkey(id, full_name, email), experiments(id, experiment_code, title)")
    .eq("id", params.id)
    .single();

  if (error || !dataset) {
    notFound();
  }

  return <DatasetDetailClient dataset={dataset} />;
}

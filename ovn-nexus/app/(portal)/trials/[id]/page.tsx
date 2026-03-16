// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { notFound } from "next/navigation";
import { TrialDetailClient } from "./client";

export default async function TrialDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: trial, error } = await supabase
    .from("clinical_trials")
    .select("*, institutions(id, name)")
    .eq("id", params.id)
    .single();

  if (error || !trial) notFound();

  return <TrialDetailClient trial={trial} />;
}

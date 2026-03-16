// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { notFound } from "next/navigation";
import { PaperDetailClient } from "./client";

export default async function PaperDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: paper, error } = await supabase
    .from("papers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !paper) return notFound();

  const { data: edges } = await supabase
    .from("knowledge_graph_edges")
    .select("*")
    .or(`source_id.eq.${params.id},target_id.eq.${params.id}`)
    .order("created_at", { ascending: false });

  return (
    <PaperDetailClient
      paper={paper}
      edges={edges ?? []}
    />
  );
}

// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { KnowledgeGraphClient } from "./client";

export default async function KnowledgeGraphPage() {
  const supabase = createServerSupabaseClient();

  const { data: edges, count } = await supabase
    .from("knowledge_graph_edges")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(200);

  return <KnowledgeGraphClient edges={edges || []} totalCount={count ?? 0} />;
}

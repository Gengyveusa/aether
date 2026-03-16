// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { TrialForm } from "@/components/forms/trial-form";

export default async function NewTrialPage() {
  const supabase = createServerSupabaseClient();
  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register Trial</h1>
        <p className="text-muted-foreground">Register a new clinical trial for biomarker-enriched enrollment</p>
      </div>
      <TrialForm institutions={institutions || []} />
    </div>
  );
}

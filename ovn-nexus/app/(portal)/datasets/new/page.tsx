// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { DatasetForm } from "@/components/forms/dataset-form";

export default async function NewDatasetPage({ searchParams }: { searchParams: { experiment_id?: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: experiments } = await supabase
    .from("experiments")
    .select("id, experiment_code, title")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Dataset</h1>
        <p className="text-muted-foreground">Register a new dataset with type, format, and metadata.</p>
      </div>
      <DatasetForm
        experiments={experiments ?? []}
        defaultExperimentId={searchParams.experiment_id}
      />
    </div>
  );
}

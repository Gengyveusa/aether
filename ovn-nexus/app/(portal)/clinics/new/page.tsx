// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { ClinicForm } from "@/components/forms/clinic-form";

export default async function NewClinicPage() {
  const supabase = createServerSupabaseClient();

  const { data: institutions } = await supabase
    .from("institutions")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Clinic</h1>
        <p className="text-muted-foreground">Register a new research clinic or data collection site.</p>
      </div>
      <ClinicForm institutions={institutions || []} />
    </div>
  );
}

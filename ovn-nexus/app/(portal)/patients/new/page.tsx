// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { PatientForm } from "@/components/forms/patient-form";

export default async function NewPatientPage() {
  const supabase = createServerSupabaseClient();
  const { data: clinics } = await supabase
    .from("clinics")
    .select("id, name, clinic_code")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Patient</h1>
        <p className="text-muted-foreground">Register a new de-identified patient</p>
      </div>
      <PatientForm clinics={clinics || []} />
    </div>
  );
}

// @ts-nocheck
import { TrialForm } from "@/components/forms/trial-form";

export default async function NewTrialPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Register New Trial</h1>
        <p className="text-muted-foreground">Register a new clinical trial for biomarker-based patient matching.</p>
      </div>
      <TrialForm />
    </div>
  );
}

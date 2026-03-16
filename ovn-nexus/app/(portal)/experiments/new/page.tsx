// @ts-nocheck
import { ExperimentForm } from "@/components/forms/experiment-form";

export default function NewExperimentPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Experiment</h1>
        <p className="text-muted-foreground">Register a new experiment with hypothesis, protocol, and metadata.</p>
      </div>
      <ExperimentForm />
    </div>
  );
}

// @ts-nocheck
import { PaperForm } from "@/components/forms/paper-form";

export default function NewPaperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Paper</h1>
        <p className="text-muted-foreground">Add a new research publication to the knowledge base</p>
      </div>
      <div className="max-w-2xl">
        <PaperForm />
      </div>
    </div>
  );
}

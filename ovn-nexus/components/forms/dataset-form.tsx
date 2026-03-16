// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Dataset, DatasetType, DatasetFormat } from "@/lib/db/types";

const DATASET_TYPE_OPTIONS: { value: DatasetType; label: string }[] = [
  { value: "microbiome_16s", label: "16S Microbiome" },
  { value: "microbiome_shotgun", label: "Shotgun Microbiome" },
  { value: "rna_seq", label: "RNA-seq" },
  { value: "proteomics", label: "Proteomics" },
  { value: "metabolomics", label: "Metabolomics" },
  { value: "ev_cargo", label: "EV Cargo" },
  { value: "clinical", label: "Clinical" },
  { value: "imaging", label: "Imaging" },
  { value: "other", label: "Other" },
];

const FORMAT_OPTIONS: DatasetFormat[] = [
  "fastq", "bam", "vcf", "csv", "tsv", "json", "h5ad", "parquet", "other",
];

interface ExperimentOption {
  id: string;
  experiment_code: string;
  title: string;
}

interface DatasetFormProps {
  dataset?: Dataset;
  experiments: ExperimentOption[];
  defaultExperimentId?: string;
}

export function DatasetForm({ dataset, experiments, defaultExperimentId }: DatasetFormProps) {
  const router = useRouter();
  const isEdit = !!dataset;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: dataset?.name ?? "",
    description: dataset?.description ?? "",
    dataset_type: dataset?.dataset_type ?? ("microbiome_16s" as DatasetType),
    format: dataset?.format ?? ("fastq" as DatasetFormat),
    access_level: dataset?.access_level ?? "private",
    experiment_id: dataset?.experiment_id ?? defaultExperimentId ?? "",
    tags: (dataset?.tags ?? []).join(", "),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        dataset_type: form.dataset_type,
        format: form.format,
        access_level: form.access_level,
        experiment_id: form.experiment_id || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = isEdit ? `/api/datasets/${dataset.id}` : "/api/datasets";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.formErrors?.[0] || body.error || "Failed to save dataset");
      }

      const { data } = await res.json();
      router.push(`/datasets/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Dataset" : "Dataset Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              required
              placeholder="Dataset name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Describe the dataset contents and purpose..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataset_type">Dataset Type *</Label>
              <Select value={form.dataset_type} onValueChange={(v) => setForm({ ...form, dataset_type: v as DatasetType })}>
                <SelectTrigger id="dataset_type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATASET_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Format *</Label>
              <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v as DatasetFormat })}>
                <SelectTrigger id="format"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FORMAT_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="access_level">Access Level</Label>
              <Select value={form.access_level} onValueChange={(v) => setForm({ ...form, access_level: v })}>
                <SelectTrigger id="access_level"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="consortium">Consortium</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment_id">Linked Experiment</Label>
              <Select value={form.experiment_id} onValueChange={(v) => setForm({ ...form, experiment_id: v })}>
                <SelectTrigger id="experiment_id"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {experiments.map((exp) => (
                    <SelectItem key={exp.id} value={exp.id}>
                      {exp.experiment_code} - {exp.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. 16s, saliva, longitudinal"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Dataset"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

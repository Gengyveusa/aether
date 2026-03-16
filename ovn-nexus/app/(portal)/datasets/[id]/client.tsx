// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Database, ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils/format";
import type { Dataset, DatasetType, DatasetFormat } from "@/lib/db/types";

const DATASET_TYPE_LABELS: Record<string, string> = {
  microbiome_16s: "16S Microbiome",
  microbiome_shotgun: "Shotgun Microbiome",
  rna_seq: "RNA-seq",
  proteomics: "Proteomics",
  metabolomics: "Metabolomics",
  ev_cargo: "EV Cargo",
  clinical: "Clinical",
  imaging: "Imaging",
  other: "Other",
};

function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "N/A";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1e6) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1e9) return `${(bytes / 1e6).toFixed(1)} MB`;
  return `${(bytes / 1e9).toFixed(2)} GB`;
}

interface DatasetWithRelations extends Dataset {
  profiles: { id: string; full_name: string; email: string } | null;
  experiments: { id: string; experiment_code: string; title: string } | null;
}

interface DatasetDetailClientProps {
  dataset: DatasetWithRelations;
}

export function DatasetDetailClient({ dataset: initial }: DatasetDetailClientProps) {
  const router = useRouter();
  const [dataset, setDataset] = useState(initial);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: dataset.name,
    description: dataset.description ?? "",
    dataset_type: dataset.dataset_type,
    format: dataset.format,
    access_level: dataset.access_level,
    tags: (dataset.tags ?? []).join(", "),
  });

  function openEdit() {
    setForm({
      name: dataset.name,
      description: dataset.description ?? "",
      dataset_type: dataset.dataset_type,
      format: dataset.format,
      access_level: dataset.access_level,
      tags: (dataset.tags ?? []).join(", "),
    });
    setEditOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        dataset_type: form.dataset_type,
        format: form.format,
        access_level: form.access_level,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch(`/api/datasets/${dataset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      const { data } = await res.json();
      setDataset({ ...dataset, ...data });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/datasets/${dataset.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/datasets");
    } finally {
      setSaving(false);
    }
  }

  const uploaderName = dataset.profiles?.full_name ?? "Unknown";
  const linkedExperiment = dataset.experiments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/datasets">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />Back
              </Button>
            </Link>
            <Badge variant="outline">{DATASET_TYPE_LABELS[dataset.dataset_type] ?? dataset.dataset_type}</Badge>
            <Badge variant="secondary" className="font-mono text-xs uppercase">{dataset.format}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{dataset.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit}>
            <Pencil className="mr-1 h-4 w-4" />Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1 h-4 w-4" />Delete
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-7">
        {[
          { label: "Type", value: DATASET_TYPE_LABELS[dataset.dataset_type] ?? dataset.dataset_type },
          { label: "Format", value: dataset.format.toUpperCase() },
          { label: "File Size", value: formatFileSize(dataset.file_size_bytes) },
          { label: "Row Count", value: dataset.row_count ? formatNumber(dataset.row_count) : "N/A" },
          { label: "Column Count", value: dataset.column_count ? formatNumber(dataset.column_count) : "N/A" },
          { label: "Access Level", value: dataset.access_level },
          { label: "Processing Status", value: dataset.processing_status },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-sm font-medium capitalize truncate" title={stat.value}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{dataset.description || "No description provided."}</p>
              <Separator />
              {dataset.tags && dataset.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {dataset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Uploaded By</p>
                  <p className="text-sm">{uploaderName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Linked Experiment</p>
                  {linkedExperiment ? (
                    <Link
                      href={`/experiments/${linkedExperiment.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {linkedExperiment.experiment_code} - {linkedExperiment.title}
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">None</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm">{formatDate(dataset.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Schema Definition</CardTitle>
            </CardHeader>
            <CardContent>
              {dataset.schema_definition && Object.keys(dataset.schema_definition).length > 0 ? (
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                  {JSON.stringify(dataset.schema_definition, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No schema definition available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {dataset.quality_metrics && Object.keys(dataset.quality_metrics).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(dataset.quality_metrics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b last:border-0">
                      <span className="text-sm font-medium capitalize">{key.replace(/_/g, " ")}</span>
                      <span className="text-sm text-muted-foreground font-mono">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No quality metrics recorded.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dataset</DialogTitle>
            <DialogDescription>Update the dataset metadata below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Dataset Type</Label>
                <Select value={form.dataset_type} onValueChange={(v) => setForm({ ...form, dataset_type: v as DatasetType })}>
                  <SelectTrigger id="edit-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATASET_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-format">Format</Label>
                <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v as DatasetFormat })}>
                  <SelectTrigger id="edit-format"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["fastq", "bam", "vcf", "csv", "tsv", "json", "h5ad", "parquet", "other"].map((f) => (
                      <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-access">Access Level</Label>
              <Select value={form.access_level} onValueChange={(v) => setForm({ ...form, access_level: v })}>
                <SelectTrigger id="edit-access"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="consortium">Consortium</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. 16s, saliva, longitudinal"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{dataset.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

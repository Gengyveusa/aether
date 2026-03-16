// @ts-nocheck
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { FlaskConical, ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatDate, formatCompact } from "@/lib/utils/format";
import type { Experiment, ExperimentStatus } from "@/lib/db/types";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline",
  active: "default",
  completed: "secondary",
  archived: "destructive",
};

interface ExperimentWithRelations extends Experiment {
  profiles: { id: string; full_name: string; email: string } | null;
  projects: { id: string; name: string } | null;
}

interface DatasetRow {
  id: string;
  name: string;
  dataset_type: string;
  format: string;
  file_size_bytes: number | null;
  row_count: number | null;
  processing_status: string;
  created_at: string;
}

interface ExperimentDetailClientProps {
  experiment: ExperimentWithRelations;
  datasets: DatasetRow[];
}

export function ExperimentDetailClient({ experiment: initial, datasets }: ExperimentDetailClientProps) {
  const router = useRouter();
  const [experiment, setExperiment] = useState(initial);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    experiment_code: experiment.experiment_code,
    title: experiment.title,
    hypothesis: experiment.hypothesis ?? "",
    model_system: experiment.model_system ?? "",
    protocol: experiment.protocol ?? "",
    status: experiment.status,
    start_date: experiment.start_date ?? "",
    end_date: experiment.end_date ?? "",
    tags: (experiment.tags ?? []).join(", "),
  });

  function openEdit() {
    setForm({
      experiment_code: experiment.experiment_code,
      title: experiment.title,
      hypothesis: experiment.hypothesis ?? "",
      model_system: experiment.model_system ?? "",
      protocol: experiment.protocol ?? "",
      status: experiment.status,
      start_date: experiment.start_date ?? "",
      end_date: experiment.end_date ?? "",
      tags: (experiment.tags ?? []).join(", "),
    });
    setEditOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        experiment_code: form.experiment_code,
        title: form.title,
        hypothesis: form.hypothesis || null,
        model_system: form.model_system || null,
        protocol: form.protocol || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch(`/api/experiments/${experiment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update");
      const { data } = await res.json();
      setExperiment({ ...experiment, ...data });
      setEditOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/experiments/${experiment.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      router.push("/experiments");
    } finally {
      setSaving(false);
    }
  }

  const piName = experiment.profiles?.full_name ?? "Unknown";
  const projectName = experiment.projects?.name ?? null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/experiments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />Back
              </Button>
            </Link>
            <span className="font-mono text-sm text-muted-foreground">{experiment.experiment_code}</span>
            <Badge variant={STATUS_COLORS[experiment.status]}>{experiment.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold">{experiment.title}</h1>
          <p className="text-muted-foreground">PI: {piName}</p>
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
      <div className="grid gap-4 md:grid-cols-6">
        {[
          { label: "Status", value: experiment.status },
          { label: "PI", value: piName },
          { label: "Project", value: projectName ?? "None" },
          { label: "Model System", value: experiment.model_system ?? "N/A" },
          { label: "Start Date", value: experiment.start_date ? formatDate(experiment.start_date) : "Not set" },
          { label: "End Date", value: experiment.end_date ? formatDate(experiment.end_date) : "Not set" },
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
          <TabsTrigger value="datasets">Datasets ({datasets.length})</TabsTrigger>
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {experiment.hypothesis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hypothesis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{experiment.hypothesis}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Model System</p>
                <p className="text-sm">{experiment.model_system ?? "Not specified"}</p>
              </div>
              {experiment.tags && experiment.tags.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {experiment.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasets">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Linked Datasets
                <Link href={`/datasets/new?experiment_id=${experiment.id}`}>
                  <Button size="sm">Add Dataset</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((ds) => (
                    <TableRow key={ds.id} className="cursor-pointer" onClick={() => router.push(`/datasets/${ds.id}`)}>
                      <TableCell className="font-medium">{ds.name}</TableCell>
                      <TableCell><Badge variant="outline">{ds.dataset_type.replace(/_/g, " ")}</Badge></TableCell>
                      <TableCell className="font-mono text-xs uppercase">{ds.format}</TableCell>
                      <TableCell>{ds.file_size_bytes ? `${(ds.file_size_bytes / 1e6).toFixed(1)} MB` : "---"}</TableCell>
                      <TableCell>{ds.row_count ? formatCompact(ds.row_count) : "---"}</TableCell>
                      <TableCell><Badge variant={ds.processing_status === "ready" ? "default" : "secondary"}>{ds.processing_status}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(ds.created_at)}</TableCell>
                    </TableRow>
                  ))}
                  {datasets.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No datasets linked to this experiment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="protocol">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              {experiment.protocol ? (
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans bg-muted p-4 rounded-md">
                  {experiment.protocol}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No protocol documented yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Experiment</DialogTitle>
            <DialogDescription>Update the experiment details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Experiment Code</Label>
                <Input
                  id="edit-code"
                  value={form.experiment_code}
                  onChange={(e) => setForm({ ...form, experiment_code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ExperimentStatus })}>
                  <SelectTrigger id="edit-status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-hypothesis">Hypothesis</Label>
              <Textarea
                id="edit-hypothesis"
                rows={3}
                value={form.hypothesis}
                onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-model">Model System</Label>
              <Input
                id="edit-model"
                value={form.model_system}
                onChange={(e) => setForm({ ...form, model_system: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-protocol">Protocol</Label>
              <Textarea
                id="edit-protocol"
                rows={5}
                value={form.protocol}
                onChange={(e) => setForm({ ...form, protocol: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-start">Start Date</Label>
                <Input
                  id="edit-start"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-end">End Date</Label>
                <Input
                  id="edit-end"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="e.g. microbiome, oral-health, pilot"
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
            <AlertDialogTitle>Delete Experiment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{experiment.title}"? This action cannot be undone.
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

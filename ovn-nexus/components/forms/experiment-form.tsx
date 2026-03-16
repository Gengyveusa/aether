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
import type { Experiment, ExperimentStatus } from "@/lib/db/types";

interface ExperimentFormProps {
  experiment?: Experiment;
}

export function ExperimentForm({ experiment }: ExperimentFormProps) {
  const router = useRouter();
  const isEdit = !!experiment;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    experiment_code: experiment?.experiment_code ?? "",
    title: experiment?.title ?? "",
    hypothesis: experiment?.hypothesis ?? "",
    model_system: experiment?.model_system ?? "",
    protocol: experiment?.protocol ?? "",
    status: experiment?.status ?? ("planned" as ExperimentStatus),
    start_date: experiment?.start_date ?? "",
    end_date: experiment?.end_date ?? "",
    tags: (experiment?.tags ?? []).join(", "),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

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

      const url = isEdit ? `/api/experiments/${experiment.id}` : "/api/experiments";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error?.formErrors?.[0] || body.error || "Failed to save experiment");
      }

      const { data } = await res.json();
      router.push(`/experiments/${data.id}`);
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
          <CardTitle>{isEdit ? "Edit Experiment" : "Experiment Details"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experiment_code">Experiment Code *</Label>
              <Input
                id="experiment_code"
                required
                placeholder="EXP-001"
                value={form.experiment_code}
                onChange={(e) => setForm({ ...form, experiment_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ExperimentStatus })}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
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
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              placeholder="Experiment title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hypothesis">Hypothesis</Label>
            <Textarea
              id="hypothesis"
              rows={3}
              placeholder="Describe the hypothesis being tested..."
              value={form.hypothesis}
              onChange={(e) => setForm({ ...form, hypothesis: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model_system">Model System</Label>
            <Input
              id="model_system"
              placeholder="e.g. in vitro, mouse, human"
              value={form.model_system}
              onChange={(e) => setForm({ ...form, model_system: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="protocol">Protocol</Label>
            <Textarea
              id="protocol"
              rows={6}
              placeholder="Document the experimental protocol..."
              value={form.protocol}
              onChange={(e) => setForm({ ...form, protocol: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g. microbiome, oral-health, pilot"
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
              {isEdit ? "Save Changes" : "Create Experiment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

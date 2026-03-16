"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pill } from "lucide-react";

const PHASE_OPTIONS = [
  { value: "preclinical", label: "Preclinical" },
  { value: "phase_1", label: "Phase I" },
  { value: "phase_2", label: "Phase II" },
  { value: "phase_3", label: "Phase III" },
  { value: "phase_4", label: "Phase IV" },
] as const;

const STATUS_OPTIONS = [
  { value: "recruiting", label: "Recruiting" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
] as const;

interface TrialFormProps {
  initialData?: {
    id: string;
    trial_code: string;
    title: string;
    description: string | null;
    phase: string;
    status: string;
    sponsor: string | null;
    target_enrollment: number | null;
    start_date: string | null;
    end_date: string | null;
    nct_number: string | null;
  };
}

export function TrialForm({ initialData }: TrialFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    trial_code: initialData?.trial_code || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    phase: initialData?.phase || "phase_1",
    status: initialData?.status || "recruiting",
    sponsor: initialData?.sponsor || "",
    target_enrollment: initialData?.target_enrollment?.toString() || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    nct_number: initialData?.nct_number || "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const url = isEditing ? `/api/trials/${initialData.id}` : "/api/trials";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        trial_code: form.trial_code,
        title: form.title,
        description: form.description || null,
        phase: form.phase,
        status: form.status,
        sponsor: form.sponsor || null,
        target_enrollment: form.target_enrollment ? parseInt(form.target_enrollment) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        nct_number: form.nct_number || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.toString() || "Failed to save trial");
      }

      const { data } = await res.json();
      router.push(`/trials/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="h-5 w-5" />
          {isEditing ? "Edit Trial" : "Trial Information"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="trial_code">Trial Code *</Label>
              <Input
                id="trial_code"
                required
                value={form.trial_code}
                onChange={(e) => setForm({ ...form, trial_code: e.target.value })}
                placeholder="e.g. OVN-TRIAL-001"
                className="font-mono"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nct_number">NCT Number</Label>
              <Input
                id="nct_number"
                value={form.nct_number}
                onChange={(e) => setForm({ ...form, nct_number: e.target.value })}
                placeholder="e.g. NCT12345678"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Oral Vesicle Biomarker Study for Periodontal Disease"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the trial objectives, methodology, and expected outcomes..."
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Phase *</Label>
              <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {PHASE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="sponsor">Sponsor</Label>
              <Input
                id="sponsor"
                value={form.sponsor}
                onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
                placeholder="e.g. National Institutes of Health"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_enrollment">Target Enrollment</Label>
              <Input
                id="target_enrollment"
                type="number"
                min="0"
                value={form.target_enrollment}
                onChange={(e) => setForm({ ...form, target_enrollment: e.target.value })}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : isEditing ? "Update Trial" : "Register Trial"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

const PHASES = [
  { value: "preclinical", label: "Preclinical" },
  { value: "phase_1", label: "Phase I" },
  { value: "phase_2", label: "Phase II" },
  { value: "phase_3", label: "Phase III" },
  { value: "phase_4", label: "Phase IV" },
];

const STATUSES = [
  { value: "recruiting", label: "Recruiting" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "suspended", label: "Suspended" },
  { value: "terminated", label: "Terminated" },
];

interface TrialFormProps {
  institutions: { id: string; name: string }[];
  initialData?: any;
}

export function TrialForm({ institutions, initialData }: TrialFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    trial_code: initialData?.trial_code || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    phase: initialData?.phase || "",
    status: initialData?.status || "recruiting",
    sponsor: initialData?.sponsor || "",
    institution_id: initialData?.institution_id || "",
    target_enrollment: initialData?.target_enrollment?.toString() || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    nct_number: initialData?.nct_number || "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      trial_code: form.trial_code,
      title: form.title,
      description: form.description || null,
      phase: form.phase,
      status: form.status,
      sponsor: form.sponsor || null,
      institution_id: form.institution_id || null,
      target_enrollment: form.target_enrollment ? parseInt(form.target_enrollment) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      nct_number: form.nct_number || null,
    };

    try {
      const url = isEdit ? `/api/trials/${initialData.id}` : "/api/trials";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(typeof data.error === "string" ? data.error : "Failed to save");
      }

      const { data } = await res.json();
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/trials/${data.id}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Trial Code <span className="text-destructive">*</span></Label>
              <Input required value={form.trial_code} onChange={(e) => update("trial_code", e.target.value)}
                placeholder="e.g. OVN-CARDIO-001" className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>NCT Number</Label>
              <Input value={form.nct_number} onChange={(e) => update("nct_number", e.target.value)}
                placeholder="e.g. NCT05123456" className="font-mono" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Title <span className="text-destructive">*</span></Label>
            <Input required value={form.title} onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. OMV-Biomarker Enriched Cardiovascular Prevention Trial" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)}
              placeholder="Trial objectives, design, and primary endpoints..." rows={4} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Phase <span className="text-destructive">*</span></Label>
              <Select value={form.phase} onValueChange={(v) => update("phase", v)}>
                <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
                <SelectContent>
                  {PHASES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Sponsor</Label>
              <Input value={form.sponsor} onChange={(e) => update("sponsor", e.target.value)}
                placeholder="e.g. OVN Research Foundation" />
            </div>
            <div className="space-y-2">
              <Label>Target Enrollment</Label>
              <Input type="number" min={0} value={form.target_enrollment}
                onChange={(e) => update("target_enrollment", e.target.value)} placeholder="e.g. 200" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Institution</Label>
              <Select value={form.institution_id} onValueChange={(v) => update("institution_id", v)}>
                <SelectTrigger><SelectValue placeholder="Select institution" /></SelectTrigger>
                <SelectContent>
                  {institutions.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={form.start_date} onChange={(e) => update("start_date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={form.end_date} onChange={(e) => update("end_date", e.target.value)} />
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <Link href={isEdit ? `/trials/${initialData.id}` : "/trials"}>
            <Button type="button" variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Register Trial"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

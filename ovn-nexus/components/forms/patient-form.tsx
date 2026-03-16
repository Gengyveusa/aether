"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Patient, Clinic } from "@/lib/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PatientFormProps {
  clinics: Pick<Clinic, "id" | "name" | "clinic_code">[];
  patient?: Patient;
}

export function PatientForm({ clinics, patient }: PatientFormProps) {
  const router = useRouter();
  const isEdit = Boolean(patient);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    patient_code: patient?.patient_code ?? "",
    clinic_id: patient?.clinic_id ?? "",
    age: patient?.age?.toString() ?? "",
    sex: patient?.sex ?? "",
    smoking_status: patient?.smoking_status ?? "",
    diabetes_status: patient?.diabetes_status ?? "",
    enrollment_date:
      patient?.enrollment_date ?? new Date().toISOString().split("T")[0],
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate required fields
    if (!form.patient_code.trim()) {
      setError("Patient code is required");
      setSaving(false);
      return;
    }
    if (!form.clinic_id) {
      setError("Clinic is required");
      setSaving(false);
      return;
    }
    if (!form.enrollment_date) {
      setError("Enrollment date is required");
      setSaving(false);
      return;
    }

    const payload = {
      patient_code: form.patient_code.trim(),
      clinic_id: form.clinic_id,
      age: form.age ? Number(form.age) : null,
      sex: form.sex || null,
      smoking_status: form.smoking_status || null,
      diabetes_status: form.diabetes_status || null,
      enrollment_date: form.enrollment_date,
      medical_history: patient?.medical_history ?? {},
      is_active: patient?.is_active ?? true,
    };

    try {
      const url = isEdit ? `/api/patients/${patient!.id}` : "/api/patients";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg =
          typeof data.error === "string"
            ? data.error
            : "Failed to save patient";
        throw new Error(msg);
      }

      const { data } = await res.json();

      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/patients/${data.id}`);
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
          {/* Patient Code & Clinic */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patient_code">
                Patient Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="patient_code"
                placeholder="e.g. PT-001"
                value={form.patient_code}
                onChange={(e) => updateField("patient_code", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic_id">
                Clinic <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.clinic_id}
                onValueChange={(v) => updateField("clinic_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.clinic_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Age & Sex */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={150}
                placeholder="e.g. 45"
                value={form.age}
                onChange={(e) => updateField("age", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select
                value={form.sex}
                onValueChange={(v) => updateField("sex", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Smoking & Diabetes */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smoking_status">Smoking Status</Label>
              <Select
                value={form.smoking_status}
                onValueChange={(v) => updateField("smoking_status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="former">Former</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="diabetes_status">Diabetes Status</Label>
              <Select
                value={form.diabetes_status}
                onValueChange={(v) => updateField("diabetes_status", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="type_1">Type 1</SelectItem>
                  <SelectItem value="type_2">Type 2</SelectItem>
                  <SelectItem value="prediabetes">Prediabetes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enrollment Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enrollment_date">
                Enrollment Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="enrollment_date"
                type="date"
                value={form.enrollment_date}
                onChange={(e) => updateField("enrollment_date", e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <Link href={isEdit ? `/patients/${patient!.id}` : "/patients"}>
            <Button type="button" variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Patient"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Patient, Visit, Biomarker, Clinic } from "@/lib/db/types";
import { formatDate, formatPeriodontalStage, formatBiomarkerValue } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Plus,
  Trash2,
  User,
  Activity,
  FlaskConical,
  Stethoscope,
  Heart,
  Cigarette,
  Droplets,
} from "lucide-react";

type PatientWithClinic = Patient & {
  clinics: { name: string; clinic_code: string } | null;
};

interface PatientDetailClientProps {
  patient: PatientWithClinic;
  visits: Visit[];
  biomarkers: Biomarker[];
  clinics: Pick<Clinic, "id" | "name" | "clinic_code">[];
}

const SEX_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

const SMOKING_LABELS: Record<string, string> = {
  never: "Never",
  former: "Former",
  current: "Current",
};

const DIABETES_LABELS: Record<string, string> = {
  none: "None",
  type_1: "Type 1",
  type_2: "Type 2",
  prediabetes: "Prediabetes",
};

const VISIT_TYPE_LABELS: Record<string, string> = {
  baseline: "Baseline",
  follow_up: "Follow-up",
  post_treatment: "Post-treatment",
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function PatientDetailClient({
  patient,
  visits,
  biomarkers,
  clinics,
}: PatientDetailClientProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [addVisitOpen, setAddVisitOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    patient_code: patient.patient_code,
    clinic_id: patient.clinic_id,
    age: patient.age ?? "",
    sex: patient.sex ?? "",
    smoking_status: patient.smoking_status ?? "",
    diabetes_status: patient.diabetes_status ?? "",
    enrollment_date: patient.enrollment_date,
    is_active: patient.is_active,
  });

  // Add visit form state
  const [visitForm, setVisitForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    visit_type: "follow_up" as string,
    visit_number: visits.length + 1,
    periodontal_stage: "" as string,
    bleeding_index: "" as string | number,
    plaque_index: "" as string | number,
    tooth_loss: "" as string | number,
    clinical_notes: "",
  });

  async function handleEditSubmit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          age: editForm.age === "" ? null : Number(editForm.age),
          sex: editForm.sex || null,
          smoking_status: editForm.smoking_status || null,
          diabetes_status: editForm.diabetes_status || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update patient");
      }
      setEditOpen(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddVisit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_id: patient.id,
          clinic_id: patient.clinic_id,
          visit_date: visitForm.visit_date,
          visit_type: visitForm.visit_type,
          visit_number: visitForm.visit_number,
          periodontal_stage: visitForm.periodontal_stage || null,
          bleeding_index:
            visitForm.bleeding_index === "" ? null : Number(visitForm.bleeding_index),
          plaque_index:
            visitForm.plaque_index === "" ? null : Number(visitForm.plaque_index),
          tooth_loss:
            visitForm.tooth_loss === "" ? null : Number(visitForm.tooth_loss),
          clinical_notes: visitForm.clinical_notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add visit");
      }
      setAddVisitOpen(false);
      setVisitForm({
        visit_date: new Date().toISOString().split("T")[0],
        visit_type: "follow_up",
        visit_number: visits.length + 2,
        periodontal_stage: "",
        bleeding_index: "",
        plaque_index: "",
        tooth_loss: "",
        clinical_notes: "",
      });
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete patient");
      }
      router.push("/patients");
    } catch (e: any) {
      setError(e.message);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link
            href="/patients"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-mono">{patient.patient_code}</h1>
            <Badge variant={patient.is_active ? "default" : "secondary"}>
              {patient.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {patient.clinics?.name ?? "Unknown Clinic"}
            {patient.clinics?.clinic_code && (
              <span className="ml-1 text-xs font-mono">({patient.clinics.clinic_code})</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Patient</DialogTitle>
                <DialogDescription>
                  Update patient information for {patient.patient_code}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">Patient Code</Label>
                    <Input
                      id="edit-code"
                      value={editForm.patient_code}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, patient_code: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-clinic">Clinic</Label>
                    <Select
                      value={editForm.clinic_id}
                      onValueChange={(v) => setEditForm((f) => ({ ...f, clinic_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clinics.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-age">Age</Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editForm.age}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, age: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-sex">Sex</Label>
                    <Select
                      value={editForm.sex}
                      onValueChange={(v) => setEditForm((f) => ({ ...f, sex: v }))}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-smoking">Smoking Status</Label>
                    <Select
                      value={editForm.smoking_status}
                      onValueChange={(v) =>
                        setEditForm((f) => ({ ...f, smoking_status: v }))
                      }
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
                    <Label htmlFor="edit-diabetes">Diabetes Status</Label>
                    <Select
                      value={editForm.diabetes_status}
                      onValueChange={(v) =>
                        setEditForm((f) => ({ ...f, diabetes_status: v }))
                      }
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
                <div className="space-y-2">
                  <Label htmlFor="edit-enrollment">Enrollment Date</Label>
                  <Input
                    id="edit-enrollment"
                    type="date"
                    value={editForm.enrollment_date}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, enrollment_date: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="edit-active"
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, is_active: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="edit-active">Active</Label>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditSubmit} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Patient</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete patient{" "}
                  <strong>{patient.patient_code}</strong>? This action cannot be undone
                  and will remove all associated visits and biomarker data.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                  {saving ? "Deleting..." : "Delete Patient"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard label="Age" value={patient.age ?? "N/A"} icon={User} />
        <StatCard
          label="Sex"
          value={patient.sex ? SEX_LABELS[patient.sex] || patient.sex : "N/A"}
          icon={User}
        />
        <StatCard
          label="Smoking"
          value={
            patient.smoking_status
              ? SMOKING_LABELS[patient.smoking_status] || patient.smoking_status
              : "N/A"
          }
          icon={Cigarette}
        />
        <StatCard
          label="Diabetes"
          value={
            patient.diabetes_status
              ? DIABETES_LABELS[patient.diabetes_status] || patient.diabetes_status
              : "N/A"
          }
          icon={Droplets}
        />
        <StatCard
          label="Enrolled"
          value={formatDate(patient.enrollment_date)}
          icon={Calendar}
        />
        <StatCard label="Visits" value={visits.length} icon={Stethoscope} />
        <StatCard label="Samples" value={biomarkers.length} icon={FlaskConical} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="biomarkers">Biomarkers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Patient Code" value={patient.patient_code} mono />
                <InfoRow
                  label="Clinic"
                  value={
                    patient.clinics
                      ? `${patient.clinics.name} (${patient.clinics.clinic_code})`
                      : "N/A"
                  }
                />
                <InfoRow label="Age" value={patient.age?.toString() ?? "N/A"} />
                <InfoRow
                  label="Sex"
                  value={patient.sex ? SEX_LABELS[patient.sex] || patient.sex : "N/A"}
                />
                <InfoRow
                  label="Enrollment Date"
                  value={formatDate(patient.enrollment_date)}
                />
                <InfoRow
                  label="Status"
                  value={patient.is_active ? "Active" : "Inactive"}
                />
                <InfoRow
                  label="Created"
                  value={formatDate(patient.created_at)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Risk Factors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="Smoking Status"
                  value={
                    patient.smoking_status
                      ? SMOKING_LABELS[patient.smoking_status] || patient.smoking_status
                      : "N/A"
                  }
                />
                <InfoRow
                  label="Diabetes Status"
                  value={
                    patient.diabetes_status
                      ? DIABETES_LABELS[patient.diabetes_status] ||
                        patient.diabetes_status
                      : "N/A"
                  }
                />
                {patient.smoking_status === "current" && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Active smoker -- elevated periodontal risk
                  </div>
                )}
                {(patient.diabetes_status === "type_1" ||
                  patient.diabetes_status === "type_2") && (
                  <div className="rounded-md bg-yellow-500/10 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                    Diabetic patient -- monitor glycemic impact on periodontal status
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Last 5 visits and biomarker samples
              </CardDescription>
            </CardHeader>
            <CardContent>
              {visits.length === 0 && biomarkers.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No visits or biomarker data recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {visits.slice(0, 5).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-md border p-3 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {VISIT_TYPE_LABELS[v.visit_type] || v.visit_type}
                        </span>
                        {v.periodontal_stage && (
                          <Badge variant="outline" className="text-xs">
                            {formatPeriodontalStage(v.periodontal_stage)}
                          </Badge>
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {formatDate(v.visit_date)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Visit History ({visits.length})
            </h2>
            <Dialog open={addVisitOpen} onOpenChange={setAddVisitOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Visit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Visit</DialogTitle>
                  <DialogDescription>
                    Record a new clinical visit for {patient.patient_code}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visit-date">Visit Date</Label>
                      <Input
                        id="visit-date"
                        type="date"
                        value={visitForm.visit_date}
                        onChange={(e) =>
                          setVisitForm((f) => ({
                            ...f,
                            visit_date: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-type">Visit Type</Label>
                      <Select
                        value={visitForm.visit_type}
                        onValueChange={(v) =>
                          setVisitForm((f) => ({ ...f, visit_type: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baseline">Baseline</SelectItem>
                          <SelectItem value="follow_up">Follow-up</SelectItem>
                          <SelectItem value="post_treatment">
                            Post-treatment
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visit-number">Visit Number</Label>
                      <Input
                        id="visit-number"
                        type="number"
                        value={visitForm.visit_number}
                        onChange={(e) =>
                          setVisitForm((f) => ({
                            ...f,
                            visit_number: parseInt(e.target.value) || 1,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-stage">Periodontal Stage</Label>
                      <Select
                        value={visitForm.periodontal_stage}
                        onValueChange={(v) =>
                          setVisitForm((f) => ({
                            ...f,
                            periodontal_stage: v,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="healthy">Healthy</SelectItem>
                          <SelectItem value="stage_1">Stage I</SelectItem>
                          <SelectItem value="stage_2">Stage II</SelectItem>
                          <SelectItem value="stage_3">Stage III</SelectItem>
                          <SelectItem value="stage_4">Stage IV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="visit-bleeding">Bleeding Index</Label>
                      <Input
                        id="visit-bleeding"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={visitForm.bleeding_index}
                        onChange={(e) =>
                          setVisitForm((f) => ({
                            ...f,
                            bleeding_index: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-plaque">Plaque Index</Label>
                      <Input
                        id="visit-plaque"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={visitForm.plaque_index}
                        onChange={(e) =>
                          setVisitForm((f) => ({
                            ...f,
                            plaque_index: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="visit-tooth">Tooth Loss</Label>
                      <Input
                        id="visit-tooth"
                        type="number"
                        placeholder="0"
                        value={visitForm.tooth_loss}
                        onChange={(e) =>
                          setVisitForm((f) => ({
                            ...f,
                            tooth_loss: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visit-notes">Clinical Notes</Label>
                    <Textarea
                      id="visit-notes"
                      rows={3}
                      placeholder="Optional clinical observations..."
                      value={visitForm.clinical_notes}
                      onChange={(e) =>
                        setVisitForm((f) => ({
                          ...f,
                          clinical_notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setAddVisitOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddVisit} disabled={saving}>
                    {saving ? "Saving..." : "Add Visit"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Periodontal Stage</TableHead>
                    <TableHead className="text-right">Bleeding Index</TableHead>
                    <TableHead className="text-right">Plaque Index</TableHead>
                    <TableHead className="text-right">Tooth Loss</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visits.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        {formatDate(visit.visit_date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {VISIT_TYPE_LABELS[visit.visit_type] || visit.visit_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {visit.periodontal_stage ? (
                          <Badge
                            variant={
                              visit.periodontal_stage === "healthy"
                                ? "default"
                                : visit.periodontal_stage === "stage_3" ||
                                  visit.periodontal_stage === "stage_4"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {formatPeriodontalStage(visit.periodontal_stage)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {visit.bleeding_index !== null
                          ? visit.bleeding_index.toFixed(2)
                          : "--"}
                      </TableCell>
                      <TableCell className="text-right">
                        {visit.plaque_index !== null
                          ? visit.plaque_index.toFixed(2)
                          : "--"}
                      </TableCell>
                      <TableCell className="text-right">
                        {visit.tooth_loss !== null ? visit.tooth_loss : "--"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {visit.clinical_notes || (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {visits.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No visits recorded yet. Add the first visit above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biomarkers Tab */}
        <TabsContent value="biomarkers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Biomarker Samples ({biomarkers.length})
            </h2>
          </div>

          {/* Summary Cards */}
          {biomarkers.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <BiomarkerSummaryCard
                label="OMV Concentration"
                values={biomarkers
                  .filter((b) => b.omv_concentration !== null)
                  .map((b) => b.omv_concentration!)}
                unit={biomarkers[0]?.omv_concentration_unit || "ng/mL"}
              />
              <BiomarkerSummaryCard
                label="Gingipain Activity"
                values={biomarkers
                  .filter((b) => b.gingipain_activity !== null)
                  .map((b) => b.gingipain_activity!)}
                unit={biomarkers[0]?.gingipain_activity_unit || "U/mL"}
              />
              <BiomarkerSummaryCard
                label="IL-6"
                values={biomarkers
                  .filter((b) => b.il6 !== null)
                  .map((b) => b.il6!)}
                unit={biomarkers[0]?.il6_unit || "pg/mL"}
              />
              <BiomarkerSummaryCard
                label="hsCRP"
                values={biomarkers
                  .filter((b) => b.hscrp !== null)
                  .map((b) => b.hscrp!)}
                unit={biomarkers[0]?.hscrp_unit || "mg/L"}
              />
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sample Date</TableHead>
                    <TableHead>Sample Type</TableHead>
                    <TableHead className="text-right">OMV Conc.</TableHead>
                    <TableHead className="text-right">Gingipain</TableHead>
                    <TableHead className="text-right">IL-6</TableHead>
                    <TableHead className="text-right">TNF-a</TableHead>
                    <TableHead className="text-right">hsCRP</TableHead>
                    <TableHead className="text-right">Quality</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {biomarkers.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {formatDate(b.sample_date)}
                      </TableCell>
                      <TableCell className="capitalize">
                        {b.sample_type?.replace(/_/g, " ") || "--"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBiomarkerValue(
                          b.omv_concentration,
                          b.omv_concentration_unit
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBiomarkerValue(
                          b.gingipain_activity,
                          b.gingipain_activity_unit
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBiomarkerValue(b.il6, b.il6_unit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBiomarkerValue(b.tnf_alpha, b.tnf_alpha_unit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatBiomarkerValue(b.hscrp, b.hscrp_unit)}
                      </TableCell>
                      <TableCell className="text-right">
                        {b.quality_score !== null ? (
                          <Badge
                            variant={
                              b.quality_score >= 0.8
                                ? "default"
                                : b.quality_score >= 0.5
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {(b.quality_score * 100).toFixed(0)}%
                          </Badge>
                        ) : (
                          "--"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {biomarkers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        No biomarker samples recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function BiomarkerSummaryCard({
  label,
  values,
  unit,
}: {
  label: string;
  values: number[];
  unit: string;
}) {
  if (values.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold mt-1">N/A</p>
        </CardContent>
      </Card>
    );
  }

  const latest = values[0];
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold mt-1">
          {latest.toFixed(2)} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
        </p>
        <Separator className="my-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Avg: {avg.toFixed(2)}</span>
          <span>
            {min.toFixed(1)}--{max.toFixed(1)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

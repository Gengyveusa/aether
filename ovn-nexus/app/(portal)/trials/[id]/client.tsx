"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pill, Users, CalendarDays, Hash, Pencil, Trash2, ArrowLeft, Sparkles, Target,
  ClipboardList, FlaskConical, Loader2,
} from "lucide-react";
import Link from "next/link";
import type { ClinicalTrial } from "@/lib/db/types";
import { formatNumber, formatDate } from "@/lib/utils/format";

const PHASE_LABELS: Record<string, string> = {
  preclinical: "Preclinical",
  phase_1: "Phase I",
  phase_2: "Phase II",
  phase_3: "Phase III",
  phase_4: "Phase IV",
};

const PHASE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  preclinical: "outline",
  phase_1: "secondary",
  phase_2: "secondary",
  phase_3: "default",
  phase_4: "default",
};

const STATUS_LABELS: Record<string, string> = {
  recruiting: "Recruiting",
  active: "Active",
  completed: "Completed",
  suspended: "Suspended",
  terminated: "Terminated",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  recruiting: "default",
  active: "default",
  completed: "secondary",
  suspended: "outline",
  terminated: "destructive",
};

interface TrialMatch {
  patient_id: string;
  patient_code: string;
  match_score: number;
  matched_criteria: string[];
}

interface TrialDetailClientProps {
  trial: ClinicalTrial & { institutions: { id: string; name: string } | null };
}

export function TrialDetailClient({ trial }: TrialDetailClientProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<TrialMatch[] | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);

  const [form, setForm] = useState({
    trial_code: trial.trial_code,
    title: trial.title,
    description: trial.description || "",
    phase: trial.phase,
    status: trial.status,
    sponsor: trial.sponsor || "",
    target_enrollment: trial.target_enrollment?.toString() || "",
    start_date: trial.start_date || "",
    end_date: trial.end_date || "",
    nct_number: trial.nct_number || "",
  });

  const enrollmentPercent = trial.target_enrollment
    ? Math.min(100, Math.round((trial.current_enrollment / trial.target_enrollment) * 100))
    : 0;

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        sponsor: form.sponsor || null,
        description: form.description || null,
        target_enrollment: form.target_enrollment ? parseInt(form.target_enrollment) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        nct_number: form.nct_number || null,
      };

      const res = await fetch(`/api/trials/${trial.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setEditOpen(false);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/trials/${trial.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/trials");
      }
    } finally {
      setDeleting(false);
    }
  }

  async function handleFindMatches() {
    setMatching(true);
    setMatchError(null);
    setMatchResults(null);
    try {
      const res = await fetch("/api/ml/trial-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trial_id: trial.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to find matches");
      }
      setMatchResults(data.top_matches || []);
    } catch (err: unknown) {
      setMatchError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setMatching(false);
    }
  }

  const biomarkerCriteria = trial.biomarker_criteria as Record<string, { min?: number; max?: number }> | null;
  const inclusionCriteria = trial.inclusion_criteria as Record<string, unknown> | null;
  const exclusionCriteria = trial.exclusion_criteria as Record<string, unknown> | null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/trials" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Trials
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold">{trial.title}</h1>
            <Badge variant={PHASE_VARIANTS[trial.phase] ?? "outline"}>
              {PHASE_LABELS[trial.phase] ?? trial.phase}
            </Badge>
            <Badge variant={STATUS_VARIANTS[trial.status] ?? "secondary"}>
              {STATUS_LABELS[trial.status] ?? trial.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-mono text-sm">{trial.trial_code}</span>
            {trial.institutions && (
              <>
                <span className="text-muted-foreground/40">|</span>
                <span>{trial.institutions.name}</span>
              </>
            )}
            {trial.nct_number && (
              <>
                <span className="text-muted-foreground/40">|</span>
                <span className="font-mono text-sm">{trial.nct_number}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Trial</DialogTitle>
                <DialogDescription>Update clinical trial details below.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-code">Trial Code</Label>
                    <Input id="edit-code" value={form.trial_code} onChange={(e) => setForm({ ...form, trial_code: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-nct">NCT Number</Label>
                    <Input id="edit-nct" value={form.nct_number} onChange={(e) => setForm({ ...form, nct_number: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Phase</Label>
                    <Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v as typeof form.phase })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preclinical">Preclinical</SelectItem>
                        <SelectItem value="phase_1">Phase I</SelectItem>
                        <SelectItem value="phase_2">Phase II</SelectItem>
                        <SelectItem value="phase_3">Phase III</SelectItem>
                        <SelectItem value="phase_4">Phase IV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recruiting">Recruiting</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sponsor">Sponsor</Label>
                    <Input id="edit-sponsor" value={form.sponsor} onChange={(e) => setForm({ ...form, sponsor: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-target">Target Enrollment</Label>
                    <Input id="edit-target" type="number" value={form.target_enrollment} onChange={(e) => setForm({ ...form, target_enrollment: e.target.value })} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-start">Start Date</Label>
                    <Input id="edit-start" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-end">End Date</Label>
                    <Input id="edit-end" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Trial</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete trial &quot;{trial.trial_code}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {deleting ? "Deleting..." : "Delete Trial"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Enrollment</p>
                <p className="text-2xl font-bold">{trial.target_enrollment ? formatNumber(trial.target_enrollment) : "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Enrollment</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{formatNumber(trial.current_enrollment)}</p>
                  {trial.target_enrollment && (
                    <span className="text-sm text-muted-foreground">/ {formatNumber(trial.target_enrollment)}</span>
                  )}
                </div>
                {trial.target_enrollment && (
                  <Progress value={enrollmentPercent} className="mt-2 h-2" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-2xl font-bold">{trial.start_date ? formatDate(trial.start_date) : "TBD"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Hash className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NCT Number</p>
                <p className="text-lg font-mono font-bold">{trial.nct_number || "Not assigned"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="biomarkers">Biomarker Criteria</TabsTrigger>
          <TabsTrigger value="ai-match">AI Match</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  Trial Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {trial.description || "No description provided."}
                </p>
                <Separator className="my-6" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Sponsor</p>
                    <p className="text-sm">{trial.sponsor || "Not specified"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Institution</p>
                    <p className="text-sm">{trial.institutions?.name || "Not assigned"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                    <p className="text-sm">{trial.start_date ? formatDate(trial.start_date) : "Not set"}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">End Date</p>
                    <p className="text-sm">{trial.end_date ? formatDate(trial.end_date) : "Not set"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inclusion / Exclusion criteria */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Inclusion Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  {inclusionCriteria && Object.keys(inclusionCriteria).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(inclusionCriteria).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                          <span><span className="font-medium">{key}:</span> {String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No inclusion criteria defined.</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exclusion Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  {exclusionCriteria && Object.keys(exclusionCriteria).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(exclusionCriteria).map(([key, value]) => (
                        <li key={key} className="flex items-start gap-2 text-sm">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                          <span><span className="font-medium">{key}:</span> {String(value)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No exclusion criteria defined.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Enrollment tab */}
        <TabsContent value="enrollment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrollment Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Enrollment</span>
                  <span className="font-medium">
                    {formatNumber(trial.current_enrollment)}
                    {trial.target_enrollment ? ` / ${formatNumber(trial.target_enrollment)}` : ""}
                  </span>
                </div>
                <Progress value={enrollmentPercent} className="h-4" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{enrollmentPercent}% complete</span>
                  <Badge variant={STATUS_VARIANTS[trial.status] ?? "secondary"}>
                    {STATUS_LABELS[trial.status] ?? trial.status}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Target</p>
                  <p className="text-2xl font-bold">{trial.target_enrollment ? formatNumber(trial.target_enrollment) : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Enrolled</p>
                  <p className="text-2xl font-bold">{formatNumber(trial.current_enrollment)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold">
                    {trial.target_enrollment
                      ? formatNumber(Math.max(0, trial.target_enrollment - trial.current_enrollment))
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biomarker Criteria tab */}
        <TabsContent value="biomarkers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5" />
                Biomarker Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {biomarkerCriteria && Object.keys(biomarkerCriteria).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marker</TableHead>
                      <TableHead className="text-right">Min</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(biomarkerCriteria).map(([marker, range]) => (
                      <TableRow key={marker}>
                        <TableCell className="font-medium">{marker.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {range.min !== undefined ? range.min : "--"}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {range.max !== undefined ? range.max : "--"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No biomarker criteria have been defined for this trial.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Match tab */}
        <TabsContent value="ai-match">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Patient Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use biomarker-based ML matching to identify patients who meet this trial&apos;s criteria.
                Results are ranked by match score.
              </p>

              <Button onClick={handleFindMatches} disabled={matching}>
                {matching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Patients...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find Matching Patients
                  </>
                )}
              </Button>

              {matchError && (
                <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {matchError}
                </div>
              )}

              {matchResults && (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {matchResults.length} matching patient{matchResults.length === 1 ? "" : "s"} found
                  </p>
                  {matchResults.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient Code</TableHead>
                          <TableHead>Match Score</TableHead>
                          <TableHead>Matched Criteria</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchResults.map((match) => (
                          <TableRow key={match.patient_id}>
                            <TableCell>
                              <Link
                                href={`/patients/${match.patient_id}`}
                                className="font-mono text-sm text-primary hover:underline"
                              >
                                {match.patient_code}
                              </Link>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={match.match_score * 100} className="h-2 w-20" />
                                <span className="text-sm font-medium">
                                  {Math.round(match.match_score * 100)}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {(match.matched_criteria || []).map((criterion) => (
                                  <Badge key={criterion} variant="secondary" className="text-xs">
                                    {criterion.replace(/_/g, " ")}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No patients matched the biomarker criteria above the threshold.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Edit, Trash2, Pill, Users, Brain, ClipboardList, Loader2 } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils/format";

const PHASE_LABELS: Record<string, string> = {
  preclinical: "Preclinical", phase_1: "Phase I", phase_2: "Phase II",
  phase_3: "Phase III", phase_4: "Phase IV",
};

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  recruiting: "default", active: "default", completed: "secondary",
  suspended: "outline", terminated: "destructive",
};

interface TrialDetailClientProps {
  trial: any;
}

export function TrialDetailClient({ trial }: TrialDetailClientProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [matching, setMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<any>(null);

  const enrollmentPct = trial.target_enrollment
    ? Math.min(100, Math.round((trial.current_enrollment / trial.target_enrollment) * 100))
    : 0;

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/trials/${trial.id}`, { method: "DELETE" });
    router.push("/trials");
    router.refresh();
  }

  async function runTrialMatch() {
    setMatching(true);
    setMatchResults(null);
    try {
      const res = await fetch("/api/ml/trial-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trial_id: trial.id }),
      });
      const data = await res.json();
      setMatchResults(data);
    } catch {
      setMatchResults({ error: "Failed to run matching" });
    } finally {
      setMatching(false);
    }
  }

  const biomarkerCriteria = trial.biomarker_criteria as Record<string, { min?: number; max?: number }> | null;
  const hasCriteria = biomarkerCriteria && Object.keys(biomarkerCriteria).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/trials" className="hover:text-foreground flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />Trials
            </Link>
          </div>
          <h1 className="text-3xl font-bold">{trial.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="font-mono">{trial.trial_code}</Badge>
            <Badge>{PHASE_LABELS[trial.phase] || trial.phase}</Badge>
            <Badge variant={STATUS_COLORS[trial.status]}>{trial.status}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trials/new?edit=${trial.id}`}>
            <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4" />Edit</Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete trial?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete this clinical trial record.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Enrollment</p>
            <p className="text-2xl font-bold">{formatNumber(trial.current_enrollment)}/{trial.target_enrollment ? formatNumber(trial.target_enrollment) : "—"}</p>
            <Progress value={enrollmentPct} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{enrollmentPct}% enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Sponsor</p>
            <p className="text-lg font-semibold">{trial.sponsor || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p className="text-lg font-semibold">{trial.start_date ? formatDate(trial.start_date) : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">NCT Number</p>
            <p className="text-lg font-semibold font-mono">{trial.nct_number || "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview"><ClipboardList className="mr-1 h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="criteria"><Pill className="mr-1 h-4 w-4" />Biomarker Criteria</TabsTrigger>
          <TabsTrigger value="match"><Brain className="mr-1 h-4 w-4" />AI Match</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {trial.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
          {trial.inclusion_criteria && Object.keys(trial.inclusion_criteria).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Inclusion Criteria</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted rounded-md p-4 overflow-auto font-mono">
                  {JSON.stringify(trial.inclusion_criteria, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
          {trial.exclusion_criteria && Object.keys(trial.exclusion_criteria).length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Exclusion Criteria</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-sm bg-muted rounded-md p-4 overflow-auto font-mono">
                  {JSON.stringify(trial.exclusion_criteria, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="criteria">
          <Card>
            <CardHeader><CardTitle className="text-base">Biomarker Eligibility Criteria</CardTitle></CardHeader>
            <CardContent>
              {hasCriteria ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Marker</TableHead>
                      <TableHead>Min</TableHead>
                      <TableHead>Max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(biomarkerCriteria!).map(([marker, range]) => (
                      <TableRow key={marker}>
                        <TableCell className="font-medium capitalize">{marker.replace(/_/g, " ")}</TableCell>
                        <TableCell className="font-mono">{range.min ?? "—"}</TableCell>
                        <TableCell className="font-mono">{range.max ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No biomarker criteria defined for this trial. Add criteria to enable AI patient matching.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="match" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5" />AI Patient Matching
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Use AI to find patients whose biomarker profiles match this trial's eligibility criteria.
              </p>
              <Button onClick={runTrialMatch} disabled={matching || !hasCriteria}>
                {matching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {matching ? "Searching..." : "Find Matching Patients"}
              </Button>
              {!hasCriteria && (
                <p className="text-xs text-muted-foreground">Define biomarker criteria first to enable matching.</p>
              )}
            </CardContent>
          </Card>

          {matchResults && !matchResults.error && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Match Results — {matchResults.total_candidates} candidate{matchResults.total_candidates !== 1 ? "s" : ""} found
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matchResults.top_matches?.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Match Score</TableHead>
                        <TableHead>Matched Criteria</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matchResults.top_matches.map((m: any) => (
                        <TableRow key={m.patient_id}>
                          <TableCell>
                            <Link href={`/patients/${m.patient_id}`} className="font-mono text-primary hover:underline">
                              {m.patient_code}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={m.match_score * 100} className="h-2 w-20" />
                              <span className="text-sm font-medium">{(m.match_score * 100).toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {m.matched_criteria?.map((c: string) => (
                                <Badge key={c} variant="outline" className="text-xs capitalize">
                                  {c.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No matching patients found.</p>
                )}
              </CardContent>
            </Card>
          )}
          {matchResults?.error && (
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-destructive text-center">{matchResults.error}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

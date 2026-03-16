"use client";

import { useState } from "react";
import { Brain, Activity, Users, Cpu, Loader2, Beaker, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils/cn";
import type { MlModel, ClinicalTrial } from "@/lib/db/types";

interface MlLabClientProps {
  models: MlModel[];
  predictionCount: number;
  recruitingTrials: Array<Pick<ClinicalTrial, "id" | "trial_code" | "title" | "phase" | "status" | "target_enrollment" | "current_enrollment">>;
  patients: Array<{ id: string; patient_code: string }>;
  visits: Array<{ id: string; patient_id: string; visit_type: string; visit_date: string; visit_number: number }>;
}

interface RiskResult {
  cardiovascular: number;
  neurodegeneration: number;
  metabolic: number;
  confidence: number;
  contributing_factors: string[];
}

interface TrialMatchResult {
  trial_code: string;
  total_candidates: number;
  top_matches: Array<{
    patient_id: string;
    patient_code: string;
    match_score: number;
    matched_criteria: string[];
  }>;
}

function RiskGauge({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  const color =
    value < 0.3
      ? "bg-green-500"
      : value < 0.6
        ? "bg-yellow-500"
        : "bg-red-500";
  const textColor =
    value < 0.3
      ? "text-green-600"
      : value < 0.6
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("font-semibold tabular-nums", textColor)}>
          {percentage}%
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function MlLabClient({
  models,
  predictionCount,
  recruitingTrials,
  patients,
  visits,
}: MlLabClientProps) {
  // Risk Prediction state
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedVisit, setSelectedVisit] = useState<string>("");
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [predError, setPredError] = useState<string | null>(null);

  // Trial Matching state
  const [selectedTrial, setSelectedTrial] = useState<string>("");
  const [trialResult, setTrialResult] = useState<TrialMatchResult | null>(null);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  const filteredVisits = visits.filter((v) => v.patient_id === selectedPatient);

  async function runPrediction() {
    if (!selectedPatient || !selectedVisit) return;
    setPredicting(true);
    setPredError(null);
    setRiskResult(null);

    try {
      const res = await fetch("/api/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patient_id: selectedPatient, visit_id: selectedVisit }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Prediction failed");
      }

      const data = await res.json();
      const score = data.risk_score;
      setRiskResult({
        cardiovascular: score.cardiovascular ?? score.cardiovascular_risk ?? 0,
        neurodegeneration: score.neurodegeneration ?? score.neurodegeneration_risk ?? 0,
        metabolic: score.metabolic ?? score.metabolic_risk ?? 0,
        confidence: score.confidence ?? 0,
        contributing_factors: score.contributing_factors || score.factors || [],
      });
    } catch (err) {
      setPredError(err instanceof Error ? err.message : "Prediction failed");
    } finally {
      setPredicting(false);
    }
  }

  async function runTrialMatch() {
    if (!selectedTrial) return;
    setMatching(true);
    setMatchError(null);
    setTrialResult(null);

    try {
      const res = await fetch("/api/ml/trial-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trial_id: selectedTrial }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Trial matching failed");
      }

      const data = await res.json();
      setTrialResult(data);
    } catch (err) {
      setMatchError(err instanceof Error ? err.message : "Trial matching failed");
    } finally {
      setMatching(false);
    }
  }

  const activeModels = models.filter((m) => m.is_active).length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI & ML Lab</h1>
            <p className="text-muted-foreground">
              Risk prediction, trial matching, and model registry
            </p>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Models Registered</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">{activeModels} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Predictions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictionCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Risk scores computed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recruiting Trials</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recruitingTrials.length}</div>
            <p className="text-xs text-muted-foreground">Available for matching</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prediction" className="gap-2">
            <Activity className="h-4 w-4" />
            Risk Prediction
          </TabsTrigger>
          <TabsTrigger value="trial-match" className="gap-2">
            <Target className="h-4 w-4" />
            Trial Matching
          </TabsTrigger>
          <TabsTrigger value="models" className="gap-2">
            <Cpu className="h-4 w-4" />
            Model Registry
          </TabsTrigger>
        </TabsList>

        {/* ── Risk Prediction Engine ─────────────────────────────── */}
        <TabsContent value="prediction">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="h-5 w-5" />
                Risk Prediction Engine
              </CardTitle>
              <CardDescription>
                Compute cardiovascular, neurodegeneration, and metabolic risk scores using
                patient clinical data and biomarker profiles. The model integrates periodontal
                staging, inflammatory markers (IL-6, TNF-alpha, hsCRP), OMV concentration,
                and gingipain activity to generate multi-domain risk assessments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Patient</Label>
                  <Select
                    value={selectedPatient}
                    onValueChange={(val) => {
                      setSelectedPatient(val);
                      setSelectedVisit("");
                      setRiskResult(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.patient_code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Visit</Label>
                  <Select
                    value={selectedVisit}
                    onValueChange={setSelectedVisit}
                    disabled={!selectedPatient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedPatient ? "Select visit" : "Select patient first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredVisits.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          Visit {v.visit_number} - {v.visit_type} ({v.visit_date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={runPrediction}
                    disabled={!selectedPatient || !selectedVisit || predicting}
                    className="w-full"
                  >
                    {predicting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Computing...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-2 h-4 w-4" />
                        Run Prediction
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {predError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {predError}
                </div>
              )}

              {riskResult && (
                <>
                  <Separator />
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Risk Scores
                      </h4>
                      <RiskGauge label="Cardiovascular Risk" value={riskResult.cardiovascular} />
                      <RiskGauge label="Neurodegeneration Risk" value={riskResult.neurodegeneration} />
                      <RiskGauge label="Metabolic Risk" value={riskResult.metabolic} />
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Model Confidence</span>
                          <span className="font-semibold">
                            {Math.round(riskResult.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Contributing Factors
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {riskResult.contributing_factors.length > 0 ? (
                          riskResult.contributing_factors.map((factor, i) => (
                            <Badge key={i} variant="secondary">
                              {factor}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No contributing factors returned by the model.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Trial Matching Engine ──────────────────────────────── */}
        <TabsContent value="trial-match">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Trial Matching Engine
              </CardTitle>
              <CardDescription>
                Select a recruiting trial to automatically find eligible patient candidates
                based on biomarker criteria, clinical parameters, and inclusion/exclusion rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Clinical Trial</Label>
                  <Select
                    value={selectedTrial}
                    onValueChange={(val) => {
                      setSelectedTrial(val);
                      setTrialResult(null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recruiting trial" />
                    </SelectTrigger>
                    <SelectContent>
                      {recruitingTrials.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.trial_code} - {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={runTrialMatch}
                    disabled={!selectedTrial || matching}
                    className="w-full"
                  >
                    {matching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Matching...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Find Candidates
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {selectedTrial && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  {(() => {
                    const trial = recruitingTrials.find((t) => t.id === selectedTrial);
                    if (!trial) return null;
                    return (
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="outline">{trial.phase}</Badge>
                        <Badge>{trial.status}</Badge>
                        <span className="text-muted-foreground">
                          Enrollment: {trial.current_enrollment}/{trial.target_enrollment ?? "?"}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              {matchError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  {matchError}
                </div>
              )}

              {trialResult && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Matched Candidates
                      </h4>
                      <Badge variant="secondary">
                        {trialResult.total_candidates} total candidates
                      </Badge>
                    </div>

                    {trialResult.top_matches.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">
                        No matching candidates found for the selected trial criteria.
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Rank</TableHead>
                            <TableHead>Patient Code</TableHead>
                            <TableHead>Match Score</TableHead>
                            <TableHead>Matched Criteria</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trialResult.top_matches.map((match, i) => (
                            <TableRow key={match.patient_id}>
                              <TableCell className="font-medium">{i + 1}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {match.patient_code}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="relative h-2 w-20 overflow-hidden rounded-full bg-secondary">
                                    <div
                                      className={cn(
                                        "h-full rounded-full",
                                        match.match_score >= 0.8
                                          ? "bg-green-500"
                                          : match.match_score >= 0.6
                                            ? "bg-yellow-500"
                                            : "bg-orange-500"
                                      )}
                                      style={{ width: `${match.match_score * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm tabular-nums">
                                    {Math.round(match.match_score * 100)}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {(match.matched_criteria || []).map((c, j) => (
                                    <Badge key={j} variant="outline" className="text-xs">
                                      {c}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ML Models Registry ────────────────────────────────── */}
        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5" />
                ML Models Registry
              </CardTitle>
              <CardDescription>
                All registered machine learning models, their versions, frameworks, and
                performance metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {models.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Cpu className="mx-auto mb-3 h-8 w-8 opacity-50" />
                  <p>No models registered yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Framework</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Metrics</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {models.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{model.name}</p>
                            {model.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {model.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{model.model_type}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{model.version}</TableCell>
                        <TableCell>{model.framework ?? "--"}</TableCell>
                        <TableCell>
                          <Badge variant={model.is_active ? "default" : "secondary"}>
                            {model.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {model.metrics &&
                              Object.entries(model.metrics).map(([key, val]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {typeof val === "number" ? val.toFixed(3) : String(val)}
                                </Badge>
                              ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

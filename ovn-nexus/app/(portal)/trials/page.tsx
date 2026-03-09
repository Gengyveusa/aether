// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pill, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate, formatNumber } from "@/lib/utils/format";

const PHASE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  preclinical: "outline",
  phase_1: "secondary",
  phase_2: "secondary",
  phase_3: "default",
  phase_4: "default",
};

export default async function TrialsPage() {
  const supabase = createServerSupabaseClient();
  const { data: trials } = await supabase
    .from("clinical_trials")
    .select("*, institutions(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clinical Trials</h1>
          <p className="text-muted-foreground">Precision trial enrichment using biomarker profiles</p>
        </div>
        <Link href="/trials/new">
          <Button><Plus className="mr-2 h-4 w-4" />Register Trial</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />Clinical Trials Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sponsor</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trials?.map((trial) => (
                <TableRow key={trial.id}>
                  <TableCell className="font-mono text-sm">{trial.trial_code}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{trial.title}</TableCell>
                  <TableCell><Badge variant={PHASE_COLORS[trial.phase] ?? "outline"}>{trial.phase.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell><Badge variant={trial.status === "recruiting" ? "default" : "secondary"}>{trial.status}</Badge></TableCell>
                  <TableCell>{trial.sponsor ?? "—"}</TableCell>
                  <TableCell>{formatNumber(trial.current_enrollment)}/{trial.target_enrollment ? formatNumber(trial.target_enrollment) : "—"}</TableCell>
                  <TableCell>{trial.start_date ? formatDate(trial.start_date) : "—"}</TableCell>
                </TableRow>
              ))}
              {(!trials || trials.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No clinical trials registered yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

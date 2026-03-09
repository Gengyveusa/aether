import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlaskConical, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline",
  active: "default",
  completed: "secondary",
  archived: "destructive",
};

export default async function ExperimentsPage() {
  const supabase = createServerSupabaseClient();
  const { data: experiments } = await supabase
    .from("experiments")
    .select("*, profiles!experiments_pi_id_fkey(full_name), projects(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Experiment Registry</h1>
          <p className="text-muted-foreground">Track experiments, hypotheses, protocols, and analysis outputs</p>
        </div>
        <Link href="/experiments/new">
          <Button><Plus className="mr-2 h-4 w-4" />New Experiment</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />Experiments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>PI</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Model System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiments?.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="font-mono text-sm">{exp.experiment_code}</TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate">{exp.title}</TableCell>
                  <TableCell>{(exp.profiles as { full_name: string } | null)?.full_name ?? "—"}</TableCell>
                  <TableCell>{(exp.projects as { name: string } | null)?.name ?? "—"}</TableCell>
                  <TableCell>{exp.model_system ?? "—"}</TableCell>
                  <TableCell><Badge variant={STATUS_COLORS[exp.status]}>{exp.status}</Badge></TableCell>
                  <TableCell>{exp.start_date ? formatDate(exp.start_date) : "—"}</TableCell>
                </TableRow>
              ))}
              {(!experiments || experiments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No experiments registered yet.
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

import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity } from "lucide-react";
import { formatDate, formatBiomarkerValue } from "@/lib/utils/format";

export default async function BiomarkersPage() {
  const supabase = createServerSupabaseClient();
  const { data: biomarkers } = await supabase
    .from("biomarkers")
    .select("*, patients(patient_code)")
    .order("sample_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Biomarker Engine</h1>
        <p className="text-muted-foreground">
          Salivary biomarker tracking: OMV concentration, gingipain activity, inflammatory markers
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Key Markers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>OMV Concentration</span><Badge>Primary</Badge></div>
              <div className="flex justify-between"><span>Gingipain Activity</span><Badge>Primary</Badge></div>
              <div className="flex justify-between"><span>IL-6</span><Badge variant="secondary">Inflammatory</Badge></div>
              <div className="flex justify-between"><span>TNF-alpha</span><Badge variant="secondary">Inflammatory</Badge></div>
              <div className="flex justify-between"><span>hsCRP</span><Badge variant="secondary">Inflammatory</Badge></div>
              <div className="flex justify-between"><span>Nitric Oxide</span><Badge variant="outline">Metabolic</Badge></div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Biomarker-Disease Associations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>High OMV load correlates with endothelial dysfunction and atherosclerotic plaque instability.</p>
              <p>Elevated gingipain activity linked to tau phosphorylation in neurodegeneration models.</p>
              <p>IL-6 and TNF-alpha elevation predicts cardiovascular event risk in periodontitis patients.</p>
              <p>hsCRP above 3 mg/L combined with periodontal stage III+ indicates systemic inflammatory burden.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />Recent Biomarker Samples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Sample Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>OMV Conc.</TableHead>
                <TableHead>Gingipain</TableHead>
                <TableHead>IL-6</TableHead>
                <TableHead>hsCRP</TableHead>
                <TableHead>Quality</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {biomarkers?.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm">{(b.patients as { patient_code: string } | null)?.patient_code ?? "—"}</TableCell>
                  <TableCell className="capitalize">{b.sample_type}</TableCell>
                  <TableCell>{formatDate(b.sample_date)}</TableCell>
                  <TableCell>{formatBiomarkerValue(b.omv_concentration, b.omv_concentration_unit)}</TableCell>
                  <TableCell>{formatBiomarkerValue(b.gingipain_activity, b.gingipain_activity_unit)}</TableCell>
                  <TableCell>{formatBiomarkerValue(b.il6, b.il6_unit)}</TableCell>
                  <TableCell>{formatBiomarkerValue(b.hscrp, b.hscrp_unit)}</TableCell>
                  <TableCell>{b.quality_score ? `${b.quality_score}%` : "—"}</TableCell>
                </TableRow>
              ))}
              {(!biomarkers || biomarkers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No biomarker samples recorded yet.
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

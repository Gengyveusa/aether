// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Database, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCompact } from "@/lib/utils/format";

export default async function DatasetsPage() {
  const supabase = createServerSupabaseClient();
  const { data: datasets } = await supabase
    .from("datasets")
    .select("*, profiles!datasets_uploaded_by_fkey(full_name), experiments(experiment_code)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Lake</h1>
          <p className="text-muted-foreground">Microbiome sequencing, RNA-seq, proteomics, EV cargo analysis</p>
        </div>
        <Link href="/datasets/new">
          <Button><Upload className="mr-2 h-4 w-4" />Upload Dataset</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {["microbiome_16s", "rna_seq", "proteomics", "ev_cargo"].map((type) => {
          const count = datasets?.filter((d) => d.dataset_type === type).length ?? 0;
          return (
            <Card key={type}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-sm text-muted-foreground capitalize">{type.replace(/_/g, " ")}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />Datasets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Rows</TableHead>
                <TableHead>Experiment</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets?.map((ds) => (
                <TableRow key={ds.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    <Link href={`/datasets/${ds.id}`} className="hover:underline text-primary">{ds.name}</Link>
                  </TableCell>
                  <TableCell><Badge variant="outline">{ds.dataset_type.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell className="font-mono text-xs uppercase">{ds.format}</TableCell>
                  <TableCell>{ds.file_size_bytes ? `${(ds.file_size_bytes / 1e6).toFixed(1)} MB` : "—"}</TableCell>
                  <TableCell>{ds.row_count ? formatCompact(ds.row_count) : "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{(ds.experiments as { experiment_code: string } | null)?.experiment_code ?? "—"}</TableCell>
                  <TableCell className="capitalize">{ds.access_level}</TableCell>
                  <TableCell><Badge variant={ds.processing_status === "ready" ? "default" : "secondary"}>{ds.processing_status}</Badge></TableCell>
                </TableRow>
              ))}
              {(!datasets || datasets.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No datasets uploaded yet.
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

import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

export default async function PapersPage() {
  const supabase = createServerSupabaseClient();
  const { data: papers } = await supabase
    .from("papers")
    .select("*")
    .order("publication_date", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Publications & Knowledge Graph</h1>
          <p className="text-muted-foreground">Research papers linked to experiments, datasets, and biomarkers</p>
        </div>
        <Link href="/papers/new">
          <Button><Plus className="mr-2 h-4 w-4" />Add Paper</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />Publications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead>DOI</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Keywords</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {papers?.map((paper) => (
                <TableRow key={paper.id}>
                  <TableCell className="font-medium max-w-[250px] truncate">{paper.title}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? " et al." : ""}</TableCell>
                  <TableCell>{paper.journal ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{paper.doi ?? "—"}</TableCell>
                  <TableCell>{paper.publication_date ? formatDate(paper.publication_date) : "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {paper.keywords.slice(0, 3).map((kw) => (
                        <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!papers || papers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No papers added yet.
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

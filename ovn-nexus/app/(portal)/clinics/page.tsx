// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils/format";

export default async function ClinicsPage() {
  const supabase = createServerSupabaseClient();
  const { data: clinics } = await supabase
    .from("clinics")
    .select("*, institutions(name)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clinics</h1>
          <p className="text-muted-foreground">Manage research clinics and data collection sites</p>
        </div>
        <Link href="/clinics/new">
          <Button><Plus className="mr-2 h-4 w-4" />Add Clinic</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Registered Clinics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Samples</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics?.map((clinic) => (
                <TableRow key={clinic.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">
                    <Link href={`/clinics/${clinic.id}`} className="text-primary hover:underline">{clinic.clinic_code}</Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/clinics/${clinic.id}`} className="hover:underline">{clinic.name}</Link>
                  </TableCell>
                  <TableCell>{(clinic.institutions as { name: string } | null)?.name ?? "—"}</TableCell>
                  <TableCell>{clinic.country}</TableCell>
                  <TableCell>{formatNumber(clinic.total_patients)}</TableCell>
                  <TableCell>{formatNumber(clinic.total_samples)}</TableCell>
                  <TableCell>
                    <Badge variant={clinic.is_active ? "default" : "secondary"}>
                      {clinic.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!clinics || clinics.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No clinics registered yet. Add your first clinic to get started.
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

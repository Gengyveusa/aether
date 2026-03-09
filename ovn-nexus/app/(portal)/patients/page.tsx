// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

export default async function PatientsPage() {
  const supabase = createServerSupabaseClient();
  const { data: patients } = await supabase
    .from("patients")
    .select("*, clinics(name, clinic_code)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">De-identified patient records for research</p>
        </div>
        <Link href="/patients/new">
          <Button><Plus className="mr-2 h-4 w-4" />Add Patient</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />Patient Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead>Smoking</TableHead>
                <TableHead>Diabetes</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients?.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-mono text-sm">
                    <Link href={`/patients/${patient.id}`} className="text-primary hover:underline">
                      {patient.patient_code}
                    </Link>
                  </TableCell>
                  <TableCell>{(patient.clinics as { name: string } | null)?.name ?? "—"}</TableCell>
                  <TableCell>{patient.age ?? "—"}</TableCell>
                  <TableCell className="capitalize">{patient.sex?.replace(/_/g, " ") ?? "—"}</TableCell>
                  <TableCell className="capitalize">{patient.smoking_status ?? "—"}</TableCell>
                  <TableCell className="capitalize">{patient.diabetes_status?.replace(/_/g, " ") ?? "—"}</TableCell>
                  <TableCell>{formatDate(patient.enrollment_date)}</TableCell>
                  <TableCell>
                    <Badge variant={patient.is_active ? "default" : "secondary"}>
                      {patient.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {(!patients || patients.length === 0) && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No patients registered yet.
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

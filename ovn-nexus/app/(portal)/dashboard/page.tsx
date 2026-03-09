import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { StatsCard } from "@/components/charts/stats-card";
import { BiomarkerChart } from "@/components/charts/biomarker-chart";
import { PeriodontalChart } from "@/components/charts/periodontal-chart";
import { RiskRadar } from "@/components/charts/risk-radar";
import {
  Building2, Users, TestTubes, FlaskConical,
  Database, FileText, Pill, Activity,
} from "lucide-react";

// Demo data for initial render
const demoBiomarkerTrends = [
  { date: "Jan", omv_concentration: 1.2e9, il6: 8.5, hscrp: 2.1 },
  { date: "Feb", omv_concentration: 1.5e9, il6: 9.2, hscrp: 2.4 },
  { date: "Mar", omv_concentration: 1.1e9, il6: 7.8, hscrp: 1.9 },
  { date: "Apr", omv_concentration: 1.8e9, il6: 11.1, hscrp: 3.2 },
  { date: "May", omv_concentration: 1.3e9, il6: 8.9, hscrp: 2.3 },
  { date: "Jun", omv_concentration: 0.9e9, il6: 6.5, hscrp: 1.7 },
];

const demoPeriodontal = [
  { stage: "healthy", count: 1250, avg_bleeding: 5.2 },
  { stage: "stage_1", count: 890, avg_bleeding: 15.8 },
  { stage: "stage_2", count: 620, avg_bleeding: 32.4 },
  { stage: "stage_3", count: 340, avg_bleeding: 48.7 },
  { stage: "stage_4", count: 150, avg_bleeding: 68.3 },
];

const demoRiskData = [
  { subject: "Cardiovascular", value: 0.45, fullMark: 1 },
  { subject: "Neurodegeneration", value: 0.32, fullMark: 1 },
  { subject: "Metabolic", value: 0.58, fullMark: 1 },
  { subject: "Oncological", value: 0.21, fullMark: 1 },
  { subject: "Autoimmune", value: 0.37, fullMark: 1 },
];

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();

  // Fetch platform stats
  const [clinics, patients, biomarkers, experiments, datasets, papers, trials, users] = await Promise.all([
    supabase.from("clinics").select("id", { count: "exact", head: true }),
    supabase.from("patients").select("id", { count: "exact", head: true }),
    supabase.from("biomarkers").select("id", { count: "exact", head: true }),
    supabase.from("experiments").select("id", { count: "exact", head: true }),
    supabase.from("datasets").select("id", { count: "exact", head: true }),
    supabase.from("papers").select("id", { count: "exact", head: true }),
    supabase.from("clinical_trials").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const stats = {
    clinics: clinics.count ?? 0,
    patients: patients.count ?? 0,
    samples: biomarkers.count ?? 0,
    experiments: experiments.count ?? 0,
    datasets: datasets.count ?? 0,
    papers: papers.count ?? 0,
    trials: trials.count ?? 0,
    users: users.count ?? 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">OVN Nexus platform overview and analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Clinics" value={stats.clinics} icon={Building2} description="Active research clinics" />
        <StatsCard title="Patients" value={stats.patients} icon={Users} description="De-identified patients" />
        <StatsCard title="Samples" value={stats.samples} icon={Activity} description="Biomarker samples collected" />
        <StatsCard title="Experiments" value={stats.experiments} icon={FlaskConical} description="Active experiments" />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Datasets" value={stats.datasets} icon={Database} description="Uploaded datasets" />
        <StatsCard title="Papers" value={stats.papers} icon={FileText} description="Linked publications" />
        <StatsCard title="Trials" value={stats.trials} icon={Pill} description="Clinical trials" />
        <StatsCard title="Users" value={stats.users} icon={TestTubes} description="Platform users" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BiomarkerChart data={demoBiomarkerTrends} title="Biomarker Trends (Platform Average)" />
        <PeriodontalChart data={demoPeriodontal} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RiskRadar data={demoRiskData} title="Avg. Disease Risk Profile (Cohort)" />
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {[
              "New clinic registered: Tokyo Periodontal Research Center",
              "Dataset uploaded: 16S rRNA microbiome (n=450)",
              "Experiment completed: OMV dose-response in endothelial cells",
              "Paper linked: Gingipain-tau interaction in neuronal models",
              "Trial enrollment update: OVN-CARDIO-001 (85/200 enrolled)",
            ].map((activity, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

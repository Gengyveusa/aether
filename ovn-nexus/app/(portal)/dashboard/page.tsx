// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { StatsCard } from "@/components/charts/stats-card";
import { BiomarkerChart } from "@/components/charts/biomarker-chart";
import { PeriodontalChart } from "@/components/charts/periodontal-chart";
import { RiskRadar } from "@/components/charts/risk-radar";
import { formatDate } from "@/lib/utils/format";
import {
  Building2, Users, TestTubes, FlaskConical,
  Database, FileText, Pill, Activity,
} from "lucide-react";

// Fallback demo data when tables are empty
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

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function aggregateBiomarkersByMonth(
  rows: { sample_date: string; omv_concentration: number | null; il6: number | null; hscrp: number | null }[]
) {
  const buckets: Record<string, { omv_sum: number; il6_sum: number; hscrp_sum: number; count: number }> = {};

  for (const row of rows) {
    const d = new Date(row.sample_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!buckets[key]) {
      buckets[key] = { omv_sum: 0, il6_sum: 0, hscrp_sum: 0, count: 0 };
    }
    const b = buckets[key];
    b.omv_sum += row.omv_concentration ?? 0;
    b.il6_sum += row.il6 ?? 0;
    b.hscrp_sum += row.hscrp ?? 0;
    b.count += 1;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, b]) => {
      const month = parseInt(key.split("-")[1], 10) - 1;
      return {
        date: MONTH_NAMES[month],
        omv_concentration: Math.round(b.omv_sum / b.count),
        il6: parseFloat((b.il6_sum / b.count).toFixed(2)),
        hscrp: parseFloat((b.hscrp_sum / b.count).toFixed(2)),
      };
    });
}

function aggregatePeriodontal(
  rows: { periodontal_stage: string; bleeding_index: number | null }[]
) {
  const buckets: Record<string, { count: number; bleedingSum: number; bleedingCount: number }> = {};

  for (const row of rows) {
    const stage = row.periodontal_stage;
    if (!buckets[stage]) {
      buckets[stage] = { count: 0, bleedingSum: 0, bleedingCount: 0 };
    }
    buckets[stage].count += 1;
    if (row.bleeding_index != null) {
      buckets[stage].bleedingSum += row.bleeding_index;
      buckets[stage].bleedingCount += 1;
    }
  }

  const stageOrder = ["healthy", "stage_1", "stage_2", "stage_3", "stage_4"];
  return stageOrder
    .filter((s) => buckets[s])
    .map((stage) => ({
      stage,
      count: buckets[stage].count,
      avg_bleeding: buckets[stage].bleedingCount > 0
        ? parseFloat((buckets[stage].bleedingSum / buckets[stage].bleedingCount).toFixed(1))
        : 0,
    }));
}

function formatActivityAction(action: string, resourceType: string, resourceId: string, details: any): string {
  const typeLabels: Record<string, string> = {
    patient: "Patient",
    experiment: "Experiment",
    dataset: "Dataset",
    paper: "Paper",
    clinical_trial: "Clinical Trial",
    clinic: "Clinic",
    biomarker: "Biomarker",
    visit: "Visit",
  };
  const label = typeLabels[resourceType] || resourceType;
  const name = details?.name || details?.title || details?.patient_code || resourceId;

  switch (action) {
    case "create":
      return `New ${label} created: ${name}`;
    case "update":
      return `${label} updated: ${name}`;
    case "delete":
      return `${label} deleted: ${name}`;
    case "upload":
      return `${label} uploaded: ${name}`;
    default:
      return `${action} on ${label}: ${name}`;
  }
}

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

  // Fetch real biomarker trends
  const { data: recentBiomarkers } = await supabase
    .from("biomarkers")
    .select("sample_date, omv_concentration, il6, hscrp")
    .order("sample_date", { ascending: true })
    .limit(200);

  const biomarkerTrends =
    recentBiomarkers && recentBiomarkers.length > 0
      ? aggregateBiomarkersByMonth(recentBiomarkers)
      : demoBiomarkerTrends;

  const biomarkerChartTitle =
    recentBiomarkers && recentBiomarkers.length > 0
      ? "Biomarker Trends (Platform Average)"
      : "Biomarker Trends (Demo Data)";

  // Fetch real periodontal distribution
  const { data: periodontalRaw } = await supabase
    .from("visits")
    .select("periodontal_stage, bleeding_index")
    .not("periodontal_stage", "is", null);

  const periodontalData =
    periodontalRaw && periodontalRaw.length > 0
      ? aggregatePeriodontal(periodontalRaw)
      : demoPeriodontal;

  // Risk data - keep as cohort demo (label clearly)
  const riskData = demoRiskData;
  const riskTitle = "Avg. Disease Risk Profile (Cohort Demo)";

  // Fetch recent activity from audit_logs
  const { data: recentActivity } = await supabase
    .from("audit_logs")
    .select("action, resource_type, resource_id, created_at, details")
    .order("created_at", { ascending: false })
    .limit(10);

  // If no audit logs, build activity from recently created records
  let activityItems: { text: string; time: string }[] = [];

  if (recentActivity && recentActivity.length > 0) {
    activityItems = recentActivity.map((log) => ({
      text: formatActivityAction(log.action, log.resource_type, log.resource_id, log.details),
      time: formatDate(log.created_at),
    }));
  } else {
    // Fallback: query recently created patients, experiments, datasets
    const [recentPatients, recentExperiments, recentDatasets] = await Promise.all([
      supabase
        .from("patients")
        .select("id, patient_code, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("experiments")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("datasets")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const fallbackItems: { text: string; time: string; sortDate: string }[] = [];

    for (const p of recentPatients.data || []) {
      fallbackItems.push({
        text: `Patient enrolled: ${p.patient_code}`,
        time: formatDate(p.created_at),
        sortDate: p.created_at,
      });
    }
    for (const e of recentExperiments.data || []) {
      fallbackItems.push({
        text: `Experiment created: ${e.title}`,
        time: formatDate(e.created_at),
        sortDate: e.created_at,
      });
    }
    for (const d of recentDatasets.data || []) {
      fallbackItems.push({
        text: `Dataset uploaded: ${d.name}`,
        time: formatDate(d.created_at),
        sortDate: d.created_at,
      });
    }

    activityItems = fallbackItems
      .sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
      .slice(0, 10)
      .map(({ text, time }) => ({ text, time }));
  }

  // Final fallback if everything is empty
  if (activityItems.length === 0) {
    activityItems = [
      { text: "New clinic registered: Tokyo Periodontal Research Center", time: "" },
      { text: "Dataset uploaded: 16S rRNA microbiome (n=450)", time: "" },
      { text: "Experiment completed: OMV dose-response in endothelial cells", time: "" },
      { text: "Paper linked: Gingipain-tau interaction in neuronal models", time: "" },
      { text: "Trial enrollment update: OVN-CARDIO-001 (85/200 enrolled)", time: "" },
    ];
  }

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
        <BiomarkerChart data={biomarkerTrends} title={biomarkerChartTitle} />
        <PeriodontalChart data={periodontalData} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RiskRadar data={riskData} title={riskTitle} />
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {activityItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div className="flex-1 min-w-0">
                  <span className="text-muted-foreground">{item.text}</span>
                  {item.time && (
                    <span className="ml-2 text-xs text-muted-foreground/60">{item.time}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

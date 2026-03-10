// @ts-nocheck
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { ResearchGate } from "@/components/research-gate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, FlaskConical, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";

export default async function HubPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, research_access")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";
  const hasAccess = profile?.research_access === true;

  const educationModules = [
    {
      icon: CheckCircle,
      iconClass: "text-green-600",
      badge: "Established",
      badgeVariant: "outline" as const,
      title: "Periodontitis & Systemic Inflammation",
      desc: "The evidence base linking periodontal disease to cardiometabolic risk. Meta-analyses, intervention studies, and clinical implications.",
    },
    {
      icon: AlertTriangle,
      iconClass: "text-amber-600",
      badge: "Supported",
      badgeVariant: "outline" as const,
      title: "Outer Membrane Vesicles (OMVs)",
      desc: "How bacterial OMVs carry and deliver virulence cargo, cross biological barriers, and activate host immune responses.",
    },
    {
      icon: FlaskConical,
      iconClass: "text-blue-600",
      badge: "Hypothesis",
      badgeVariant: "outline" as const,
      title: "The OVN Axis — Working Model",
      desc: "The hypothesis that a conserved OMV-driven cellular program underlies multiple systemic disease endpoints.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-2">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {firstName}</h1>
        <p className="mt-2 text-muted-foreground">
          Your OVN Nexus member hub — education, community, and research access in one place.
        </p>
      </div>

      {/* Research Access Gate */}
      <ResearchGate hasAccess={hasAccess} />

      {/* Education Modules */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Education Modules</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {educationModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${module.iconClass}`} />
                    <Badge variant={module.badgeVariant} className="text-xs">
                      {module.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-snug mt-2">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">{module.desc}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <a
            href="https://omvs.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Full OVN Axis presentation at omvs.io <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </section>

      {/* Community Placeholder */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Community</h2>
          <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <p className="font-medium">Community features are in development</p>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              Case discussions, colleague connections, and live activity feeds will be
              available here. Check back soon.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

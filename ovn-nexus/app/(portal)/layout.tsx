// @ts-nocheck
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/portal/sidebar";
import { Header } from "@/components/portal/header";
import { createServerSupabaseClient } from "@/lib/db/supabase-server";
import { headers } from "next/headers";

// Routes that require research_access (or admin role)
const RESEARCH_ROUTES = [
  "/dashboard",
  "/clinics",
  "/patients",
  "/biomarkers",
  "/experiments",
  "/datasets",
  "/papers",
  "/trials",
];

// Admin-only routes
const ADMIN_ROUTES = ["/admin"];

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  const hasResearchAccess = profile?.research_access === true;
  const isAdmin = profile?.role === "admin";

  // Determine the current pathname from the x-pathname header set by middleware
  const headersList = headers();
  const pathname = headersList.get("x-pathname") ?? "";

  // Protect admin routes
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (isAdminRoute && !isAdmin) {
    redirect("/hub");
  }

  // Protect research routes
  const isResearchRoute = RESEARCH_ROUTES.some((r) => pathname.startsWith(r));
  if (isResearchRoute && !hasResearchAccess && !isAdmin) {
    redirect("/hub");
  }

  return (
    <div className="flex h-screen">
      <Sidebar hasResearchAccess={hasResearchAccess || isAdmin} isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={profile} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

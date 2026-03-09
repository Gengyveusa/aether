"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, Building2, Users, TestTubes, FlaskConical,
  Database, FileText, Pill, Brain, Activity,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clinics", href: "/clinics", icon: Building2 },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Biomarkers", href: "/biomarkers", icon: Activity },
  { name: "Experiments", href: "/experiments", icon: FlaskConical },
  { name: "Datasets", href: "/datasets", icon: Database },
  { name: "Papers", href: "/papers", icon: FileText },
  { name: "Trials", href: "/trials", icon: Pill },
  { name: "ML Models", href: "/dashboard/ml", icon: Brain },
  { name: "Lab", href: "/dashboard/lab", icon: TestTubes },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            OVN
          </div>
          <span className="text-lg font-semibold">Nexus</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          Oral-Vascular-Neural Axis
        </p>
        <p className="text-xs text-muted-foreground">Research Network</p>
      </div>
    </div>
  );
}

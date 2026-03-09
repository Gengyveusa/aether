"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { formatPeriodontalStage } from "@/lib/utils/format";

interface PeriodontalData {
  stage: string;
  count: number;
  avg_bleeding: number;
}

const STAGE_COLORS: Record<string, string> = {
  healthy: "#22c55e",
  stage_1: "#84cc16",
  stage_2: "#f59e0b",
  stage_3: "#f97316",
  stage_4: "#ef4444",
};

export function PeriodontalChart({ data }: { data: PeriodontalData[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatPeriodontalStage(d.stage),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Periodontal Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formatted} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="label" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Bar dataKey="count" name="Patients" radius={[4, 4, 0, 0]}>
              {formatted.map((entry) => (
                <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || "#888"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

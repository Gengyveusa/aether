"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

interface BiomarkerDataPoint {
  date: string;
  omv_concentration?: number;
  gingipain_activity?: number;
  il6?: number;
  tnf_alpha?: number;
  hscrp?: number;
}

interface BiomarkerChartProps {
  data: BiomarkerDataPoint[];
  title?: string;
  markers?: string[];
}

const MARKER_COLORS: Record<string, string> = {
  omv_concentration: "#8b5cf6",
  gingipain_activity: "#ef4444",
  il6: "#f59e0b",
  tnf_alpha: "#10b981",
  hscrp: "#3b82f6",
};

const MARKER_LABELS: Record<string, string> = {
  omv_concentration: "OMV Conc.",
  gingipain_activity: "Gingipain",
  il6: "IL-6",
  tnf_alpha: "TNF-α",
  hscrp: "hsCRP",
};

export function BiomarkerChart({
  data,
  title = "Biomarker Trends",
  markers = ["omv_concentration", "il6", "hscrp"],
}: BiomarkerChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Legend />
            {markers.map((marker) => (
              <Line
                key={marker}
                type="monotone"
                dataKey={marker}
                name={MARKER_LABELS[marker] || marker}
                stroke={MARKER_COLORS[marker] || "#888"}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

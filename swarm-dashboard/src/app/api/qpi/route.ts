import { NextResponse } from "next/server";
import { generateQPITimeSeries, BIOMARKERS } from "@/lib/swarm-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "48", 10);

  return NextResponse.json({
    timeSeries: generateQPITimeSeries(hours),
    biomarkers: BIOMARKERS,
    weights: {
      alpha: 0.30,
      beta: 0.25,
      gamma: 0.30,
      delta: 0.15,
    },
    timestamp: new Date().toISOString(),
  });
}

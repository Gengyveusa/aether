export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatPeriodontalStage(stage: string): string {
  const labels: Record<string, string> = {
    healthy: "Healthy",
    stage_1: "Stage I",
    stage_2: "Stage II",
    stage_3: "Stage III",
    stage_4: "Stage IV",
  };
  return labels[stage] || stage;
}

export function formatBiomarkerValue(value: number | null, unit: string): string {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(2)} ${unit}`;
}

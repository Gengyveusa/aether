import type { Biomarker, Patient, Visit } from "@/lib/db/types";

export interface PredictionInput {
  patient: Pick<Patient, "age" | "sex" | "smoking_status" | "diabetes_status">;
  visit: Pick<Visit, "periodontal_stage" | "bleeding_index" | "tooth_loss">;
  biomarkers: Pick<Biomarker, "omv_concentration" | "gingipain_activity" | "il6" | "tnf_alpha" | "hscrp" | "nitric_oxide">;
}

export interface RiskScore {
  cardiovascular_risk: number;
  neurodegeneration_risk: number;
  metabolic_risk: number;
  overall_risk: number;
  confidence: number;
  contributing_factors: string[];
}

export interface OmvSignature {
  pathogenicity_score: number;
  dominant_species: string[];
  virulence_factors: string[];
  inflammatory_potential: "low" | "moderate" | "high" | "critical";
}

// Feature engineering for ML pipeline
export function extractFeatures(input: PredictionInput): Record<string, number> {
  const features: Record<string, number> = {};

  // Demographics
  features.age = input.patient.age ?? 0;
  features.sex_male = input.patient.sex === "male" ? 1 : 0;
  features.smoker_current = input.patient.smoking_status === "current" ? 1 : 0;
  features.smoker_former = input.patient.smoking_status === "former" ? 1 : 0;
  features.diabetes_t1 = input.patient.diabetes_status === "type_1" ? 1 : 0;
  features.diabetes_t2 = input.patient.diabetes_status === "type_2" ? 1 : 0;

  // Periodontal
  const stageMap: Record<string, number> = { healthy: 0, stage_1: 1, stage_2: 2, stage_3: 3, stage_4: 4 };
  features.periodontal_severity = stageMap[input.visit.periodontal_stage ?? "healthy"] ?? 0;
  features.bleeding_index = input.visit.bleeding_index ?? 0;
  features.tooth_loss = input.visit.tooth_loss ?? 0;

  // Biomarkers
  features.omv_concentration = input.biomarkers.omv_concentration ?? 0;
  features.gingipain_activity = input.biomarkers.gingipain_activity ?? 0;
  features.il6 = input.biomarkers.il6 ?? 0;
  features.tnf_alpha = input.biomarkers.tnf_alpha ?? 0;
  features.hscrp = input.biomarkers.hscrp ?? 0;
  features.nitric_oxide = input.biomarkers.nitric_oxide ?? 0;

  // Derived
  features.inflammatory_burden = (features.il6 + features.tnf_alpha + features.hscrp) / 3;
  features.omv_gingipain_ratio = features.gingipain_activity > 0
    ? features.omv_concentration / features.gingipain_activity
    : 0;

  return features;
}

// Heuristic risk scoring (placeholder for trained ML model endpoint)
export function computeRiskScore(input: PredictionInput): RiskScore {
  const features = extractFeatures(input);
  const factors: string[] = [];

  let cvRisk = 0.1;
  let neuroRisk = 0.1;
  let metaRisk = 0.1;

  if (features.omv_concentration > 1e9) { cvRisk += 0.2; neuroRisk += 0.15; factors.push("Elevated OMV load"); }
  if (features.gingipain_activity > 50) { neuroRisk += 0.25; factors.push("High gingipain activity"); }
  if (features.periodontal_severity >= 3) { cvRisk += 0.15; factors.push("Severe periodontitis"); }
  if (features.hscrp > 3) { cvRisk += 0.2; metaRisk += 0.1; factors.push("Elevated hsCRP"); }
  if (features.il6 > 10) { cvRisk += 0.1; neuroRisk += 0.1; factors.push("Elevated IL-6"); }
  if (features.smoker_current) { cvRisk += 0.15; factors.push("Current smoker"); }
  if (features.diabetes_t2) { metaRisk += 0.25; cvRisk += 0.1; factors.push("Type 2 diabetes"); }
  if (features.age > 65) { cvRisk += 0.1; neuroRisk += 0.15; factors.push("Age > 65"); }

  const clamp = (v: number) => Math.min(1, Math.max(0, v));
  const overall = (cvRisk + neuroRisk + metaRisk) / 3;

  return {
    cardiovascular_risk: clamp(cvRisk),
    neurodegeneration_risk: clamp(neuroRisk),
    metabolic_risk: clamp(metaRisk),
    overall_risk: clamp(overall),
    confidence: 0.65,
    contributing_factors: factors,
  };
}

// Trial matching based on biomarker criteria
export function matchPatientToTrialCriteria(
  biomarkers: Biomarker,
  criteria: Record<string, { min?: number; max?: number }>
): { matches: boolean; score: number; matchedCriteria: string[] } {
  const matched: string[] = [];
  let totalCriteria = 0;
  let matchedCount = 0;

  for (const [key, range] of Object.entries(criteria)) {
    totalCriteria++;
    const value = (biomarkers as unknown as Record<string, number>)[key];
    if (value === null || value === undefined) continue;
    const aboveMin = range.min === undefined || value >= range.min;
    const belowMax = range.max === undefined || value <= range.max;
    if (aboveMin && belowMax) {
      matchedCount++;
      matched.push(key);
    }
  }

  const score = totalCriteria > 0 ? matchedCount / totalCriteria : 0;
  return { matches: score >= 0.8, score, matchedCriteria: matched };
}

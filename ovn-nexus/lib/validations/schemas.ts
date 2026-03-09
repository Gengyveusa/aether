import { z } from "zod";

export const patientSchema = z.object({
  clinic_id: z.string().uuid(),
  patient_code: z.string().min(1).max(50),
  age: z.number().int().min(0).max(150).optional(),
  sex: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  smoking_status: z.enum(["never", "former", "current"]).optional(),
  diabetes_status: z.enum(["none", "type_1", "type_2", "prediabetes"]).optional(),
  medical_history: z.record(z.unknown()).optional(),
});

export const visitSchema = z.object({
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  visit_type: z.enum(["baseline", "follow_up", "post_treatment"]),
  visit_date: z.string(),
  visit_number: z.number().int().min(1).optional(),
  periodontal_stage: z.enum(["healthy", "stage_1", "stage_2", "stage_3", "stage_4"]).optional(),
  probing_depths: z.record(z.array(z.number())).optional(),
  bleeding_index: z.number().min(0).max(100).optional(),
  plaque_index: z.number().min(0).max(100).optional(),
  tooth_loss: z.number().int().min(0).max(32).optional(),
  clinical_notes: z.string().optional(),
});

export const biomarkerSchema = z.object({
  visit_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  sample_type: z.enum(["saliva", "blood", "gingival_fluid", "plaque", "tissue"]).default("saliva"),
  sample_date: z.string(),
  omv_concentration: z.number().optional(),
  gingipain_activity: z.number().optional(),
  il6: z.number().optional(),
  tnf_alpha: z.number().optional(),
  hscrp: z.number().optional(),
  nitric_oxide: z.number().optional(),
  additional_markers: z.record(z.unknown()).optional(),
  microbiome_sample_id: z.string().optional(),
  sequencing_method: z.string().optional(),
  collection_method: z.string().optional(),
  storage_conditions: z.string().optional(),
  quality_score: z.number().min(0).max(100).optional(),
});

export const experimentSchema = z.object({
  project_id: z.string().uuid().optional(),
  experiment_code: z.string().min(1),
  title: z.string().min(1),
  hypothesis: z.string().optional(),
  model_system: z.string().optional(),
  protocol: z.string().optional(),
  status: z.enum(["planned", "active", "completed", "archived"]).default("planned"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const datasetSchema = z.object({
  experiment_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  dataset_type: z.enum([
    "microbiome_16s", "microbiome_shotgun", "rna_seq", "proteomics",
    "metabolomics", "ev_cargo", "clinical", "imaging", "other",
  ]),
  format: z.enum(["fastq", "bam", "vcf", "csv", "tsv", "json", "h5ad", "parquet", "other"]),
  access_level: z.enum(["public", "consortium", "project", "private"]).default("project"),
  tags: z.array(z.string()).optional(),
});

export const paperSchema = z.object({
  title: z.string().min(1),
  authors: z.array(z.string()).min(1),
  journal: z.string().optional(),
  doi: z.string().optional(),
  pubmed_id: z.string().optional(),
  abstract: z.string().optional(),
  publication_date: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const trialSchema = z.object({
  trial_code: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  phase: z.enum(["preclinical", "phase_1", "phase_2", "phase_3", "phase_4"]),
  status: z.enum(["recruiting", "active", "completed", "suspended", "terminated"]).default("recruiting"),
  sponsor: z.string().optional(),
  institution_id: z.string().uuid().optional(),
  target_enrollment: z.number().int().optional(),
  inclusion_criteria: z.record(z.unknown()).optional(),
  exclusion_criteria: z.record(z.unknown()).optional(),
  biomarker_criteria: z.record(z.unknown()).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  nct_number: z.string().optional(),
});

export const clinicSchema = z.object({
  institution_id: z.string().uuid(),
  name: z.string().min(1),
  clinic_code: z.string().min(1),
  address: z.string().optional(),
  country: z.string().min(1),
  city: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
});

export const knowledgeGraphEdgeSchema = z.object({
  source_type: z.enum(["paper", "experiment", "dataset", "biomarker", "disease", "pathway"]),
  source_id: z.string().uuid(),
  target_type: z.enum(["paper", "experiment", "dataset", "biomarker", "disease", "pathway"]),
  target_id: z.string().uuid(),
  relationship: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.unknown()).optional(),
});

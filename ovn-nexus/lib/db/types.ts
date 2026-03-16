export type UserRole = "admin" | "pi" | "clinic" | "researcher" | "analyst" | "observer";
export type PeriodontalStage = "healthy" | "stage_1" | "stage_2" | "stage_3" | "stage_4";
export type SexType = "male" | "female" | "other" | "prefer_not_to_say";
export type SmokingStatus = "never" | "former" | "current";
export type DiabetesStatus = "none" | "type_1" | "type_2" | "prediabetes";
export type VisitType = "baseline" | "follow_up" | "post_treatment";
export type ExperimentStatus = "planned" | "active" | "completed" | "archived";
export type DatasetFormat = "fastq" | "bam" | "vcf" | "csv" | "tsv" | "json" | "h5ad" | "parquet" | "other";
export type DatasetType = "microbiome_16s" | "microbiome_shotgun" | "rna_seq" | "proteomics" | "metabolomics" | "ev_cargo" | "clinical" | "imaging" | "other";
export type TrialPhase = "preclinical" | "phase_1" | "phase_2" | "phase_3" | "phase_4";
export type TrialStatus = "recruiting" | "active" | "completed" | "suspended" | "terminated";

export interface Institution {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  institution_id: string | null;
  title: string | null;
  specialty: string | null;
  orcid: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Clinic {
  id: string;
  institution_id: string;
  name: string;
  clinic_code: string;
  address: string | null;
  country: string;
  city: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  total_patients: number;
  total_samples: number;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  patient_code: string;
  age: number | null;
  sex: SexType | null;
  smoking_status: SmokingStatus | null;
  diabetes_status: DiabetesStatus | null;
  medical_history: Record<string, unknown>;
  enrollment_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  clinic_id: string;
  visit_type: VisitType;
  visit_date: string;
  visit_number: number;
  periodontal_stage: PeriodontalStage | null;
  probing_depths: Record<string, number[]> | null;
  bleeding_index: number | null;
  plaque_index: number | null;
  tooth_loss: number | null;
  clinical_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Biomarker {
  id: string;
  visit_id: string;
  patient_id: string;
  sample_type: string;
  sample_date: string;
  omv_concentration: number | null;
  omv_concentration_unit: string;
  gingipain_activity: number | null;
  gingipain_activity_unit: string;
  il6: number | null;
  il6_unit: string;
  tnf_alpha: number | null;
  tnf_alpha_unit: string;
  hscrp: number | null;
  hscrp_unit: string;
  nitric_oxide: number | null;
  nitric_oxide_unit: string;
  additional_markers: Record<string, unknown>;
  microbiome_sample_id: string | null;
  sequencing_method: string | null;
  collection_method: string | null;
  storage_conditions: string | null;
  quality_score: number | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  pi_id: string;
  institution_id: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  funding_source: string | null;
  irb_number: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Experiment {
  id: string;
  project_id: string | null;
  experiment_code: string;
  title: string;
  hypothesis: string | null;
  model_system: string | null;
  protocol: string | null;
  status: ExperimentStatus;
  start_date: string | null;
  end_date: string | null;
  pi_id: string;
  analysis_outputs: Record<string, unknown>;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Dataset {
  id: string;
  experiment_id: string | null;
  project_id: string | null;
  name: string;
  description: string | null;
  dataset_type: DatasetType;
  format: DatasetFormat;
  file_path: string | null;
  file_size_bytes: number | null;
  row_count: number | null;
  column_count: number | null;
  schema_definition: Record<string, unknown> | null;
  processing_status: string;
  quality_metrics: Record<string, unknown>;
  access_level: string;
  uploaded_by: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  journal: string | null;
  doi: string | null;
  pubmed_id: string | null;
  abstract: string | null;
  publication_date: string | null;
  keywords: string[];
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeGraphEdge {
  id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  relationship: string;
  confidence: number | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

export interface Disease {
  id: string;
  name: string;
  icd10_code: string | null;
  category: string | null;
  description: string | null;
  created_at: string;
}

export interface ClinicalTrial {
  id: string;
  trial_code: string;
  title: string;
  description: string | null;
  phase: TrialPhase;
  status: TrialStatus;
  sponsor: string | null;
  institution_id: string | null;
  pi_id: string | null;
  target_enrollment: number | null;
  current_enrollment: number;
  inclusion_criteria: Record<string, unknown>;
  exclusion_criteria: Record<string, unknown>;
  biomarker_criteria: Record<string, unknown>;
  start_date: string | null;
  end_date: string | null;
  nct_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface MlModel {
  id: string;
  name: string;
  description: string | null;
  model_type: string;
  version: string;
  framework: string | null;
  input_features: unknown[];
  output_schema: Record<string, unknown>;
  metrics: Record<string, unknown>;
  artifact_path: string | null;
  training_dataset_id: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface PlatformStats {
  total_clinics: number;
  total_patients: number;
  total_samples: number;
  total_datasets: number;
  total_experiments: number;
  total_papers: number;
  total_trials: number;
  total_users: number;
}

// ── Music Generation Types ───────────────────────────────────

export type MusicUseCase = "podcast" | "research_video" | "brand_theme" | "social_media" | "background_music" | "presentation" | "other";
export type MusicTempo = "slow" | "medium" | "fast";
export type MusicVoiceType = "male" | "female" | "instrumental";
export type MusicLyricsMode = "auto" | "manual" | "none";
export type MusicJobStatus = "draft" | "queued" | "generating" | "generated" | "review" | "approved" | "published" | "rejected";

export interface MusicRequestRow {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  use_case: MusicUseCase;
  mood: string;
  genre: string;
  tempo: MusicTempo;
  instrumentation: string | null;
  voice_type: MusicVoiceType;
  lyrics_mode: MusicLyricsMode;
  lyrics_text: string | null;
  prompt_notes: string | null;
  duration_seconds: number | null;
  generated_prompts: unknown;
  status: MusicJobStatus;
  assigned_operator_id: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MusicVersionRow {
  id: string;
  request_id: string;
  version_number: number;
  audio_url: string;
  audio_format: string;
  audio_size_bytes: number | null;
  duration_seconds: number | null;
  stems_url: string | null;
  cover_image_url: string | null;
  waveform_data: unknown;
  prompt_used: string | null;
  suno_generation_id: string | null;
  is_selected: boolean;
  rating: number | null;
  review_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface MusicCommentRow {
  id: string;
  request_id: string;
  version_id: string | null;
  user_id: string;
  content: string;
  timestamp_seconds: number | null;
  created_at: string;
}

export interface MusicPublishedRow {
  id: string;
  request_id: string;
  version_id: string;
  title: string;
  description: string | null;
  license_type: string;
  attached_to_type: string | null;
  attached_to_id: string | null;
  cover_image_url: string | null;
  genre: string | null;
  mood: string | null;
  tags: string[];
  play_count: number;
  download_count: number;
  published_by: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

// Supabase Database type mapping
export interface Database {
  public: {
    Tables: {
      institutions: { Row: Institution; Insert: Omit<Institution, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Institution, "id">> };
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at" | "updated_at">; Update: Partial<Omit<Profile, "id">> };
      clinics: { Row: Clinic; Insert: Omit<Clinic, "id" | "created_at" | "updated_at" | "total_patients" | "total_samples">; Update: Partial<Omit<Clinic, "id">> };
      patients: { Row: Patient; Insert: Omit<Patient, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Patient, "id">> };
      visits: { Row: Visit; Insert: Omit<Visit, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Visit, "id">> };
      biomarkers: { Row: Biomarker; Insert: Omit<Biomarker, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Biomarker, "id">> };
      projects: { Row: Project; Insert: Omit<Project, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Project, "id">> };
      experiments: { Row: Experiment; Insert: Omit<Experiment, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Experiment, "id">> };
      datasets: { Row: Dataset; Insert: Omit<Dataset, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Dataset, "id">> };
      papers: { Row: Paper; Insert: Omit<Paper, "id" | "created_at" | "updated_at">; Update: Partial<Omit<Paper, "id">> };
      knowledge_graph_edges: { Row: KnowledgeGraphEdge; Insert: Omit<KnowledgeGraphEdge, "id" | "created_at">; Update: Partial<Omit<KnowledgeGraphEdge, "id">> };
      diseases: { Row: Disease; Insert: Omit<Disease, "id" | "created_at">; Update: Partial<Omit<Disease, "id">> };
      clinical_trials: { Row: ClinicalTrial; Insert: Omit<ClinicalTrial, "id" | "created_at" | "updated_at">; Update: Partial<Omit<ClinicalTrial, "id">> };
      ml_models: { Row: MlModel; Insert: Omit<MlModel, "id" | "created_at" | "updated_at">; Update: Partial<Omit<MlModel, "id">> };
      audit_logs: { Row: AuditLog; Insert: Omit<AuditLog, "id" | "created_at">; Update: never };
      music_requests: { Row: MusicRequestRow; Insert: Omit<MusicRequestRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<MusicRequestRow, "id">> };
      music_versions: { Row: MusicVersionRow; Insert: Omit<MusicVersionRow, "id" | "created_at" | "updated_at">; Update: Partial<Omit<MusicVersionRow, "id">> };
      music_comments: { Row: MusicCommentRow; Insert: Omit<MusicCommentRow, "id" | "created_at">; Update: never };
      music_published: { Row: MusicPublishedRow; Insert: Omit<MusicPublishedRow, "id" | "created_at" | "updated_at" | "play_count" | "download_count">; Update: Partial<Omit<MusicPublishedRow, "id">> };
    };
    Views: {
      platform_stats: { Row: PlatformStats };
      biomarker_summary: { Row: Record<string, unknown> };
      periodontal_distribution: { Row: Record<string, unknown> };
    };
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: UserRole };
      get_user_institution: { Args: { user_id: string }; Returns: string };
      log_audit: { Args: { p_action: string; p_resource_type: string; p_resource_id: string; p_details?: Record<string, unknown> }; Returns: void };
    };
  };
}

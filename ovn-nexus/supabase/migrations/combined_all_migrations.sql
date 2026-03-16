-- OVN Nexus: Oral-Vascular-Neural Research Platform
-- Initial Schema Migration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'admin', 'pi', 'clinic', 'researcher', 'analyst', 'observer'
);

CREATE TYPE periodontal_stage AS ENUM (
  'healthy', 'stage_1', 'stage_2', 'stage_3', 'stage_4'
);

CREATE TYPE sex_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

CREATE TYPE smoking_status AS ENUM ('never', 'former', 'current');

CREATE TYPE diabetes_status AS ENUM ('none', 'type_1', 'type_2', 'prediabetes');

CREATE TYPE visit_type AS ENUM ('baseline', 'follow_up', 'post_treatment');

CREATE TYPE experiment_status AS ENUM ('planned', 'active', 'completed', 'archived');

CREATE TYPE dataset_format AS ENUM (
  'fastq', 'bam', 'vcf', 'csv', 'tsv', 'json', 'h5ad', 'parquet', 'other'
);

CREATE TYPE dataset_type AS ENUM (
  'microbiome_16s', 'microbiome_shotgun', 'rna_seq', 'proteomics',
  'metabolomics', 'ev_cargo', 'clinical', 'imaging', 'other'
);

CREATE TYPE trial_phase AS ENUM (
  'preclinical', 'phase_1', 'phase_2', 'phase_3', 'phase_4'
);

CREATE TYPE trial_status AS ENUM (
  'recruiting', 'active', 'completed', 'suspended', 'terminated'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Institutions
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('university', 'hospital', 'clinic', 'biotech', 'pharma', 'cro', 'other')),
  country TEXT NOT NULL,
  city TEXT,
  website TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users / Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'observer',
  institution_id UUID REFERENCES institutions(id),
  title TEXT,
  specialty TEXT,
  orcid TEXT,
  bio TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinics
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  name TEXT NOT NULL,
  clinic_code TEXT NOT NULL UNIQUE,
  address TEXT,
  country TEXT NOT NULL,
  city TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_patients INTEGER NOT NULL DEFAULT 0,
  total_samples INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- De-identified patients
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_code TEXT NOT NULL,
  age INTEGER CHECK (age >= 0 AND age <= 150),
  sex sex_type,
  smoking_status smoking_status,
  diabetes_status diabetes_status,
  medical_history JSONB DEFAULT '{}',
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(clinic_id, patient_code)
);

-- Visits (longitudinal tracking)
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  visit_type visit_type NOT NULL,
  visit_date DATE NOT NULL,
  visit_number INTEGER NOT NULL DEFAULT 1,
  periodontal_stage periodontal_stage,
  probing_depths JSONB,
  bleeding_index NUMERIC(5,2) CHECK (bleeding_index >= 0 AND bleeding_index <= 100),
  plaque_index NUMERIC(5,2) CHECK (plaque_index >= 0 AND plaque_index <= 100),
  tooth_loss INTEGER CHECK (tooth_loss >= 0 AND tooth_loss <= 32),
  clinical_notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Biomarkers
CREATE TABLE biomarkers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  sample_type TEXT NOT NULL DEFAULT 'saliva' CHECK (sample_type IN ('saliva', 'blood', 'gingival_fluid', 'plaque', 'tissue')),
  sample_date DATE NOT NULL,
  -- OMV markers
  omv_concentration NUMERIC(12,4),
  omv_concentration_unit TEXT DEFAULT 'particles/mL',
  -- Enzyme activity
  gingipain_activity NUMERIC(12,4),
  gingipain_activity_unit TEXT DEFAULT 'U/mL',
  -- Inflammatory markers
  il6 NUMERIC(12,4),
  il6_unit TEXT DEFAULT 'pg/mL',
  tnf_alpha NUMERIC(12,4),
  tnf_alpha_unit TEXT DEFAULT 'pg/mL',
  hscrp NUMERIC(12,4),
  hscrp_unit TEXT DEFAULT 'mg/L',
  -- Metabolites
  nitric_oxide NUMERIC(12,4),
  nitric_oxide_unit TEXT DEFAULT 'µmol/L',
  -- Additional markers stored as JSONB
  additional_markers JSONB DEFAULT '{}',
  -- Microbiome
  microbiome_sample_id TEXT,
  sequencing_method TEXT,
  -- Metadata
  collection_method TEXT,
  storage_conditions TEXT,
  quality_score NUMERIC(5,2),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  pi_id UUID NOT NULL REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  funding_source TEXT,
  irb_number TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project members
CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'co_pi', 'member', 'collaborator')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (project_id, profile_id)
);

-- Experiments
CREATE TABLE experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  experiment_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  hypothesis TEXT,
  model_system TEXT,
  protocol TEXT,
  status experiment_status NOT NULL DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  pi_id UUID NOT NULL REFERENCES profiles(id),
  analysis_outputs JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Datasets (Data Lake)
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID REFERENCES experiments(id),
  project_id UUID REFERENCES projects(id),
  name TEXT NOT NULL,
  description TEXT,
  dataset_type dataset_type NOT NULL,
  format dataset_format NOT NULL,
  file_path TEXT,
  file_size_bytes BIGINT,
  row_count BIGINT,
  column_count INTEGER,
  schema_definition JSONB,
  processing_status TEXT DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'validating', 'processing', 'ready', 'error')),
  quality_metrics JSONB DEFAULT '{}',
  access_level TEXT NOT NULL DEFAULT 'project' CHECK (access_level IN ('public', 'consortium', 'project', 'private')),
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Papers / Publications
CREATE TABLE papers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  journal TEXT,
  doi TEXT UNIQUE,
  pubmed_id TEXT,
  abstract TEXT,
  publication_date DATE,
  keywords TEXT[] DEFAULT '{}',
  added_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Knowledge Graph Edges
CREATE TABLE knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('paper', 'experiment', 'dataset', 'biomarker', 'disease', 'pathway')),
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('paper', 'experiment', 'dataset', 'biomarker', 'disease', 'pathway')),
  target_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_type, source_id, target_type, target_id, relationship)
);

-- Disease ontology reference
CREATE TABLE diseases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icd10_code TEXT,
  category TEXT CHECK (category IN ('cardiovascular', 'neurological', 'metabolic', 'oncological', 'autoimmune', 'oral', 'other')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Biomarker-disease associations
CREATE TABLE biomarker_disease_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  biomarker_name TEXT NOT NULL,
  disease_id UUID NOT NULL REFERENCES diseases(id),
  association_type TEXT NOT NULL CHECK (association_type IN ('risk_factor', 'diagnostic', 'prognostic', 'therapeutic_target')),
  evidence_level TEXT CHECK (evidence_level IN ('strong', 'moderate', 'emerging', 'hypothesis')),
  odds_ratio NUMERIC(8,4),
  p_value NUMERIC(20,18),
  source_paper_id UUID REFERENCES papers(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clinical Trials
CREATE TABLE clinical_trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  phase trial_phase NOT NULL,
  status trial_status NOT NULL DEFAULT 'recruiting',
  sponsor TEXT,
  institution_id UUID REFERENCES institutions(id),
  pi_id UUID REFERENCES profiles(id),
  target_enrollment INTEGER,
  current_enrollment INTEGER DEFAULT 0,
  inclusion_criteria JSONB DEFAULT '{}',
  exclusion_criteria JSONB DEFAULT '{}',
  biomarker_criteria JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  nct_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trial patient matching
CREATE TABLE trial_patient_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES clinical_trials(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  match_score NUMERIC(5,4) CHECK (match_score >= 0 AND match_score <= 1),
  matching_criteria JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'potential' CHECK (status IN ('potential', 'screened', 'enrolled', 'excluded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(trial_id, patient_id)
);

-- ML Models registry
CREATE TABLE ml_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  model_type TEXT NOT NULL CHECK (model_type IN ('biomarker_predictor', 'risk_score', 'omv_signature', 'classifier', 'clustering', 'other')),
  version TEXT NOT NULL,
  framework TEXT,
  input_features JSONB NOT NULL DEFAULT '[]',
  output_schema JSONB NOT NULL DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  artifact_path TEXT,
  training_dataset_id UUID REFERENCES datasets(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(name, version)
);

-- ML Predictions
CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES ml_models(id),
  patient_id UUID REFERENCES patients(id),
  input_data JSONB NOT NULL,
  prediction JSONB NOT NULL,
  confidence NUMERIC(5,4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API keys for external partners
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  institution_id UUID REFERENCES institutions(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_profiles_institution ON profiles(institution_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_clinics_institution ON clinics(institution_id);
CREATE INDEX idx_clinics_country ON clinics(country);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_clinic ON visits(clinic_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_type ON visits(visit_type);
CREATE INDEX idx_biomarkers_visit ON biomarkers(visit_id);
CREATE INDEX idx_biomarkers_patient ON biomarkers(patient_id);
CREATE INDEX idx_biomarkers_sample_date ON biomarkers(sample_date);
CREATE INDEX idx_biomarkers_omv ON biomarkers(omv_concentration) WHERE omv_concentration IS NOT NULL;
CREATE INDEX idx_experiments_project ON experiments(project_id);
CREATE INDEX idx_experiments_status ON experiments(status);
CREATE INDEX idx_datasets_experiment ON datasets(experiment_id);
CREATE INDEX idx_datasets_type ON datasets(dataset_type);
CREATE INDEX idx_datasets_access ON datasets(access_level);
CREATE INDEX idx_papers_doi ON papers(doi);
CREATE INDEX idx_papers_pubmed ON papers(pubmed_id);
CREATE INDEX idx_knowledge_graph_source ON knowledge_graph_edges(source_type, source_id);
CREATE INDEX idx_knowledge_graph_target ON knowledge_graph_edges(target_type, target_id);
CREATE INDEX idx_trial_matches_trial ON trial_patient_matches(trial_id);
CREATE INDEX idx_trial_matches_patient ON trial_patient_matches(patient_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_ml_predictions_model ON ml_predictions(model_id);
CREATE INDEX idx_ml_predictions_patient ON ml_predictions(patient_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE biomarker_disease_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE trial_patient_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function to get user institution
CREATE OR REPLACE FUNCTION get_user_institution(user_id UUID)
RETURNS UUID AS $$
  SELECT institution_id FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read all profiles, update own
CREATE POLICY "profiles_read" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Institutions: readable by all authenticated users
CREATE POLICY "institutions_read" ON institutions FOR SELECT USING (true);
CREATE POLICY "institutions_manage_admin" ON institutions FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Clinics: readable by institution members, manageable by admin/PI
CREATE POLICY "clinics_read" ON clinics FOR SELECT USING (true);
CREATE POLICY "clinics_manage" ON clinics FOR ALL
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi')
    OR get_user_institution(auth.uid()) = institution_id
  );

-- Patients: restricted to clinic staff and researchers
CREATE POLICY "patients_read" ON patients FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher', 'analyst')
    OR EXISTS (
      SELECT 1 FROM clinics c
      WHERE c.id = patients.clinic_id
      AND c.institution_id = get_user_institution(auth.uid())
    )
  );
CREATE POLICY "patients_insert" ON patients FOR INSERT
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'clinic')
  );
CREATE POLICY "patients_update" ON patients FOR UPDATE
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'clinic')
  );

-- Visits: same as patients
CREATE POLICY "visits_read" ON visits FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher', 'analyst')
    OR EXISTS (
      SELECT 1 FROM clinics c
      WHERE c.id = visits.clinic_id
      AND c.institution_id = get_user_institution(auth.uid())
    )
  );
CREATE POLICY "visits_insert" ON visits FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'pi', 'clinic'));
CREATE POLICY "visits_update" ON visits FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'clinic'));

-- Biomarkers: same access as visits
CREATE POLICY "biomarkers_read" ON biomarkers FOR SELECT
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher', 'analyst')
    OR EXISTS (
      SELECT 1 FROM visits v
      JOIN clinics c ON c.id = v.clinic_id
      WHERE v.id = biomarkers.visit_id
      AND c.institution_id = get_user_institution(auth.uid())
    )
  );
CREATE POLICY "biomarkers_insert" ON biomarkers FOR INSERT
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'pi', 'clinic', 'researcher'));
CREATE POLICY "biomarkers_update" ON biomarkers FOR UPDATE
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'clinic', 'researcher'));

-- Projects: members can read, PI/admin can manage
CREATE POLICY "projects_read" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_manage" ON projects FOR ALL
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR pi_id = auth.uid()
  );

-- Project members
CREATE POLICY "project_members_read" ON project_members FOR SELECT USING (true);
CREATE POLICY "project_members_manage" ON project_members FOR ALL
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_members.project_id AND p.pi_id = auth.uid()
    )
  );

-- Experiments: readable by authenticated users, manageable by PI
CREATE POLICY "experiments_read" ON experiments FOR SELECT USING (true);
CREATE POLICY "experiments_manage" ON experiments FOR ALL
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher')
  );

-- Datasets: access level based
CREATE POLICY "datasets_read" ON datasets FOR SELECT
  USING (
    access_level = 'public'
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
    OR uploaded_by = auth.uid()
    OR (access_level = 'consortium' AND get_user_role(auth.uid()) IN ('researcher', 'analyst'))
  );
CREATE POLICY "datasets_manage" ON datasets FOR ALL
  USING (
    get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher')
  );

-- Papers: public read
CREATE POLICY "papers_read" ON papers FOR SELECT USING (true);
CREATE POLICY "papers_manage" ON papers FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher'));

-- Knowledge graph: public read
CREATE POLICY "kg_read" ON knowledge_graph_edges FOR SELECT USING (true);
CREATE POLICY "kg_manage" ON knowledge_graph_edges FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher'));

-- Diseases: public read, admin manage
CREATE POLICY "diseases_read" ON diseases FOR SELECT USING (true);
CREATE POLICY "diseases_manage" ON diseases FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- Biomarker disease links: public read
CREATE POLICY "bdl_read" ON biomarker_disease_links FOR SELECT USING (true);
CREATE POLICY "bdl_manage" ON biomarker_disease_links FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher'));

-- Clinical trials: public read
CREATE POLICY "trials_read" ON clinical_trials FOR SELECT USING (true);
CREATE POLICY "trials_manage" ON clinical_trials FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi'));

-- Trial patient matches: restricted
CREATE POLICY "trial_matches_read" ON trial_patient_matches FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher'));
CREATE POLICY "trial_matches_manage" ON trial_patient_matches FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi'));

-- ML models: authenticated read, researcher+ manage
CREATE POLICY "ml_models_read" ON ml_models FOR SELECT USING (true);
CREATE POLICY "ml_models_manage" ON ml_models FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher'));

-- ML predictions: restricted
CREATE POLICY "ml_predictions_read" ON ml_predictions FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher', 'analyst'));
CREATE POLICY "ml_predictions_manage" ON ml_predictions FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi', 'researcher'));

-- Audit logs: admin only
CREATE POLICY "audit_read" ON audit_logs FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "audit_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- API keys: admin and creator
CREATE POLICY "api_keys_read" ON api_keys FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
  );
CREATE POLICY "api_keys_manage" ON api_keys FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with that column
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
    AND table_schema = 'public'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;

-- Audit log function
CREATE OR REPLACE FUNCTION log_audit(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID,
  p_details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update clinic counters
CREATE OR REPLACE FUNCTION update_clinic_patient_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clinics SET total_patients = total_patients + 1 WHERE id = NEW.clinic_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clinics SET total_patients = total_patients - 1 WHERE id = OLD.clinic_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_clinic_patient_count
AFTER INSERT OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION update_clinic_patient_count();

-- Update clinic sample counter
CREATE OR REPLACE FUNCTION update_clinic_sample_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clinics SET total_samples = total_samples + 1
    WHERE id = (SELECT clinic_id FROM visits WHERE id = NEW.visit_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_clinic_sample_count
AFTER INSERT ON biomarkers
FOR EACH ROW EXECUTE FUNCTION update_clinic_sample_count();

-- Platform-wide analytics view
CREATE OR REPLACE VIEW platform_stats AS
SELECT
  (SELECT COUNT(*) FROM clinics WHERE is_active = true) AS total_clinics,
  (SELECT COUNT(*) FROM patients WHERE is_active = true) AS total_patients,
  (SELECT COUNT(*) FROM biomarkers) AS total_samples,
  (SELECT COUNT(*) FROM datasets) AS total_datasets,
  (SELECT COUNT(*) FROM experiments) AS total_experiments,
  (SELECT COUNT(*) FROM papers) AS total_papers,
  (SELECT COUNT(*) FROM clinical_trials) AS total_trials,
  (SELECT COUNT(*) FROM profiles WHERE is_active = true) AS total_users;

-- Biomarker summary view
CREATE OR REPLACE VIEW biomarker_summary AS
SELECT
  b.sample_type,
  COUNT(*) AS sample_count,
  AVG(b.omv_concentration) AS avg_omv_concentration,
  AVG(b.gingipain_activity) AS avg_gingipain_activity,
  AVG(b.il6) AS avg_il6,
  AVG(b.tnf_alpha) AS avg_tnf_alpha,
  AVG(b.hscrp) AS avg_hscrp,
  AVG(b.nitric_oxide) AS avg_nitric_oxide
FROM biomarkers b
GROUP BY b.sample_type;

-- Periodontal distribution view
CREATE OR REPLACE VIEW periodontal_distribution AS
SELECT
  v.periodontal_stage,
  COUNT(DISTINCT v.patient_id) AS patient_count,
  AVG(v.bleeding_index) AS avg_bleeding_index,
  AVG(v.tooth_loss) AS avg_tooth_loss
FROM visits v
WHERE v.periodontal_stage IS NOT NULL
GROUP BY v.periodontal_stage;
-- Migration: Add handle_new_user trigger to auto-insert profiles on signup
-- The trigger respects the role chosen by the user in raw_user_meta_data,
-- while still assigning 'admin' to the very first user and defaulting to 'observer'.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role user_role;
BEGIN
  -- First user becomes admin, all others default to observer.
  -- Note: there is a theoretical race condition if two users sign up simultaneously
  -- before any profile exists; in practice this only affects initial system setup.
  IF NOT EXISTS (SELECT 1 FROM profiles LIMIT 1) THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'observer';
  END IF;

  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, assigned_role)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- Migration: Add research access gating
-- Adds research_access flag to profiles and a research_access_keys table for admin key management

-- Add research_access column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS research_access BOOLEAN NOT NULL DEFAULT false;

-- Create research access keys table
CREATE TABLE IF NOT EXISTS research_access_keys (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT        UNIQUE NOT NULL,
  created_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  used_by     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active   BOOLEAN     NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE research_access_keys ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admin full access to research keys"
  ON research_access_keys
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Any authenticated user can read active keys (needed to validate during redemption)
CREATE POLICY "Users can read active keys"
  ON research_access_keys
  FOR SELECT
  USING (is_active = true AND used_by IS NULL);

-- Users can update a key to mark it used (needed for redemption)
CREATE POLICY "Users can redeem keys"
  ON research_access_keys
  FOR UPDATE
  USING (is_active = true AND used_by IS NULL)
  WITH CHECK (used_by = auth.uid());
-- OVN Nexus: AI Music Generation Workflow (Suno Integration)
-- Tables for music request → prompt → job → upload → review → publish pipeline

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE music_use_case AS ENUM (
  'podcast', 'research_video', 'brand_theme', 'social_media', 'background_music', 'presentation', 'other'
);

CREATE TYPE music_tempo AS ENUM ('slow', 'medium', 'fast');

CREATE TYPE music_voice_type AS ENUM ('male', 'female', 'instrumental');

CREATE TYPE music_lyrics_mode AS ENUM ('auto', 'manual', 'none');

CREATE TYPE music_job_status AS ENUM (
  'draft', 'queued', 'generating', 'generated', 'review', 'approved', 'published', 'rejected'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Music generation requests
CREATE TABLE music_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  use_case music_use_case NOT NULL DEFAULT 'background_music',
  mood TEXT NOT NULL,
  genre TEXT NOT NULL,
  tempo music_tempo NOT NULL DEFAULT 'medium',
  instrumentation TEXT,
  voice_type music_voice_type NOT NULL DEFAULT 'instrumental',
  lyrics_mode music_lyrics_mode NOT NULL DEFAULT 'none',
  lyrics_text TEXT,
  prompt_notes TEXT,
  duration_seconds INTEGER CHECK (duration_seconds > 0 AND duration_seconds <= 600),
  -- System-generated Suno prompts (up to 3)
  generated_prompts JSONB NOT NULL DEFAULT '[]',
  -- Job tracking
  status music_job_status NOT NULL DEFAULT 'draft',
  assigned_operator_id UUID REFERENCES profiles(id),
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Music versions (uploaded results from Suno)
CREATE TABLE music_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES music_requests(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  -- File references
  audio_url TEXT NOT NULL,
  audio_format TEXT NOT NULL DEFAULT 'mp3' CHECK (audio_format IN ('mp3', 'wav', 'flac', 'ogg')),
  audio_size_bytes BIGINT,
  duration_seconds NUMERIC(8,2),
  -- Optional extras
  stems_url TEXT,
  cover_image_url TEXT,
  waveform_data JSONB,
  -- Which Suno prompt was used
  prompt_used TEXT,
  suno_generation_id TEXT,
  -- Review
  is_selected BOOLEAN NOT NULL DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, version_number)
);

-- Music comments (review thread)
CREATE TABLE music_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES music_requests(id) ON DELETE CASCADE,
  version_id UUID REFERENCES music_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  timestamp_seconds NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Published music (final approved tracks available for embedding)
CREATE TABLE music_published (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES music_requests(id),
  version_id UUID NOT NULL REFERENCES music_versions(id),
  title TEXT NOT NULL,
  description TEXT,
  -- Usage rights
  license_type TEXT NOT NULL DEFAULT 'internal' CHECK (license_type IN ('internal', 'creative_commons', 'commercial', 'custom')),
  -- Embedding targets
  attached_to_type TEXT CHECK (attached_to_type IN ('presentation', 'podcast', 'research_video', 'page', 'other')),
  attached_to_id UUID,
  -- Public metadata
  cover_image_url TEXT,
  genre TEXT,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  play_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  published_by UUID NOT NULL REFERENCES profiles(id),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_music_requests_user ON music_requests(user_id);
CREATE INDEX idx_music_requests_status ON music_requests(status);
CREATE INDEX idx_music_requests_project ON music_requests(project_id);
CREATE INDEX idx_music_requests_created ON music_requests(created_at DESC);
CREATE INDEX idx_music_versions_request ON music_versions(request_id);
CREATE INDEX idx_music_comments_request ON music_comments(request_id);
CREATE INDEX idx_music_comments_version ON music_comments(version_id);
CREATE INDEX idx_music_published_request ON music_published(request_id);
CREATE INDEX idx_music_published_attached ON music_published(attached_to_type, attached_to_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE music_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_published ENABLE ROW LEVEL SECURITY;

-- Music requests: users can read own + admin/pi can read all
CREATE POLICY "music_requests_read" ON music_requests FOR SELECT
  USING (
    user_id = auth.uid()
    OR assigned_operator_id = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
  );
CREATE POLICY "music_requests_insert" ON music_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "music_requests_update" ON music_requests FOR UPDATE
  USING (
    user_id = auth.uid()
    OR assigned_operator_id = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
  );

-- Music versions: same access as parent request
CREATE POLICY "music_versions_read" ON music_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM music_requests mr WHERE mr.id = music_versions.request_id
      AND (mr.user_id = auth.uid() OR mr.assigned_operator_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'pi'))
    )
  );
CREATE POLICY "music_versions_insert" ON music_versions FOR INSERT
  WITH CHECK (uploaded_by = auth.uid() AND get_user_role(auth.uid()) IN ('admin', 'pi'));
CREATE POLICY "music_versions_update" ON music_versions FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'pi')
  );

-- Comments: authenticated users can read/write on requests they have access to
CREATE POLICY "music_comments_read" ON music_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM music_requests mr WHERE mr.id = music_comments.request_id
      AND (mr.user_id = auth.uid() OR mr.assigned_operator_id = auth.uid() OR get_user_role(auth.uid()) IN ('admin', 'pi'))
    )
  );
CREATE POLICY "music_comments_insert" ON music_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Published: public read, admin/pi manage
CREATE POLICY "music_published_read" ON music_published FOR SELECT USING (true);
CREATE POLICY "music_published_manage" ON music_published FOR ALL
  USING (get_user_role(auth.uid()) IN ('admin', 'pi'));
-- Create storage bucket for music uploads (audio files, cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'music-uploads',
  'music-uploads',
  true,
  104857600, -- 100 MB max file size
  ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/ogg', 'audio/x-wav',
        'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload, public can read
CREATE POLICY "music_uploads_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'music-uploads');

CREATE POLICY "music_uploads_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'music-uploads'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "music_uploads_auth_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'music-uploads'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "music_uploads_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'music-uploads'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

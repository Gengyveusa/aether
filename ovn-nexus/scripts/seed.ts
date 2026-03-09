/**
 * OVN Nexus - Seed Data Script
 * Run with: npx tsx scripts/seed.ts
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function seed() {
  console.log("Seeding OVN Nexus database...\n");

  // 1. Institutions
  console.log("Creating institutions...");
  const { data: institutions } = await supabase
    .from("institutions")
    .upsert([
      { name: "Harvard School of Dental Medicine", type: "university", country: "US", city: "Boston", website: "https://hsdm.harvard.edu" },
      { name: "Karolinska Institute", type: "university", country: "SE", city: "Stockholm", website: "https://ki.se" },
      { name: "Tokyo Medical and Dental University", type: "university", country: "JP", city: "Tokyo" },
      { name: "King's College London Dental Institute", type: "university", country: "GB", city: "London" },
      { name: "University of Zurich Center for Dental Medicine", type: "university", country: "CH", city: "Zurich" },
      { name: "Cortexyme Inc.", type: "biotech", country: "US", city: "San Francisco" },
      { name: "OraSure Technologies", type: "biotech", country: "US", city: "Bethlehem" },
      { name: "Pacific Dental Research CRO", type: "cro", country: "US", city: "San Diego" },
      { name: "Charité University Hospital", type: "hospital", country: "DE", city: "Berlin" },
      { name: "Melbourne Dental School", type: "university", country: "AU", city: "Melbourne" },
    ], { onConflict: "id" })
    .select();

  if (!institutions) { console.error("Failed to create institutions"); return; }
  console.log(`  Created ${institutions.length} institutions`);

  // 2. Clinics
  console.log("Creating clinics...");
  const clinicData = [
    { institution_id: institutions[0].id, name: "Harvard Periodontal Research Clinic", clinic_code: "HPRC-001", country: "US", city: "Boston", contact_email: "perio@hsdm.harvard.edu" },
    { institution_id: institutions[1].id, name: "Karolinska Salivary Diagnostics Lab", clinic_code: "KSDL-001", country: "SE", city: "Stockholm" },
    { institution_id: institutions[2].id, name: "TMDU Oral Microbiome Center", clinic_code: "TMDU-001", country: "JP", city: "Tokyo" },
    { institution_id: institutions[3].id, name: "King's Oral-Systemic Research Unit", clinic_code: "KCL-001", country: "GB", city: "London" },
    { institution_id: institutions[4].id, name: "Zurich OMV Research Clinic", clinic_code: "UZH-001", country: "CH", city: "Zurich" },
    { institution_id: institutions[8].id, name: "Charité Periodontology Department", clinic_code: "CHR-001", country: "DE", city: "Berlin" },
    { institution_id: institutions[9].id, name: "Melbourne Oral Health Research", clinic_code: "MOHR-001", country: "AU", city: "Melbourne" },
  ];

  const { data: clinics } = await supabase.from("clinics").upsert(clinicData, { onConflict: "clinic_code" }).select();
  if (!clinics) { console.error("Failed to create clinics"); return; }
  console.log(`  Created ${clinics.length} clinics`);

  // 3. Diseases
  console.log("Creating disease ontology...");
  const { data: diseases } = await supabase
    .from("diseases")
    .upsert([
      { name: "Atherosclerosis", icd10_code: "I70", category: "cardiovascular", description: "Buildup of plaques in arterial walls" },
      { name: "Alzheimer's Disease", icd10_code: "G30", category: "neurological", description: "Progressive neurodegenerative disorder" },
      { name: "Colorectal Cancer", icd10_code: "C18", category: "oncological", description: "Cancer of the colon or rectum" },
      { name: "Type 2 Diabetes", icd10_code: "E11", category: "metabolic", description: "Insulin resistance and relative insulin deficiency" },
      { name: "Rheumatoid Arthritis", icd10_code: "M05", category: "autoimmune", description: "Chronic inflammatory disorder of joints" },
      { name: "Periodontitis", icd10_code: "K05.3", category: "oral", description: "Inflammatory disease of the periodontium" },
      { name: "Pancreatic Cancer", icd10_code: "C25", category: "oncological", description: "Cancer of the pancreas" },
      { name: "Endocarditis", icd10_code: "I33", category: "cardiovascular", description: "Infection of the heart valves" },
      { name: "Preeclampsia", icd10_code: "O14", category: "other", description: "Pregnancy complication with high blood pressure" },
      { name: "Parkinson's Disease", icd10_code: "G20", category: "neurological", description: "Progressive nervous system disorder affecting movement" },
    ], { onConflict: "name" })
    .select();

  console.log(`  Created ${diseases?.length ?? 0} diseases`);

  // 4. Patients (de-identified)
  console.log("Creating sample patients...");
  const patientData = [];
  const sexes: Array<"male" | "female"> = ["male", "female"];
  const smokingStatuses: Array<"never" | "former" | "current"> = ["never", "former", "current"];
  const diabetesStatuses: Array<"none" | "type_1" | "type_2" | "prediabetes"> = ["none", "none", "none", "type_2", "prediabetes"];

  for (let i = 0; i < clinics.length; i++) {
    for (let j = 1; j <= 15; j++) {
      patientData.push({
        clinic_id: clinics[i].id,
        patient_code: `${clinics[i].clinic_code}-P${String(j).padStart(3, "0")}`,
        age: 25 + Math.floor(Math.random() * 50),
        sex: sexes[Math.floor(Math.random() * sexes.length)],
        smoking_status: smokingStatuses[Math.floor(Math.random() * smokingStatuses.length)],
        diabetes_status: diabetesStatuses[Math.floor(Math.random() * diabetesStatuses.length)],
        enrollment_date: new Date(2024, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)).toISOString().split("T")[0],
      });
    }
  }

  const { data: patients } = await supabase.from("patients").upsert(patientData, { onConflict: "clinic_id,patient_code" }).select();
  console.log(`  Created ${patients?.length ?? 0} patients`);

  // 5. Visits
  console.log("Creating visits...");
  const visitData = [];
  const stages: Array<"healthy" | "stage_1" | "stage_2" | "stage_3" | "stage_4"> = ["healthy", "stage_1", "stage_2", "stage_3", "stage_4"];
  const visitTypes: Array<"baseline" | "follow_up" | "post_treatment"> = ["baseline", "follow_up", "post_treatment"];

  for (const patient of patients || []) {
    const numVisits = 1 + Math.floor(Math.random() * 3);
    for (let v = 0; v < numVisits; v++) {
      visitData.push({
        patient_id: patient.id,
        clinic_id: patient.clinic_id,
        visit_type: visitTypes[Math.min(v, visitTypes.length - 1)],
        visit_date: new Date(2024, v * 3, 1 + Math.floor(Math.random() * 28)).toISOString().split("T")[0],
        visit_number: v + 1,
        periodontal_stage: stages[Math.floor(Math.random() * stages.length)],
        bleeding_index: Math.round(Math.random() * 80 * 100) / 100,
        plaque_index: Math.round(Math.random() * 70 * 100) / 100,
        tooth_loss: Math.floor(Math.random() * 8),
      });
    }
  }

  const { data: visits } = await supabase.from("visits").insert(visitData).select();
  console.log(`  Created ${visits?.length ?? 0} visits`);

  // 6. Biomarkers
  console.log("Creating biomarker samples...");
  const biomarkerData = [];

  for (const visit of visits || []) {
    biomarkerData.push({
      visit_id: visit.id,
      patient_id: visit.patient_id,
      sample_type: "saliva",
      sample_date: visit.visit_date,
      omv_concentration: Math.round((0.5 + Math.random() * 3) * 1e9),
      gingipain_activity: Math.round((5 + Math.random() * 80) * 100) / 100,
      il6: Math.round((2 + Math.random() * 25) * 100) / 100,
      tnf_alpha: Math.round((1 + Math.random() * 15) * 100) / 100,
      hscrp: Math.round((0.5 + Math.random() * 8) * 100) / 100,
      nitric_oxide: Math.round((10 + Math.random() * 60) * 100) / 100,
      quality_score: Math.round((70 + Math.random() * 30) * 100) / 100,
      collection_method: "passive_drool",
      storage_conditions: "-80C",
    });
  }

  const { data: biomarkers } = await supabase.from("biomarkers").insert(biomarkerData).select();
  console.log(`  Created ${biomarkers?.length ?? 0} biomarker samples`);

  // 7. Papers
  console.log("Creating papers...");
  const { data: papers } = await supabase
    .from("papers")
    .insert([
      {
        title: "Porphyromonas gingivalis outer membrane vesicles promote endothelial dysfunction",
        authors: ["Chen Y", "Wang L", "Martinez A", "Zhou H"],
        journal: "Journal of Dental Research",
        doi: "10.1177/00220345241234567",
        publication_date: "2024-03-15",
        keywords: ["OMV", "endothelial", "P. gingivalis", "atherosclerosis"],
        added_by: institutions[0].id,
      },
      {
        title: "Gingipain-mediated tau phosphorylation in Alzheimer's disease models",
        authors: ["Dominy SS", "Lynch C", "Ermini F", "Benedyk M"],
        journal: "Science Advances",
        doi: "10.1126/sciadv.2024.001",
        publication_date: "2024-01-20",
        keywords: ["gingipain", "tau", "Alzheimer's", "neurodegeneration"],
        added_by: institutions[0].id,
      },
      {
        title: "Salivary IL-6 as a predictor of cardiovascular events in periodontitis patients",
        authors: ["Tonetti MS", "Greenwell H", "Kornman KS"],
        journal: "Journal of Clinical Periodontology",
        doi: "10.1111/jcpe.2024.0042",
        publication_date: "2024-06-01",
        keywords: ["IL-6", "cardiovascular", "periodontitis", "biomarker"],
        added_by: institutions[0].id,
      },
      {
        title: "Fusobacterium nucleatum extracellular vesicles in colorectal tumor microenvironment",
        authors: ["Liu H", "Kim S", "Park J", "Nakamura T"],
        journal: "Gut Microbes",
        doi: "10.1080/19490976.2024.5678",
        publication_date: "2024-04-10",
        keywords: ["F. nucleatum", "colorectal cancer", "extracellular vesicles", "tumor"],
        added_by: institutions[0].id,
      },
      {
        title: "Multi-omic profiling of the oral-vascular axis in metabolic syndrome",
        authors: ["Bergstrom J", "Lindhe J", "Petersen PE"],
        journal: "Nature Communications",
        doi: "10.1038/s41467-024-98765",
        publication_date: "2024-08-22",
        keywords: ["multi-omics", "oral-vascular", "metabolic syndrome", "microbiome"],
        added_by: institutions[0].id,
      },
    ])
    .select();

  console.log(`  Created ${papers?.length ?? 0} papers`);

  // 8. Biomarker-disease links
  if (diseases && papers) {
    console.log("Creating biomarker-disease links...");
    await supabase.from("biomarker_disease_links").insert([
      { biomarker_name: "OMV concentration", disease_id: diseases[0].id, association_type: "risk_factor", evidence_level: "moderate", odds_ratio: 2.45, source_paper_id: papers[0].id },
      { biomarker_name: "Gingipain activity", disease_id: diseases[1].id, association_type: "risk_factor", evidence_level: "strong", odds_ratio: 3.12, source_paper_id: papers[1].id },
      { biomarker_name: "IL-6", disease_id: diseases[0].id, association_type: "prognostic", evidence_level: "strong", odds_ratio: 1.87, source_paper_id: papers[2].id },
      { biomarker_name: "hsCRP", disease_id: diseases[0].id, association_type: "diagnostic", evidence_level: "strong", odds_ratio: 2.1 },
      { biomarker_name: "TNF-alpha", disease_id: diseases[3].id, association_type: "risk_factor", evidence_level: "moderate", odds_ratio: 1.65 },
      { biomarker_name: "OMV concentration", disease_id: diseases[2].id, association_type: "risk_factor", evidence_level: "emerging", source_paper_id: papers[3].id },
      { biomarker_name: "Nitric oxide", disease_id: diseases[0].id, association_type: "diagnostic", evidence_level: "moderate", odds_ratio: 0.72 },
    ]);
    console.log("  Created biomarker-disease links");
  }

  // 9. Clinical Trials
  console.log("Creating clinical trials...");
  await supabase.from("clinical_trials").upsert([
    {
      trial_code: "OVN-CARDIO-001",
      title: "OMV Load and Endothelial Dysfunction in Periodontitis",
      description: "Prospective study linking salivary OMV concentration to flow-mediated dilation",
      phase: "phase_2",
      status: "recruiting",
      sponsor: "OVN Nexus Consortium",
      institution_id: institutions[0].id,
      target_enrollment: 200,
      current_enrollment: 85,
      biomarker_criteria: { omv_concentration: { min: 1e9 }, hscrp: { min: 2 } },
      start_date: "2024-01-15",
    },
    {
      trial_code: "OVN-NEURO-001",
      title: "Gingipain Inhibition and Cognitive Decline in Alzheimer's",
      description: "Phase 2 trial of gingipain inhibitors with salivary biomarker monitoring",
      phase: "phase_2",
      status: "active",
      sponsor: "Cortexyme-OVN Partnership",
      institution_id: institutions[5].id,
      target_enrollment: 150,
      current_enrollment: 120,
      biomarker_criteria: { gingipain_activity: { min: 40 } },
      start_date: "2023-06-01",
    },
    {
      trial_code: "OVN-META-001",
      title: "Periodontal Treatment Effect on Metabolic Biomarkers",
      description: "RCT measuring systemic inflammatory marker changes after scaling and root planing",
      phase: "phase_3",
      status: "recruiting",
      sponsor: "NIH/NIDCR",
      institution_id: institutions[3].id,
      target_enrollment: 500,
      current_enrollment: 210,
      biomarker_criteria: { il6: { min: 5 }, tnf_alpha: { min: 3 } },
      start_date: "2024-03-01",
    },
  ], { onConflict: "trial_code" });

  console.log("  Created clinical trials");

  console.log("\nSeed completed successfully!");
  console.log("Summary:");
  console.log(`  Institutions: ${institutions.length}`);
  console.log(`  Clinics: ${clinics.length}`);
  console.log(`  Diseases: ${diseases?.length ?? 0}`);
  console.log(`  Patients: ${patients?.length ?? 0}`);
  console.log(`  Visits: ${visits?.length ?? 0}`);
  console.log(`  Biomarker samples: ${biomarkers?.length ?? 0}`);
  console.log(`  Papers: ${papers?.length ?? 0}`);
  console.log(`  Clinical trials: 3`);
}

seed().catch(console.error);

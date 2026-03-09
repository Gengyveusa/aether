import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              OVN
            </div>
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            The Oral-Vascular-Neural
            <br />
            <span className="text-primary">Research Network</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Building the world&apos;s largest structured dataset linking oral microbiology,
            salivary biomarkers, and systemic disease outcomes. Connecting dentists,
            clinician-scientists, biotech researchers, and diagnostic companies.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg">Join the Network</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/50 py-16">
          <div className="container">
            <h2 className="text-center text-3xl font-bold">Platform Capabilities</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                { title: "Clinic Data Ingestion", desc: "Structured clinical data from thousands of dental clinics worldwide. Periodontal staging, probing depths, and salivary biomarkers." },
                { title: "Biomarker Engine", desc: "Track OMV concentrations, gingipain activity, inflammatory markers, and correlate with systemic disease outcomes." },
                { title: "Longitudinal Tracking", desc: "Follow patients from baseline through treatment. Analyze trends in biomarker profiles across visits." },
                { title: "Experiment Registry", desc: "Research labs track experiments, protocols, and datasets. Link findings to the global knowledge graph." },
                { title: "Data Lake", desc: "Store and query microbiome sequencing, RNA-seq, proteomics, and EV cargo analysis datasets." },
                { title: "ML Discovery", desc: "Machine learning pipelines for biomarker prediction, disease risk scoring, and OMV pathogenicity signatures." },
                { title: "Knowledge Graph", desc: "Connect papers, experiments, datasets, biomarkers, and diseases in a queryable research graph." },
                { title: "Clinical Trial Enrichment", desc: "Match patients with specific biomarker profiles to precision clinical trials." },
                { title: "HIPAA-Style Security", desc: "De-identified data, role-based access, row-level security, and comprehensive audit logging." },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border bg-card p-6">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">Research Focus Areas</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-4">
              {[
                { area: "Atherosclerosis", desc: "Oral bacterial OMVs and cardiovascular plaque formation" },
                { area: "Neurodegeneration", desc: "Gingipain-mediated pathways in Alzheimer's disease" },
                { area: "Cancer", desc: "Fusobacterium and colorectal cancer progression" },
                { area: "Metabolic Disease", desc: "Periodontal inflammation and diabetes pathways" },
              ].map((item) => (
                <div key={item.area} className="rounded-lg border p-6 text-left">
                  <h3 className="font-semibold text-primary">{item.area}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          OVN Nexus - Oral-Vascular-Neural Research Platform
        </div>
      </footer>
    </div>
  );
}

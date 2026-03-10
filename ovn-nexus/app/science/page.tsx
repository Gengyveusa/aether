import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, FlaskConical, ArrowLeft } from "lucide-react";

export default function SciencePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">OVN</div>
            <span className="text-xl font-bold">Nexus</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to OVN Nexus</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="container py-16 text-center">
          <Badge variant="secondary" className="mb-4 text-xs uppercase tracking-wider">Research Presentation</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl max-w-4xl mx-auto leading-tight">The Oral-Vascular-Neural Axis</h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">Bacterial extracellular vesicles as a candidate oral-systemic disease interface</p>
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium">S. Thaddeus Connelly, DDS, MD, PhD, FACS</p>
            <p>San Francisco Veterans Affairs Healthcare System</p>
            <p>University of California San Francisco | GengyeUSA | 2026</p>
          </div>
        </section>

        {/* How to Read This */}
        <section className="border-t bg-muted/50 py-12">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-8">How to Read This Presentation</h2>
            <p className="text-center text-muted-foreground mb-8">This presentation distinguishes established evidence from supported mechanisms and working hypotheses that still require causal testing.</p>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge variant="outline" className="border-green-400 text-green-700 text-xs">Established</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>Periodontitis generates systemic inflammatory and microbial exposure</li>
                  <li>Periodontal disease is associated with ASCVD and chronic outcomes</li>
                  <li>Periodontal therapy can improve endothelial or inflammatory biomarkers</li>
                </ul>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <Badge variant="outline" className="border-amber-400 text-amber-700 text-xs">Supported, Not Settled</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>P. gingivalis OMVs carry virulence cargo and injure host cells in models</li>
                  <li>OMVs can promote endothelial activation and mitochondrial stress</li>
                  <li>P. gingivalis is associated with certain cancers and neurodegenerative pathways</li>
                </ul>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-3">
                  <FlaskConical className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline" className="border-blue-400 text-blue-700 text-xs">Hypothesis Under Test</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>A conserved OMV-driven program contributes across vascular, tumor, and brain disease</li>
                  <li>Salivary/blood OMV signals can serve as scalable upstream biomarkers</li>
                  <li>Upstream oral intervention can change long-term systemic trajectories</li>
                </ul>
              </div>
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground italic">Read this as a disciplined translational hypothesis -- not a proven unifying law.</p>
          </div>
        </section>

        {/* Why the Mouth-Body Interface Matters */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-4">Why the Mouth-Body Interface Matters</h2>
            <p className="text-center text-muted-foreground mb-8">The opportunity is not to collapse diseases into one disease, but to identify shared upstream interfaces worth measuring and testing.</p>
            <div className="grid gap-6 md:grid-cols-3 text-center">
              <div className="rounded-xl border bg-card p-6">
                <div className="text-4xl font-bold text-primary">32%</div>
                <div className="mt-1 font-semibold">CVD Global Deaths</div>
                <p className="mt-2 text-sm text-muted-foreground">Cardiovascular disease is the leading cause of global mortality</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="text-4xl font-bold text-primary">1 in 6</div>
                <div className="mt-1 font-semibold">Cancer Deaths</div>
                <p className="mt-2 text-sm text-muted-foreground">Cancer accounts for nearly 1 in 6 deaths worldwide</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <div className="text-4xl font-bold text-primary">~1B</div>
                <div className="mt-1 font-semibold">Dementia Burden</div>
                <p className="mt-2 text-sm text-muted-foreground">Dementia is a major cause of disability and death globally</p>
              </div>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground italic">Even a modest upstream risk signal could matter clinically if it is measurable and modifiable.</p>
          </div>
        </section>

        {/* Candidate Effector */}
        <section className="border-t bg-muted/50 py-12">
          <div className="container max-w-4xl">
            <Badge variant="outline" className="mb-4 text-xs">Plausible Messenger -- Not Yet a Proven Master Cause</Badge>
            <h2 className="text-2xl font-bold mb-4">Candidate Effector: P. gingivalis Outer Membrane Vesicles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-3">What They Are</h3>
                <p className="text-sm text-muted-foreground">20-250 nm bilayer vesicles shed from Gram-negative bacteria. They package concentrated virulence factors and move through tissues and fluids more easily than intact bacteria.</p>
              </div>
              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-3">Typical Cargo</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Gingipains</li>
                  <li>Heterogeneous LPS / lipid A species</li>
                  <li>PPAD and adhesins / fimbrial components</li>
                  <li>Nucleic acids</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5-Step Cascade */}
        <section className="py-12">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-2">A Working Five-Step Cascade</h2>
            <p className="text-center text-sm text-muted-foreground mb-8 italic">Useful for organizing experiments; risky if presented as already-proven causality.</p>
            <div className="space-y-4">
              {[
                { step: "1", title: "Barrier Disruption", badge: "Preclinical + Translational", desc: "Barrier injury is the gatekeeping step that makes distal effects plausible. P. gingivalis cells and OMVs increase endothelial signaling, promote monocyte adhesion, and perturb epithelial integrity." },
                { step: "2", title: "Mitochondrial Dysfunction", badge: "High-Value Mechanistic Node", desc: "P. gingivalis exposure increases mitochondrial fragmentation and mtROS, lowers membrane potential, and decreases ATP via Drp1-dependent fission in endothelial models." },
                { step: "3", title: "Phenotypic Reprogramming", badge: "Selected Tissues", desc: "OMVs can induce osteogenic calcification in VSMCs, EMT-like programs in oral epithelium, and inflammatory phenotypes in microglia -- avoid over-generalizing across all tissues." },
                { step: "4", title: "Secondary EV Signals", badge: "Emerging", desc: "P. gingivalis infection can alter host EV release and cargo. EVs can propagate pathology in AD models. Mitochondrial transfer occurs in cancer and affects chemoresistance." },
                { step: "5", title: "Tissue-Level Endpoints", badge: "Guardrail", desc: "Vascular calcification, cancer progression in oral/GI contexts, and AD-like pathology in animal models are real -- but not identical. Use shared upstream interface, tissue-specific endpoints." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 rounded-xl border bg-card p-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">{item.step}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Clinical Implications */}
        <section className="border-t bg-muted/50 py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8">Clinical Implications Justified Today</h2>
            <p className="text-center text-sm text-muted-foreground mb-8 italic">Be ambitious in screening and collaboration; be conservative in causal claims and treatment promises.</p>
            <div className="space-y-3">
              {[
                { icon: "yes", text: "Treat periodontitis as a systemic health issue, not just a local dental problem" },
                { icon: "yes", text: "Capture periodontal status in cardiometabolic and geriatric histories where relevant" },
                { icon: "yes", text: "Expect local benefit and some biomarker or endothelial improvement after periodontal therapy" },
                { icon: "no", text: "Claiming periodontal disease is a fully validated causal driver of ASCVD, cancer, or AD" },
                { icon: "no", text: "Telling patients gingipain inhibition or oral therapy is proven to slow dementia" },
                { icon: "no", text: "Presenting the AHA statement as if it resolved the causal question" },
              ].map((item) => (
                <div key={item.text} className={`flex gap-3 rounded-lg border p-4 ${item.icon === "yes" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"}`}>
                  <span className="text-lg shrink-0">{item.icon === "yes" ? "\u2705" : "\u274C"}</span>
                  <p className="text-sm">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Line */}
        <section className="py-12">
          <div className="container max-w-3xl">
            <h2 className="text-2xl font-bold text-center mb-8">Bottom Line</h2>
            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8">
              <h3 className="font-semibold text-lg mb-3">Best Current Claim</h3>
              <p className="text-muted-foreground mb-4">Oral bacterial EVs are plausible systemic effectors and a tractable upstream biomarker interface -- strong enough to justify measurement, intervention studies, and disciplined translational development now.</p>
              <h3 className="font-semibold text-lg mb-3">Strongest Evidence</h3>
              <p className="text-muted-foreground mb-4">Periodontitis-ASCVD association; OMV endothelial effects; mitochondrial stress; selected neural and cancer-related model systems.</p>
              <h3 className="font-semibold text-lg mb-3">Biggest Gaps</h3>
              <p className="text-muted-foreground mb-6">Human causality, cargo attribution, prospective biomarker validation, and proof that the proposed cascade is truly conserved across tissues.</p>
              <div className="rounded-lg bg-primary/10 p-4">
                <p className="text-sm font-medium text-center">Winning Strategy: Prove an upstream signal, show that intervention moves it, and only then claim disease modification. That path is scientifically stronger and commercially more credible.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Nexus CTA */}
        <section className="border-t bg-muted/50 py-12 text-center">
          <div className="container">
            <h2 className="text-xl font-bold mb-4">Ready to Join the Research Network?</h2>
            <div className="flex justify-center gap-4">
              <Link href="/">
                <Button variant="outline" size="lg" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back to OVN Nexus</Button>
              </Link>
              <Link href="/signup">
                <Button size="lg">Join the Network</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-medium">S. Thaddeus Connelly, DDS, MD, PhD, FACS</p>
          <p>UCSF / SFVAMC / GengyeUSA</p>
          <p className="mt-4 text-xs">Content on this platform is for professional education. It does not constitute medical advice and does not establish a causal relationship between periodontal disease and any systemic condition.</p>
        </div>
      </footer>
    </div>
  );
}

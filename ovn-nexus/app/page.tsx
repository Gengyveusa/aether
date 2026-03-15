import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, FlaskConical, ArrowRight, ExternalLink } from "lucide-react";
import { AuthNavButtons } from "@/components/auth-nav-buttons";
import { OvnAxisDiagram } from "@/components/diagrams/ovn-axis-diagram";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              OVN
            </div>
            <span className="text-xl font-bold">Nexus</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/education" className="text-muted-foreground hover:text-foreground transition-colors">Education</Link>
            <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors">Community</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          </nav>
          <AuthNavButtons />
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="container py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6 text-xs uppercase tracking-wider">
              For Dental Hygienists & Dentists
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              The Mouth May Be the Most Overlooked Driver of{" "}
              <span className="text-primary">Systemic Disease</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Oral microbes release inflammatory signals that travel through the
              bloodstream and nervous system to affect the heart, brain, and
              immune system.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              The <strong className="text-foreground">OVN Axis</strong>{" "}
              (Oral&#8209;Vascular&#8209;Neural) is a scientific framework for
              studying this connection.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Join the OVN Research Network <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="/science" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg">Explore the Science</Button>
              </a>
            </div>
          </div>

          <div className="mt-16 sm:mt-20">
            <OvnAxisDiagram />
          </div>
        </section>

        {/* ── Why This Matters ────────────────────────────────────── */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">Why Periodontal Health Is a Systemic Issue</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                The global burden of the diseases now linked to chronic systemic inflammation is
                staggering. Even a modest, measurable, upstream risk signal — one that is
                modifiable in the dental chair — could matter clinically at population scale.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 text-center">
              {[
                {
                  stat: "32%",
                  label: "of global deaths",
                  context: "attributed to cardiovascular disease — the leading cause of mortality worldwide",
                },
                {
                  stat: "1 in 6",
                  label: "cancer deaths",
                  context: "involve pathways now under investigation for oral microbial contributions",
                },
                {
                  stat: "~1 Billion",
                  label: "dementia burden",
                  context: "individuals projected to be affected globally by 2050, with neuroinflammatory drivers under active study",
                },
              ].map((item) => (
                <div key={item.stat} className="rounded-xl border bg-card p-8">
                  <div className="text-5xl font-bold text-primary">{item.stat}</div>
                  <div className="mt-2 text-lg font-semibold">{item.label}</div>
                  <p className="mt-3 text-sm text-muted-foreground">{item.context}</p>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-sm text-muted-foreground max-w-2xl mx-auto italic">
              These statistics do not imply that periodontitis is a proven causal driver of any
              systemic disease. They frame the scale of the problem and the potential significance
              of upstream modifiable risk signals.
            </p>
          </div>
        </section>

        {/* ── Education — The Science ──────────────────────────────── */}
        <section id="education" className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">The Science — Evidence Tiers</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                Not all science is created equal. Here is how the current evidence stacks up,
                presented with the same epistemic honesty you would apply to any clinical literature.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <Badge variant="outline" className="border-green-400 text-green-700 dark:text-green-300 text-xs">Established</Badge>
                </div>
                <h3 className="font-semibold text-lg">Systemic Inflammatory Exposure</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Periodontitis generates measurable systemic inflammatory exposure. Multiple
                  meta-analyses show significant association between periodontal disease and
                  atherosclerotic cardiovascular disease (ASCVD), with periodontal intervention
                  linked to improvement in surrogate cardiometabolic markers.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300 text-xs">Supported</Badge>
                </div>
                <h3 className="font-semibold text-lg">OMV Virulence Cargo</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <em>P. gingivalis</em> outer membrane vesicles (OMVs) carry concentrated
                  virulence factors — gingipains, LPS, and fimbriae — that can translocate
                  across epithelial and endothelial barriers, promoting endothelial activation
                  and local inflammatory responses in preclinical models.
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-4">
                  <FlaskConical className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <Badge variant="outline" className="border-blue-400 text-blue-700 dark:text-blue-300 text-xs">Hypothesis Under Test</Badge>
                </div>
                <h3 className="font-semibold text-lg">A Conserved OMV-Driven Program</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  A working hypothesis proposes that oral bacterial OMVs trigger a conserved
                  cellular reprogramming program — mitochondrial dysfunction, phenotypic
                  plasticity, and secondary EV signaling — that may contribute to vascular,
                  neurodegenerative, and oncological tissue endpoints. Under active investigation.
                </p>
              </div>
            </div>

            {/* OMV explainer */}
            <div className="mt-12 rounded-xl border bg-card p-8">
              <h3 className="text-xl font-bold mb-4">What Are Outer Membrane Vesicles (OMVs)?</h3>
              <p className="text-muted-foreground leading-relaxed">
                OMVs are nanoscale particles (20–250 nm) constitutively shed from the outer
                membrane of gram-negative bacteria like <em>P. gingivalis</em> and{" "}
                <em>Fusobacterium nucleatum</em>. Unlike planktonic bacteria, OMVs can cross
                epithelial barriers, evade immune clearance, and deliver concentrated virulence
                cargo — including proteases, lipopolysaccharide, and nucleic acids — directly
                to host cells at distant sites.
              </p>

              {/* 5-step cascade */}
              <div className="mt-8">
                <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-muted-foreground">
                  The Proposed 5-Step Cascade
                </h4>
                <div className="flex flex-col md:flex-row gap-2 items-stretch">
                  {[
                    { step: "1", title: "Barrier Disruption", desc: "OMVs breach periodontal epithelium and enter systemic circulation" },
                    { step: "2", title: "Mitochondrial Dysfunction", desc: "Virulence cargo impairs mitochondrial respiration in target cells" },
                    { step: "3", title: "Phenotypic Reprogramming", desc: "Host cells shift toward a pro-inflammatory, pro-remodeling phenotype" },
                    { step: "4", title: "Secondary EV Signals", desc: "Reprogrammed cells shed their own EVs, amplifying the signal" },
                    { step: "5", title: "Tissue Endpoints", desc: "Cumulative effects manifest as vascular, neural, or oncological pathology" },
                  ].map((item, i, arr) => (
                    <div key={item.step} className="flex flex-col md:flex-row items-stretch flex-1">
                      <div className="rounded-lg border bg-muted/50 p-4 flex-1">
                        <div className="text-xs font-bold text-primary mb-1">Step {item.step}</div>
                        <div className="font-semibold text-sm">{item.title}</div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex items-center justify-center px-2 text-muted-foreground shrink-0 rotate-90 md:rotate-0">
                          →
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <a
                  href="/science/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  Full presentation at Explore the Science <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── What You Can Do Today ────────────────────────────────── */}
        <section className="border-t bg-muted/50 py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold">What You Can Do Today</h2>
              <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
                The evidence does not yet support claiming periodontal disease as a validated
                causal driver of ASCVD, cancer, or Alzheimer&apos;s disease. But there is
                plenty of justified clinical action right now.
              </p>
            </div>
            <div className="mx-auto max-w-2xl space-y-4">
              {[
                {
                  icon: "✅",
                  text: "Treat periodontitis as a systemic health issue — not just a local dental problem",
                  positive: true,
                },
                {
                  icon: "✅",
                  text: "Capture periodontal status in cardiometabolic and neurological histories",
                  positive: true,
                },
                {
                  icon: "✅",
                  text: "Anticipate and communicate biomarker improvement (hsCRP, IL-6) after periodontal therapy",
                  positive: true,
                },
                {
                  icon: "❌",
                  text: 'Do NOT claim periodontal disease is a proven causal driver of ASCVD, cancer, or Alzheimer\'s disease — the causal evidence is not yet there',
                  positive: false,
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className={`flex gap-4 rounded-lg border p-4 ${
                    item.positive
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
                      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
                  }`}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <p className="text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Community / Engagement ──────────────────────────────── */}
        <section id="community" className="py-16 scroll-mt-16">
          <div className="container text-center">
            <h2 className="text-3xl font-bold">
              Join Dental Professionals Building the Evidence Base
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              OVN Nexus is a professional community and research platform for clinicians who
              want to stay current on the oral-systemic connection and contribute to the
              science.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3 max-w-3xl mx-auto">
              {[
                {
                  title: "Education Modules",
                  desc: "Curated, evidence-tiered content on the oral-vascular-neural axis — written for clinicians, not just researchers.",
                  badge: "Available Now",
                },
                {
                  title: "Case Discussions",
                  desc: "Share and discuss cases where periodontal findings intersected with systemic disease presentations.",
                  badge: "Coming Soon",
                },
                {
                  title: "Biomarker Tracking",
                  desc: "Contribute to and access aggregated, de-identified data linking periodontal therapy to systemic biomarker changes.",
                  badge: "Coming Soon",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border bg-card p-6 text-left">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge
                      variant={item.badge === "Available Now" ? "default" : "secondary"}
                      className="text-xs shrink-0"
                    >
                      {item.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Create Your Account <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

            {/* Living Document Banner */}
      <section className="border-t border-b bg-primary/5 py-8">
        <div className="container text-center max-w-2xl mx-auto">
          <p className="text-sm font-medium text-primary mb-2">This Platform Is a Living Document</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            OVN Nexus is continuously evolving, shaped by the clinicians and researchers who use it. We welcome your feedback and suggestions as we build new features to strengthen your educational experience -- so you can deliver the highest standard of care to your patients.
          </p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer id="about" className="border-t bg-muted/50 py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                OVN
              </div>
              <div>
                <div className="font-bold text-sm">OVN Nexus</div>
                <div className="text-xs text-muted-foreground">Oral-Vascular-Neural Research Network</div>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium">S. Thaddeus Connelly, DDS, MD, PhD, FACS</p>
              <p>UCSF / SFVAMC / GengyeUSA</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a
                href="/science/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Explore the Science <ExternalLink className="h-3 w-3" />
              </a>
              <Link href="/login" className="text-muted-foreground hover:text-foreground">Sign In</Link>
              <Link href="/signup" className="text-muted-foreground hover:text-foreground">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            Content on this platform is for professional education. It does not constitute
            medical advice and does not establish a causal relationship between periodontal
            disease and any systemic condition.
          </div>
        </div>
      </footer>
    </div>
  );
}

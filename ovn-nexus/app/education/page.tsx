import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, BookOpen, FileText, ExternalLink } from "lucide-react";

const SERIES = [
  {
    title: "Series 1: Diabetes & Oral Health",
    modules: [
      {
        number: 45,
        title: "Diabetes, Saliva, and the Silent Acceleration of Cavities",
        description:
          "How elevated blood glucose alters salivary chemistry, creating a continuous acidic environment that accelerates enamel breakdown — even with good hygiene.",
        tags: ["Diabetes", "Saliva", "Caries Risk"],
        pages: 5,
      },
    ],
  },
  {
    title: "Series 2: Oral Pathogens & Systemic Disease",
    modules: [
      {
        number: 46,
        title: "Do Oral Pathogens Cause Systemic Disease? — Part I",
        description:
          "Examining the evidence linking periodontal pathogens to cardiovascular disease, neurodegeneration, and cancer through bacterial translocation and immune activation.",
        tags: ["Pathogenesis", "Systemic Disease", "OMVs"],
        pages: 4,
      },
      {
        number: 47,
        title: "When Pathogens Rewrite the Rules — Part II",
        description:
          "How P. gingivalis outer membrane vesicles carry concentrated virulence cargo into distant tissues, hijacking host cell signaling and immune responses.",
        tags: ["OMVs", "Virulence", "Immune Evasion"],
        pages: 5,
      },
    ],
  },
  {
    title: "Series 3: Information Collapse",
    modules: [
      {
        number: 48,
        title: "Information Collapse — Part I",
        description:
          "Introducing the concept of information collapse: when chronic oral infection degrades biological signaling networks, leading to systemic dysfunction.",
        tags: ["Information Theory", "Systems Biology", "Oral-Systemic"],
        pages: 4,
      },
      {
        number: 49,
        title: "System-Level Consequences — Part II",
        description:
          "How disrupted signaling cascades from oral pathogens propagate through vascular, neural, and metabolic systems, compounding disease risk.",
        tags: ["Systems Biology", "Disease Propagation", "Biomarkers"],
        pages: 5,
      },
      {
        number: 50,
        title: "Clinical Biomarkers — Part III",
        description:
          "Identifying measurable biomarkers that track the oral-systemic disease axis — from salivary diagnostics to circulating inflammatory markers.",
        tags: ["Biomarkers", "Diagnostics", "Clinical Application"],
        pages: 5,
      },
      {
        number: 51,
        title: "Therapeutic Recalibration — Part IV",
        description:
          "Strategies for restoring biological signaling integrity through targeted periodontal intervention, microbiome modulation, and systemic monitoring.",
        tags: ["Therapeutics", "Intervention", "Microbiome"],
        pages: 5,
      },
    ],
  },
  {
    title: "Series 4: Biofilm Architecture & Disease",
    modules: [
      {
        number: 52,
        title: "Biofilm as a Structured Information System — Part I",
        description:
          "Reframing dental biofilm not as simple plaque, but as a structured microbial community with coordinated signaling, quorum sensing, and adaptive behavior.",
        tags: ["Biofilm", "Quorum Sensing", "Microbiology"],
        pages: 5,
      },
      {
        number: 53,
        title: "From Symbiosis to Dysbiosis — Part II",
        description:
          "How the oral microbiome transitions from a balanced, health-promoting community to a dysbiotic state that drives chronic inflammation and tissue destruction.",
        tags: ["Dysbiosis", "Microbiome", "Inflammation"],
        pages: 5,
      },
      {
        number: 54,
        title: "Immune Signaling at the Biofilm Interface — Part III",
        description:
          "The immune system's complex dialogue with biofilm communities — from tolerance and surveillance to escalation and tissue damage.",
        tags: ["Immunology", "Biofilm", "Host Response"],
        pages: 5,
      },
      {
        number: 55,
        title: "Systemic Coupling and Attractor States — Part IV",
        description:
          "How chronic periodontal disease creates self-reinforcing feedback loops (attractor states) that couple oral inflammation to systemic disease progression.",
        tags: ["Systems Biology", "Attractor States", "Chronic Disease"],
        pages: 6,
      },
    ],
  },
];

export default function EducationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              OVN
            </div>
            <span className="text-xl font-bold">Nexus</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link
              href="/science"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Science
            </Link>
            <Link
              href="/education"
              className="text-foreground transition-colors"
            >
              Education
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="container py-16 md:py-24 text-center">
          <Badge
            variant="secondary"
            className="mb-6 text-xs uppercase tracking-wider"
          >
            <BookOpen className="mr-1.5 h-3 w-3" />
            Professional Education
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl max-w-4xl mx-auto leading-tight">
            The Oral Health Bulletin{" "}
            <span className="text-primary">Education Series</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Curated education modules from Dr. Stephen Thaddeus Connelly&apos;s{" "}
            <em>Oral Health Bulletin</em> newsletter — bridging the gap between
            emerging oral-systemic science and clinical practice.
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium">
              Stephen Thaddeus Connelly, DDS, MD, PhD
            </p>
            <p>Professor of Oral &amp; Maxillofacial Surgery, UCSF</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>11 Modules</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>4 Series</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <span>54 Pages Total</span>
          </div>
        </section>

        {/* ── Module Series ──────────────────────────────────────── */}
        {SERIES.map((series, seriesIdx) => (
          <section
            key={series.title}
            className={`py-12 md:py-16 ${seriesIdx % 2 === 1 ? "bg-muted/50" : ""}`}
          >
            <div className="container">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">{series.title}</h2>
                <div className="mt-2 h-1 w-16 rounded-full bg-primary" />
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {series.modules.map((mod) => (
                  <Card
                    key={mod.number}
                    className="flex flex-col transition-shadow hover:shadow-md"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <Badge
                          variant="outline"
                          className="shrink-0 font-mono text-xs"
                        >
                          Module {mod.number}
                        </Badge>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {mod.pages} pages
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-snug mt-2">
                        {mod.title}
                      </CardTitle>
                      <CardDescription className="leading-relaxed">
                        {mod.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="flex flex-wrap gap-1.5">
                        {mod.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <a
                        href={`/education-pdfs/module-${mod.number}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full"
                      >
                        <Button className="w-full gap-2" variant="default">
                          Read Module{" "}
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* ── CTA ────────────────────────────────────────────────── */}
        <section className="border-t bg-primary/5 py-12 text-center">
          <div className="container max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              Want to Explore the Underlying Science?
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              These modules are grounded in a growing body of research on the
              oral-systemic disease interface. See the full evidence presentation
              or join the professional network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="/science" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="lg" className="gap-2">
                  Explore the Science{" "}
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/signup">
                <Button size="lg">Join the Network</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="font-medium">
            S. Thaddeus Connelly, DDS, MD, PhD, FACS
          </p>
          <p>UCSF / SFVAMC / GengyeUSA</p>
          <p className="mt-4 text-xs">
            Content on this platform is for professional education. It does not
            constitute medical advice and does not establish a causal
            relationship between periodontal disease and any systemic condition.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShowcaseContent } from "./showcase-content";

export const metadata = {
  title: "Gingival Immunity v2.0 — OVN Nexus Video Showcase",
  description: "A cinematic presentation of the molecularly resolved, spatially aware control architecture of gingival immunity",
};

export default function ShowcasePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                OVN
              </div>
              <span className="text-xl font-bold">Nexus</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Film className="h-4 w-4" />
              Showcase
            </div>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight">
              Gingival Immunity v2.0: The Wiring Diagram
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A molecularly resolved, spatially aware, dynamically modeled
              layered control architecture — presented as a cinematic experience.
            </p>
          </div>

          <ShowcaseContent />
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container text-center text-xs text-muted-foreground">
          Content on this platform is for professional education. It does not constitute
          medical advice.
        </div>
      </footer>
    </div>
  );
}

import type { Metadata } from "next";
import { MusicGeneratorForm } from "./generator-form";

export const metadata: Metadata = {
  title: "Music Generator - OVN Nexus",
};

export default function MusicGeneratorPage() {
  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">AI Music Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Describe the music you need and we&apos;ll generate optimized prompts for Suno AI.
          A human operator will generate the tracks and upload them for your review.
        </p>
      </div>
      <MusicGeneratorForm />
    </div>
  );
}

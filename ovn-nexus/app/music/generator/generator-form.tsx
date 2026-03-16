"use client";

import { useState } from "react";
import { Music, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PromptCard } from "@/components/music/prompt-card";
import { MOODS, GENRES, INSTRUMENTATIONS, USE_CASE_LABELS } from "@/lib/music/constants";
import type { MusicRequest, MusicUseCase, MusicTempo, MusicVoiceType, MusicLyricsMode } from "@/lib/music/types";

export function MusicGeneratorForm() {
  const [title, setTitle] = useState("");
  const [useCase, setUseCase] = useState<MusicUseCase>("background_music");
  const [mood, setMood] = useState("");
  const [genre, setGenre] = useState("");
  const [tempo, setTempo] = useState<MusicTempo>("medium");
  const [instrumentation, setInstrumentation] = useState("");
  const [voiceType, setVoiceType] = useState<MusicVoiceType>("instrumental");
  const [lyricsMode, setLyricsMode] = useState<MusicLyricsMode>("none");
  const [lyricsText, setLyricsText] = useState("");
  const [promptNotes, setPromptNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<MusicRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        title,
        use_case: useCase,
        mood,
        genre,
        tempo,
        voice_type: voiceType,
        lyrics_mode: lyricsMode,
      };
      if (instrumentation) body.instrumentation = instrumentation;
      if (lyricsText && lyricsMode === "manual") body.lyrics_text = lyricsText;
      if (promptNotes) body.prompt_notes = promptNotes;
      if (duration) body.duration_seconds = parseInt(duration, 10);

      const res = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create request");

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Music className="h-5 w-5" />
              Request Created: {result.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your request is <strong>queued</strong>. Below are 3 optimized Suno prompts.
              An operator will generate the tracks and upload them for your review.
            </p>
            <div className="grid gap-4">
              {result.generated_prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setResult(null)}>
                Create Another
              </Button>
              <Button asChild>
                <a href="/music/library">
                  Go to Library <ArrowRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Name */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Project Name *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. OVN Research Podcast Intro"
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Use Case *</label>
              <Select value={useCase} onValueChange={(v) => setUseCase(v as MusicUseCase)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(USE_CASE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Duration (seconds)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 120"
                min={10}
                max={600}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Musical Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Musical Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mood *</label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => (
                    <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Genre *</label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g.toLowerCase()}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tempo *</label>
              <Select value={tempo} onValueChange={(v) => setTempo(v as MusicTempo)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (60-80 BPM)</SelectItem>
                  <SelectItem value="medium">Medium (90-120 BPM)</SelectItem>
                  <SelectItem value="fast">Fast (130-160 BPM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Voice Type *</label>
              <Select value={voiceType} onValueChange={(v) => setVoiceType(v as MusicVoiceType)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instrumental">Instrumental Only</SelectItem>
                  <SelectItem value="male">Male Vocals</SelectItem>
                  <SelectItem value="female">Female Vocals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Instrumentation</label>
              <Select value={instrumentation} onValueChange={setInstrumentation}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any</SelectItem>
                  {INSTRUMENTATIONS.map((inst) => (
                    <SelectItem key={inst} value={inst.toLowerCase()}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lyrics & Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lyrics & Additional Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Lyrics Mode</label>
            <Select value={lyricsMode} onValueChange={(v) => setLyricsMode(v as MusicLyricsMode)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Lyrics</SelectItem>
                <SelectItem value="auto">Auto-Generate Lyrics</SelectItem>
                <SelectItem value="manual">I&apos;ll Write Lyrics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {lyricsMode === "manual" && (
            <div>
              <label className="text-sm font-medium">Lyrics</label>
              <textarea
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                placeholder="Enter your lyrics here..."
                rows={4}
                className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Prompt Notes</label>
            <p className="text-xs text-muted-foreground mb-1">
              Any special instructions for the music generation (e.g. &quot;build to a crescendo at 0:45&quot;)
            </p>
            <textarea
              value={promptNotes}
              onChange={(e) => setPromptNotes(e.target.value)}
              placeholder="Additional notes for the AI..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting || !title || !mood || !genre}>
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Music className="h-4 w-4" />
        )}
        {submitting ? "Generating Prompts..." : "Generate Suno Prompts"}
      </Button>
    </form>
  );
}

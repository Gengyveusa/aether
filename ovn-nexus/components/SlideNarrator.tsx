'use client';

import { useState } from 'react';

interface SlideNarratorProps {
  /** Optional pre-loaded slide image URL or File */
  initialSlide?: string | File;
  /** Narrator voice (default: 'eryn') */
  narrator?: 'eryn' | 'peter' | 'both';
  /** Teaching style */
  style?: 'didactic' | 'case-based' | 'socratic' | 'clinical-pearls';
  /** Target audience */
  targetAudience?: 'dental-student' | 'oms-resident' | 'attending' | 'patient';
  /** Duration in seconds */
  duration?: 30 | 60 | 90 | 120;
  /** Callback when script is generated */
  onScriptGenerated?: (result: NarrationResult) => void;
  /** Callback when audio is generated */
  onAudioGenerated?: (audioUrl: string) => void;
}

interface NarrationResult {
  script: string;
  slideTitle: string;
  keyPoints: string[];
  speakers: Array<{
    speaker: string;
    voiceId: string;
    text: string;
  }>;
  estimatedDuration: number;
}

/**
 * SlideNarrator - Slide-to-Narration Component
 *
 * Upload a slide → GPT-4o Vision reads it → generates narration script
 * with [audio tags] → optionally renders expressive audio via ElevenLabs.
 *
 * Usage:
 *   <SlideNarrator
 *     narrator="eryn"
 *     style="case-based"
 *     targetAudience="oms-resident"
 *     duration={60}
 *     onScriptGenerated={(result) => console.log(result)}
 *   />
 */
export function SlideNarrator({
  initialSlide,
  narrator = 'eryn',
  style = 'didactic',
  targetAudience = 'oms-resident',
  duration = 60,
  onScriptGenerated,
  onAudioGenerated,
}: SlideNarratorProps) {
  const [slideFile, setSlideFile] = useState<File | null>(null);
  const [slidePreview, setSlidePreview] = useState<string | null>(
    typeof initialSlide === 'string' ? initialSlide : null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [result, setResult] = useState<NarrationResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPEG, WebP, etc.)');
      return;
    }

    setSlideFile(file);
    setError(null);
    setResult(null);
    setAudioUrl(null);

    // Generate preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSlidePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generateScript = async () => {
    if (!slideFile && !slidePreview) {
      setError('Please upload a slide first');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const formData = new FormData();
      if (slideFile) {
        formData.append('image', slideFile);
      }

      const options = {
        narrator,
        style,
        targetAudience,
        duration,
        specialty: 'oral and maxillofacial surgery',
      };
      formData.append('options', JSON.stringify(options));

      const res = await fetch('/api/narration-script', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate script');
      }

      const data: NarrationResult = await res.json();
      setResult(data);
      if (onScriptGenerated) onScriptGenerated(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async () => {
    if (!result?.speakers) {
      setError('Generate a script first');
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setError(null);

      const res = await fetch('/api/text-to-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns: result.speakers,
          outputFormat: 'mp3_44100_128',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      if (onAudioGenerated) onAudioGenerated(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Audio generation failed';
      setError(message);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold">Slide Narrator</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a slide → GPT-4o generates teaching narration → ElevenLabs renders audio
        </p>
      </div>

      {/* Upload Section */}
      <div className="flex flex-col gap-3">
        <label className="block">
          <span className="text-sm font-medium">Upload Slide</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full mt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </label>

        {slidePreview && (
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={slidePreview}
              alt="Slide preview"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Narrator</label>
          <p className="text-sm font-medium capitalize">{narrator}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Style</label>
          <p className="text-sm font-medium">{style}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Audience</label>
          <p className="text-sm font-medium">{targetAudience.replace('-', ' ')}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Duration</label>
          <p className="text-sm font-medium">{duration}s</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={generateScript}
          disabled={isGenerating || !slideFile}
          className="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? 'Generating Script...' : 'Generate Script'}
        </button>

        {result && (
          <button
            onClick={generateAudio}
            disabled={isGeneratingAudio}
            className="flex-1 px-4 py-3 rounded-xl bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
          >
            {isGeneratingAudio ? 'Generating Audio...' : 'Generate Audio'}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 p-4 rounded-xl bg-muted">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Slide Title</h4>
            <p className="text-base font-medium mt-1">{result.slideTitle}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Key Points</h4>
            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
              {result.keyPoints.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Narration Script</h4>
            <div className="mt-2 p-3 rounded-lg bg-background border border-border text-sm font-mono whitespace-pre-wrap">
              {result.script}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Est. duration: {result.estimatedDuration}s
          </div>
        </div>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="flex flex-col gap-2">
          <h4 className="font-semibold text-sm">Generated Audio</h4>
          <audio controls src={audioUrl} className="w-full" />
          <a
            href={audioUrl}
            download="narration.mp3"
            className="text-sm text-primary hover:underline"
          >
            Download MP3
          </a>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Music, X, FileAudio, Image } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface UploadDropzoneProps {
  requestId: string;
  onUploadComplete?: (version: { id: string; version_number: number }) => void;
  className?: string;
}

export function UploadDropzone({ requestId, onUploadComplete, className }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [promptUsed, setPromptUsed] = useState("");
  const [sunoGenId, setSunoGenId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/flac", "audio/ogg"];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && AUDIO_TYPES.includes(file.type)) {
      setAudioFile(file);
      setError(null);
    } else {
      setError("Please drop an MP3, WAV, FLAC, or OGG file.");
    }
  }, []);

  const handleSubmit = async () => {
    if (!audioFile) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      if (coverFile) formData.append("cover_image", coverFile);
      if (promptUsed) formData.append("prompt_used", promptUsed);
      if (sunoGenId) formData.append("suno_generation_id", sunoGenId);

      const res = await fetch(`/api/music/${requestId}/versions`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { data } = await res.json();
      onUploadComplete?.(data);

      // Reset form
      setAudioFile(null);
      setCoverFile(null);
      setPromptUsed("");
      setSunoGenId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Audio dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => audioInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          audioFile && "border-green-500/50 bg-green-50"
        )}
      >
        <input
          ref={audioInputRef}
          type="file"
          accept=".mp3,.wav,.flac,.ogg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setAudioFile(file);
              setError(null);
            }
          }}
        />

        {audioFile ? (
          <div className="flex items-center justify-center gap-3">
            <FileAudio className="h-8 w-8 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-sm">{audioFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAudioFile(null);
              }}
              className="p-1 rounded hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">Drop audio file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">MP3, WAV, FLAC, OGG</p>
          </>
        )}
      </div>

      {/* Optional cover image */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => coverInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
        >
          <Image className="h-3 w-3" />
          {coverFile ? coverFile.name : "Add cover image (optional)"}
        </button>
        {coverFile && (
          <button onClick={() => setCoverFile(null)} className="p-1 rounded hover:bg-muted">
            <X className="h-3 w-3" />
          </button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setCoverFile(file);
          }}
        />
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Prompt used (optional)</label>
          <input
            type="text"
            value={promptUsed}
            onChange={(e) => setPromptUsed(e.target.value)}
            placeholder="Which prompt was used?"
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Suno Generation ID (optional)</label>
          <input
            type="text"
            value={sunoGenId}
            onChange={(e) => setSunoGenId(e.target.value)}
            placeholder="e.g. abc123..."
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Upload button */}
      <button
        onClick={handleSubmit}
        disabled={!audioFile || uploading}
        className={cn(
          "w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
          audioFile && !uploading
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        <Music className="h-4 w-4" />
        {uploading ? "Uploading..." : "Upload Version"}
      </button>
    </div>
  );
}

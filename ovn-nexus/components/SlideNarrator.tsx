'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Settings2, 
  Play, 
  Download, 
  Sparkles, 
  FileText, 
  Volume2, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Music4
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SlideNarratorProps {
  initialSlide?: string | File;
  narrator?: 'eryn' | 'peter' | 'both';
  style?: 'didactic' | 'case-based' | 'socratic' | 'clinical-pearls';
  targetAudience?: 'dental-student' | 'oms-resident' | 'attending' | 'patient';
  duration?: 30 | 60 | 90 | 120;
}

export function SlideNarrator({
  initialSlide,
  narrator = 'eryn',
  style = 'clinical-pearls',
  targetAudience = 'oms-resident',
  duration = 60
}: SlideNarratorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [step, setStep] = useState<'upload' | 'analyzing' | 'review' | 'audio'>('upload');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configuration states
  const [config, setConfig] = useState({
    narrator,
    style,
    targetAudience,
    duration
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep('upload');
    }
  };

  const startAnalysis = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setStep('analyzing');
    setProgress(0);
    setError(null);

    // Simulated progress for better UX
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('style', config.style);
      formData.append('targetAudience', config.targetAudience);
      formData.append('duration', String(config.duration));

      const response = await fetch('/api/narration-script', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
      setStep('review');
      setProgress(100);
    } catch (err) {
      setError('Failed to analyze slide. Please try again.');
      setStep('upload');
    } finally {
      clearInterval(interval);
      setIsAnalyzing(false);
    }
  };

  const generateAudio = async () => {
    if (!result?.script) return;

    setIsGeneratingAudio(true);
    setProgress(0);

    try {
      const response = await fetch('/api/text-to-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: result.script,
          narrator: config.narrator,
        }),
      });

      if (!response.ok) throw new Error('Audio generation failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setStep('audio');
    } catch (err) {
      setError('Failed to generate audio. Please try again.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Premium Header Decoration */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">Narration Pipeline</h3>
            <p className="text-sm text-muted-foreground">GPT-4o Vision + ElevenLabs Iconic Voices</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['upload', 'analyzing', 'review', 'audio'].map((s, i) => (
            <div 
              key={s}
              className={`h-1 w-12 rounded-full transition-colors duration-500 ${
                ['upload', 'analyzing', 'review', 'audio'].indexOf(step) >= i 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Canvas */}
        <Card className="lg:col-span-7 overflow-hidden border-2 bg-slate-950/50 backdrop-blur-sm group relative">
          {!previewUrl ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all duration-300 border-2 border-dashed border-white/10 m-4 rounded-xl group-hover:border-primary/50"
            >
              <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <p className="font-medium text-lg">Drop your slide here</p>
              <p className="text-sm text-muted-foreground mt-2">PowerPoint, PNG, or JPEG</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          ) : (
            <div className="relative aspect-video">
              <img 
                src={previewUrl} 
                alt="Slide Preview" 
                className="w-full h-full object-contain"
              />
              {step === 'analyzing' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-8 text-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                  <h4 className="text-xl font-bold text-white mb-2">Analyzing Visual Architecture</h4>
                  <p className="text-white/60 text-sm max-w-sm">GPT-4o is currently mapping the clinical logic and spatial relationships within your slide...</p>
                  <Progress value={progress} className="w-64 h-1.5 mt-6" />
                </div>
              )}
              {step === 'upload' && (
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <Button 
                    onClick={startAnalysis}
                    className="w-full gap-2 h-12 text-lg font-bold shadow-2xl shadow-primary/20"
                  >
                    <Sparkles className="w-5 h-5" />
                    Generate Narration Script
                  </Button>
                </div>
              )}
              {previewUrl && step !== 'analyzing' && (
                <button 
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Right: Controls & Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Configuration Panel */}
          <Card className="p-6 border-2 bg-card/50 backdrop-blur-sm">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Intelligence Config
            </h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Narrator Profile</label>
                  <Select 
                    value={config.narrator} 
                    onValueChange={(v:any) => setConfig({...config, narrator: v})}
                  >
                    <SelectTrigger className="h-10 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eryn">Eryn (Professional)</SelectItem>
                      <SelectItem value="peter">Peter (Academic)</SelectItem>
                      <SelectItem value="both">Dialogue (Duo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Teaching Style</label>
                  <Select 
                    value={config.style} 
                    onValueChange={(v:any) => setConfig({...config, style: v})}
                  >
                    <SelectTrigger className="h-10 bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinical-pearls">Clinical Pearls</SelectItem>
                      <SelectItem value="didactic">Didactic</SelectItem>
                      <SelectItem value="socratic">Socratic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Target Audience</label>
                <Select 
                  value={config.targetAudience} 
                  onValueChange={(v:any) => setConfig({...config, targetAudience: v})}
                >
                  <SelectTrigger className="h-10 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oms-resident">OMS Resident</SelectItem>
                    <SelectItem value="attending">Attending Surgeon</SelectItem>
                    <SelectItem value="dental-student">Dental Student</SelectItem>
                    <SelectItem value="patient">Patient Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Result Display */}
          {result && (
            <Card className="p-6 border-2 border-primary/20 bg-primary/5 relative overflow-hidden animate-in slide-in-from-right duration-500">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <FileText className="w-12 h-12" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Badge variant="outline" className="mb-2 bg-primary/10 text-primary border-primary/20">
                    Script Ready
                  </Badge>
                  <h4 className="text-xl font-bold">{result.slideTitle}</h4>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    "{result.script.substring(0, 150)}..."
                  </p>
                </div>

                {step === 'review' && (
                  <Button 
                    onClick={generateAudio}
                    disabled={isGeneratingAudio}
                    className="w-full gap-2 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating ElevenLabs Audio...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Generate Iconic Audio
                      </>
                    )}
                  </Button>
                )}

                {audioUrl && (
                  <div className="space-y-4 pt-4 border-t border-primary/10 animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-primary flex items-center gap-1">
                        <Music4 className="w-3 h-3" />
                        Final Production
                      </span>
                      <a 
                        href={audioUrl} 
                        download="narration.mp3"
                        className="text-xs flex items-center gap-1 hover:underline text-primary"
                      >
                        <Download className="w-3 h-3" />
                        Download MP3
                      </a>
                    </div>
                    <audio controls src={audioUrl} className="w-full h-10 custom-audio-player" />
                  </div>
                )}
              </div>
            </Card>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

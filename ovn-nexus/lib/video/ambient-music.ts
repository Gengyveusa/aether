// ── Client-Side Ambient Music Generator ─────────────────────────────────────
// Generates looping background music using the Web Audio API.
// Each template mood creates a different tonal atmosphere — no external API needed.

export interface AmbientConfig {
  preset: string;
  volume: number;
}

interface OscillatorVoice {
  osc: OscillatorNode;
  gain: GainNode;
}

export class AmbientMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private voices: OscillatorVoice[] = [];
  private lfo: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private isPlaying = false;
  private _volume = 0.15;

  constructor() {}

  get playing() {
    return this.isPlaying;
  }

  /**
   * Start ambient music for the given template preset.
   */
  async start(preset: string, volume: number = 0.15) {
    if (this.isPlaying) this.stop();

    this._volume = volume;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Fade in over 2 seconds
    this.masterGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2);

    const config = PRESETS[preset] || PRESETS["cinematic-dark"];
    this.buildPad(config);
    this.isPlaying = true;
  }

  /**
   * Stop with a gentle fade out.
   */
  stop() {
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0, now + 1);

    setTimeout(() => {
      this.voices.forEach((v) => {
        try { v.osc.stop(); } catch {}
      });
      this.voices = [];
      try { this.lfo?.stop(); } catch {}
      try { this.noiseNode?.stop(); } catch {}
      this.lfo = null;
      this.noiseNode = null;
      try { this.ctx?.close(); } catch {}
      this.ctx = null;
      this.masterGain = null;
      this.isPlaying = false;
    }, 1100);
  }

  /**
   * Set volume (0-1).
   */
  setVolume(v: number) {
    this._volume = v;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(v, this.ctx.currentTime + 0.1);
    }
  }

  /**
   * Mute/unmute.
   */
  setMuted(muted: boolean) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.linearRampToValueAtTime(
        muted ? 0 : this._volume,
        this.ctx.currentTime + 0.1
      );
    }
  }

  // ── Internal ────────────────────────────────────────────────

  private buildPad(config: PadConfig) {
    if (!this.ctx || !this.masterGain) return;

    // Create pad voices (detuned oscillators for richness)
    for (const note of config.notes) {
      const freq = noteToFreq(note);

      // Main oscillator
      this.addVoice(freq, config.waveform, 0.3);
      // Detuned +7 cents for chorus
      this.addVoice(freq * Math.pow(2, 7 / 1200), config.waveform, 0.15);
      // Detuned -7 cents
      this.addVoice(freq * Math.pow(2, -7 / 1200), config.waveform, 0.15);
      // Sub octave (very quiet)
      this.addVoice(freq / 2, "sine", 0.1);
    }

    // LFO for gentle movement
    this.lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    this.lfo.frequency.setValueAtTime(config.lfoRate, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(config.lfoDepth, this.ctx.currentTime);
    this.lfo.connect(lfoGain);

    // Connect LFO to each voice's gain
    for (const voice of this.voices) {
      lfoGain.connect(voice.gain.gain);
    }
    this.lfo.start();

    // Optional filtered noise layer for texture
    if (config.noiseLevel > 0) {
      this.addNoise(config.noiseLevel, config.noiseFilterFreq);
    }
  }

  private addVoice(freq: number, waveform: OscillatorType, level: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(level, this.ctx.currentTime);

    // Low-pass filter to soften the tone
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start();

    this.voices.push({ osc, gain });
  }

  private addNoise(level: number, filterFreq: number) {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(level, this.ctx.currentTime);

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    this.noiseNode.start();
  }
}

// ── Preset Configurations ────────────────────────────────────────────────────

interface PadConfig {
  notes: string[];
  waveform: OscillatorType;
  lfoRate: number;
  lfoDepth: number;
  noiseLevel: number;
  noiseFilterFreq: number;
}

const PRESETS: Record<string, PadConfig> = {
  documentary: {
    // Warm, cinematic — D minor 7th spread voicing
    notes: ["D2", "A2", "F3", "C4", "E4"],
    waveform: "sine",
    lfoRate: 0.08,
    lfoDepth: 0.03,
    noiseLevel: 0.02,
    noiseFilterFreq: 400,
  },
  "cinematic-dark": {
    // Dark, tension — C minor cluster
    notes: ["C2", "G2", "Eb3", "Bb3", "D4"],
    waveform: "triangle",
    lfoRate: 0.05,
    lfoDepth: 0.04,
    noiseLevel: 0.03,
    noiseFilterFreq: 300,
  },
  "modern-minimal": {
    // Clean, corporate — C major 9th open voicing
    notes: ["C3", "G3", "E4", "D5"],
    waveform: "sine",
    lfoRate: 0.12,
    lfoDepth: 0.02,
    noiseLevel: 0.01,
    noiseFilterFreq: 600,
  },
  "science-journal": {
    // Thoughtful, academic — A minor 7th
    notes: ["A2", "E3", "G3", "C4", "B4"],
    waveform: "sine",
    lfoRate: 0.06,
    lfoDepth: 0.02,
    noiseLevel: 0.015,
    noiseFilterFreq: 500,
  },
  "impact-story": {
    // Epic, driving — D power chords with tension
    notes: ["D2", "A2", "D3", "F3", "A3", "C4"],
    waveform: "sawtooth",
    lfoRate: 0.1,
    lfoDepth: 0.05,
    noiseLevel: 0.04,
    noiseFilterFreq: 350,
  },
};

// ── Utility ──────────────────────────────────────────────────────────────────

const NOTE_FREQ: Record<string, number> = {
  C2: 65.41, D2: 73.42, Eb2: 77.78, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, Eb3: 155.56, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, Eb4: 311.13, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26,
};

function noteToFreq(note: string): number {
  return NOTE_FREQ[note] || 220;
}

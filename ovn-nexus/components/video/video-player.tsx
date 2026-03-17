"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";
import { IntroScene, SlideScene, OutroScene } from "./cinematic-scenes";

// ── Types ────────────────────────────────────────────────────────────────────

interface VideoSlide {
  index: number;
  title: string;
  body: string;
  imageUrl?: string;
  duration: number; // seconds
  audioUrl?: string;
  narrationScript?: string;

}

interface VideoData {
  title: string;
  subtitle?: string;
  author?: string;
  slides: VideoSlide[];
  musicUrl?: string;
  videoUrl?: string; // if pre-rendered MP4 is available
  template: {
    preset: string;
    style: {
      backgroundColor: string;
      textColor: string;
      accentColor: string;
      fontFamily: string;
      overlayOpacity: number;
    };
    timing: {
      introDurationSec: number;
      outroDurationSec: number;
      transitionDurationSec: number;
    };
    music: {
      volume: number;
    };
  };
}

interface CinematicPlayerProps {
  data: VideoData;
  autoPlay?: boolean;
  className?: string;
}

// ── Cinematic Video Player ───────────────────────────────────────────────────
// A React-based presentation player that renders slides with cinematic
// animations, synchronized narration, and background music.
// Falls back to native <video> if a pre-rendered MP4 is available.

export function CinematicPlayer({ data, autoPlay = false, className = "" }: CinematicPlayerProps) {
  // If we have a pre-rendered video, use native player
  if (data.videoUrl) {
    return <NativeVideoPlayer src={data.videoUrl} className={className} autoPlay={autoPlay} />;
  }

  return <SlidePlayer data={data} autoPlay={autoPlay} className={className} />;
}

// ── Native Video Player (for pre-rendered MP4) ───────────────────────────────

function NativeVideoPlayer({
  src,
  className,
  autoPlay,
}: {
  src: string;
  className: string;
  autoPlay: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div
      className={`relative group bg-black rounded-xl overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        onClick={togglePlay}
      />

      {/* Controls overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0 }}
      >
        {/* Progress bar */}
        <div
          className="h-1 cursor-pointer mx-4"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          onClick={(e) => {
            const video = videoRef.current;
            if (!video) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            video.currentTime = pct * video.duration;
          }}
        >
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="text-white hover:text-white/80">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-white/80">
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          <button onClick={toggleFullscreen} className="text-white hover:text-white/80">
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Slide-Based Player (real-time rendering) ─────────────────────────────────

function SlidePlayer({ data, autoPlay, className }: CinematicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const narrationRef = useRef<HTMLAudioElement | null>(null);
  const activeNarrationIndex = useRef<number>(-1);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const narrationActiveRef = useRef(false);
  const slideEndTimeRef = useRef<number>(Infinity);

  const { style, timing } = data.template;

  // Build timeline
  const timeline = buildTimeline(data);
  const totalDuration = timeline.totalDuration;

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return;

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prev) => {
                const rawNext = prev + delta;
        const next = rawNext > slideEndTimeRef.current
              ? slideEndTimeRef.current
              : rawNext;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return totalDuration;
        }
        return next;
      });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isPlaying, totalDuration]);

  // Sync music playback
  useEffect(() => {
    if (!data.musicUrl || !musicRef.current) return;
    const audio = musicRef.current;
    audio.volume = data.template.music.volume;
    audio.muted = isMuted;

    if (isPlaying) {
      audio.currentTime = currentTime;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, isMuted, data.musicUrl, data.template.music.volume, currentTime]);

  // Sync per-slide narration audio
  useEffect(() => {
    const scene = getCurrentScene(timeline, currentTime);
    const slideIndex = scene?.slide?.index ?? -1;
    const audioUrl = scene?.slide?.audioUrl;

    // If we moved to a different slide, switch narration
    if (slideIndex !== activeNarrationIndex.current) {
      activeNarrationIndex.current = slideIndex;

      // Stop current narration
      if (narrationRef.current) {
        narrationRef.current.pause();
        narrationRef.current.src = "";
        narrationActiveRef.current = false;
      }

      // Start new narration if available
      if (audioUrl && isPlaying) {
        const audio = narrationRef.current || new Audio();
        narrationRef.current = audio;
        audio.src = audioUrl;
        audio.volume = 1.0;
        audio.muted = isMuted;
        audio.play().catch(() => {});
        narrationActiveRef.current = true;
      slideEndTimeRef.current = (scene?.startTime ?? 0) + (scene?.duration ?? Infinity);
      audio.onended = () => { narrationActiveRef.current = false; };
      }
    }

    // Handle play/pause state changes on the current narration
    if (narrationRef.current && narrationRef.current.src) {
      narrationRef.current.muted = isMuted;
      if (isPlaying && narrationRef.current.paused) {
        narrationRef.current.play().catch(() => {});
      } else if (!isPlaying && !narrationRef.current.paused) {
        narrationRef.current.pause();
      }
    }
  }, [currentTime, isPlaying, isMuted, timeline]);

  // Cleanup narration audio on unmount
  useEffect(() => {
    return () => {
      if (narrationRef.current) {
        narrationRef.current.pause();
        narrationRef.current.src = "";
      }
    };
  }, []);

  // Determine current scene
  const currentScene = getCurrentScene(timeline, currentTime);
  const sceneProgress = currentScene
    ? (currentTime - currentScene.startTime) / currentScene.duration
    : 0;

  const togglePlay = () => setIsPlaying((p) => !p);
  const toggleMute = () => setIsMuted((m) => !m);

  const skipTo = (time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)));
    // Reset narration index so the next effect will trigger a new narration
    activeNarrationIndex.current = -1;
  };

  const progress = (currentTime / totalDuration) * 100;

  return (
    <div
      className={`relative group rounded-xl overflow-hidden select-none ${className}`}
      style={{ backgroundColor: style.backgroundColor, aspectRatio: "16/9" }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Audio elements */}
      {data.musicUrl && (
        <audio ref={musicRef} src={data.musicUrl} loop preload="auto" />
      )}

      {/* Scene renderer */}
      <div className="absolute inset-0">
        {currentScene?.type === "intro" && (
          <IntroScene
            title={data.title}
            subtitle={data.subtitle}
            author={data.author}
            style={style}
            progress={sceneProgress}
          />
        )}

        {currentScene?.type === "slide" && currentScene.slide && (
          <SlideScene
            slideIndex={currentScene.slide.index}
            title={currentScene.slide.title}
            body={currentScene.slide.body}
            imageUrl={currentScene.slide.imageUrl}
            style={style}
            progress={sceneProgress}
            transition="fade"
          />
        )}

        {currentScene?.type === "outro" && (
          <OutroScene
            title={data.title}
            author={data.author}
            style={style}
            progress={sceneProgress}
          />
        )}
      </div>

      {/* Play button overlay (when paused) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
          onClick={togglePlay}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{
              backgroundColor: `${style.accentColor}dd`,
            }}
          >
            <Play className="h-8 w-8 ml-1" style={{ color: style.backgroundColor }} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0 }}
      >
        {/* Progress bar */}
        <div className="px-4 pb-1">
          <div
            className="h-1.5 rounded-full cursor-pointer relative"
            style={{ backgroundColor: `${style.textColor}20` }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              skipTo(pct * totalDuration);
            }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: style.accentColor,
              }}
            />
            {/* Scene markers */}
            {timeline.scenes
              .filter((s) => s.type === "slide")
              .map((s, i) => (
                <div
                  key={i}
                  className="absolute top-0 w-0.5 h-full"
                  style={{
                    left: `${(s.startTime / totalDuration) * 100}%`,
                    backgroundColor: `${style.textColor}30`,
                  }}
                />
              ))}
          </div>
        </div>

        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ backgroundColor: `${style.backgroundColor}cc` }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => skipTo(currentTime - 5)}
              style={{ color: style.textColor }}
              className="opacity-70 hover:opacity-100"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button onClick={togglePlay} style={{ color: style.textColor }}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={() => skipTo(currentTime + 5)}
              style={{ color: style.textColor }}
              className="opacity-70 hover:opacity-100"
            >
              <SkipForward className="h-4 w-4" />
            </button>
            <button
              onClick={toggleMute}
              style={{ color: style.textColor }}
              className="opacity-70 hover:opacity-100"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          {/* Time display */}
          <div
            className="text-xs font-mono"
            style={{ color: style.textColor, opacity: 0.6 }}
          >
            {formatTime(currentTime)} / {formatTime(totalDuration)}
          </div>

          <button
            onClick={() => {
              const el = document.querySelector("[data-cinematic-player]");
              if (el) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  (el as HTMLElement).requestFullscreen();
                }
              }
            }}
            style={{ color: style.textColor }}
            className="opacity-70 hover:opacity-100"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Timeline Utilities ───────────────────────────────────────────────────────

interface TimelineScene {
  type: "intro" | "slide" | "outro";
  startTime: number;
  duration: number;
  slide?: VideoSlide;
}

interface Timeline {
  scenes: TimelineScene[];
  totalDuration: number;
}

function buildTimeline(data: VideoData): Timeline {
  const { timing } = data.template;
  const scenes: TimelineScene[] = [];
  let currentTime = 0;

  // Intro
  scenes.push({
    type: "intro",
    startTime: currentTime,
    duration: timing.introDurationSec,
  });
  currentTime += timing.introDurationSec;

  // Slides
  for (const slide of data.slides) {
    scenes.push({
      type: "slide",
      startTime: currentTime,
      duration: slide.duration,
      slide,
    });
    currentTime += slide.duration;
  }

  // Outro
  scenes.push({
    type: "outro",
    startTime: currentTime,
    duration: timing.outroDurationSec,
  });
  currentTime += timing.outroDurationSec;

  return { scenes, totalDuration: currentTime };
}

function getCurrentScene(timeline: Timeline, time: number): TimelineScene | null {
  for (const scene of timeline.scenes) {
    if (time >= scene.startTime && time < scene.startTime + scene.duration) {
      return scene;
    }
  }
  return timeline.scenes[timeline.scenes.length - 1] || null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type { VideoData, VideoSlide };

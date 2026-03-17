"use client";

import React from "react";

// ── Cinematic Scene Components ───────────────────────────────────────────────
// These React components define the visual composition for each scene type.
// Used both by Remotion (for rendering) and the web player (for preview).

interface SceneStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  overlayOpacity: number;
}

// ── Intro Scene ──────────────────────────────────────────────────────────────

interface IntroSceneProps {
  title: string;
  subtitle?: string;
  author?: string;
  style: SceneStyle;
  progress: number; // 0-1, animation progress
}

export function IntroScene({ title, subtitle, author, style, progress }: IntroSceneProps) {
  const titleOpacity = Math.min(progress * 3, 1);
  const titleY = 30 * (1 - Math.min(progress * 2, 1));
  const subtitleOpacity = Math.max(0, Math.min((progress - 0.3) * 3, 1));
  const authorOpacity = Math.max(0, Math.min((progress - 0.5) * 3, 1));
  const lineWidth = Math.min(progress * 2, 1) * 120;

  return (
    <div
      className="relative flex items-center justify-center w-full h-full overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        fontFamily: style.fontFamily,
      }}
    >
      {/* Animated gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${50 + Math.sin(progress * Math.PI) * 20}% ${50 + Math.cos(progress * Math.PI) * 10}%, ${style.accentColor}15, transparent 70%)`,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              backgroundColor: style.accentColor,
              opacity: 0.1 + (i % 5) * 0.05,
              left: `${(i * 17 + progress * 100) % 100}%`,
              top: `${(i * 23 + progress * 50) % 100}%`,
              transform: `translateY(${Math.sin(progress * Math.PI * 2 + i) * 20}px)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-16 max-w-4xl">
        {/* Title */}
        <h1
          className="text-6xl font-bold leading-tight tracking-tight"
          style={{
            color: style.textColor,
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            transition: "none",
          }}
        >
          {title}
        </h1>

        {/* Accent line */}
        <div className="flex justify-center my-8">
          <div
            style={{
              width: lineWidth,
              height: 3,
              backgroundColor: style.accentColor,
              borderRadius: 2,
            }}
          />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-2xl leading-relaxed"
            style={{
              color: style.textColor,
              opacity: subtitleOpacity * 0.8,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Author */}
        {author && (
          <p
            className="mt-8 text-lg tracking-widest uppercase"
            style={{
              color: style.accentColor,
              opacity: authorOpacity * 0.7,
            }}
          >
            {author}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Slide Scene ──────────────────────────────────────────────────────────────

interface SlideSceneProps {
  slideIndex: number;
  title: string;
  body: string;
  imageUrl?: string;
  style: SceneStyle;
  progress: number;
  transition: string;
}

export function SlideScene({
  slideIndex,
  title,
  body,
  imageUrl,
  style,
  progress,
  transition,
}: SlideSceneProps) {
  const contentOpacity = Math.min(progress * 4, 1);
  const kenBurnsScale = 1 + progress * 0.08;
  const kenBurnsX = Math.sin(progress * Math.PI) * 3;
  const kenBurnsY = Math.cos(progress * Math.PI) * 2;

  // Transition effects
  let transformStyle = {};
  switch (transition) {
    case "slide-left":
      transformStyle = {
        transform: `translateX(${(1 - Math.min(progress * 3, 1)) * 100}px)`,
      };
      break;
    case "zoom-in":
      const zoomScale = 0.9 + Math.min(progress * 3, 1) * 0.1;
      transformStyle = { transform: `scale(${zoomScale})` };
      break;
    case "cinematic-wipe":
      transformStyle = {
        clipPath: `inset(0 ${(1 - Math.min(progress * 2, 1)) * 100}% 0 0)`,
      };
      break;
    default:
      break;
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        fontFamily: style.fontFamily,
        opacity: contentOpacity,
        ...transformStyle,
      }}
    >
      {/* Slide image with Ken Burns effect */}
      {imageUrl ? (
        <div className="absolute inset-0">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${kenBurnsScale}) translate(${kenBurnsX}%, ${kenBurnsY}%)`,
            }}
          />
          {/* Dark overlay for readability */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: style.backgroundColor,
              opacity: style.overlayOpacity,
            }}
          />
        </div>
      ) : (
        /* Text-only layout when no image */
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="max-w-4xl w-full">
            {/* Slide number indicator */}
            <div
              className="text-sm font-mono mb-6 tracking-widest"
              style={{ color: style.accentColor, opacity: 0.6 }}
            >
              {String(slideIndex + 1).padStart(2, "0")}
            </div>

            {/* Title */}
            <h2
              className="text-5xl font-bold leading-tight mb-8"
              style={{ color: style.textColor }}
            >
              {title}
            </h2>

            {/* Accent line */}
            <div
              className="mb-8"
              style={{
                width: Math.min(progress * 3, 1) * 80,
                height: 2,
                backgroundColor: style.accentColor,
              }}
            />

            {/* Body text */}
            {body && (
              <div
                className="text-xl leading-relaxed space-y-3"
                style={{
                  color: style.textColor,
                  opacity: Math.max(0, Math.min((progress - 0.2) * 3, 0.85)),
                }}
              >
                {body.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom caption overlay (for image slides) */}
      {imageUrl && (
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div
            className="rounded-xl p-8"
            style={{
              backgroundColor: `${style.backgroundColor}cc`,
              backdropFilter: "blur(20px)",
            }}
          >
            <h2
              className="text-3xl font-bold mb-3"
              style={{ color: style.textColor }}
            >
              {title}
            </h2>
            </div>
        </div>
      )}
    </div>
  );
}

// ── Outro Scene ──────────────────────────────────────────────────────────────

interface OutroSceneProps {
  title: string;
  author?: string;
  style: SceneStyle;
  progress: number;
}

export function OutroScene({ title, author, style, progress }: OutroSceneProps) {
  const fadeIn = Math.min(progress * 3, 1);
  const fadeOut = progress > 0.7 ? Math.max(0, 1 - (progress - 0.7) * 3.3) : 1;
  const opacity = fadeIn * fadeOut;

  return (
    <div
      className="relative flex items-center justify-center w-full h-full"
      style={{
        backgroundColor: style.backgroundColor,
        fontFamily: style.fontFamily,
      }}
    >
      <div className="text-center" style={{ opacity }}>
        {/* OVN Nexus branding */}
        <div
          className="inline-flex items-center gap-3 mb-10 px-6 py-3 rounded-full"
          style={{
            border: `1px solid ${style.accentColor}40`,
            backgroundColor: `${style.accentColor}10`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{
              backgroundColor: style.accentColor,
              color: style.backgroundColor,
            }}
          >
            OVN
          </div>
          <span
            className="text-lg font-semibold"
            style={{ color: style.textColor }}
          >
            Nexus
          </span>
        </div>

        <h2
          className="text-4xl font-bold mb-4"
          style={{ color: style.textColor }}
        >
          {title}
        </h2>

        {author && (
          <p
            className="text-xl mt-6"
            style={{ color: style.accentColor, opacity: 0.8 }}
          >
            {author}
          </p>
        )}

        <p
          className="mt-10 text-sm tracking-widest uppercase"
          style={{ color: style.textColor, opacity: 0.4 }}
        >
          ovnnexus.com
        </p>
      </div>
    </div>
  );
}

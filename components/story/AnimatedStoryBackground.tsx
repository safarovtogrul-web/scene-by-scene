"use client";

import { useEffect, useRef, useState } from "react";

import { FloatingStoryCard } from "./FloatingStoryCard";
import { AmbientGlow } from "./AmbientGlow";
import {
  MOBILE_TIMINGS,
  type FeaturePhase,
  type FeaturedSlot,
} from "./heroFeature";
import { heroArtwork } from "@/lib/catalog/heroArtwork";
import { cn } from "@/lib/cn";

/**
 * Compact collage used behind the mobile hero and inside the phone mockups.
 *
 * Same independent-layer model as the desktop scene, re-composed for a tall
 * viewport: five unrelated worlds bleed off the edges so the screen reads as a
 * window into the whole library rather than one story. No pointer parallax
 * here (touch devices), only the ambient drift.
 */
const COLLAGE_LAYOUT = [
  {
    storyId: "neon-nights",
    left: 3,
    top: 18,
    rotate: -8,
    depth: 0.5,
    driftX: -7,
    driftY: 10,
    rotateAmplitude: 0.7,
    durationX: 33,
    durationY: 25,
    durationRotate: 47,
    delay: 2,
  },
  {
    storyId: "the-giants-forest",
    left: 60,
    top: 22,
    rotate: 7,
    depth: 0.34,
    driftX: 9,
    driftY: -12,
    rotateAmplitude: 0.6,
    durationX: 41,
    durationY: 29,
    durationRotate: 53,
    delay: 11,
  },
  {
    storyId: "the-last-train",
    left: 3,
    top: 45,
    rotate: 5,
    depth: 0.42,
    driftX: 8,
    driftY: -14,
    rotateAmplitude: 0.8,
    durationX: 27,
    durationY: 36,
    durationRotate: 44,
    delay: 6,
    priority: true,
  },
  {
    storyId: "coffee-for-two",
    left: 58,
    top: 43,
    rotate: -6,
    depth: 0.56,
    driftX: -10,
    driftY: 12,
    rotateAmplitude: 0.75,
    durationX: 35,
    durationY: 22,
    durationRotate: 51,
    delay: 16,
    priority: true,
  },
  {
    storyId: "the-quiet-woods",
    left: 30,
    top: 62,
    rotate: -4,
    depth: 0.68,
    driftX: 11,
    driftY: 13,
    rotateAmplitude: 0.65,
    durationX: 24,
    durationY: 38,
    durationRotate: 43,
    delay: 20,
    priority: true,
  },
] as const;

/** Every card in the curated mobile gallery takes a turn in the same frame. */
const FEATURE_ORDER = [
  "the-last-train",
  "coffee-for-two",
  "the-quiet-woods",
  "neon-nights",
  "the-giants-forest",
] as const;

export const MOBILE_FEATURE_COUNT = FEATURE_ORDER.length;

/**
 * The foreground presentation gets its own stage between the compacted copy
 * and CTA. It stays large enough to read as the focal story without filling
 * the full phone width.
 */
const MOBILE_CARD_FRAME = { width: 40, aspect: 1.15 } as const;

/** One canonical presentation frame: every mobile story resolves here. */
const MOBILE_FEATURED_TARGET: FeaturedSlot = {
  centerX: 50,
  centerY: 54,
  width: 70,
  straighten: true,
};

/** No point on the foreground orbit may put the card above this hero-relative line. */
const FEATURED_STAGE_TOP = 10;

/** Shorter arcs than desktop: a tall viewport makes vertical bow expensive. */
const FEATURE_BOW = { out: 9, back: 7 };

/** Resting cards < scrims (40) < copy (50) < active card (60). */
const FEATURE_Z = 60;

/** 390 × 844, used until the real box is measured. */
const FALLBACK_ASPECT = 390 / 844;

export function AnimatedStoryBackground({
  className,
  /** How hard the artwork is pushed behind the UI. */
  dim = "strong",
  /** Static preview surfaces (the landing-page phone mockups) opt out. */
  feature = true,
  /** Shared with the mobile copy so layout and card motion change together. */
  sequence,
}: {
  className?: string;
  dim?: "strong" | "soft";
  feature?: boolean;
  sequence?: { activeIndex: number; phase: FeaturePhase };
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [sceneAspect, setSceneAspect] = useState(FALLBACK_ASPECT);

  // The collage fills whatever it is dropped into, so unlike the fixed 7:6
  // desktop scene its ratio has to be measured for the orbit maths.
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSceneAspect(width / height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const activeIndex = feature ? (sequence?.activeIndex ?? -1) : -1;
  const phase = feature ? (sequence?.phase ?? "resting") : "resting";

  const activeStoryId = activeIndex >= 0 ? FEATURE_ORDER[activeIndex] : null;
  const presenting = activeStoryId !== null && phase !== "resting";

  return (
    <div
      ref={frame}
      aria-hidden
      data-story-scene={feature ? "mobile-hero" : "static-preview"}
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <AmbientGlow />

      <div className="absolute inset-0">
        {COLLAGE_LAYOUT.map((card) => (
          <FloatingStoryCard
            key={card.storyId}
            {...card}
            width={MOBILE_CARD_FRAME.width}
            aspect={MOBILE_CARD_FRAME.aspect}
            artwork={heroArtwork(card.storyId)}
            slot={card.storyId}
            sizes="80vw"
            feature={{
              phase: card.storyId === activeStoryId ? phase : "resting",
              dimmed: presenting && card.storyId !== activeStoryId,
              slot: MOBILE_FEATURED_TARGET,
              sceneAspect,
              timings: MOBILE_TIMINGS,
              frontZ: FEATURE_Z,
              enhanceForeground: true,
              // The collage is placed exactly; drifting would unsettle it.
              pauseDrift: true,
              bow: FEATURE_BOW,
              minTop: FEATURED_STAGE_TOP,
            }}
          />
        ))}
      </div>

      {/* Legibility stack — the UI on top must never fight the artwork.
       * Opaque where the branding sits, thinnest through the middle band so
       * the story worlds stay clearly readable, dark again under the CTA. */}
      <div
        className="absolute inset-0 z-40"
        style={{
          background:
            dim === "strong"
              ? "linear-gradient(to bottom, rgba(4,3,12,0.96) 0%, rgba(4,3,12,0.8) 14%, rgba(4,3,12,0.5) 34%, rgba(4,3,12,0.45) 62%, rgba(4,3,12,0.86) 87%, #04030c 100%)"
              : "linear-gradient(to bottom, rgba(4,3,12,0.86) 0%, rgba(4,3,12,0.5) 45%, rgba(4,3,12,0.8) 100%)",
        }}
      />
      <div className="absolute inset-0 z-40 bg-[radial-gradient(72%_40%_at_50%_30%,rgba(4,3,12,0.85),transparent_78%)]" />
    </div>
  );
}

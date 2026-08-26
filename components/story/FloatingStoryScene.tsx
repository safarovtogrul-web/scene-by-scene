"use client";

import { FloatingStoryCard } from "./FloatingStoryCard";
import {
  DESKTOP_TIMINGS,
  useFeatureSequence,
  type FeaturedSlot,
} from "./heroFeature";
import { usePointerParallax } from "@/lib/usePointerParallax";
import { requireStory } from "@/lib/catalog";
import { cn } from "@/lib/cn";

/**
 * Desktop hero composition.
 *
 * Every entry is one independent card layer. All geometry is expressed as a
 * percentage of the scene box (which keeps a fixed 7:6 aspect), so the whole
 * arrangement scales as one piece from 1024px to ultra-wide without retuning.
 *
 * Durations are intentionally spread and non-multiple (17…59s) and every card
 * carries its own negative delay, so no two cards ever share a phase.
 *
 * The `storyId`s point at real catalogue entries — the artwork these cards show
 * is whatever cover that story currently has, so replacing placeholder art
 * updates the hero automatically.
 */
const CARD_LAYOUT = [
  {
    storyId: "the-last-train",
    left: -1,
    top: 1.3,
    width: 32,
    aspect: 1.12,
    rotate: -9,
    tiltY: 6,
    depth: 0.86,
    driftX: -13,
    driftY: 17,
    rotateAmplitude: 1,
    durationX: 23,
    durationY: 31,
    durationRotate: 41,
    delay: 0,
    priority: true,
  },
  {
    storyId: "coffee-for-two",
    left: 49,
    top: -1.6,
    width: 28,
    aspect: 1.12,
    rotate: -7,
    tiltY: -6,
    depth: 0.44,
    driftX: -8,
    driftY: -12,
    rotateAmplitude: 0.7,
    durationX: 43,
    durationY: 26,
    durationRotate: 47,
    delay: 12,
  },
  {
    storyId: "the-giants-forest",
    left: 21,
    top: 24.6,
    width: 30,
    aspect: 1.14,
    rotate: 4,
    tiltY: -4,
    depth: 0.58,
    driftX: 11,
    driftY: -14,
    rotateAmplitude: 0.9,
    durationX: 29,
    durationY: 37,
    durationRotate: 53,
    delay: 5,
  },
  {
    storyId: "lost-at-sea",
    left: 74,
    top: 21,
    width: 26,
    aspect: 1.38,
    rotate: -5,
    tiltY: 5,
    depth: 0.46,
    driftX: -9,
    driftY: -15,
    rotateAmplitude: 0.75,
    durationX: 35,
    durationY: 24,
    durationRotate: 51,
    delay: 7,
  },
  {
    storyId: "the-quiet-woods",
    left: 47,
    top: 43.2,
    width: 34,
    aspect: 1.55,
    rotate: 3,
    tiltY: -3,
    depth: 0.95,
    driftX: 14,
    driftY: 12,
    rotateAmplitude: 0.8,
    durationX: 19,
    durationY: 33,
    durationRotate: 44,
    delay: 3,
    priority: true,
  },
  {
    storyId: "the-empty-house",
    left: 0,
    top: 56.3,
    width: 24,
    aspect: 1.2,
    rotate: 8,
    tiltY: 7,
    depth: 0.14,
    driftX: 6,
    driftY: -9,
    rotateAmplitude: 0.6,
    durationX: 47,
    durationY: 34,
    durationRotate: 59,
    delay: 9,
  },
  {
    storyId: "the-missing-letter",
    left: 71,
    top: 67.6,
    width: 28,
    aspect: 1.32,
    rotate: -4,
    tiltY: -5,
    depth: 0.66,
    driftX: -10,
    driftY: 13,
    rotateAmplitude: 0.65,
    durationX: 31,
    durationY: 21,
    durationRotate: 57,
    delay: 19,
  },
  {
    storyId: "neon-nights",
    left: 24,
    top: 67.8,
    width: 32,
    aspect: 1.15,
    rotate: 4,
    tiltY: 3,
    depth: 0.78,
    driftX: 12,
    driftY: -16,
    rotateAmplitude: 0.95,
    durationX: 27,
    durationY: 39,
    durationRotate: 36,
    delay: 15,
  },
] as const;

/**
 * Where a card goes when it is being presented: centred in the scene, a little
 * above the middle, and wider than any resting card without dominating the
 * hero. Shared by every card, so each one is presented at the same size.
 */
const FEATURED_SLOT: FeaturedSlot = { centerX: 50, centerY: 44, width: 52 };

/** The scene box is locked to 7:6, so vertical percentages resolve exactly. */
const SCENE_ASPECT = 7 / 6;

/**
 * The running order. Data, not animation logic — reorder this list and the
 * sequence changes; no card knows anything about its neighbours.
 */
const FEATURE_ORDER = [
  "the-last-train",
  "the-giants-forest",
  "coffee-for-two",
  "lost-at-sea",
  "the-empty-house",
  "neon-nights",
  "the-missing-letter",
  "the-quiet-woods",
] as const;

export function FloatingStoryScene({ className }: { className?: string }) {
  const parallax = usePointerParallax();
  const { activeIndex, phase } = useFeatureSequence({
    count: FEATURE_ORDER.length,
    timings: DESKTOP_TIMINGS,
  });

  const activeStoryId = activeIndex >= 0 ? FEATURE_ORDER[activeIndex] : null;
  const presenting = activeStoryId !== null && phase !== "resting";

  return (
    <div
      className={cn("relative aspect-[7/6] w-full", className)}
      aria-label="A selection of stories from the library"
      role="img"
    >
      {CARD_LAYOUT.map((card) => (
        <FloatingStoryCard
          key={card.storyId}
          {...card}
          story={requireStory(card.storyId)}
          parallax={parallax}
          feature={{
            phase: card.storyId === activeStoryId ? phase : "resting",
            dimmed: presenting && card.storyId !== activeStoryId,
            slot: FEATURED_SLOT,
            sceneAspect: SCENE_ASPECT,
            timings: DESKTOP_TIMINGS,
            // Same foreground treatment and glint set the mobile hero uses.
            enhanceForeground: true,
            // No legibility scrim here, so the resting cards carry their own
            // shade; without it a card at depth 0.95 sits at a 2% veil and is
            // already as bright as the one being presented. Held deliberately
            // deep: only the card that comes forward should read clearly.
            restingShade: 0.34,
          }}
        />
      ))}
    </div>
  );
}

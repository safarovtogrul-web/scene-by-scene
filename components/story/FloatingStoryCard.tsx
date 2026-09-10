"use client";

import Image from "next/image";
import { motion, motionValue, useTransform } from "framer-motion";
import { useMemo, type CSSProperties } from "react";

import { StorySparkles } from "./StorySparkles";
import {
  buildOrbit,
  type FeaturePhase,
  type FeatureTimings,
  type FeaturedSlot,
} from "./heroFeature";
import type { ParallaxField } from "@/lib/usePointerParallax";
import { cn } from "@/lib/cn";

/**
 * Shared, never-updated motion value used when a card is rendered without a
 * parallax field (mobile, reduced motion). Keeps the hook calls unconditional.
 */
const ZERO = motionValue(0);

/** Everything a card needs to know about the scene's featuring sequence. */
export type CardFeatureState = {
  /** This card's own phase. Cards that are not the active one get "resting". */
  phase: FeaturePhase;
  /** Another card is currently being presented. */
  dimmed: boolean;
  slot: FeaturedSlot;
  /** Scene width ÷ scene height. Vertical percentages resolve against it. */
  sceneAspect: number;
  timings: FeatureTimings;
  /**
   * Stacking level while presenting. Defaults above the greeting chips; the
   * mobile collage passes a lower value so a presented card stays behind the
   * legibility scrim and can never cover the headline or CTA.
   */
  frontZ?: number;
  /** How far the travel arcs bow away from a straight line, in scene-%. */
  bow?: { out: number; back: number };
  /**
   * Brighter, sharper foreground treatment for the presented card: the depth
   * veil clears, a highlight and violet rim fade in, and the glint set gets its
   * three extra edge sparkles. Used by both heroes.
   */
  enhanceForeground?: boolean;
  /**
   * Freezes the ambient drift and snaps the orbit at rest. The mobile collage
   * is placed exactly and must not wander; the desktop scene keeps drifting.
   */
  pauseDrift?: boolean;
  /**
   * Extra darkness on every card that is not being presented, on top of the
   * depth-derived veil. The mobile hero leaves this at 0 because its legibility
   * scrim already sits over the resting cards, and the presented card rises
   * above that scrim. The desktop scene has no scrim, so it shades its own
   * resting cards instead — otherwise a near card reads as bright as the
   * featured one and nothing appears to come forward.
   */
  restingShade?: number;
  /** Minimum top edge for the full featured orbit, as a scene percentage. */
  minTop?: number;
};

export type FloatingStoryCardProps = {
  /** Decorative artwork path. The tile is not a catalogue entry. */
  artwork: string;
  /** Layout slot id, kept for the presentation sequence. */
  slot: string;

  /* --- Placement, as a percentage of the parent scene box --- */
  left: number;
  top: number;
  /** Card width as a percentage of the scene width. */
  width: number;
  /** Width / height ratio of the card itself. */
  aspect: number;

  /* --- Static pose --- */
  /** Base 2D rotation in degrees. */
  rotate?: number;
  /** Optional 3D lean (degrees) for extra depth. Keep small. */
  tiltY?: number;
  /** 0 = far away, 1 = close to the viewer. Drives parallax + veil. */
  depth?: number;
  zIndex?: number;

  /* --- Ambient drift ---
   * Amplitudes are half-distances in px: the card travels 2× this value
   * across a full back-and-forth cycle. Signs set the drift direction. */
  driftX?: number;
  driftY?: number;
  rotateAmplitude?: number;

  /** Seconds. Give every card different, non-multiple periods. */
  durationX?: number;
  durationY?: number;
  durationRotate?: number;

  /** Seconds. Applied as a negative delay so cards start mid-cycle. */
  delay?: number;

  parallax?: ParallaxField;
  /** Omit to render a card that never takes part in the featuring sequence. */
  feature?: CardFeatureState;
  /** Fetch priority for the artwork (use on the 2–3 largest cards). */
  priority?: boolean;
  /** Rendered-width hint for the image pipeline. */
  sizes?: string;
  className?: string;
};

type DriftStyle = CSSProperties & Record<`--${string}`, string>;

/** Stacking level for the card currently being presented. */
const FEATURED_Z = 45;

/**
 * One independent story card in a floating composition.
 *
 * Layer stack — each layer animates `transform` only, so the whole card stays
 * on the compositor and never triggers layout or paint:
 *
 *   1. placement + pointer parallax   → motion.div (springed x / y)
 *   2. featured orbit                 → motion.div (curved x / y, scale, tilt)
 *   3. horizontal drift               → CSS `alternate` animation
 *   4. vertical drift                 → CSS `alternate` animation
 *   5. base rotation + rotation sway  → CSS `alternate` animation
 *   6. the visual (artwork, depth veil, rim light)
 *
 * The drift periods are intentionally non-harmonic, so the composed path is a
 * Lissajous curve with no perceivable loop point. The orbit sits *above* the
 * drift layers rather than replacing them: the ambient float keeps running
 * underneath while a card is presented, and because the orbit animates back to
 * an exact identity transform, the card always lands on its original resting
 * pose with no accumulated drift.
 */
export function FloatingStoryCard({
  artwork,
  slot,
  left,
  top,
  width,
  aspect,
  rotate = 0,
  tiltY = 0,
  depth = 0.5,
  zIndex,
  driftX = 10,
  driftY = 14,
  rotateAmplitude = 0.8,
  durationX = 23,
  durationY = 31,
  durationRotate = 41,
  delay = 0,
  parallax,
  feature,
  priority = false,
  sizes = "(min-width: 1536px) 26vw, (min-width: 1024px) 30vw, 45vw",
  className,
}: FloatingStoryCardProps) {
  // Nearer cards lean further. Total travel stays well under ~26px.
  const strength = 10 + depth * 16;
  const parallaxX = useTransform(parallax?.x ?? ZERO, (v) => v * strength);
  const parallaxY = useTransform(
    parallax?.y ?? ZERO,
    (v) => v * strength * 0.6,
  );

  const orbit = useMemo(
    () =>
      feature
        ? buildOrbit(
            { left, top, width, aspect, rotate, tiltY },
            feature.slot,
            feature.sceneAspect,
            feature.bow,
            feature.minTop,
          )
        : null,
    [feature, left, top, width, aspect, rotate, tiltY],
  );

  const phase = feature?.phase ?? "resting";
  const isPresenting = phase !== "resting";
  const isFront = phase === "entering" || phase === "featured";
  const isForeground = isPresenting;
  const mobilePromotion = Boolean(feature?.enhanceForeground);
  const staticCollage = Boolean(feature?.pauseDrift);
  const promotionTarget = isFront ? 1 : 0;

  /**
   * A permanent `will-change: opacity` would give every one of these layers its
   * own compositor layer for the whole session — eight cards times five layers
   * of surface the GPU has to keep around while nothing is fading. They only
   * need promoting while this card is actually moving through the sequence.
   */
  const willChangeOpacity = isPresenting ? "will-change-[opacity]" : "";

  /** How dark this card sits while it is not the one being presented. */
  const restingVeil = Math.min(
    0.62,
    (feature?.restingShade ?? 0) + (1 - depth) * 0.22,
  );

  const driftXStyle: DriftStyle = {
    "--drift-x": `${driftX}px`,
    animationDuration: `${durationX}s`,
    animationDelay: `${-delay}s`,
    animationName: staticCollage ? "none" : undefined,
  };
  const driftYStyle: DriftStyle = {
    "--drift-y": `${driftY}px`,
    animationDuration: `${durationY}s`,
    animationDelay: `${-delay * 1.7}s`,
    animationName: staticCollage ? "none" : undefined,
  };
  const rotateStyle: DriftStyle = {
    "--rotate-amp": `${rotateAmplitude}deg`,
    animationDuration: `${durationRotate}s`,
    animationDelay: `${-delay * 2.3}s`,
    animationName: staticCollage ? "none" : undefined,
  };

  const orbitTarget = useMemo(() => {
    const dimmed = feature?.dimmed ? 0.78 : 1;
    if (!orbit || phase === "resting") {
      return { x: "0%", y: "0%", scale: 1, rotate: 0, rotateY: 0, opacity: dimmed };
    }
    if (phase === "entering") {
      return {
        x: orbit.enterX,
        y: orbit.enterY,
        scale: orbit.scale,
        rotate: orbit.rotate,
        rotateY: orbit.rotateY,
        opacity: 1,
      };
    }
    if (phase === "featured") {
      return {
        x: orbit.x,
        y: orbit.y,
        scale: orbit.scale,
        rotate: orbit.rotate,
        rotateY: orbit.rotateY,
        opacity: 1,
      };
    }
    return {
      x: orbit.exitX,
      y: orbit.exitY,
      scale: 1,
      rotate: 0,
      rotateY: 0,
      opacity: 1,
    };
  }, [orbit, phase, feature?.dimmed]);

  const orbitTransition = useMemo(() => {
    const timings = feature?.timings;
    // The path keyframes already carry their velocity profile through eased
    // sampling, so x/y interpolate linearly; scale and tilt get their own ease.
    const shaped = { ease: [0.33, 0, 0.2, 1] as const };
    if (phase === "entering" && timings) {
      const duration = timings.enter / 1000;
      return {
        duration,
        ease: "linear" as const,
        scale: { duration, ...shaped },
        rotate: { duration, ...shaped },
        rotateY: { duration, ...shaped },
        opacity: { duration: 0.5 },
      };
    }
    if (phase === "returning" && timings) {
      const duration = timings.exit / 1000;
      return {
        duration,
        ease: "linear" as const,
        scale: { duration, ...shaped },
        rotate: { duration, ...shaped },
        rotateY: { duration, ...shaped },
        opacity: { duration: 0.6 },
      };
    }
    if (phase === "featured") {
      return staticCollage
        ? { duration: 0 }
        : { duration: 0.45, ease: "easeOut" as const };
    }
    return staticCollage
      ? { duration: 0 }
      : { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const };
  }, [phase, feature?.timings, staticCollage]);

  const promotionTransition = useMemo(() => {
    const timings = feature?.timings;
    const duration =
      phase === "entering"
        ? (timings?.enter ?? 900) / 1000
        : phase === "returning"
          ? (timings?.exit ?? 900) / 1000
          : phase === "featured"
            ? 0
            : 0;
    const ease =
      phase === "featured"
        ? ("easeOut" as const)
        : phase === "resting"
          ? ([0.22, 1, 0.36, 1] as const)
          : ([0.33, 0, 0.2, 1] as const);

    return { duration, ease };
  }, [phase, feature?.timings]);

  return (
    <motion.div
      className={cn("absolute", className)}
      data-story-id={slot}
      data-feature-phase={phase}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${width}%`,
        zIndex: isForeground
          ? (feature?.frontZ ?? FEATURED_Z)
          : (zIndex ?? Math.round(depth * 20) + 1),
        x: parallaxX,
        y: parallaxY,
      }}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 1.1,
        delay: 0.15 + (1 - depth) * 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <motion.div
        className="relative"
        style={{ transformPerspective: 1400 }}
        animate={orbitTarget}
        transition={orbitTransition}
      >
        {/* Presentation glow — sits behind the artwork, outside its clip. */}
        <motion.div
          aria-hidden
          data-card-emphasis="glow"
          initial={false}
          animate={mobilePromotion ? { opacity: promotionTarget } : undefined}
          transition={mobilePromotion ? promotionTransition : undefined}
          className={cn(
            `pointer-events-none absolute -inset-8 rounded-[40px] bg-[radial-gradient(closest-side,rgba(139,92,246,0.42),transparent)] ${willChangeOpacity}`,
            !mobilePromotion &&
              "transition-opacity duration-[900ms] ease-out",
            !mobilePromotion && (isFront ? "opacity-100" : "opacity-0"),
          )}
        />

        <div className="drift-x" style={driftXStyle}>
          <div className="drift-y" style={driftYStyle}>
            <div className="drift-rotate" style={rotateStyle}>
              <div
                className="relative overflow-hidden rounded-[clamp(14px,1.6vw,26px)] bg-ink-900 shadow-card ring-1 ring-white/10"
                style={{
                  aspectRatio: `${aspect}`,
                  // Static pose: survives `prefers-reduced-motion`.
                  transform: `perspective(1400px) rotateY(${tiltY}deg) rotate(${rotate}deg)`,
                }}
              >
                <Image
                  src={artwork}
                  // The hero is one composite role="img"; each tile is decorative.
                  alt=""
                  fill
                  sizes={sizes}
                  priority={priority}
                  className="object-cover"
                  draggable={false}
                />

                {/* Depth veil — distant cards sit further back in the haze.
                 * It clears as the card is brought forward. */}
                <motion.div
                  data-card-emphasis="veil"
                  initial={false}
                  animate={
                    mobilePromotion
                      ? { opacity: isFront ? 0 : restingVeil }
                      : undefined
                  }
                  transition={mobilePromotion ? promotionTransition : undefined}
                  className={cn(
                    `pointer-events-none absolute inset-0 bg-ink-950 ${willChangeOpacity}`,
                    !mobilePromotion &&
                      "transition-opacity duration-[900ms] ease-out",
                  )}
                  style={
                    mobilePromotion
                      ? undefined
                      : { opacity: isFront ? 0 : restingVeil }
                  }
                />

                {mobilePromotion && (
                  <motion.div
                    data-card-emphasis="highlight"
                    initial={false}
                    animate={{ opacity: promotionTarget * 0.14 }}
                    transition={promotionTransition}
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-white/35 via-iris-300/15 to-transparent mix-blend-screen ${willChangeOpacity}`}
                  />
                )}

                {/* Cinematic grade: cool shadow foot, violet rim light. */}
                <motion.div
                  data-card-emphasis="grade"
                  initial={false}
                  animate={
                    mobilePromotion
                      ? { opacity: isFront ? 0.45 : 1 }
                      : undefined
                  }
                  transition={mobilePromotion ? promotionTransition : undefined}
                  className={cn(
                    `pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/45 via-transparent to-iris-500/[0.06] ${willChangeOpacity}`,
                    !mobilePromotion &&
                      "transition-opacity duration-[900ms] ease-out",
                    !mobilePromotion &&
                      (isFront ? "opacity-45" : "opacity-100"),
                  )}
                />
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/[0.14]" />
                {/* Violet rim, faded in only while the story is presented. */}
                <motion.div
                  data-card-emphasis="rim"
                  initial={false}
                  animate={mobilePromotion ? { opacity: promotionTarget } : undefined}
                  transition={mobilePromotion ? promotionTransition : undefined}
                  className={cn(
                    `pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-iris-200/55 ${willChangeOpacity}`,
                    !mobilePromotion &&
                      "transition-opacity duration-[900ms] ease-out",
                    !mobilePromotion &&
                      (isFront ? "opacity-100" : "opacity-0"),
                  )}
                />
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-iris-400/12 via-transparent to-transparent mix-blend-screen" />
              </div>
            </div>
          </div>
        </div>

        {/* Glints ride along with the card. Sizes are pre-divided by the
         * featured scale so they read the same at any card size. */}
        {isPresenting && orbit && (
          <motion.div
            data-card-emphasis="sparkles"
            className="pointer-events-none absolute inset-0"
            initial={mobilePromotion ? { opacity: 0 } : false}
            animate={mobilePromotion ? { opacity: promotionTarget } : undefined}
            transition={mobilePromotion ? promotionTransition : undefined}
          >
            <StorySparkles compensate={orbit.scale} rich={mobilePromotion} />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

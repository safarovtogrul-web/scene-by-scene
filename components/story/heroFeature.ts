"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ *
 * Phases
 * ------------------------------------------------------------------ */

export type FeaturePhase = "resting" | "entering" | "featured" | "returning";

export type FeatureTimings = {
  /** ms to travel from the resting position into the featured slot. */
  enter: number;
  /** ms held in the foreground. */
  hold: number;
  /** ms to travel home. */
  exit: number;
  /** ms of stillness before the next card starts. */
  gap: number;
  /** ms before the very first card is featured, so entrances can settle. */
  intro: number;
};

/** 1.2 + 5.0 + 1.2 + 0.6 = one story every 8.0s. */
export const DESKTOP_TIMINGS: FeatureTimings = {
  enter: 1200,
  hold: 5000,
  exit: 1200,
  gap: 600,
  intro: 2600,
};

/** Slightly shorter travel on small screens; same 8.0s cadence. */
export const MOBILE_TIMINGS: FeatureTimings = {
  enter: 1100,
  hold: 5000,
  exit: 1100,
  gap: 800,
  intro: 3000,
};

/* ------------------------------------------------------------------ *
 * Sequencer
 * ------------------------------------------------------------------ */

/**
 * Drives "one card at a time steps forward" for a whole scene.
 *
 * A four-state machine on a chain of timeouts. The scene owns it; individual
 * cards only receive their own phase, so there is no per-card animation logic
 * and the running order is pure data.
 *
 * Returns `activeIndex: -1` when sequencing is off (reduced motion, or a
 * scene that opts out) — every card then renders its resting pose.
 */
export function useFeatureSequence({
  count,
  timings,
  enabled = true,
}: {
  count: number;
  timings: FeatureTimings;
  enabled?: boolean;
}): { activeIndex: number; phase: FeaturePhase } {
  const prefersReducedMotion = useReducedMotion();
  const running = enabled && !prefersReducedMotion && count > 0;

  const [state, setState] = useState<{ index: number; phase: FeaturePhase }>({
    index: 0,
    phase: "resting",
  });
  const startedRef = useRef(false);

  useEffect(() => {
    if (!running) return;

    const duration =
      state.phase === "entering"
        ? timings.enter
        : state.phase === "featured"
          ? timings.hold
          : state.phase === "returning"
            ? timings.exit
            : startedRef.current
              ? timings.gap
              : timings.intro;

    const timer = window.setTimeout(() => {
      startedRef.current = true;
      setState((previous) => {
        switch (previous.phase) {
          case "resting":
            return { index: previous.index, phase: "entering" };
          case "entering":
            return { index: previous.index, phase: "featured" };
          case "featured":
            return { index: previous.index, phase: "returning" };
          default:
            return { index: (previous.index + 1) % count, phase: "resting" };
        }
      });
    }, duration);

    return () => window.clearTimeout(timer);
  }, [running, state, count, timings]);

  if (!running) return { activeIndex: -1, phase: "resting" };
  return { activeIndex: state.index, phase: state.phase };
}

/* ------------------------------------------------------------------ *
 * Orbit geometry
 * ------------------------------------------------------------------ */

export type FeaturedSlot = {
  /** Centre of the featured position, as a % of the scene box. */
  centerX: number;
  centerY: number;
  /** Featured width as a % of the scene width. Drives the scale factor. */
  width: number;
  /** Fully cancel the resting tilt so every card shares one final frame. */
  straighten?: boolean;
};

type CardGeometry = {
  left: number;
  top: number;
  width: number;
  aspect: number;
  rotate: number;
  tiltY: number;
};

export type Orbit = {
  /** Curved path out, as percentages of the card's own box. */
  enterX: string[];
  enterY: string[];
  /** Curved path home — deliberately a different arc. */
  exitX: string[];
  exitY: string[];
  /** Held pose. */
  x: string;
  y: string;
  scale: number;
  rotate: number;
  rotateY: number;
};

type Point = { x: number; y: number };

/** Sine ease-in-out: gentle departure, gentle arrival, no snap at either end. */
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

/** Enough samples that the polyline reads as a continuous curve. */
const PATH_SAMPLES = 18;

/**
 * Samples a quadratic Bézier at eased parameter values.
 *
 * The eased sampling is what carries the velocity profile, so the keyframes
 * themselves can be interpolated linearly — that keeps Framer from easing each
 * tiny segment separately, which would read as a stutter at every waypoint.
 */
function sampleCurve(from: Point, to: Point, control: Point): Point[] {
  const points: Point[] = [];
  for (let i = 0; i <= PATH_SAMPLES; i++) {
    const t = easeInOutSine(i / PATH_SAMPLES);
    const inverse = 1 - t;
    points.push({
      x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
      y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
    });
  }
  return points;
}

/**
 * Builds the curved journey between a card's resting position and the shared
 * featured slot.
 *
 * Everything is expressed as a percentage of the card's own box, which means
 * the whole path is resolution-independent: no measurement, no layout reads,
 * and it stays correct from 390px to ultra-wide. The only input that varies is
 * `sceneAspect` (scene width ÷ height), because vertical percentages resolve
 * against the card's height rather than the scene's.
 *
 * The outbound arc bows away from the centre of the scene and the return arc
 * bows the other way, so the card traces a loop through space instead of
 * retracing its own line.
 */
export function buildOrbit(
  card: CardGeometry,
  slot: FeaturedSlot,
  sceneAspect: number,
  bow: { out: number; back: number } = { out: 15, back: 11 },
  minTop?: number,
): Orbit {
  // Card height as a % of the scene height.
  const cardHeight = (card.width * sceneAspect) / card.aspect;

  const restCentre: Point = {
    x: card.left + card.width / 2,
    y: card.top + cardHeight / 2,
  };

  // Scaling happens about the card's centre, so translating the centre onto
  // the slot centre lands the scaled card exactly where it belongs.
  const delta: Point = {
    x: slot.centerX - restCentre.x,
    y: slot.centerY - restCentre.y,
  };

  const length = Math.hypot(delta.x, delta.y) || 1;
  const perpendicular: Point = { x: -delta.y / length, y: delta.x / length };

  // Bow away from the middle of the scene — that is what makes it read as an
  // orbit rather than a diagonal slide.
  const midpoint: Point = {
    x: restCentre.x + delta.x / 2,
    y: restCentre.y + delta.y / 2,
  };
  const outward: Point = { x: midpoint.x - 50, y: midpoint.y - 50 };
  const side =
    perpendicular.x * outward.x + perpendicular.y * outward.y >= 0 ? 1 : -1;

  const controlOut: Point = {
    x: delta.x / 2 + perpendicular.x * bow.out * side,
    y: delta.y / 2 + perpendicular.y * bow.out * side,
  };
  const controlBack: Point = {
    x: delta.x / 2 - perpendicular.x * bow.back * side,
    y: delta.y / 2 - perpendicular.y * bow.back * side,
  };

  const origin: Point = { x: 0, y: 0 };
  const keepInsideStage = (points: Point[]): Point[] => {
    if (minTop === undefined) return points;

    // Use the largest (featured) card height for the whole route. This is
    // conservative while scale is still increasing and guarantees that even
    // the bowed part of the orbit cannot enter the header/copy safe zone.
    const featuredHeight = cardHeight * (slot.width / card.width);
    const minimumCentre = minTop + featuredHeight / 2;
    const minimumDeltaY = minimumCentre - restCentre.y;

    return points.map((point) => ({
      ...point,
      y: Math.max(point.y, minimumDeltaY),
    }));
  };

  const outbound = keepInsideStage(sampleCurve(origin, delta, controlOut));
  const inbound = keepInsideStage(sampleCurve(delta, origin, controlBack));

  // Phase boundaries reuse these exact mathematical endpoints. This prevents
  // a follow-up correction when entering becomes featured (and vice versa).
  outbound[0] = origin;
  outbound[outbound.length - 1] = delta;
  inbound[0] = delta;
  inbound[inbound.length - 1] = origin;

  // Scene-% → percentage of the card's own box.
  const toX = (value: number) => `${((value / card.width) * 100).toFixed(6)}%`;
  const toY = (value: number) => `${((value / cardHeight) * 100).toFixed(6)}%`;

  return {
    enterX: outbound.map((point) => toX(point.x)),
    enterY: outbound.map((point) => toY(point.y)),
    exitX: inbound.map((point) => toX(point.x)),
    exitY: inbound.map((point) => toY(point.y)),
    x: toX(delta.x),
    y: toY(delta.y),
    scale: slot.width / card.width,
    // Straighten as it comes forward, without losing the pose entirely.
    rotate: -card.rotate * (slot.straighten ? 1 : 0.8),
    rotateY: -card.tiltY * (slot.straighten ? 1 : 0.85),
  };
}

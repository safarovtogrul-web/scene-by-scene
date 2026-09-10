import type { BubblePlacement, NormalizedPoint } from "../story-packages/schema";
import { BUBBLE_PRESETS } from "../story-packages/schema";

/**
 * Author-controlled overlay layout for scene bubbles.
 *
 * Generic corner anchors are not enough: a corner that is empty in one scene
 * holds Lucía's face in the next, and the artwork is canonical and must never
 * be edited to make room. So each scene declares, in normalized image
 * coordinates, the regions a bubble must not cover and the regions it may use.
 * Placement is then a pure function of that data — no runtime vision, no
 * viewport pixels, and the same answer on every device.
 */
export type NormalizedRect = { x: number; y: number; width: number; height: number };

/** Why a region is protected. Ordered by the priority the reader must respect. */
export type ProtectedRole = "face" | "primaryAction" | "activeHand" | "importantProp";

export const ROLE_PRIORITY: readonly ProtectedRole[] = ["face", "primaryAction", "activeHand", "importantProp"];

export type ProtectedRegion = NormalizedRect & { role: ProtectedRole; note: string };

export type SceneOverlay = {
  /** Regions the bubble must never cover, in normalized image coordinates. */
  avoid: ProtectedRegion[];
  /** Candidate regions the bubble may occupy, best first. */
  preferred: NormalizedRect[];
  /** The anchor chosen for this scene and orientation. */
  anchor: (typeof BUBBLE_PRESETS)[number] | NormalizedPoint;
  /** Fraction of the frame width the bubble may occupy. */
  maxWidth: number;
  /** Optional cap on height, for scenes where a tall bubble would reach a face. */
  maxHeight?: number;
  /**
   * Lower bound on text scale. Shrinking text is allowed to clear a face, but
   * never below this — an unreadable sentence fails the reader either way.
   */
  minTextScale?: number;
};

export const MIN_TEXT_SCALE = 0.82;

const PRESET_ORIGIN: Record<(typeof BUBBLE_PRESETS)[number], [number, number]> = {
  "top-left": [0, 0], "top-center": [0.5, 0], "top-right": [1, 0],
  "center-left": [0, 0.5], "center-right": [1, 0.5],
  "bottom-left": [0, 1], "bottom-center": [0.5, 1], "bottom-right": [1, 1],
};

/**
 * The box a bubble of the given height actually occupies.
 *
 * It mirrors the reader stylesheet exactly: the bubble is positioned at its
 * anchor and then pulled back by its own size, so a right anchor grows leftward
 * rather than off the frame.
 */
export function bubbleRect(overlay: Pick<SceneOverlay, "anchor" | "maxWidth">, height: number): NormalizedRect {
  const [ox, oy] = typeof overlay.anchor === "string"
    ? PRESET_ORIGIN[overlay.anchor]
    : [overlay.anchor.x, overlay.anchor.y];
  return {
    x: ox - ox * overlay.maxWidth,
    y: oy - oy * height,
    width: overlay.maxWidth,
    height,
  };
}

export function rectsOverlap(a: NormalizedRect, b: NormalizedRect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width
    && a.y < b.y + b.height && b.y < a.y + a.height;
}

/** Every protected region a bubble of this height would cover. */
export function occlusions(overlay: SceneOverlay, height: number): ProtectedRegion[] {
  const rect = bubbleRect(overlay, height);
  return overlay.avoid.filter((region) => rectsOverlap(rect, region));
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The anchor that lands a bubble's top-left corner on a point.
 *
 * The stylesheet positions a bubble at its anchor and then pulls it back by its
 * own size, so placing a box at an arbitrary point is a small inversion rather
 * than a special case.
 */
function anchorForTopLeft(x: number, y: number, width: number, height: number): NormalizedPoint {
  return {
    x: clamp01(width < 1 ? x / (1 - width) : 0),
    y: clamp01(height < 1 ? y / (1 - height) : 0),
  };
}

/**
 * A placement carrying exactly one kind of anchor.
 *
 * The authored hint this builds on may already name a preset, and the resolver
 * is free to answer with normalized coordinates instead. Spreading one over the
 * other would leave both on the object, which the schema rejects for good
 * reason: a bubble with a preset *and* a point does not say where it goes.
 */
function withAnchor(
  base: BubblePlacement | undefined,
  anchor: SceneOverlay["anchor"],
  maxWidth: number,
): BubblePlacement {
  const rest = { ...(base ?? {}) } as Record<string, unknown>;
  delete rest.preset;
  delete rest.x;
  delete rest.y;
  return {
    ...rest,
    ...(typeof anchor === "string" ? { preset: anchor } : { x: anchor.x, y: anchor.y }),
    maxWidth,
  } as BubblePlacement;
}

/**
 * Resolves the overlay to the placement the reader renders.
 *
 * The search follows the brief's priority order rather than taste: keep the
 * authored anchor if it clears everything; otherwise shrink the text a little
 * (never past `MIN_TEXT_SCALE`); otherwise move to the next declared safe
 * region. If nothing clears, it returns the least-bad option and `blocked`
 * lists what it still covers, so a test fails loudly instead of a reader
 * quietly losing a face.
 */
export function resolveBubblePlacement(
  overlay: SceneOverlay,
  base: BubblePlacement | undefined,
  naturalHeight: number,
): BubblePlacement & { textScale?: number; blocked?: ProtectedRegion[] } {
  const floor = overlay.minTextScale ?? MIN_TEXT_SCALE;
  const capped = overlay.maxHeight ? Math.min(naturalHeight, overlay.maxHeight) : naturalHeight;

  type Candidate = { anchor: SceneOverlay["anchor"]; width: number };
  const candidates: Candidate[] = [
    { anchor: overlay.anchor, width: overlay.maxWidth },
    ...overlay.preferred.map((region) => ({
      anchor: anchorForTopLeft(region.x, region.y, Math.min(overlay.maxWidth, region.width), capped) as SceneOverlay["anchor"],
      width: Math.min(overlay.maxWidth, region.width),
    })),
  ];

  // Scale steps, largest first, always including the floor so the search runs
  // even when the declared cap is smaller than readable text can achieve.
  const steps: number[] = [];
  for (let scale = Math.min(1, capped / naturalHeight); scale >= floor - 1e-9; scale -= 0.02) steps.push(scale);
  if (steps.length === 0 || steps[steps.length - 1] > floor) steps.push(floor);

  /**
   * How bad a compromise is: the highest-priority thing it covers decides,
   * because losing a face is worse than losing any number of props.
   */
  const cost = (blocked: ProtectedRegion[]) => {
    const worst = Math.min(...blocked.map((region) => ROLE_PRIORITY.indexOf(region.role)));
    return worst * 100 + blocked.length;
  };

  let fallback: { candidate: Candidate; height: number; blocked: ProtectedRegion[] } | null = null;

  for (const candidate of candidates) {
    for (const scale of steps) {
      const height = naturalHeight * Math.min(1, scale);
      const blocked = occlusions({ ...overlay, anchor: candidate.anchor, maxWidth: candidate.width }, height);
      if (blocked.length === 0) {
        const textScale = Math.min(1, scale);
        return {
          ...withAnchor(base, candidate.anchor, candidate.width),
          ...(textScale < 1 ? { textScale: Number(textScale.toFixed(3)) } : {}),
        } as BubblePlacement & { textScale?: number };
      }
      if (!fallback || cost(blocked) < cost(fallback.blocked)) fallback = { candidate, height, blocked };
    }
  }

  const chosen = fallback!;
  return {
    ...withAnchor(base, chosen.candidate.anchor, chosen.candidate.width),
    textScale: Number((chosen.height / naturalHeight).toFixed(3)),
    blocked: chosen.blocked,
  } as BubblePlacement & { textScale?: number; blocked?: ProtectedRegion[] };
}

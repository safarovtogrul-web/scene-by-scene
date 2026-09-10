import type { SceneOverlay } from "../../reader/bubbleLayout";

/**
 * Bubble overlay layout for The Lost Map, authored from a visual audit of all
 * 48 canonical images (S01-S24, wide and portrait) in the production reader.
 *
 * Coordinates are fractions of the rendered artwork box, never viewport pixels,
 * so the same data holds at 360px and at 1440px. The artwork is canonical and is
 * never edited: every correction here is overlay-only.
 *
 * `avoid` records what the audit found worth protecting in that frame; a test
 * asserts the resolved bubble clears all of it at the worst-case bubble height.
 * `preferred` records the regions judged free, best first, so a later copy change
 * can be re-resolved against the same judgement rather than re-eyeballed.
 */
export type SceneOrientation = "wide" | "portrait";

export const THE_LOST_MAP_OVERLAY: Record<string, Record<SceneOrientation, SceneOverlay>> = {
  S01: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face at the door", x: 0.22, y: 0.08, width: 0.12, height: 0.16 },
        { role: "activeHand", note: "right hand on the door handle", x: 0.28, y: 0.48, width: 0.08, height: 0.1 },
      ],
      preferred: [
        { x: 0.36, y: 0.02, width: 0.62, height: 0.34 },
      ],
      anchor: "top-right",
      maxWidth: 0.5,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face at the door", x: 0.26, y: 0.15, width: 0.14, height: 0.17 },
        { role: "activeHand", note: "right hand on the door handle", x: 0.31, y: 0.4, width: 0.08, height: 0.08 },
      ],
      preferred: [
        { x: 0.44, y: 0.02, width: 0.54, height: 0.3 },
      ],
      anchor: "top-right",
      maxWidth: 0.52,
    },
  },
  S02: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.6, y: 0.12, width: 0.1, height: 0.18 },
        { role: "importantProp", note: "grandmother photograph", x: 0.44, y: 0.38, width: 0.1, height: 0.2 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.56, height: 0.3 },
      ],
      anchor: "top-left",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face and hair", x: 0.53, y: 0.18, width: 0.18, height: 0.24 },
        { role: "importantProp", note: "grandmother photograph", x: 0.34, y: 0.45, width: 0.16, height: 0.16 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.5, height: 0.34 },
      ],
      anchor: "top-left",
      maxWidth: 0.5,
    },
  },
  S03: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.28, y: 0.1, width: 0.1, height: 0.16 },
        { role: "activeHand", note: "hands searching the drawer", x: 0.24, y: 0.55, width: 0.14, height: 0.12 },
        { role: "importantProp", note: "open drawer contents", x: 0.22, y: 0.62, width: 0.2, height: 0.22 },
      ],
      preferred: [
        { x: 0.42, y: 0.66, width: 0.56, height: 0.32 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.19, y: 0.08, width: 0.14, height: 0.16 },
        { role: "importantProp", note: "open drawer contents", x: 0.1, y: 0.38, width: 0.28, height: 0.14 },
      ],
      preferred: [
        { x: 0.3, y: 0.66, width: 0.68, height: 0.32 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.66,
    },
  },
  S04: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.3, y: 0.1, width: 0.1, height: 0.16 },
        { role: "importantProp", note: "green notebook", x: 0.24, y: 0.45, width: 0.1, height: 0.16 },
        { role: "importantProp", note: "open drawer", x: 0.16, y: 0.62, width: 0.26, height: 0.2 },
      ],
      preferred: [
        { x: 0.46, y: 0.02, width: 0.52, height: 0.3 },
      ],
      anchor: "top-right",
      maxWidth: 0.54,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.31, y: 0.22, width: 0.16, height: 0.16 },
        { role: "importantProp", note: "green notebook in her raised hand", x: 0.24, y: 0.46, width: 0.16, height: 0.14 },
      ],
      preferred: [
        { x: 0.02, y: 0.62, width: 0.62, height: 0.36 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.62,
    },
  },
  S05: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.5, y: 0.22, width: 0.12, height: 0.2 },
        { role: "importantProp", note: "notebook and folded map", x: 0.28, y: 0.6, width: 0.32, height: 0.32 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.46, height: 0.24 },
      ],
      anchor: "top-left",
      maxWidth: 0.46,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.46, y: 0.36, width: 0.16, height: 0.16 },
        { role: "importantProp", note: "notebook and folded map", x: 0.14, y: 0.68, width: 0.5, height: 0.24 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.66, height: 0.34 },
      ],
      anchor: "top-left",
      maxWidth: 0.66,
    },
  },
  S06: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.38, y: 0.16, width: 0.12, height: 0.18 },
        { role: "importantProp", note: "open map with blue route", x: 0.08, y: 0.6, width: 0.62, height: 0.38 },
      ],
      preferred: [
        { x: 0.44, y: 0.02, width: 0.54, height: 0.22 },
      ],
      anchor: "top-right",
      maxWidth: 0.54,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.37, y: 0.26, width: 0.16, height: 0.16 },
        { role: "importantProp", note: "open map with blue route", x: 0.02, y: 0.58, width: 0.94, height: 0.36 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.66, height: 0.22 },
      ],
      anchor: "top-left",
      maxWidth: 0.66,
      maxHeight: 0.22,
    },
  },
  S07: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.53, y: 0.1, width: 0.12, height: 0.22 },
        { role: "importantProp", note: "brass key leaving the envelope", x: 0.6, y: 0.44, width: 0.1, height: 0.2 },
      ],
      preferred: [
        { x: 0.02, y: 0.38, width: 0.56, height: 0.24 },
      ],
      anchor: "center-left",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.5, y: 0.1, width: 0.16, height: 0.22 },
        { role: "importantProp", note: "brass key", x: 0.62, y: 0.46, width: 0.1, height: 0.18 },
        { role: "activeHand", note: "hand drawing the key out", x: 0.52, y: 0.48, width: 0.12, height: 0.14 },
      ],
      preferred: [
        { x: 0.02, y: 0.34, width: 0.46, height: 0.32 },
      ],
      anchor: "center-left",
      maxWidth: 0.46,
    },
  },
  S08: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.6, y: 0.12, width: 0.12, height: 0.3 },
        { role: "primaryAction", note: "key and map seal being compared", x: 0.08, y: 0.72, width: 0.3, height: 0.26 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.56, height: 0.28 },
      ],
      anchor: "top-left",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.54, y: 0.32, width: 0.2, height: 0.18 },
        { role: "primaryAction", note: "key and map seal being compared", x: 0.06, y: 0.7, width: 0.42, height: 0.24 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.5, height: 0.34 },
      ],
      anchor: "top-left",
      maxWidth: 0.5,
    },
  },
  S09: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.34, y: 0.06, width: 0.1, height: 0.16 },
        { role: "importantProp", note: "open backpack mouth with map, lantern and key", x: 0.2, y: 0.48, width: 0.22, height: 0.3 },
      ],
      preferred: [
        { x: 0.44, y: 0.7, width: 0.54, height: 0.28 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.58,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.38, y: 0.16, width: 0.14, height: 0.16 },
        { role: "importantProp", note: "open backpack with map, lantern and key", x: 0.16, y: 0.44, width: 0.34, height: 0.3 },
      ],
      preferred: [
        { x: 0.32, y: 0.66, width: 0.66, height: 0.32 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.66,
    },
  },
  S10: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.545, y: 0.14, width: 0.09, height: 0.14 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.5, height: 0.26 },
      ],
      anchor: "top-left",
      maxWidth: 0.5,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.44, y: 0.25, width: 0.14, height: 0.13 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.42, height: 0.34 },
      ],
      anchor: "top-left",
      maxWidth: 0.42,
    },
  },
  S11: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.17, y: 0.06, width: 0.1, height: 0.16 },
        { role: "importantProp", note: "backpack and map", x: 0.16, y: 0.22, width: 0.18, height: 0.26 },
      ],
      preferred: [
        { x: 0.42, y: 0.02, width: 0.56, height: 0.26 },
      ],
      anchor: "top-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.32, y: 0.18, width: 0.14, height: 0.15 },
        { role: "importantProp", note: "backpack and map", x: 0.16, y: 0.36, width: 0.2, height: 0.26 },
      ],
      preferred: [
        { x: 0.52, y: 0.02, width: 0.46, height: 0.3 },
      ],
      anchor: "top-right",
      maxWidth: 0.48,
    },
  },
  S12: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.62, y: 0.1, width: 0.1, height: 0.14 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.46, height: 0.24 },
      ],
      anchor: "top-left",
      maxWidth: 0.46,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.37, y: 0.15, width: 0.14, height: 0.14 },
      ],
      preferred: [
        { x: 0.38, y: 0.72, width: 0.6, height: 0.26 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.6,
    },
  },
  S13: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.52, y: 0.1, width: 0.08, height: 0.14 },
        { role: "importantProp", note: "first stone marker and its carved seal", x: 0.4, y: 0.48, width: 0.14, height: 0.26 },
      ],
      preferred: [
        { x: 0.02, y: 0.76, width: 0.52, height: 0.22 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.52,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.78, y: 0.1, width: 0.12, height: 0.14 },
        { role: "importantProp", note: "stone marker carved seal", x: 0.54, y: 0.28, width: 0.18, height: 0.22 },
      ],
      preferred: [
        { x: 0.02, y: 0.54, width: 0.68, height: 0.32 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.66,
    },
  },
  S14: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.55, y: 0.16, width: 0.1, height: 0.18 },
        { role: "importantProp", note: "open map being compared", x: 0.36, y: 0.32, width: 0.26, height: 0.22 },
        { role: "primaryAction", note: "marker seal and pointing finger", x: 0.08, y: 0.4, width: 0.26, height: 0.24 },
      ],
      preferred: [
        { x: 0.44, y: 0.74, width: 0.54, height: 0.24 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.28, y: 0.22, width: 0.16, height: 0.14 },
        { role: "importantProp", note: "open map being compared", x: 0.14, y: 0.4, width: 0.26, height: 0.2 },
        { role: "primaryAction", note: "marker seal and pointing finger", x: 0.04, y: 0.54, width: 0.24, height: 0.18 },
      ],
      preferred: [
        { x: 0.38, y: 0.62, width: 0.6, height: 0.36 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.62,
    },
  },
  S15: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.14, y: 0.06, width: 0.1, height: 0.14 },
        { role: "importantProp", note: "stone markers along the path", x: 0.4, y: 0.34, width: 0.28, height: 0.28 },
      ],
      preferred: [
        { x: 0.42, y: 0.02, width: 0.56, height: 0.24 },
      ],
      anchor: "top-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.17, y: 0.19, width: 0.14, height: 0.13 },
        { role: "importantProp", note: "stone markers along the path", x: 0.4, y: 0.6, width: 0.3, height: 0.24 },
      ],
      preferred: [
        { x: 0.38, y: 0.02, width: 0.6, height: 0.4 },
      ],
      anchor: "top-right",
      maxWidth: 0.62,
    },
  },
  S16: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.72, y: 0.08, width: 0.11, height: 0.18 },
        { role: "primaryAction", note: "fallen branches blocking the path", x: 0.08, y: 0.28, width: 0.58, height: 0.48 },
        { role: "importantProp", note: "open map", x: 0.6, y: 0.42, width: 0.2, height: 0.16 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.56, height: 0.24 },
      ],
      anchor: "top-left",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.55, y: 0.22, width: 0.16, height: 0.18 },
        { role: "primaryAction", note: "fallen branches blocking the path", x: 0.02, y: 0.42, width: 0.52, height: 0.44 },
        { role: "importantProp", note: "open map", x: 0.46, y: 0.6, width: 0.3, height: 0.16 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.52, height: 0.32 },
      ],
      anchor: "top-left",
      maxWidth: 0.52,
    },
  },
  S17: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.07, y: 0.06, width: 0.1, height: 0.16 },
        { role: "importantProp", note: "open map", x: 0.13, y: 0.28, width: 0.24, height: 0.22 },
        { role: "importantProp", note: "old stone bridge", x: 0.34, y: 0.44, width: 0.42, height: 0.3 },
      ],
      preferred: [
        { x: 0.42, y: 0.02, width: 0.56, height: 0.24 },
      ],
      anchor: "top-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.14, y: 0.1, width: 0.16, height: 0.16 },
        { role: "importantProp", note: "open map", x: 0.28, y: 0.38, width: 0.28, height: 0.24 },
        { role: "importantProp", note: "old stone bridge", x: 0.54, y: 0.4, width: 0.44, height: 0.34 },
      ],
      preferred: [
        { x: 0.34, y: 0.02, width: 0.64, height: 0.32 },
      ],
      anchor: "top-right",
      maxWidth: 0.64,
    },
  },
  S18: {
    wide: {
      avoid: [
        { role: "primaryAction", note: "Lucia crossing the bridge", x: 0.28, y: 0.26, width: 0.16, height: 0.24 },
        { role: "importantProp", note: "narrow stone bridge", x: 0.18, y: 0.4, width: 0.68, height: 0.34 },
      ],
      preferred: [
        { x: 0.02, y: 0.76, width: 0.58, height: 0.22 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.58,
    },
    portrait: {
      avoid: [
        { role: "primaryAction", note: "Lucia crossing the bridge", x: 0.26, y: 0.12, width: 0.18, height: 0.24 },
        { role: "importantProp", note: "narrow stone bridge", x: 0.04, y: 0.26, width: 0.92, height: 0.28 },
      ],
      preferred: [
        { x: 0.02, y: 0.58, width: 0.66, height: 0.36 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.66,
    },
  },
  S19: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.66, y: 0.04, width: 0.12, height: 0.18 },
        { role: "importantProp", note: "open map being compared", x: 0.46, y: 0.26, width: 0.26, height: 0.28 },
        { role: "importantProp", note: "ruins silhouette", x: 0.18, y: 0.06, width: 0.48, height: 0.24 },
      ],
      preferred: [
        { x: 0.02, y: 0.38, width: 0.42, height: 0.24 },
      ],
      anchor: "center-left",
      maxWidth: 0.44,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.52, y: 0.2, width: 0.16, height: 0.16 },
        { role: "importantProp", note: "open map being compared", x: 0.14, y: 0.36, width: 0.34, height: 0.22 },
        { role: "importantProp", note: "ruins silhouette", x: 0.16, y: 0.1, width: 0.42, height: 0.2 },
      ],
      preferred: [
        { x: 0.02, y: 0.62, width: 0.5, height: 0.36 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.5,
    },
  },
  S20: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.78, y: 0.11, width: 0.08, height: 0.12 },
        { role: "importantProp", note: "North Star seal above the entrance", x: 0.74, y: 0, width: 0.14, height: 0.15 },
        { role: "importantProp", note: "hidden entrance", x: 0.7, y: 0.14, width: 0.18, height: 0.44 },
        { role: "activeHand", note: "hand holding the ivy back", x: 0.66, y: 0.13, width: 0.09, height: 0.11 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.6, height: 0.26 },
      ],
      anchor: "top-left",
      maxWidth: 0.6,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.6, y: 0.24, width: 0.14, height: 0.12 },
        { role: "importantProp", note: "North Star seal above the entrance", x: 0.55, y: 0.07, width: 0.18, height: 0.15 },
        { role: "importantProp", note: "hidden entrance", x: 0.44, y: 0.2, width: 0.3, height: 0.48 },
        { role: "activeHand", note: "hand holding the ivy back", x: 0.37, y: 0.29, width: 0.11, height: 0.11 },
      ],
      preferred: [
        { x: 0.02, y: 0.62, width: 0.56, height: 0.34 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.56,
    },
  },
  S21: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.15, y: 0.26, width: 0.09, height: 0.16 },
        { role: "importantProp", note: "lit lantern", x: 0.11, y: 0.46, width: 0.09, height: 0.18 },
        { role: "importantProp", note: "stone steps", x: 0.08, y: 0.6, width: 0.3, height: 0.38 },
      ],
      preferred: [
        { x: 0.42, y: 0.02, width: 0.56, height: 0.26 },
      ],
      anchor: "top-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.42, y: 0.15, width: 0.16, height: 0.15 },
        { role: "importantProp", note: "lit lantern", x: 0.28, y: 0.4, width: 0.12, height: 0.2 },
        { role: "importantProp", note: "lit stone treads beneath her", x: 0.04, y: 0.55, width: 0.38, height: 0.42 },
      ],
      preferred: [
        { x: 0.46, y: 0.58, width: 0.52, height: 0.4 },
      ],
      anchor: "bottom-right",
      maxWidth: 0.52,
    },
  },
  S22: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.79, y: 0.28, width: 0.07, height: 0.12 },
        { role: "importantProp", note: "closed wooden box on the plinth", x: 0.38, y: 0.53, width: 0.2, height: 0.18 },
        { role: "importantProp", note: "lit lantern", x: 0.6, y: 0.44, width: 0.07, height: 0.14 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.56, height: 0.26 },
      ],
      anchor: "top-left",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.77, y: 0.24, width: 0.15, height: 0.16 },
        { role: "importantProp", note: "closed wooden box on the plinth", x: 0.5, y: 0.6, width: 0.24, height: 0.16 },
        { role: "importantProp", note: "lit lantern", x: 0.76, y: 0.46, width: 0.1, height: 0.16 },
      ],
      preferred: [
        { x: 0.02, y: 0.02, width: 0.72, height: 0.22 },
      ],
      anchor: "top-left",
      maxWidth: 0.72,
    },
  },
  S23: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.09, y: 0.04, width: 0.09, height: 0.14 },
        { role: "primaryAction", note: "brass key already in the lock", x: 0.12, y: 0.2, width: 0.18, height: 0.2 },
        { role: "activeHand", note: "hands lifting the lid", x: 0.06, y: 0.2, width: 0.22, height: 0.16 },
      ],
      preferred: [
        { x: 0.42, y: 0.34, width: 0.56, height: 0.3 },
      ],
      anchor: "center-right",
      maxWidth: 0.56,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.15, y: 0.07, width: 0.14, height: 0.14 },
        { role: "primaryAction", note: "brass key already in the lock", x: 0.16, y: 0.36, width: 0.58, height: 0.26 },
        { role: "activeHand", note: "hands lifting the lid", x: 0.1, y: 0.34, width: 0.24, height: 0.16 },
      ],
      preferred: [
        { x: 0.46, y: 0.02, width: 0.52, height: 0.32 },
      ],
      anchor: "top-right",
      maxWidth: 0.54,
    },
  },
  S24: {
    wide: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.31, y: 0.06, width: 0.11, height: 0.17 },
        { role: "importantProp", note: "grandmother photograph by the same bridge", x: 0.52, y: 0.2, width: 0.12, height: 0.2 },
        { role: "importantProp", note: "open archive box", x: 0.53, y: 0.3, width: 0.24, height: 0.24 },
      ],
      preferred: [
        { x: 0.21, y: 0.78, width: 0.58, height: 0.2 },
      ],
      anchor: "bottom-center",
      maxWidth: 0.58,
    },
    portrait: {
      avoid: [
        { role: "face", note: "Lucia's face", x: 0.16, y: 0.16, width: 0.15, height: 0.16 },
        { role: "importantProp", note: "grandmother photograph by the same bridge", x: 0.3, y: 0.32, width: 0.2, height: 0.18 },
        { role: "importantProp", note: "open archive box", x: 0.45, y: 0.42, width: 0.34, height: 0.24 },
      ],
      preferred: [
        { x: 0.02, y: 0.62, width: 0.58, height: 0.34 },
      ],
      anchor: "bottom-left",
      maxWidth: 0.58,
    },
  },
};

import approvedSpanish from "./THE_LOST_MAP_TEXTS_ES.json";
import sourceTexts from "./THE_LOST_MAP_TEXTS.json";
import { BUBBLE_TYPES, type PackageScene, type SceneLanguageText } from "../schema";
import { LANGUAGE_IDS, isLanguageId, type LanguageId } from "../../languages";
import { resolveBubblePlacement } from "../../reader/bubbleLayout";
import { THE_LOST_MAP_OVERLAY } from "./the-lost-map-overlay";
import {
  THE_LOST_MAP_ASSET_SCENES,
  THE_LOST_MAP_SLUG,
  type TheLostMapAssetScene,
} from "./the-lost-map-assets";

type CopyMode = (typeof BUBBLE_TYPES)[number];

type RawApprovedScene = {
  sceneId: string;
  easy: string;
  hard: string;
  mode: string;
};

type RawApprovedManifest = {
  title: string;
  slug: string;
  primaryLanguage: string;
  status: string;
  knownReview: Array<Record<string, string>>;
  scenes: RawApprovedScene[];
};

type RawTextScene = {
  sceneId: string;
  mode: string;
  semanticCore: string;
  easy: Record<string, string>;
  hard: Record<string, string>;
};

type RawTextManifest = {
  title: string;
  slug: string;
  sourceLanguage: string;
  status: string;
  languages: string[];
  scenes: RawTextScene[];
};

export type TheLostMapScene = PackageScene & {
  semanticCore: string;
  production: TheLostMapAssetScene["production"];
};

const approved = approvedSpanish as RawApprovedManifest;
const texts = sourceTexts as RawTextManifest;
const copyModes = new Set<string>(BUBBLE_TYPES);

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid The Lost Map copy manifest: ${message}`);
}

function copyMode(value: string, field: string): CopyMode {
  invariant(copyModes.has(value), `${field} has unsupported mode ${value}`);
  return value as CopyMode;
}

invariant(approved.title === "The Lost Map", "title must be The Lost Map");
invariant(approved.slug === THE_LOST_MAP_SLUG, `slug must be ${THE_LOST_MAP_SLUG}`);
invariant(approved.primaryLanguage === "es", "primaryLanguage must be es");
invariant(approved.status === "production-approved", "status must be production-approved");
invariant(approved.knownReview.length === 0, "knownReview must be empty before registration");
invariant(approved.scenes.length === 24, "approved Spanish must contain 24 records");

invariant(texts.slug === THE_LOST_MAP_SLUG, `multilingual slug must be ${THE_LOST_MAP_SLUG}`);
invariant(texts.status === "production-approved", "multilingual status must be production-approved");
invariant(texts.scenes.length === 24, "multilingual copy must contain 24 records");

/**
 * The languages this story is published in. Derived from the manifest rather
 * than restated, so a language cannot be advertised without having copy.
 */
export const THE_LOST_MAP_LANGUAGES: LanguageId[] = texts.languages.map((language) => {
  invariant(isLanguageId(language), `${language} is not a shipped language`);
  return language as LanguageId;
});

invariant(
  THE_LOST_MAP_LANGUAGES.length === LANGUAGE_IDS.length,
  `expected all ${LANGUAGE_IDS.length} shipped languages, found ${THE_LOST_MAP_LANGUAGES.length}`,
);

function languageText(record: Record<string, string>, field: string): SceneLanguageText {
  const text: SceneLanguageText = {};
  for (const language of THE_LOST_MAP_LANGUAGES) {
    const value = record[language];
    invariant(typeof value === "string" && value.trim(), `${field}.${language} must be non-empty`);
    text[language] = value;
  }
  return text;
}

/**
 * The tallest each card actually grows, measured in the production reader at
 * the width its scene authorises: the worst of all nineteen languages at Hard,
 * with one side of the card visible, at the tightest viewport of each
 * orientation (360x800 portrait, 1024x768 wide).
 *
 * Measured rather than assumed, and re-measured for the one-sided card: a
 * bubble takes the height its own words need at its own width, so one
 * pessimistic number for all 24 scenes would force placements that solve a
 * problem no reader has — and one optimistic number would let a bubble grow
 * over a face that a test believed was clear.
 */
const MEASURED = {
  wide: {
    S01: 0.2192, S02: 0.2611, S03: 0.2118, S04: 0.2611, S05: 0.1921, S06: 0.2611,
    S07: 0.2611, S08: 0.3276, S09: 0.2611, S10: 0.2611, S11: 0.1921, S12: 0.2118,
    S13: 0.2118, S14: 0.1921, S15: 0.2857, S16: 0.2118, S17: 0.2611, S18: 0.1921,
    S19: 0.2118, S20: 0.2611, S21: 0.2611, S22: 0.1921, S23: 0.1921, S24: 0.1921,
  },
  portrait: {
    S01: 0.2222, S02: 0.2804, S03: 0.2222, S04: 0.2222, S05: 0.2804, S06: 0.2222,
    S07: 0.2487, S08: 0.2804, S09: 0.2222, S10: 0.2804, S11: 0.2804, S12: 0.2222,
    S13: 0.336, S14: 0.2804, S15: 0.5635, S16: 0.2222, S17: 0.2222, S18: 0.2804,
    S19: 0.2804, S20: 0.336, S21: 0.6772, S22: 0.336, S23: 0.2804, S24: 0.336,
  },
} as const;

const HEADROOM = 1.08;

export function worstCaseHeight(sceneId: string, orientation: "wide" | "portrait"): number {
  const measured = MEASURED[orientation][sceneId as keyof (typeof MEASURED)["wide"]];
  return Number(((measured ?? (orientation === "wide" ? 0.18 : 0.39)) * HEADROOM).toFixed(4));
}

/** Kept for callers that want a single pessimistic bound across the story. */
export const WORST_CASE_HEIGHT = { wide: 0.19, portrait: 0.416 } as const;

/** Complete production scene records built from the approved copy and asset manifests. */
export const THE_LOST_MAP_SCENES: TheLostMapScene[] = THE_LOST_MAP_ASSET_SCENES.map((asset, index) => {
  const scene = texts.scenes[index];
  const overlay = THE_LOST_MAP_OVERLAY[asset.id];
  invariant(overlay, `${asset.id} has no audited bubble overlay`);
  invariant(scene?.sceneId === asset.id, `scenes[${index}].sceneId must be ${asset.id}`);
  invariant(scene.semanticCore?.trim(), `${asset.id}.semanticCore must be non-empty`);

  // Spanish is the approved source of truth. Every other language is written
  // against the same scene, so a drift here means the manifests disagree about
  // what actually happens — which must fail the build, not reach a reader.
  const approvedScene = approved.scenes[index];
  invariant(approvedScene?.sceneId === asset.id, `approved scenes[${index}].sceneId must be ${asset.id}`);
  invariant(scene.easy.es === approvedScene.easy, `${asset.id}.easy.es must match the approved Spanish`);
  invariant(scene.hard.es === approvedScene.hard, `${asset.id}.hard.es must match the approved Spanish`);
  invariant(scene.mode === approvedScene.mode, `${asset.id}.mode must match the approved Spanish`);

  return {
    id: asset.id,
    order: asset.order,
    image: asset.image,
    semanticCore: scene.semanticCore,
    text: {
      easy: languageText(scene.easy, `${asset.id}.easy`),
      hard: languageText(scene.hard, `${asset.id}.hard`),
    },
    // Placement comes from the audited overlay, not from a generic corner
    // preset: the manifest hints were a starting point, and where the real
    // artwork disagreed with them the overlay wins.
    bubble: {
      ...resolveBubblePlacement(overlay.wide, asset.bubble, worstCaseHeight(asset.id, "wide")),
      type: copyMode(scene.mode, `${asset.id}.mode`),
    },
    mobileBubble: {
      ...resolveBubblePlacement(overlay.portrait, asset.mobileBubble, worstCaseHeight(asset.id, "portrait")),
      type: copyMode(scene.mode, `${asset.id}.mode`),
    },
    production: asset.production,
  };
});

invariant(
  new Set(THE_LOST_MAP_SCENES.map((scene) => scene.id)).size === 24,
  "scene IDs must be unique",
);

export const THE_LOST_MAP_COPY_MANIFEST = approved;
export const THE_LOST_MAP_TEXT_MANIFEST = texts;
export const THE_LOST_MAP_REGISTRATION_BLOCKERS = approved.knownReview;

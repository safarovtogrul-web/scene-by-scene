import sourceCopy from "./THE_LOST_MAP_TEXTS_ES.json";
import { BUBBLE_TYPES, type PackageScene } from "../schema";
import {
  THE_LOST_MAP_ASSET_SCENES,
  THE_LOST_MAP_SLUG,
  type TheLostMapAssetScene,
} from "./the-lost-map-assets";

type CopyMode = (typeof BUBBLE_TYPES)[number];

type RawCopyScene = {
  sceneId: string;
  easy: string;
  hard: string;
  mode: string;
};

type RawCopyReview = {
  sceneId: string;
  field: "easy" | "hard";
  sourceText: string;
  reason: string;
  suggestedVisualConsistentText: string;
};

type RawCopyManifest = {
  title: string;
  slug: string;
  primaryLanguage: string;
  source: string;
  status: string;
  note: string;
  knownReview: RawCopyReview[];
  scenes: RawCopyScene[];
};

export type TheLostMapScene = PackageScene & {
  production: TheLostMapAssetScene["production"];
};

const copy = sourceCopy as RawCopyManifest;
const copyModes = new Set<string>(BUBBLE_TYPES);

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid The Lost Map copy manifest: ${message}`);
}

function copyMode(value: string, field: string): CopyMode {
  invariant(copyModes.has(value), `${field} has unsupported mode ${value}`);
  return value as CopyMode;
}

invariant(copy.title === "The Lost Map", "title must be The Lost Map");
invariant(copy.slug === THE_LOST_MAP_SLUG, `slug must be ${THE_LOST_MAP_SLUG}`);
invariant(copy.primaryLanguage === "es", "primaryLanguage must be es");
invariant(copy.status === "production-approved", "status must be production-approved");
invariant(copy.knownReview.length === 0, "knownReview must be empty before registration");
invariant(copy.scenes.length === 24, "scenes must contain 24 records");

export const THE_LOST_MAP_COPY_MANIFEST = copy;
export const THE_LOST_MAP_REGISTRATION_BLOCKERS = copy.knownReview;

/** Complete production scene records built from the approved copy and asset manifests. */
export const THE_LOST_MAP_SCENES: TheLostMapScene[] = THE_LOST_MAP_ASSET_SCENES.map((asset, index) => {
  const sceneCopy = copy.scenes[index];
  invariant(sceneCopy?.sceneId === asset.id, `scenes[${index}].sceneId must be ${asset.id}`);
  invariant(sceneCopy.easy.trim(), `${asset.id}.easy must be non-empty`);
  invariant(sceneCopy.hard.trim(), `${asset.id}.hard must be non-empty`);

  return {
    id: asset.id,
    order: asset.order,
    image: asset.image,
    text: {
      easy: { es: sceneCopy.easy },
      hard: { es: sceneCopy.hard },
    },
    bubble: { ...asset.bubble, type: copyMode(sceneCopy.mode, `${asset.id}.mode`) },
    mobileBubble: asset.mobileBubble,
    production: asset.production,
  };
});

invariant(
  new Set(THE_LOST_MAP_SCENES.map((scene) => scene.id)).size === 24,
  "scene IDs must be unique",
);

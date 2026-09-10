import sourceManifest from "./THE_LOST_MAP_ASSET_MANIFEST.json";
import {
  BUBBLE_PRESETS,
  type BubblePlacement,
  type PackageScene,
} from "../schema";

export const THE_LOST_MAP_SLUG = "the-lost-map";

type RawAssetScene = {
  sceneId: string;
  wide: string;
  portrait: string;
  wideAspectRatio: string;
  portraitAspectRatio: string;
  bubbleSafeWide: string;
  bubbleSafePortrait: string;
  characterState: string;
  propState: string;
  location: string;
  timeOfDay: string;
};

type RawAssetManifest = {
  title: string;
  product: string;
  manifestVersion: string;
  sceneCount: number;
  imageCount: number;
  sourceFormat: string;
  imagesContainTextOrUI: boolean;
  canonicalCharacterState: string;
  scenes: RawAssetScene[];
};

export type TheLostMapProductionMetadata = Pick<
  RawAssetScene,
  | "wideAspectRatio"
  | "portraitAspectRatio"
  | "characterState"
  | "propState"
  | "location"
  | "timeOfDay"
>;

export type TheLostMapAssetScene = Pick<
  PackageScene,
  "id" | "order" | "image"
> & {
  bubble: BubblePlacement;
  mobileBubble: BubblePlacement;
  production: TheLostMapProductionMetadata;
};

const manifest = sourceManifest as RawAssetManifest;
const expectedSceneIds = Array.from({ length: 24 }, (_, index) => `S${String(index + 1).padStart(2, "0")}`);
const bubblePresets = new Set<string>(BUBBLE_PRESETS);
type BubblePreset = (typeof BUBBLE_PRESETS)[number];
const mobileBubbleConstraints: Partial<Record<string, Pick<BubblePlacement, "maxWidth" | "alignment">>> = {
  // Keep the entrance seal and Lucía's working hand outside the left safe column.
  S20: { maxWidth: 0.42, alignment: "start" },
  // Keep the closing photograph and Lucía's face readable below the title strip.
  S24: { maxWidth: 0.82, alignment: "center" },
};
const mobileBubblePresetOverrides: Partial<Record<string, BubblePreset>> = {
  // Hard copy is tall enough to reach Lucía's face in the centered strip;
  // the top-right stone and stair area remains clear of her and the photograph.
  S24: "top-right",
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid The Lost Map asset manifest: ${message}`);
}

function bubblePreset(value: string, field: string): BubblePreset {
  invariant(bubblePresets.has(value), `${field} has unknown preset ${value}`);
  return value as BubblePreset;
}

function publicAssetPath(relativePath: string, kind: "wide" | "portrait", sceneId: string) {
  invariant(relativePath === `${kind}/${sceneId}.png`, `${sceneId}.${kind} must be ${kind}/${sceneId}.png`);
  return `/stories/${THE_LOST_MAP_SLUG}/${relativePath}`;
}

invariant(manifest.title === "The Lost Map", "title must be The Lost Map");
invariant(manifest.manifestVersion === "1.0", "manifestVersion must be 1.0");
invariant(manifest.sceneCount === 24, "sceneCount must be 24");
invariant(manifest.imageCount === 48, "imageCount must be 48");
invariant(manifest.sourceFormat === "PNG", "sourceFormat must be PNG");
invariant(manifest.imagesContainTextOrUI === false, "scene images must not contain text or UI");
invariant(manifest.scenes.length === 24, "scenes must contain 24 records");

export const THE_LOST_MAP_ASSET_MANIFEST = manifest;

export const THE_LOST_MAP_ASSET_SCENES: TheLostMapAssetScene[] = manifest.scenes.map((scene, index) => {
  const expectedId = expectedSceneIds[index];
  invariant(scene.sceneId === expectedId, `scenes[${index}].sceneId must be ${expectedId}`);
  invariant(scene.wideAspectRatio === "16:9", `${scene.sceneId}.wideAspectRatio must be 16:9`);
  invariant(scene.portraitAspectRatio === "4:5", `${scene.sceneId}.portraitAspectRatio must be 4:5`);

  return {
    id: scene.sceneId,
    order: index + 1,
    image: {
      desktop: publicAssetPath(scene.wide, "wide", scene.sceneId),
      mobile: publicAssetPath(scene.portrait, "portrait", scene.sceneId),
    },
    bubble: { preset: bubblePreset(scene.bubbleSafeWide, `${scene.sceneId}.bubbleSafeWide`) },
    mobileBubble: {
      preset: mobileBubblePresetOverrides[scene.sceneId]
        ?? bubblePreset(scene.bubbleSafePortrait, `${scene.sceneId}.bubbleSafePortrait`),
      ...mobileBubbleConstraints[scene.sceneId],
    },
    production: {
      wideAspectRatio: scene.wideAspectRatio,
      portraitAspectRatio: scene.portraitAspectRatio,
      characterState: scene.characterState,
      propState: scene.propState,
      location: scene.location,
      timeOfDay: scene.timeOfDay,
    },
  };
});

invariant(new Set(THE_LOST_MAP_ASSET_SCENES.map((scene) => scene.id)).size === 24, "scene IDs must be unique");
invariant(
  new Set(THE_LOST_MAP_ASSET_SCENES.map((scene) => typeof scene.image === "string" ? scene.image : scene.image.desktop)).size === 24,
  "wide asset paths must be unique",
);
invariant(
  new Set(THE_LOST_MAP_ASSET_SCENES.map((scene) => typeof scene.image === "string" ? scene.image : scene.image.mobile)).size === 24,
  "portrait asset paths must be unique",
);

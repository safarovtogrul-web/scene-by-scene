import { existsSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";
import { STORY_SHELLS } from "../catalog/stories";
import { STORY_PACKAGES } from "./registry";
import { assertStoryPackages } from "./validation";

export function storyAssetExists(asset: string): boolean {
  const publicRoot = resolve(process.cwd(), "public");
  const path = resolve(publicRoot, asset.replace(/^\//, ""));
  return path.startsWith(publicRoot + sep) && existsSync(path) && statSync(path).isFile();
}

/** Called by Next config in dev/build, and again by development reader routes. */
export function validateRegisteredStories() {
  assertStoryPackages(STORY_PACKAGES, {
    assetExists: storyAssetExists,
    reserved: STORY_SHELLS.filter((shell) => !STORY_PACKAGES.some((story) => story.id === shell.id)),
  });
}

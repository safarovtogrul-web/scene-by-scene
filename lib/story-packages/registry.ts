import type { StoryPackage } from "./schema";
import { THE_LOST_MAP } from "./manifests/the-lost-map";

/** Register reviewed production manifests here. Never register design mockups or fixtures. */
export const STORY_PACKAGES: StoryPackage[] = [THE_LOST_MAP];

export function getStoryPackage(slug: string): StoryPackage | undefined {
  return STORY_PACKAGES.find((story) => story.slug === slug);
}

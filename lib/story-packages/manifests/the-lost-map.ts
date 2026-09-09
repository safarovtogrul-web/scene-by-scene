import { sceneImageSources, type StoryPackage } from "../schema";
import { THE_LOST_MAP_SCENES } from "./the-lost-map-copy";

const openingScene = sceneImageSources(THE_LOST_MAP_SCENES[0].image).desktop;

/**
 * Publication metadata follows the approved grounded-adventure-mystery story
 * arc. The opening canonical frame supplies the required catalogue surfaces;
 * no additional cover artwork is introduced.
 */
export const THE_LOST_MAP = {
  schemaVersion: 1,
  status: "published",
  id: "the-lost-map",
  slug: "the-lost-map",
  title: "The Lost Map",
  subtitle: "A grounded adventure mystery",
  genre: "adventure",
  description:
    "Lucía follows a map, a brass key and a trail of stone markers to a hidden family archive that reveals her grandmother's connection to an old bridge.",
  cover: openingScene,
  heroScene: openingScene,
  background: { image: openingScene },
  defaultDifficulty: "easy",
  estimatedReadingMinutes: 8,
  availableLanguages: ["es"],
  addedAt: "2026-09-09",
  scenes: THE_LOST_MAP_SCENES,
} satisfies StoryPackage;

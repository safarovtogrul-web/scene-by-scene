import localizedMetadata from "./THE_LOST_MAP_METADATA.json";
import { sceneImageSources, type StoryDisplayCopy, type StoryPackage } from "../schema";
import type { LanguageId } from "../../languages";
import { THE_LOST_MAP_LANGUAGES, THE_LOST_MAP_SCENES } from "./the-lost-map-copy";

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
  availableLanguages: THE_LOST_MAP_LANGUAGES,
  addedAt: "2026-09-09",
  // Display copy follows the interface language. The slug, id and canonical
  // English title above are identifiers and never move with it.
  localized: (localizedMetadata.metadata ?? {}) as Partial<Record<LanguageId, StoryDisplayCopy>>,
  scenes: THE_LOST_MAP_SCENES,
} satisfies StoryPackage;

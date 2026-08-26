import type { MessageKey } from "@/lib/i18n/messages";

import type { LanguageId } from "@/lib/languages";

/** Textory intentionally uses only these two editorial difficulty versions. */
export const STORY_DIFFICULTIES = ["easy", "hard"] as const;
export type Difficulty = (typeof STORY_DIFFICULTIES)[number];

export type GenreId =
  | "mystery"
  | "adventure"
  | "daily-life"
  | "romance"
  | "comedy"
  | "fantasy"
  | "crime";

/** Reading-length bucket, derived from `minutes`. */
export type LengthBucket = "short" | "medium" | "long";

export type StoryVocabulary = {
  term: string;
  definition?: string;
  sceneId?: string;
};

/** One independently renderable scene from a PDF/story source. */
export type StoryScene = {
  id: string;
  image: string;
  /** The sentence in the selected learning language. */
  text: string;
  /** Supporting copy by interface-language id, never one story-wide block. */
  translations?: Partial<Record<LanguageId, string>>;
  vocabulary?: StoryVocabulary[];
};

/** The complete authored variant for one learning language at one difficulty. */
export type StoryLanguageVariant = {
  scenes: StoryScene[];
  vocabulary?: StoryVocabulary[];
};

export type StoryDifficultyContent = {
  /** A story can have a different scene count and content in each level. */
  languageVariants: Partial<Record<LanguageId, StoryLanguageVariant>>;
};

export type StoryLevels = Record<Difficulty, StoryDifficultyContent>;

export type StoryBackground = {
  /** Background treatment for this story only, distinct from cover and hero scene. */
  image?: string;
  accent?: string;
};

export type Story = {
  /** URL slug and stable identifier. */
  id: string;
  title: string;
  /** The initially highlighted reader version; the reader can switch either way. */
  defaultDifficulty: Difficulty;
  genre: GenreId;
  /** Estimated time to work through every scene. */
  minutes: number;
  /** Catalogue estimate retained until authored scene data arrives. */
  scenes: number;
  /** Cover artwork — catalogue cards, grids and the story detail page. */
  cover: string;
  /** Dedicated hero artwork. It stays distinct from `cover` by design. */
  heroScene?: string;
  /** Per-story visual identity, never inferred from the global homepage. */
  background: StoryBackground;
  /** Explicit availability declaration; no unlisted language may fall back. */
  availableLanguages: LanguageId[];
  /** Exactly Easy and Hard, each with its own optional language variants. */
  levels: StoryLevels;
  /** Existing catalogue metadata, not reader scene text. */
  description: string;
  /** Existing catalogue preview vocabulary, not authored reader vocabulary. */
  vocabulary: string[];
  /** ISO date the story was added — drives the "New Stories" row and sorting. */
  addedAt: string;
  /** Understated premium marker. No paywall logic exists yet. */
  premium?: boolean;
};

export type StorySeed = Omit<Story, "background" | "availableLanguages" | "levels"> & {
  background?: StoryBackground;
};

/**
 * Current catalogue cards have no trusted PDF-backed scene data. This helper
 * makes their explicit empty availability honest while giving every story the
 * permanent two-level content shape needed for future imports.
 */
export function createStoryShell(seed: StorySeed): Story {
  return {
    ...seed,
    background: seed.background ?? { image: seed.cover, accent: "violet" },
    availableLanguages: [],
    levels: {
      easy: { languageVariants: {} },
      hard: { languageVariants: {} },
    },
  };
}

export type Genre = {
  id: GenreId;
  labelKey: MessageKey;
  taglineKey: MessageKey;
  cover: string;
};

/** Mock reading progress. Replaced by real per-user state once accounts exist. */
export type StoryProgress = {
  storyId: string;
  scenesCompleted: number;
  updatedAt: string;
};

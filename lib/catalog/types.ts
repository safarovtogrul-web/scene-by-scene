import type { MessageKey } from "@/lib/i18n/messages";

import type { LanguageId } from "@/lib/languages";

/** Scene by Scene intentionally uses only these two editorial difficulty versions. */
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

/** Resolved view of one scene, retained for existing catalogue consumers. */
export type StoryScene = {
  id: string;
  order: number;
  image: string;
  /** The sentence in the selected learning language. */
  text: string;
  /** Supporting copy by interface-language id, never one story-wide block. */
  translations?: Partial<Record<LanguageId, string>>;
  vocabulary?: StoryVocabulary[];
};

/** Derived on demand from the canonical package for one language/difficulty. */
export type StoryLanguageVariant = {
  scenes: StoryScene[];
  vocabulary?: StoryVocabulary[];
};

export type StoryDifficultyContent = {
  /** Legacy catalogue container; new authored content lives in StoryPackage. */
  languageVariants: Partial<Record<LanguageId, StoryLanguageVariant>>;
};

export type StoryLevels = Record<Difficulty, StoryDifficultyContent>;

export type StoryBackground = {
  /** Background treatment for this story only, distinct from cover and hero scene. */
  image?: string;
  accent?: string;
};

export type Story = {
  /** Stable identifier, independent of the URL. */
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
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

export type StorySeed = Omit<Story, "slug" | "background" | "availableLanguages" | "levels"> & {
  slug?: string;
  background?: StoryBackground;
};

/**
 * Current catalogue cards have no reviewed scene data. This helper
 * makes their explicit empty availability honest while giving every story the
 * existing two-difficulty availability shape.
 */
export function createStoryShell(seed: StorySeed): Story {
  return {
    ...seed,
    slug: seed.slug ?? seed.id,
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

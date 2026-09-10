import type { Difficulty, GenreId, Story } from "../catalog/types";
import type { LanguageId } from "../languages";

export const BUBBLE_PRESETS = [
  "top-left", "top-center", "top-right", "center-left", "center-right",
  "bottom-left", "bottom-center", "bottom-right",
] as const;
export const BUBBLE_TYPES = ["narration", "speech"] as const;
/** Portrait phones get the book composition; every landscape viewport uses wide art. */
export const READER_MOBILE_MEDIA = "(max-width: 767px) and (orientation: portrait)";
/** A single source retains the safe contain fallback. Paired art shares one moment. */
export type SceneImage = string | { desktop: string; mobile?: string };

export function sceneImageSources(image: SceneImage | null | undefined) {
  const desktop = typeof image === "string" ? image : typeof image?.desktop === "string" ? image.desktop : "";
  return { desktop, mobile: typeof image === "object" && typeof image?.mobile === "string" && image.mobile ? image.mobile : desktop };
}

export function readerHref(slug: string, difficulty: Difficulty, base = `/stories/${encodeURIComponent(slug)}/read`) {
  return `${base}?difficulty=${difficulty}`;
}

/** All coordinates and widths are fractions in [0, 1], never screen pixels. */
export type NormalizedPoint = { x: number; y: number };
export type BubblePlacement = (
  | { preset: (typeof BUBBLE_PRESETS)[number]; x?: never; y?: never }
  | (NormalizedPoint & { preset?: never })
) & {
  type?: (typeof BUBBLE_TYPES)[number];
  speaker?: string;
  maxWidth?: number;
  alignment?: "start" | "center" | "end";
  tone?: "glass" | "ink";
};

export type SceneLanguageText = Partial<Record<LanguageId, string>>;

/** The editorial source: shared responsive artwork, with exactly two text versions. */
export type PackageScene = {
  id: string;
  order: number;
  image: SceneImage;
  /**
   * The one visible event this scene shows, written once in English. It is the
   * reference every language is checked against and is never rendered — it
   * exists so "the same meaning in all nineteen" is something a test can
   * assert rather than something a reviewer must take on trust.
   */
  semanticCore?: string;
  /** Reviewed image descriptions; an absent locale leaves the image decorative. */
  alt?: SceneLanguageText;
  text: Record<Difficulty, SceneLanguageText>;
  bubble?: BubblePlacement;
  /** Optional composition override on small screens. */
  mobileBubble?: BubblePlacement;
  visual?: { focalPoint?: NormalizedPoint; mobileFocalPoint?: NormalizedPoint };
  translation?: {
    /** Optional editorial caption overrides, including translation-only languages. */
    text?: Partial<Record<Difficulty, SceneLanguageText>>;
    hide?: boolean;
    editorialNote?: string;
  };
};

/**
 * Display copy for one interface language. The story's slug, id and canonical
 * English title are identifiers and never change with language.
 */
export type StoryDisplayCopy = { title?: string; subtitle?: string; description?: string };

export type StoryPackage = {
  schemaVersion: 1;
  status: "published" | "development";
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  genre: GenreId;
  description: string;
  cover: string;
  heroScene: string;
  background: { image: string; color?: string; accent?: string };
  defaultDifficulty: Difficulty;
  estimatedReadingMinutes: number;
  availableLanguages: LanguageId[];
  addedAt: string;
  premium?: boolean;
  vocabulary?: string[];
  /** Interface-language display copy; absent locales fall back to canonical English. */
  localized?: Partial<Record<LanguageId, StoryDisplayCopy>>;
  scenes: PackageScene[];
};

/**
 * Resolves the title, subtitle and description to show.
 *
 * This follows the *interface* language and nothing else: story metadata is
 * product chrome around the story, not the story's own text, so it must not
 * move when a reader changes their learning or translation language.
 */
export function storyDisplay(
  story: { title: string; subtitle?: string; description: string; localized?: Partial<Record<LanguageId, StoryDisplayCopy>> },
  language: LanguageId,
): { title: string; subtitle?: string; description: string } {
  const copy = story.localized?.[language];
  return {
    title: copy?.title?.trim() || story.title,
    subtitle: copy?.subtitle?.trim() || story.subtitle,
    description: copy?.description?.trim() || story.description,
  };
}

/** Adapt authored packages to the existing catalogue; counts are always derived. */
export function packageToStory(story: StoryPackage): Story {
  return {
    id: story.id, slug: story.slug, title: story.title, subtitle: story.subtitle,
    genre: story.genre, description: story.description,
    cover: story.cover, heroScene: story.heroScene, background: story.background,
    defaultDifficulty: story.defaultDifficulty,
    minutes: story.estimatedReadingMinutes, scenes: story.scenes.length,
    availableLanguages: story.availableLanguages,
    addedAt: story.addedAt, premium: story.premium, vocabulary: story.vocabulary ?? [],
    localized: story.localized,
    // Catalogue consumers retain their existing availability contract. Reader
    // text stays in the package, resolved only on its dedicated route.
    levels: { easy: { languageVariants: {} }, hard: { languageVariants: {} } },
  };
}

const readableText = (value: unknown): string | undefined => typeof value === "string" && value.trim() ? value : undefined;

/** Missing/transitional content is unavailable, never an implicit language substitution. */
export function sceneCopy(scene: PackageScene | null | undefined, difficulty: Difficulty, learning: LanguageId, ui: LanguageId) {
  return {
    primary: readableText(scene?.text?.[difficulty]?.[learning]),
    translation: scene?.translation?.hide || learning === ui
      ? undefined
      : readableText(scene?.translation?.text?.[difficulty]?.[ui]) ?? readableText(scene?.text?.[difficulty]?.[ui]),
  };
}

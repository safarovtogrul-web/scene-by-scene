import { STORIES } from "./stories";
import { MOCK_PROGRESS } from "./progress";
import { GENRES, bucketForMinutes } from "./taxonomy";
import type { MessageKey } from "@/lib/i18n/messages";
import type { Difficulty, GenreId, LengthBucket, Story, StoryLanguageVariant, StoryProgress } from "./types";
import type { LanguageId } from "@/lib/languages";
import { getStoryPackage } from "../story-packages/registry";
import { sceneCopy, sceneImageSources } from "../story-packages/schema";

const BY_ID = new Map(STORIES.map((story) => [story.id, story]));
const BY_SLUG = new Map(STORIES.map((story) => [story.slug, story]));
const PROGRESS_BY_ID = new Map(MOCK_PROGRESS.map((entry) => [entry.storyId, entry]));

export function getStory(id: string): Story | undefined { return BY_ID.get(id); }
export function getStoryBySlug(slug: string): Story | undefined { return BY_SLUG.get(slug); }
export function requireStory(id: string): Story {
  const story = BY_ID.get(id);
  if (!story) throw new Error(`Unknown story: ${id}`);
  return story;
}
export function getGenre(id: GenreId) { return GENRES.find((genre) => genre.id === id); }
/** Message key for a genre name; resolve it through `t()` to display it. */
export function genreLabelKey(id: GenreId): MessageKey | null { return getGenre(id)?.labelKey ?? null; }

/** English name, for page metadata and image alt text — neither is user-language aware. */
export function genreSlugLabel(id: GenreId): string {
  return id.split("-").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
export function difficultyLabelKey(difficulty: Difficulty): MessageKey { return difficulty === "easy" ? "easy" : "hard"; }
export function countByGenre(id: GenreId): number { return STORIES.filter((story) => story.genre === id).length; }

/** Resolves one exact story/difficulty/learning-language variant, never falls back. */
export function resolveStoryLanguageVariant(
  story: Story,
  difficulty: Difficulty,
  learningLanguage: LanguageId,
): StoryLanguageVariant | null {
  if (!story.availableLanguages.includes(learningLanguage)) return null;
  const authored = getStoryPackage(story.slug);
  if (authored && !authored.scenes.every((scene) => sceneCopy(scene, difficulty, learningLanguage, learningLanguage).primary)) return null;
  if (authored) return {
    scenes: authored.scenes.map((scene) => ({
      id: scene.id, order: scene.order, image: sceneImageSources(scene.image).desktop,
      text: sceneCopy(scene, difficulty, learningLanguage, learningLanguage).primary!,
      translations: scene.translation?.hide ? undefined : {
        ...scene.text[difficulty], ...scene.translation?.text?.[difficulty],
      },
    })),
  };
  return story.levels?.[difficulty]?.languageVariants?.[learningLanguage] ?? null;
}

export function getProgress(storyId: string): StoryProgress | undefined { return PROGRESS_BY_ID.get(storyId); }
export function progressRatio(story: Story): number {
  const progress = PROGRESS_BY_ID.get(story.id);
  return progress ? Math.min(progress.scenesCompleted / story.scenes, 1) : 0;
}
export function getContinueLearning(): Story[] {
  return [...MOCK_PROGRESS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((entry) => BY_ID.get(entry.storyId)).filter((story): story is Story => Boolean(story));
}
export function getNewStories(limit = 8): Story[] { return [...STORIES].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, limit); }
export function getRecommended(limit = 8): Story[] {
  const started = new Set(MOCK_PROGRESS.map((entry) => entry.storyId));
  return STORIES.filter((story) => !started.has(story.id)).sort((a, b) => a.title.localeCompare(b.title)).slice(0, limit);
}
export function getByDifficulty(difficulty: Difficulty, limit?: number): Story[] {
  const matches = STORIES.filter((story) => story.levels[difficulty] !== undefined);
  return limit ? matches.slice(0, limit) : matches;
}
export function getByGenre(genre: GenreId, limit?: number): Story[] {
  const matches = STORIES.filter((story) => story.genre === genre);
  return limit ? matches.slice(0, limit) : matches;
}
export function getRelated(story: Story, limit = 6): Story[] {
  const sameGenre = STORIES.filter((candidate) => candidate.genre === story.genre && candidate.id !== story.id);
  if (sameGenre.length >= limit) return sameGenre.slice(0, limit);
  const sameDifficulty = STORIES.filter((candidate) => candidate.defaultDifficulty === story.defaultDifficulty && candidate.id !== story.id && candidate.genre !== story.genre);
  return [...sameGenre, ...sameDifficulty].slice(0, limit);
}

export type SortOption = "recommended" | "newest" | "shortest";
export type StoryQuery = {
  search?: string;
  difficulty?: Difficulty | "all";
  genre?: GenreId | "all";
  length?: LengthBucket | "all";
  sort?: SortOption;
};
export function filterStories(query: StoryQuery): Story[] {
  const search = query.search?.trim().toLowerCase() ?? "";
  const results = STORIES.filter((story) => {
    if (query.difficulty && query.difficulty !== "all" && !story.levels[query.difficulty]) return false;
    if (query.genre && query.genre !== "all" && story.genre !== query.genre) return false;
    if (query.length && query.length !== "all" && bucketForMinutes(story.minutes) !== query.length) return false;
    return !search || `${story.title} ${story.description} ${story.genre} ${story.defaultDifficulty}`.toLowerCase().includes(search);
  });
  if (query.sort === "newest") return results.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  if (query.sort === "shortest") return results.sort((a, b) => a.minutes - b.minutes);
  return results.sort((a, b) => a.title.localeCompare(b.title));
}
export const TOTAL_STORY_COUNT = STORIES.length;

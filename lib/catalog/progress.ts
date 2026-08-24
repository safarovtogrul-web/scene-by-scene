import type { StoryProgress } from "./types";

/**
 * Mock reading progress.
 *
 * Stands in for per-user state until accounts exist. The homepage hides the
 * "Continue Learning" row entirely when this is empty, so flipping
 * `MOCK_PROGRESS` to `[]` is enough to preview the signed-out homepage.
 */
export const MOCK_PROGRESS: StoryProgress[] = [
  { storyId: "the-last-train", scenesCompleted: 6, updatedAt: "2026-08-14" },
  { storyId: "coffee-for-two", scenesCompleted: 8, updatedAt: "2026-08-12" },
  { storyId: "lost-at-sea", scenesCompleted: 3, updatedAt: "2026-08-09" },
];

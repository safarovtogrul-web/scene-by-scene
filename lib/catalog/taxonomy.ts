import type { MessageKey } from "@/lib/i18n/messages";
import { STORY_DIFFICULTIES, type Difficulty, type Genre, type LengthBucket } from "./types";

export const DIFFICULTY_OPTIONS: Array<{ id: Difficulty; labelKey: MessageKey }> = [
  { id: "easy", labelKey: "easy" },
  { id: "hard", labelKey: "hard" },
];

export { STORY_DIFFICULTIES };

export const GENRES: Genre[] = [
  { id: "mystery", labelKey: "genreMystery", taglineKey: "taglineMystery", cover: "/stories/midnight-express.svg" },
  { id: "adventure", labelKey: "genreAdventure", taglineKey: "taglineAdventure", cover: "/stories/salt-and-lantern.svg" },
  { id: "daily-life", labelKey: "genreDailyLife", taglineKey: "taglineDailyLife", cover: "/stories/table-for-two.svg" },
  { id: "romance", labelKey: "genreRomance", taglineKey: "taglineRomance", cover: "/stories/the-quiet-woods.svg" },
  { id: "fantasy", labelKey: "genreFantasy", taglineKey: "taglineFantasy", cover: "/stories/the-last-giant.svg" },
  { id: "comedy", labelKey: "genreComedy", taglineKey: "taglineComedy", cover: "/stories/the-reading-room.svg" },
  { id: "crime", labelKey: "genreCrime", taglineKey: "taglineCrime", cover: "/stories/neon-rain.svg" },
];

export const FEATURED_GENRE_IDS = ["mystery", "adventure", "daily-life", "romance", "fantasy", "comedy"] as const;

export const LENGTH_BUCKETS: Array<{ id: LengthBucket; labelKey: MessageKey; max: number }> = [
  { id: "short", labelKey: "lengthShort", max: 5 },
  { id: "medium", labelKey: "lengthMedium", max: 10 },
  { id: "long", labelKey: "lengthLong", max: Infinity },
];

export function bucketForMinutes(minutes: number): LengthBucket {
  if (minutes <= 5) return "short";
  if (minutes <= 10) return "medium";
  return "long";
}

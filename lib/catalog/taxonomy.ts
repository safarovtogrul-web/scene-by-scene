import { STORY_DIFFICULTIES, type Difficulty, type Genre, type LengthBucket } from "./types";

export const DIFFICULTY_OPTIONS: Array<{ id: Difficulty; label: string }> = [
  { id: "easy", label: "Easy" },
  { id: "hard", label: "Hard" },
];

export { STORY_DIFFICULTIES };

export const GENRES: Genre[] = [
  { id: "mystery", label: "Mystery", tagline: "Something does not add up.", cover: "/stories/midnight-express.svg" },
  { id: "adventure", label: "Adventure", tagline: "Far from anywhere safe.", cover: "/stories/salt-and-lantern.svg" },
  { id: "daily-life", label: "Daily Life", tagline: "The language you actually use.", cover: "/stories/table-for-two.svg" },
  { id: "romance", label: "Romance", tagline: "Small moments, said out loud.", cover: "/stories/the-quiet-woods.svg" },
  { id: "fantasy", label: "Fantasy", tagline: "Worlds that never existed.", cover: "/stories/the-last-giant.svg" },
  { id: "comedy", label: "Comedy", tagline: "It gets worse, politely.", cover: "/stories/the-reading-room.svg" },
  { id: "crime", label: "Crime", tagline: "Someone is lying.", cover: "/stories/neon-rain.svg" },
];

export const FEATURED_GENRE_IDS = ["mystery", "adventure", "daily-life", "romance", "fantasy", "comedy"] as const;

export const LENGTH_BUCKETS: Array<{ id: LengthBucket; label: string; max: number }> = [
  { id: "short", label: "Under 5 min", max: 5 },
  { id: "medium", label: "5 – 10 min", max: 10 },
  { id: "long", label: "Over 10 min", max: Infinity },
];

export function bucketForMinutes(minutes: number): LengthBucket {
  if (minutes <= 5) return "short";
  if (minutes <= 10) return "medium";
  return "long";
}

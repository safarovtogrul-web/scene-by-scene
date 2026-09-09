import { createStoryShell, type Story, type StorySeed } from "./types";
import { STORY_PACKAGES } from "../story-packages/registry";
import { packageToStory } from "../story-packages/schema";

/**
 * Demo catalogue.
 *
 * Every entry is fictional placeholder content used to make the UI feel real.
 * Covers currently point at the eight temporary SVGs in `public/stories/`, so
 * several stories deliberately share artwork — that repetition disappears the
 * moment real per-story scenes land. Nothing outside this file needs to change
 * when that happens.
 *
 * `heroScene` is set only on the stories the animated homepage hero composes
 * with, and during the placeholder phase it points at the same temporary SVG as
 * `cover`. The two are separate fields so real hero artwork can be chosen
 * independently of catalogue cover artwork later.
 */
const STORY_SEEDS: StorySeed[] = [
  {
    id: "the-last-train",
    title: "The Last Train",
    defaultDifficulty: "hard",
    genre: "mystery",
    minutes: 8,
    scenes: 14,
    cover: "/stories/midnight-express.svg",
    heroScene: "/stories/midnight-express.svg",
    description:
      "A woman boards the final train of the night and realises the man in the next carriage has been following her since the station café.",
    vocabulary: ["glance", "approach", "hesitate", "platform", "carriage"],
    addedAt: "2026-07-28",
  },
  {
    id: "the-giants-forest",
    title: "The Giant's Forest",
    defaultDifficulty: "easy",
    genre: "fantasy",
    minutes: 6,
    scenes: 11,
    cover: "/stories/the-last-giant.svg",
    heroScene: "/stories/the-last-giant.svg",
    description:
      "A shepherd crosses the valley at dusk and finds that the shape on the ridge is not a mountain at all.",
    vocabulary: ["climb", "shadow", "enormous", "valley", "wake up"],
    addedAt: "2026-08-04",
  },
  {
    id: "a-rainy-evening",
    title: "A Rainy Evening",
    defaultDifficulty: "hard",
    genre: "daily-life",
    minutes: 7,
    scenes: 12,
    cover: "/stories/table-for-two.svg",
    description:
      "Two colleagues wait out a storm in a small café and end up having the conversation they had been avoiding for months.",
    vocabulary: ["order", "admit", "interrupt", "soaked", "on purpose"],
    addedAt: "2026-08-01",
  },
  {
    id: "lost-at-sea",
    title: "Lost at Sea",
    defaultDifficulty: "hard",
    genre: "adventure",
    minutes: 11,
    scenes: 18,
    cover: "/stories/salt-and-lantern.svg",
    heroScene: "/stories/salt-and-lantern.svg",
    description:
      "Three days after the storm, the crew spots a light on the horizon — and has to decide whether to trust it.",
    vocabulary: ["drift", "signal", "supplies", "horizon", "give in"],
    addedAt: "2026-07-15",
    premium: true,
  },
  {
    id: "the-empty-house",
    title: "The Empty House",
    defaultDifficulty: "hard",
    genre: "mystery",
    minutes: 9,
    scenes: 15,
    cover: "/stories/house-on-the-hill.svg",
    heroScene: "/stories/house-on-the-hill.svg",
    description:
      "The house at the end of the road has been empty for nine years. Tonight, one window is lit.",
    vocabulary: ["knock", "notice", "upstairs", "locked", "turn back"],
    addedAt: "2026-08-08",
  },
  {
    id: "coffee-for-two",
    title: "Coffee for Two",
    defaultDifficulty: "easy",
    genre: "romance",
    minutes: 5,
    scenes: 9,
    cover: "/stories/table-for-two.svg",
    heroScene: "/stories/table-for-two.svg",
    description:
      "He orders two coffees every morning at the same time. This morning, someone asks him why.",
    vocabulary: ["smile", "wait for", "usual", "seat", "every day"],
    addedAt: "2026-07-22",
  },
  {
    id: "neon-nights",
    title: "Neon Nights",
    defaultDifficulty: "hard",
    genre: "crime",
    minutes: 12,
    scenes: 20,
    cover: "/stories/neon-rain.svg",
    heroScene: "/stories/neon-rain.svg",
    description:
      "A detective works a case through the rain-soaked streets of a city that never quite turns its lights off.",
    vocabulary: ["suspect", "witness", "follow up", "alibi", "come clean"],
    addedAt: "2026-08-11",
    premium: true,
  },
  {
    id: "the-missing-letter",
    title: "The Missing Letter",
    defaultDifficulty: "hard",
    genre: "mystery",
    minutes: 8,
    scenes: 13,
    cover: "/stories/the-reading-room.svg",
    heroScene: "/stories/the-reading-room.svg",
    description:
      "An archivist finds a letter that was never sent, and spends the night working out who it was meant for.",
    vocabulary: ["seal", "handwriting", "archive", "figure out", "on purpose"],
    addedAt: "2026-07-19",
  },
  {
    id: "the-quiet-woods",
    title: "The Quiet Woods",
    defaultDifficulty: "easy",
    genre: "fantasy",
    minutes: 6,
    scenes: 10,
    cover: "/stories/the-quiet-woods.svg",
    heroScene: "/stories/the-quiet-woods.svg",
    description:
      "The lantern only lights the path ahead. Behind it, the forest closes again — and something keeps pace.",
    vocabulary: ["path", "follow", "quiet", "lantern", "look back"],
    addedAt: "2026-06-30",
  },
  {
    id: "the-late-shift",
    title: "The Late Shift",
    defaultDifficulty: "hard",
    genre: "daily-life",
    minutes: 7,
    scenes: 12,
    cover: "/stories/neon-rain.svg",
    description:
      "The last hour of a night shift, a broken till and a customer who will not leave until the story is finished.",
    vocabulary: ["close up", "complain", "shift", "regular", "put up with"],
    addedAt: "2026-08-06",
  },
  {
    id: "a-seat-by-the-window",
    title: "A Seat by the Window",
    defaultDifficulty: "easy",
    genre: "daily-life",
    minutes: 4,
    scenes: 8,
    cover: "/stories/midnight-express.svg",
    description:
      "A short first journey: buy the ticket, find the seat, watch the city go past.",
    vocabulary: ["ticket", "seat", "window", "arrive", "get off"],
    addedAt: "2026-07-09",
  },
  {
    id: "the-lighthouse-keeper",
    title: "The Lighthouse Keeper",
    defaultDifficulty: "hard",
    genre: "adventure",
    minutes: 10,
    scenes: 16,
    cover: "/stories/salt-and-lantern.svg",
    description:
      "For thirty years he has kept the light burning. Tonight the supply boat does not come.",
    vocabulary: ["keep", "warn", "cliff", "run out of", "hold on"],
    addedAt: "2026-06-18",
  },
  {
    id: "two-tickets-home",
    title: "Two Tickets Home",
    defaultDifficulty: "easy",
    genre: "romance",
    minutes: 5,
    scenes: 9,
    cover: "/stories/midnight-express.svg",
    description:
      "She bought two tickets. She only needs one. The train leaves in eleven minutes.",
    vocabulary: ["decide", "platform", "change my mind", "leave", "wait"],
    addedAt: "2026-08-13",
  },
  {
    id: "the-wrong-address",
    title: "The Wrong Address",
    defaultDifficulty: "hard",
    genre: "crime",
    minutes: 9,
    scenes: 15,
    cover: "/stories/house-on-the-hill.svg",
    description:
      "A parcel arrives at the wrong door. Opening it turns out to be the first mistake of several.",
    vocabulary: ["deliver", "sign for", "deny", "trace", "get involved"],
    addedAt: "2026-07-31",
  },
  {
    id: "the-night-librarian",
    title: "The Night Librarian",
    defaultDifficulty: "hard",
    genre: "mystery",
    minutes: 13,
    scenes: 21,
    cover: "/stories/the-reading-room.svg",
    description:
      "Every book returned after midnight is catalogued by hand. The librarian has been recording something else entirely.",
    vocabulary: [
      "catalogue",
      "discrepancy",
      "meticulous",
      "look into",
      "come to light",
    ],
    addedAt: "2026-08-09",
    premium: true,
  },
  {
    id: "what-the-neighbour-saw",
    title: "What the Neighbour Saw",
    defaultDifficulty: "hard",
    genre: "comedy",
    minutes: 7,
    scenes: 12,
    cover: "/stories/table-for-two.svg",
    description:
      "A misunderstanding at a dinner party grows, politely and unstoppably, into a neighbourhood scandal.",
    vocabulary: ["overhear", "assume", "bring up", "awkward", "blow over"],
    addedAt: "2026-08-02",
  },
  {
    id: "one-more-stop",
    title: "One More Stop",
    defaultDifficulty: "easy",
    genre: "comedy",
    minutes: 4,
    scenes: 7,
    cover: "/stories/neon-rain.svg",
    description:
      "He falls asleep on the bus. He wakes up four stops later. So does the man next to him.",
    vocabulary: ["sleep", "wake up", "stop", "sorry", "get up"],
    addedAt: "2026-07-05",
  },
  {
    id: "the-shape-on-the-ridge",
    title: "The Shape on the Ridge",
    defaultDifficulty: "hard",
    genre: "fantasy",
    minutes: 10,
    scenes: 17,
    cover: "/stories/the-last-giant.svg",
    description:
      "The old maps mark the ridge as impassable. The expedition finds out why on the second night.",
    vocabulary: ["set out", "trace", "vanish", "ridge", "turn out"],
    addedAt: "2026-06-24",
  },
];

/**
 * Existing catalogue entries remain metadata-only until reviewed story packages
 * and original scene images are supplied. `createStoryShell` gives each one a truthful
 * empty language availability declaration and both Easy/Hard containers.
 */
export const STORY_SHELLS: Story[] = STORY_SEEDS.map(createStoryShell);

// A reviewed package can replace an existing demo by id. New identities append
// naturally; the build validator prevents collisions between unrelated stories.
const published = STORY_PACKAGES.map(packageToStory);
export const STORIES: Story[] = [
  ...STORY_SHELLS.filter((shell) => !published.some((story) => story.id === shell.id)),
  ...published,
];

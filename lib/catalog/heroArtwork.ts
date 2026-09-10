/**
 * Decorative artwork for the homepage hero mosaic.
 *
 * The hero is one composite `role="img"` — its tiles are not links, not cards a
 * reader can open, and not catalogue entries. They used to be sourced from the
 * demo catalogue, which meant placeholder stories that nobody can read were
 * being presented as part of the library. The artwork is the same; it is simply
 * no longer claimed to be a story.
 *
 * Keys are the historic layout slot names so the two hero compositions keep
 * their tuned geometry untouched.
 */
export const HERO_ARTWORK: Readonly<Record<string, string>> = {
  "the-last-train": "/stories/midnight-express.svg",
  "coffee-for-two": "/stories/table-for-two.svg",
  "the-giants-forest": "/stories/the-last-giant.svg",
  "lost-at-sea": "/stories/salt-and-lantern.svg",
  "the-quiet-woods": "/stories/the-quiet-woods.svg",
  "the-empty-house": "/stories/house-on-the-hill.svg",
  "the-missing-letter": "/stories/the-reading-room.svg",
  "neon-nights": "/stories/neon-rain.svg",
};

export function heroArtwork(slot: string): string {
  const image = HERO_ARTWORK[slot];
  if (!image) throw new Error(`Unknown hero artwork slot: ${slot}`);
  return image;
}

import type { Difficulty } from "../catalog/types";
import type { CatalogueLanguage } from "../languages";

/**
 * The model behind the reader's sentence card.
 *
 * The card shows one sentence at a time and can be turned over to the same
 * sentence in the reader's own language. Everything about *which* side that is
 * lives here rather than in the component, because it is the part with rules:
 * a reverse side only exists when it would say something new, the card always
 * opens on the learning sentence, and speech follows whatever is face up.
 *
 * Keeping it as plain functions also keeps it honest — these are the guarantees
 * a test can hold the reader to without a browser.
 */

/** One side of the card: what it says, and everything needed to present it. */
export type SentenceFace = {
  text: string;
  /** BCP 47 tag for the `lang` attribute — what the text *is*, not the interface. */
  locale: string;
  dir: "ltr" | "rtl";
  /** Locale used to choose a speech-synthesis voice for this side. */
  speechLocale: string;
};

/** Why a card has no reverse side. Both are legitimate; neither is an error. */
export type FlipUnavailable = "same-language" | "missing";

export type SentenceCard = {
  front: SentenceFace;
  /** Absent when the reverse side would be a duplicate or does not exist. */
  back?: SentenceFace;
  unavailable?: FlipUnavailable;
};

const face = (text: string, language: Pick<CatalogueLanguage, "locale" | "dir" | "speechLocale">): SentenceFace => ({
  text, locale: language.locale, dir: language.dir, speechLocale: language.speechLocale,
});

/**
 * Builds the card for one scene.
 *
 * A translation that is missing and a translation that would merely repeat the
 * learning sentence are both "no reverse side", but they are different
 * situations to a reader, so the reason travels with the card and the control
 * can say which one it is instead of failing silently.
 */
export function sentenceCard(
  copy: { primary?: string; translation?: string },
  learning: Pick<CatalogueLanguage, "id" | "locale" | "dir" | "speechLocale">,
  translation: Pick<CatalogueLanguage, "id" | "locale" | "dir" | "speechLocale">,
): SentenceCard | null {
  if (!copy.primary?.trim()) return null;
  if (copy.translation?.trim()) {
    return { front: face(copy.primary, learning), back: face(copy.translation, translation) };
  }
  return { front: face(copy.primary, learning), unavailable: learning.id === translation.id ? "same-language" : "missing" };
}

/**
 * What identifies "the sentence in front of the reader".
 *
 * The scene, the level and the learning language each change what the front
 * says, so each of them ends a flip. The *translation* language deliberately
 * does not appear: changing it rewrites the back of the card the reader is
 * already looking at rather than turning the card over.
 */
export function sentenceKeyFor(sceneId: string, difficulty: Difficulty, learningLanguage: string): string {
  return `${sceneId}|${difficulty}|${learningLanguage}`;
}

/**
 * Which side is face up.
 *
 * A card is turned over only while the reader's own choice still refers to the
 * sentence in front of them, so a new scene, level or learning language returns
 * to the front by arithmetic rather than by an effect chasing the render that
 * caused it — and a reverse side that stops existing cannot strand the card.
 */
export function visibleSide(card: SentenceCard, flippedKey: string | null, sentenceKey: string): {
  side: "front" | "back"; face: SentenceFace; flipped: boolean; canFlip: boolean;
} {
  const canFlip = Boolean(card.back);
  const flipped = canFlip && flippedKey === sentenceKey;
  return { side: flipped ? "back" : "front", face: flipped ? card.back! : card.front, flipped, canFlip };
}

/** The flip state after a press: turn this sentence over, or turn it back. */
export function toggleFlip(flippedKey: string | null, sentenceKey: string): string | null {
  return flippedKey === sentenceKey ? null : sentenceKey;
}

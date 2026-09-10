"use client";

import { useCallback, useState } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { toggleFlip, visibleSide, type SentenceCard, type SentenceFace } from "@/lib/reader/sentenceCard";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
import styles from "./reader.module.css";

export type SentenceBubbleProps = {
  card: SentenceCard;
  type?: "narration" | "speech";
  speaker?: string;
  /** Only the on-screen scene is interactive; its neighbours are inert. */
  active: boolean;
  /**
   * Identifies the sentence on screen. When it changes the card returns to its
   * front, so "which side am I on" never outlives what the sentence says.
   */
  sentenceKey: string;
};

/**
 * The reader's sentence card: one compact surface with two sides.
 *
 * The learning sentence is the front; the translation is the back, reached by
 * the flip control and never shown at the same time. That is the whole point of
 * the shape — two stacked bubbles hid too much of the artwork, and the artwork
 * is what the sentence is about.
 *
 * Structure matters here and is not incidental:
 *
 *   BubbleShell            fixed frame, owns the surface and the footprint
 *    ├─ FlipSurface        the only thing that rotates
 *    │   ├─ front face
 *    │   └─ back face      pre-rotated, so its text is never mirrored
 *    └─ FixedActionRail    speech + flip, outside the rotation entirely
 *
 * The rail sits outside the rotating element on purpose: controls that turned
 * with the card would arrive mirrored, move under the reader's thumb mid-press,
 * and lose their hit target for the length of the animation.
 *
 * This component is story-agnostic. A story supplies sentences and placement;
 * every part of the interaction lives here, so the next story gets it for free.
 */
export function SentenceBubble({ card, type = "narration", speaker, active, sentenceKey }: SentenceBubbleProps) {
  const { t } = usePreferences();
  const [flippedKey, setFlippedKey] = useState<string | null>(null);
  const { face: visible, flipped, canFlip } = visibleSide(card, flippedKey, sentenceKey);

  // The speaker reads what the reader can actually see, in that side's own
  // language. Handing the hook the visible sentence is also what ends an
  // utterance the moment the sentence underneath it changes.
  const speech = useSpeechSynthesis(active, visible.text);
  const { cancel: stopSpeaking } = speech;

  const flipLabel = canFlip
    ? t(flipped ? "showLearningSentence" : "showTranslation")
    : card.unavailable === "same-language" ? t("translationSameLanguage") : t("translationUnavailableShort");
  const speechLabel = !speech.supported ? t("audioUnavailable")
    : speech.speaking ? t("stopSpeaking")
      : flipped ? t("speakTranslationSentence") : t("speakSentence");

  // Turning the card ends the sentence being read rather than letting it finish
  // in the language the reader has just turned away from.
  const flip = useCallback(() => {
    if (!canFlip) return;
    stopSpeaking();
    setFlippedKey((current) => toggleFlip(current, sentenceKey));
  }, [canFlip, sentenceKey, stopSpeaking]);

  return (
    <div className={styles.bubble} data-bubble-type={type} data-reader-bubble data-flipped={flipped}>
      {speaker && <span className={styles.speaker}>{speaker}</span>}
      <div className={styles.flipSurface} data-flip-surface>
        <CardFace face={card.front} side="front" hidden={flipped} active={active} />
        {card.back && <CardFace face={card.back} side="back" hidden={!flipped} active={active} />}
      </div>
      <div className={styles.actionRail} data-action-rail>
        <button
          type="button" className={styles.audioButton} data-reader-control data-speech-button
          disabled={!speech.supported || !visible.text}
          aria-label={speechLabel} title={speechLabel} aria-pressed={speech.speaking}
          onClick={() => speech.speaking ? speech.cancel() : speech.speak(visible.text, visible.speechLocale)}
        >
          {speech.speaking
            ? <svg viewBox="0 0 24 24" fill="none" aria-hidden><rect x="7.5" y="7.5" width="9" height="9" rx="1.4" fill="currentColor" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 10v4h3l4 3V7l-4 3H5Z" fill="currentColor" /><path d="M15.5 9.1a4 4 0 0 1 0 5.8M18 6.8a7.2 7.2 0 0 1 0 10.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
        </button>
        <button
          type="button" className={styles.flipButton} data-reader-control data-flip-button
          disabled={!canFlip} aria-label={flipLabel} title={flipLabel}
          aria-pressed={canFlip ? flipped : undefined}
          onClick={flip}
        >
          <TranslateGlyph />
        </button>
      </div>
    </div>
  );
}

/**
 * One face of the card.
 *
 * The back face is pre-rotated by half a turn so the surface's own rotation
 * lands it upright: text is never presented mirrored, at any point in the
 * animation. `inert` keeps the hidden face out of the tab order and out of a
 * screen reader's path, so only one sentence is ever announced.
 */
function CardFace({ face, side, hidden, active }: { face: SentenceFace; side: "front" | "back"; hidden: boolean; active: boolean }) {
  return (
    <p
      className={styles.sentence} data-face={side} data-hidden={hidden}
      lang={face.locale} dir={face.dir}
      aria-hidden={hidden || undefined} inert={hidden}
      tabIndex={!hidden && active ? 0 : -1}
    >
      {face.text}
    </p>
  );
}

/**
 * Two scripts with an exchange between them: a language glyph rather than a
 * generic refresh arrow, which would read as "reload" instead of "translate".
 */
function TranslateGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3.4 6.4h7.2M7 4.7v1.7m2.1 0c0 3.2-2.4 5.9-5.7 6.9m1.6-3.4c.9 1.6 2.4 2.8 4.1 3.4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.2 19.3 16.6 11l3.4 8.3m-5.9-2.1h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

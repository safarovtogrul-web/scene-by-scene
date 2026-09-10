"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

const subscribeToSpeechSupport = () => () => undefined;
const speechSupportSnapshot = () => "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
const serverSpeechSupportSnapshot = () => false;

function normalizedLocale(locale: string): string {
  return locale.toLowerCase().replaceAll("_", "-");
}

/** Prefer an exact locale, then the same language family, then a browser default. */
export function bestSpeechVoice(voices: readonly SpeechSynthesisVoice[], locale: string) {
  const target = normalizedLocale(locale);
  const language = target.split("-")[0];
  return voices.find((voice) => normalizedLocale(voice.lang) === target)
    ?? voices.find((voice) => normalizedLocale(voice.lang).split("-")[0] === language)
    ?? voices.find((voice) => voice.default)
    ?? voices[0];
}

/**
 * Speech for one sentence on screen.
 *
 * `sentence` is what is currently readable — the visible side of the card, not
 * the scene. Passing it in is what makes "never read a sentence the reader can
 * no longer see" a property of the hook rather than a rule every caller has to
 * remember: a scene change, a level change, a language change and a flip all
 * arrive here as a different string, and each ends the utterance before the new
 * one can start. There is never more than one.
 */
export function useSpeechSynthesis(active: boolean, sentence = "") {
  const supported = useSyncExternalStore(subscribeToSpeechSupport, speechSupportSnapshot, serverSpeechSupportSnapshot);
  const [speaking, setSpeaking] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    utterance.current = null;
    setSpeaking(false);
  }, []);

  useEffect(() => {
    let resetTimer: number | undefined;
    if (supported && (!active || sentence)) {
      // Whatever was being read belonged to the previous sentence. Some engines
      // do not fire `onend` for a cancelled utterance, so the speaking state is
      // cleared here rather than left waiting for a callback that may not come.
      window.speechSynthesis.cancel();
      utterance.current = null;
      resetTimer = window.setTimeout(() => setSpeaking(false), 0);
    }
    return () => {
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
      if (supported) window.speechSynthesis.cancel();
    };
  }, [active, sentence, supported]);

  const speak = useCallback((text: string, locale: string) => {
    if (!text.trim() || !("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) return;
    window.speechSynthesis.cancel();
    const next = new SpeechSynthesisUtterance(text);
    next.lang = locale;
    next.rate = 0.94;
    const voice = bestSpeechVoice(window.speechSynthesis.getVoices(), locale);
    if (voice) next.voice = voice;
    next.onend = () => { if (utterance.current === next) { utterance.current = null; setSpeaking(false); } };
    next.onerror = () => { if (utterance.current === next) { utterance.current = null; setSpeaking(false); } };
    utterance.current = next;
    setSpeaking(true);
    window.speechSynthesis.speak(next);
  }, []);

  return { supported, speaking, speak, cancel };
}

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

export function useSpeechSynthesis(active: boolean) {
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
    if (!active && supported) {
      window.speechSynthesis.cancel();
      utterance.current = null;
      resetTimer = window.setTimeout(() => setSpeaking(false), 0);
    }
    return () => {
      if (resetTimer !== undefined) window.clearTimeout(resetTimer);
      if (supported) window.speechSynthesis.cancel();
    };
  }, [active, supported]);

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

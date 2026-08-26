import {
  DEFAULT_INTERFACE_LANGUAGE,
  DEFAULT_LEARNING_LANGUAGE,
  isLanguageId,
  type LanguageId,
} from "./languages";

/** Versioned local cache for signed-out and offline use. */
const STORAGE_KEY = "textory.preferences.v2";

/**
 * The same value, mirrored into a cookie so the *server* can render the first
 * paint in the reader’s language. `localStorage` is invisible to the server,
 * which is why a client-only preference always shows a flash of the default
 * language before hydration swaps it out.
 */
export const PREFERENCES_COOKIE = "textory_prefs";

/** A year: the preference is not sensitive and should survive between visits. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function writePreferencesCookie(serialized: string): void {
  try {
    document.cookie = `${PREFERENCES_COOKIE}=${encodeURIComponent(serialized)};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
  } catch {
    // Cookies disabled — the local copy still drives this browser session.
  }
}

export function readPreferencesCookie(): string {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${PREFERENCES_COOKIE}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

/** Key in Supabase's existing authenticated user metadata for signed-in users. */
export const PREFERENCES_METADATA_KEY = "textory_preferences";

export type TextoryPreferences = {
  interfaceLanguage: LanguageId;
  learningLanguage: LanguageId;
  showTranslations: boolean;
};

export const EMPTY_PREFERENCES: TextoryPreferences = {
  interfaceLanguage: DEFAULT_INTERFACE_LANGUAGE,
  learningLanguage: DEFAULT_LEARNING_LANGUAGE,
  showTranslations: true,
};

const listeners = new Set<() => void>();
let memoryValue: string | null = null;

export function getPreferencesSnapshot(): string {
  if (memoryValue !== null) return memoryValue;
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function getServerPreferencesSnapshot(): string {
  return "";
}

export function subscribeToPreferences(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Parses both the permanent v2 shape and the former onboarding-only
 * `{ learning, speaking }` shape, so existing local choices move forward.
 */
export function parsePreferences(raw: string | unknown): TextoryPreferences {
  let parsed: Record<string, unknown> | null = null;
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    parsed = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return EMPTY_PREFERENCES;
  }
  if (!parsed) return EMPTY_PREFERENCES;

  return {
    interfaceLanguage: isLanguageId(parsed.interfaceLanguage)
      ? parsed.interfaceLanguage
      : isLanguageId(parsed.speaking)
        ? parsed.speaking
        : DEFAULT_INTERFACE_LANGUAGE,
    learningLanguage: isLanguageId(parsed.learningLanguage)
      ? parsed.learningLanguage
      : isLanguageId(parsed.learning)
        ? parsed.learning
        : DEFAULT_LEARNING_LANGUAGE,
    showTranslations:
      typeof parsed.showTranslations === "boolean" ? parsed.showTranslations : true,
  };
}

export function hasStoredPreferences(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    "interfaceLanguage" in record || "learningLanguage" in record ||
    "learning" in record || "speaking" in record || "showTranslations" in record
  );
}

export function writePreferences(preferences: TextoryPreferences): void {
  const next = JSON.stringify(preferences);
  memoryValue = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The in-memory copy still keeps this browser session usable.
  }
  // Kept in step with the local copy so the next server render already knows.
  writePreferencesCookie(next);
  listeners.forEach((listener) => listener());
}

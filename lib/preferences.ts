import {
  DEFAULT_INTERFACE_LANGUAGE,
  DEFAULT_LEARNING_LANGUAGE,
  isLanguageId,
  type LanguageId,
} from "./languages";

/** Versioned local cache for signed-out and offline use. */
const STORAGE_KEY = "scenebyscene.preferences.v1";

/**
 * Keys written before the rename. They are only ever read — anything found
 * under them is migrated to the current key on first load, so the rebrand does
 * not throw away a reader’s saved languages.
 */
const LEGACY_STORAGE_KEY = "textory.preferences.v2";
export const LEGACY_PREFERENCES_COOKIE = "textory_prefs";
export const LEGACY_PREFERENCES_METADATA_KEY = "textory_preferences";

/**
 * The same value, mirrored into a cookie so the *server* can render the first
 * paint in the reader’s language. `localStorage` is invisible to the server,
 * which is why a client-only preference always shows a flash of the default
 * language before hydration swaps it out.
 */
export const PREFERENCES_COOKIE = "scenebyscene_prefs";

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
    for (const name of [PREFERENCES_COOKIE, LEGACY_PREFERENCES_COOKIE]) {
      const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
      if (match) return decodeURIComponent(match[1]);
    }
    return "";
  } catch {
    return "";
  }
}

/** Key in Supabase's existing authenticated user metadata for signed-in users. */
export const PREFERENCES_METADATA_KEY = "scenebyscene_preferences";

export type AppPreferences = {
  interfaceLanguage: LanguageId;
  learningLanguage: LanguageId;
  translationLanguage: LanguageId;
  showTranslations: boolean;
};

export const EMPTY_PREFERENCES: AppPreferences = {
  interfaceLanguage: DEFAULT_INTERFACE_LANGUAGE,
  learningLanguage: DEFAULT_LEARNING_LANGUAGE,
  translationLanguage: DEFAULT_INTERFACE_LANGUAGE,
  showTranslations: true,
};

const listeners = new Set<() => void>();
let memoryValue: string | null = null;

export function getPreferencesSnapshot(): string {
  if (memoryValue !== null) return memoryValue;
  try {
    return (
      window.localStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(LEGACY_STORAGE_KEY) ??
      ""
    );
  } catch {
    return "";
  }
}

export function getServerPreferencesSnapshot(): string {
  return "";
}

export function subscribeToPreferences(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY && event.key !== LEGACY_STORAGE_KEY) return;
    memoryValue = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Parses both the permanent v2 shape and the former onboarding-only
 * `{ learning, speaking }` shape, so existing local choices move forward.
 */
export function parsePreferences(raw: string | unknown): AppPreferences {
  let parsed: Record<string, unknown> | null = null;
  try {
    const value = typeof raw === "string" ? JSON.parse(raw) : raw;
    parsed = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return EMPTY_PREFERENCES;
  }
  if (!parsed) return EMPTY_PREFERENCES;

  const interfaceLanguage = isLanguageId(parsed.interfaceLanguage)
    ? parsed.interfaceLanguage
    : isLanguageId(parsed.speaking)
      ? parsed.speaking
      : DEFAULT_INTERFACE_LANGUAGE;

  return {
    interfaceLanguage,
    learningLanguage: isLanguageId(parsed.learningLanguage)
      ? parsed.learningLanguage
      : isLanguageId(parsed.learning)
        ? parsed.learning
        : DEFAULT_LEARNING_LANGUAGE,
    // Older preferences used the interface language as the subtitle target.
    translationLanguage: isLanguageId(parsed.translationLanguage)
      ? parsed.translationLanguage
      : interfaceLanguage,
    showTranslations:
      typeof parsed.showTranslations === "boolean" ? parsed.showTranslations : true,
  };
}

export function hasStoredPreferences(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    "interfaceLanguage" in record || "learningLanguage" in record || "translationLanguage" in record ||
    "learning" in record || "speaking" in record || "showTranslations" in record
  );
}

export function writePreferences(preferences: AppPreferences): void {
  const next = JSON.stringify(parsePreferences(preferences));
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

/** Apply a patch to the latest store value, including multiple changes before a render. */
export function patchPreferences(patch: Partial<AppPreferences>, fallback: AppPreferences = EMPTY_PREFERENCES): AppPreferences {
  const current = parsePreferences(getPreferencesSnapshot() || fallback);
  const next = {
    interfaceLanguage: isLanguageId(patch.interfaceLanguage) ? patch.interfaceLanguage : current.interfaceLanguage,
    learningLanguage: isLanguageId(patch.learningLanguage) ? patch.learningLanguage : current.learningLanguage,
    translationLanguage: isLanguageId(patch.translationLanguage) ? patch.translationLanguage : current.translationLanguage,
    showTranslations: typeof patch.showTranslations === "boolean" ? patch.showTranslations : current.showTranslations,
  };
  writePreferences(next);
  return next;
}

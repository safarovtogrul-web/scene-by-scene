import {
  DEFAULT_INTERFACE_LANGUAGE,
  DEFAULT_LEARNING_LANGUAGE,
  isLanguageId,
  type LanguageId,
} from "./languages";

/** Versioned local cache for signed-out and offline use. */
const STORAGE_KEY = "textory.preferences.v2";

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
  listeners.forEach((listener) => listener());
}

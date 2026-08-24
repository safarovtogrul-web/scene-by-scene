"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  EMPTY_PREFERENCES,
  PREFERENCES_METADATA_KEY,
  getPreferencesSnapshot,
  getServerPreferencesSnapshot,
  hasStoredPreferences,
  parsePreferences,
  subscribeToPreferences,
  writePreferences,
  type TextoryPreferences,
} from "@/lib/preferences";
import { getLanguage, type LanguageId } from "@/lib/languages";
import { formatMessage, messageFor, type MessageKey } from "@/lib/i18n/messages";

type PreferencesContextValue = {
  preferences: TextoryPreferences;
  updatePreferences: (patch: Partial<TextoryPreferences>) => Promise<void>;
  isSaving: boolean;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: EMPTY_PREFERENCES,
  updatePreferences: async () => {},
  isSaving: false,
  t: (key) => messageFor("en", key),
});

/**
 * One preference model for the whole product. For signed-in readers the
 * canonical copy is stored on the existing Supabase auth user metadata; the
 * local store is a signed-out/offline cache rather than a competing profile.
 */
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { status, user } = useAuth();
  const rawLocal = useSyncExternalStore(subscribeToPreferences, getPreferencesSnapshot, getServerPreferencesSnapshot);
  const localPreferences = useMemo(() => parsePreferences(rawLocal), [rawLocal]);
  const [authenticatedPreferences, setAuthenticatedPreferences] = useState<TextoryPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !user) {
      setAuthenticatedPreferences(null);
      return;
    }
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const stored = metadata?.[PREFERENCES_METADATA_KEY];
    if (hasStoredPreferences(stored)) {
      const next = parsePreferences(stored);
      setAuthenticatedPreferences(next);
      writePreferences(next);
      return;
    }
    // Choices made before sign-in remain meaningful when a session appears.
    setAuthenticatedPreferences(localPreferences);
  }, [localPreferences, status, user]);

  const preferences = authenticatedPreferences ?? localPreferences;

  useEffect(() => {
    const language = getLanguage(preferences.interfaceLanguage);
    document.documentElement.lang = language.locale;
    document.documentElement.dir = language.dir;
  }, [preferences.interfaceLanguage]);

  const updatePreferences = useCallback(async (patch: Partial<TextoryPreferences>) => {
    const next = { ...preferences, ...patch };
    writePreferences(next);
    if (status !== "authenticated" || !user) return;

    setAuthenticatedPreferences(next);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setIsSaving(true);
    await supabase.auth.updateUser({ data: { [PREFERENCES_METADATA_KEY]: next } });
    setIsSaving(false);
  }, [preferences, status, user]);

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    updatePreferences,
    isSaving,
    t: (key, values) => values
      ? formatMessage(preferences.interfaceLanguage, key, values)
      : messageFor(preferences.interfaceLanguage, key),
  }), [isSaving, preferences, updatePreferences]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  return useContext(PreferencesContext);
}

export function useInterfaceLanguage(): LanguageId {
  return usePreferences().preferences.interfaceLanguage;
}

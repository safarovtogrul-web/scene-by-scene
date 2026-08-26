"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";

import { DirectionProvider } from "@radix-ui/react-direction";

import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  EMPTY_PREFERENCES,
  LEGACY_PREFERENCES_METADATA_KEY,
  PREFERENCES_METADATA_KEY,
  getPreferencesSnapshot,
  hasStoredPreferences,
  parsePreferences,
  readPreferencesCookie,
  subscribeToPreferences,
  writePreferences,
  type AppPreferences,
} from "@/lib/preferences";
import { getLanguage, type LanguageId } from "@/lib/languages";
import { formatMessage, messageFor, type MessageKey } from "@/lib/i18n/messages";

type PreferencesContextValue = {
  preferences: AppPreferences;
  updatePreferences: (patch: Partial<AppPreferences>) => Promise<void>;
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
export function PreferencesProvider({
  children,
  /**
   * What the server read from the preferences cookie. It seeds both the
   * server render and hydration, so the very first painted frame is already in
   * the reader’s language instead of flashing the default one first.
   */
  initialPreferences,
}: {
  children: ReactNode;
  initialPreferences?: AppPreferences;
}) {
  const { status, user } = useAuth();
  const serverSnapshot = useMemo(
    () => (initialPreferences ? JSON.stringify(initialPreferences) : ""),
    [initialPreferences],
  );
  const rawLocal = useSyncExternalStore(
    subscribeToPreferences,
    getPreferencesSnapshot,
    // Must be referentially stable and identical on server and hydration.
    () => serverSnapshot,
  );
  const localPreferences = useMemo(() => parsePreferences(rawLocal), [rawLocal]);
  const [authenticatedPreferences, setAuthenticatedPreferences] = useState<AppPreferences | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !user) {
      setAuthenticatedPreferences(null);
      return;
    }
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const stored =
      metadata?.[PREFERENCES_METADATA_KEY] ?? metadata?.[LEGACY_PREFERENCES_METADATA_KEY];
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

  // Readers who chose a language before the cookie existed only have the local
  // copy; mirror it out once so their next page load is server-rendered right.
  useEffect(() => {
    const local = getPreferencesSnapshot();
    if (local && local !== readPreferencesCookie()) writePreferences(parsePreferences(local));
  }, []);

  const updatePreferences = useCallback(async (patch: Partial<AppPreferences>) => {
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

  // Radix primitives read their writing direction from context, not from the
  // document, so the two are kept in step here rather than in each component.
  return (
    <PreferencesContext.Provider value={value}>
      <DirectionProvider dir={getLanguage(preferences.interfaceLanguage).dir}>
        {children}
      </DirectionProvider>
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  return useContext(PreferencesContext);
}

export function useInterfaceLanguage(): LanguageId {
  return usePreferences().preferences.interfaceLanguage;
}

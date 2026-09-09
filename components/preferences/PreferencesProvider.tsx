"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

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
  patchPreferences,
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
  syncFailed: boolean;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesContextValue>({
  preferences: EMPTY_PREFERENCES,
  updatePreferences: async () => {},
  isSaving: false,
  syncFailed: false,
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
  const [isSaving, setIsSaving] = useState(false);
  const [syncFailed, setSyncFailed] = useState(false);
  const pendingWrites = useRef(0);
  const syncQueue = useRef(Promise.resolve());

  useEffect(() => {
    if (status !== "authenticated" || !user || pendingWrites.current > 0) return;
    const metadata = user.user_metadata as Record<string, unknown> | undefined;
    const stored =
      metadata?.[PREFERENCES_METADATA_KEY] ?? metadata?.[LEGACY_PREFERENCES_METADATA_KEY];
    if (hasStoredPreferences(stored)) {
      writePreferences(parsePreferences(stored));
    }
    // With no remote copy, choices made before sign-in remain authoritative.
  }, [status, user]);

  const preferences = localPreferences;

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
    const next = patchPreferences(patch, preferences);
    if (status !== "authenticated" || !user) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    pendingWrites.current += 1;
    setIsSaving(true);
    // Serial writes prevent a slower response overwriting a newer language choice.
    // Only the external sync is caught; rendering/programming errors stay visible.
    const sync = async () => {
      try {
        const { error } = await supabase.auth.updateUser({ data: { [PREFERENCES_METADATA_KEY]: next } });
        setSyncFailed(Boolean(error));
        if (error) console.warn("[preferences] Account sync failed; local choices retained.", { code: error.code, status: error.status });
      } catch (error) {
        setSyncFailed(true);
        console.warn("[preferences] Account sync rejected; local choices retained.", { name: error instanceof Error ? error.name : "UnknownError" });
      } finally {
        pendingWrites.current -= 1;
        if (pendingWrites.current === 0) setIsSaving(false);
      }
    };
    syncQueue.current = syncQueue.current.then(sync, sync);
    await syncQueue.current;
  }, [preferences, status, user]);

  const value = useMemo<PreferencesContextValue>(() => ({
    preferences,
    updatePreferences,
    isSaving,
    syncFailed,
    t: (key, values) => values
      ? formatMessage(preferences.interfaceLanguage, key, values)
      : messageFor(preferences.interfaceLanguage, key),
  }), [isSaving, syncFailed, preferences, updatePreferences]);

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

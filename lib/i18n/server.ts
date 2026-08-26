import { cookies } from "next/headers";

import { PREFERENCES_COOKIE, parsePreferences, type TextoryPreferences } from "@/lib/preferences";
import { formatMessage, messageFor, type MessageKey } from "./messages";

/**
 * The server-side twin of `usePreferences().t`.
 *
 * Page metadata is generated on the server, so the browser tab title would stay
 * English no matter what the interface language is unless the same preferences
 * cookie the root layout reads is available here too.
 *
 * Crawlers arrive without the cookie and get the English default, which is the
 * behaviour we want for shared links and search results.
 */
export async function getServerPreferences(): Promise<TextoryPreferences> {
  const store = await cookies();
  return parsePreferences(store.get(PREFERENCES_COOKIE)?.value ?? "");
}

export async function getServerT(): Promise<
  (key: MessageKey, values?: Record<string, string | number>) => string
> {
  const { interfaceLanguage } = await getServerPreferences();
  return (key, values) =>
    values ? formatMessage(interfaceLanguage, key, values) : messageFor(interfaceLanguage, key);
}

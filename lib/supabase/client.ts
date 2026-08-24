"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

let cached: SupabaseClient | null = null;

/**
 * The browser-side Supabase client.
 *
 * `createBrowserClient` stores the session in cookies rather than
 * localStorage, which is what lets the server read the same session later
 * without any manual token juggling. Token refresh is handled by the client.
 *
 * Returns `null` when Supabase has not been configured yet — callers render
 * their disabled state instead.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  cached ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return cached;
}


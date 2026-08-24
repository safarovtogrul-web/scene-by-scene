"use client";

import type { User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AuthStatus =
  /** Reading the stored session. */
  | "loading"
  /** Signed in. */
  | "authenticated"
  /** Definitely signed out. */
  | "anonymous"
  /** Supabase has not been connected yet — sign-in is unavailable. */
  | "unconfigured";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  status: "unconfigured",
  user: null,
  signOut: async () => {},
});

/**
 * Holds the real Supabase session for the whole app.
 *
 * There is no hand-rolled persistence here: the session lives in the cookies
 * Supabase writes, and `onAuthStateChange` keeps this in step with them across
 * refreshes, tabs and token refreshes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: AuthStatus; user: User | null }>(
    () => ({
      status: isSupabaseConfigured ? "loading" : "unconfigured",
      user: null,
    }),
  );

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({
        status: data.session ? "authenticated" : "anonymous",
        user: data.session?.user ?? null,
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        status: session ? "authenticated" : "anonymous",
        user: session?.user ?? null,
      });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ status: state.status, user: state.user, signOut }),
    [state.status, state.user, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/** Best available human name for a signed-in reader. */
export function displayNameFor(user: User): string {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    (typeof metadata?.full_name === "string" && metadata.full_name) ||
    (typeof metadata?.name === "string" && metadata.name) ||
    "";
  if (fullName.trim()) return fullName.trim();
  if (user.email) return user.email.split("@")[0];
  return "Reader";
}

/** One or two letters for the avatar. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "T";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

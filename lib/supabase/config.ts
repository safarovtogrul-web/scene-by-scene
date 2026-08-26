/**
 * Supabase connection details.
 *
 * Both values are public by design: the publishable key is a client-side key
 * whose power is bounded by row-level security, not secrecy. Nothing private
 * ever belongs in a `NEXT_PUBLIC_` variable.
 *
 * "Publishable key" is Supabase's current name for what older projects label
 * `anon public` — same value, newer wording.
 *
 * The literal `process.env.NEXT_PUBLIC_*` reads matter — Next inlines those
 * exact expressions into the client bundle at build time, so they cannot be
 * accessed through a computed key.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

/**
 * Scene by Scene runs perfectly well before Supabase is connected: the catalogue,
 * hero and onboarding are all public. Everything auth-related checks this
 * first and degrades to a clearly-explained disabled state rather than
 * throwing, so a missing `.env.local` can never take the site down.
 */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_PUBLISHABLE_KEY.length > 0;


/**
 * The social providers Textory offers.
 *
 * These ids are Supabase provider slugs — adding a provider here is only half
 * the job; it also has to be enabled in the Supabase dashboard with its own
 * client id and secret.
 */
export const AUTH_PROVIDERS = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "facebook", label: "Continue with Facebook" },
] as const;

export type AuthProviderId = (typeof AUTH_PROVIDERS)[number]["id"];

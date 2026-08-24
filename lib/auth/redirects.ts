/**
 * Every auth redirect decision lives here.
 *
 * When the learning dashboard exists, changing `POST_SIGN_IN_PATH` is the only
 * edit needed to send people there after signing in — no component knows where
 * the journey continues.
 */

export const LOGIN_PATH = "/login";
export const AUTH_CALLBACK_PATH = "/auth/callback";

/** Where a freshly signed-in reader lands when no explicit target was given. */
export const POST_SIGN_IN_PATH = "/";
export const POST_SIGN_OUT_PATH = "/";

/** Paths we never bounce back to — they would loop the user through auth. */
const NON_RETURNABLE = [LOGIN_PATH, "/auth"];

/**
 * Accepts only same-origin absolute paths. Anything else — a full URL, a
 * protocol-relative `//evil.com`, a missing value — falls back to the default,
 * which closes the open-redirect hole that `?next=` would otherwise open.
 */
export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value) return POST_SIGN_IN_PATH;
  if (!value.startsWith("/") || value.startsWith("//")) {
    return POST_SIGN_IN_PATH;
  }
  if (NON_RETURNABLE.some((path) => value.startsWith(path))) {
    return POST_SIGN_IN_PATH;
  }
  return value;
}

/**
 * The `redirectTo` handed to the OAuth provider. Must exactly match one of the
 * redirect URLs allow-listed in the Supabase dashboard.
 */
export function buildOAuthRedirectUrl(
  origin: string,
  next?: string | null,
): string {
  const url = new URL(AUTH_CALLBACK_PATH, origin);
  const target = sanitizeNextPath(next);
  if (target !== POST_SIGN_IN_PATH) url.searchParams.set("next", target);
  return url.toString();
}

/** Link to the sign-in page, remembering where the reader was. */
export function buildLoginHref(next?: string | null): string {
  const target = sanitizeNextPath(next);
  return target === POST_SIGN_IN_PATH
    ? LOGIN_PATH
    : `${LOGIN_PATH}?next=${encodeURIComponent(target)}`;
}

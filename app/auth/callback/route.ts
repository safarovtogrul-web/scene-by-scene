import { NextResponse } from "next/server";

import { LOGIN_PATH, sanitizeNextPath } from "@/lib/auth/redirects";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth landing point.
 *
 * The provider sends the reader back here with a one-time authorization code.
 * Exchanging it server-side is what turns the code into a real session and
 * writes the httpOnly cookies — the browser never handles a token directly.
 *
 * Failures always land back on /login with a reason, never on a blank page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  // Behind a proxy the request URL is the internal one; trust the forwarded
  // host so the redirect goes back to the address the reader actually used.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : url.origin;

  const failure = (reason: string) =>
    NextResponse.redirect(new URL(`${LOGIN_PATH}?error=${reason}`, origin));

  // The provider itself refused (consent denied, misconfigured client, …).
  if (url.searchParams.get("error")) return failure("provider");

  const code = url.searchParams.get("code");
  if (!code) return failure("missing_code");

  const supabase = await getSupabaseServerClient();
  if (!supabase) return failure("not_configured");

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return failure("exchange");

  const next = sanitizeNextPath(url.searchParams.get("next"));
  return NextResponse.redirect(new URL(next, origin));
}

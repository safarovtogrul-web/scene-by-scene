import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

/**
 * Next 16's replacement for the `middleware` convention.
 *
 * Its only job is refreshing the Supabase session cookie so a server-side read
 * never sees a stale token. It is a no-op until Supabase is configured.
 */
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /**
     * Everything except Next's own assets and static files. Story artwork is
     * served from `/stories/*.svg`, which the extension guard covers, so the
     * catalogue routes at `/stories/...` still pass through.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|js|json|webmanifest)$).*)",
  ],
};

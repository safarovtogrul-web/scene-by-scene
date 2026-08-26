import type { Metadata } from "next";
import { Suspense } from "react";

import { AmbientGlow } from "@/components/story/AmbientGlow";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: t("signIn"), description: t("welcomeBody") };
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-6 py-12">
      <AmbientGlow />

      <Suspense fallback={<PanelFallback />}>
        <LoginPanel />
      </Suspense>
    </main>
  );
}

function PanelFallback() {
  return (
    <div className="relative z-10 w-full max-w-[440px]">
      <div className="h-[520px] animate-pulse rounded-[32px] border border-white/[0.08] bg-ink-900/60" />
    </div>
  );
}

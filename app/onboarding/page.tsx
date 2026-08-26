import type { Metadata } from "next";

import { AmbientGlow } from "@/components/story/AmbientGlow";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return { title: t("metaLanguageSetup"), description: t("onbUseHint") };
}

export default function OnboardingPage() {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-ink-950 sm:p-8">
      <AmbientGlow />

      <div className="relative z-10 flex h-[100dvh] w-full max-w-[430px] flex-col sm:h-[min(780px,calc(100dvh-4rem))] sm:overflow-hidden sm:rounded-[34px] sm:border sm:border-white/[0.08] sm:bg-ink-900/70 sm:shadow-[0_60px_120px_-50px_rgba(0,0,0,0.95)] sm:backdrop-blur-2xl">
        <OnboardingFlow />
      </div>
    </main>
  );
}

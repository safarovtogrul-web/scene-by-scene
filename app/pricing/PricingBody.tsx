"use client";

import { AmbientGlow } from "@/components/story/AmbientGlow";
import { PrimaryButton, ArrowGlyph } from "@/components/ui/PrimaryButton";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export function PricingBody() {
  const { t } = usePreferences();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-6 pt-16 pb-24 md:pt-20">
      <AmbientGlow />

      <div className="relative z-10 max-w-[54ch] text-center">
        <p className="text-[12px] font-semibold tracking-[0.16em] text-iris-300 uppercase">
          {t("navPricing")}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.03em] text-mist-100">
          {t("pricingTitle")}{" "}
          <span className="text-emphasis">{t("pricingEmphasis")}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[44ch] text-[clamp(1rem,1.2vw,1.1rem)] leading-relaxed text-mist-300">
          {t("pricingBody")}
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <PrimaryButton href="/stories" size="lg" className="px-8">
            {t("browseLibrary")}
            <ArrowGlyph />
          </PrimaryButton>
          <PrimaryButton href="/onboarding" variant="ghost" size="lg">
            {t("getStarted")}
          </PrimaryButton>
        </div>
      </div>
    </main>
  );
}

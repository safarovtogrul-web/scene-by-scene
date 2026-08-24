import type { Metadata } from "next";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { AmbientGlow } from "@/components/story/AmbientGlow";
import { PrimaryButton, ArrowGlyph } from "@/components/ui/PrimaryButton";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Textory pricing is still being finalised.",
};

/**
 * Placeholder so the "Pricing" navigation item is not a dead link.
 *
 * Intentionally minimal: plans, billing and payments are explicitly out of
 * scope for this phase, so nothing here implies a purchasable product.
 */
export default function PricingPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-6 pt-16 pb-24 md:pt-20">
        <AmbientGlow />

        <div className="relative z-10 max-w-[54ch] text-center">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-iris-300 uppercase">
            Pricing
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.1rem,4.4vw,3.4rem)] leading-[1.05] font-bold tracking-[-0.03em] text-mist-100">
            Still being{" "}
            <span className="text-emphasis">written.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[44ch] text-[clamp(1rem,1.2vw,1.1rem)] leading-relaxed text-mist-300">
            We&apos;re finishing the first set of stories before we decide what
            Textory costs. Until then, everything in the library is open.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <PrimaryButton href="/stories" size="lg" className="px-8">
              Browse the library
              <ArrowGlyph />
            </PrimaryButton>
            <PrimaryButton href="/onboarding" variant="ghost" size="lg">
              Get Started
            </PrimaryButton>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

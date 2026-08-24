import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { StoryCatalogue } from "./StoryCatalogue";
import { TOTAL_STORY_COUNT } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Discover a world. Learn a language. Browse the Textory library by difficulty, genre and length.",
};

export default function StoriesPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative min-h-dvh bg-ink-950 pt-16 md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(70%_100%_at_50%_0%,rgba(76,29,149,0.28),transparent)]" />

        <div className="relative mx-auto max-w-[1440px] px-6 pt-9 pb-20 md:px-10 md:pt-16 md:pb-24 lg:px-16">
          <header className="max-w-[46ch]">
            <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.05] font-bold tracking-[-0.03em] text-mist-100">
              Stories
            </h1>
            <p className="mt-4 text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-mist-300">
              Discover a world.{" "}
              <span className="text-emphasis">Learn a language.</span>
            </p>
            <p className="mt-3 text-[14.5px] text-mist-500">
              {TOTAL_STORY_COUNT} stories · Easy and Hard · new scenes every week
            </p>
          </header>

          <div className="mt-9 md:mt-12">
            <Suspense fallback={<CatalogueFallback />}>
              <StoryCatalogue />
            </Suspense>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

function CatalogueFallback() {
  return (
    <div className="space-y-6">
      <div className="h-14 animate-pulse rounded-2xl bg-white/[0.04]" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-10 w-20 animate-pulse rounded-full bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}

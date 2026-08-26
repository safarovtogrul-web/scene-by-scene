import type { Metadata } from "next";
import { Suspense } from "react";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { StoryCatalogue } from "./StoryCatalogue";
import { StoriesHeader } from "./StoriesHeader";
import { getServerT } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getServerT();
  return {
    title: t("navStories"),
    description: `${t("storiesLeadOne")} ${t("storiesLeadTwo")}`,
  };
}

export default function StoriesPage() {
  return (
    <>
      <SiteHeader />

      <main className="relative min-h-dvh bg-ink-950 pt-16 md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(70%_100%_at_50%_0%,rgba(76,29,149,0.28),transparent)]" />

        <div className="relative mx-auto max-w-[1440px] px-6 pt-9 pb-20 md:px-10 md:pt-16 md:pb-24 lg:px-16">
          <StoriesHeader />

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

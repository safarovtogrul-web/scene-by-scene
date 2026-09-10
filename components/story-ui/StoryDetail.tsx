"use client";

import Image from "next/image";
import Link from "next/link";
import { PremiumBadge } from "./StoryMeta";
import { StoryExperience } from "./StoryExperience";
import type { Story } from "@/lib/catalog";
import { storyDisplay } from "@/lib/story-packages/schema";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

/** A concise portal for the selected story; discovery stays on /stories. */
export function StoryDetail({ story, readerBase }: { story: Story; readerBase?: string }) {
  const { preferences, t } = usePreferences();
  // Story metadata is chrome around the story, so it follows the interface
  // language and never the learning or translation language.
  const display = storyDisplay(story, preferences.interfaceLanguage);
  return <div className="relative mx-auto max-w-[1160px] px-5 pt-6 pb-10 md:px-10 md:pt-10">
    <Link href="/stories" className="inline-flex min-h-11 items-center gap-2 text-sm text-mist-400 hover:text-mist-100">
      <svg viewBox="0 0 20 20" fill="none" aria-hidden className="size-4 rtl:rotate-180"><path d="M16 10H5m0 0 4.5-4.5M5 10l4.5 4.5" stroke="currentColor" strokeWidth="1.5" /></svg>
      {t("backToStories")}
    </Link>
    <div className="mt-4 grid items-center gap-7 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
      <div className="relative h-[min(32dvh,300px)] overflow-hidden rounded-xl border border-white/10 bg-ink-800 lg:h-auto lg:aspect-[4/3]">
        <Image src={story.heroScene ?? story.cover} alt={`Cover scene from ${display.title}`} fill sizes="(min-width: 1024px) 52vw, 92vw" loading="eager" fetchPriority="high" className="object-contain" />
        {story.premium && <PremiumBadge className="absolute top-4 right-4" />}
      </div>
      <div>
        <p className="text-xs text-mist-400">{t("scenesCount", { count: story.scenes })} · {t("minutesCount", { count: story.minutes })}</p>
        <h1 className="mt-3 font-display text-[clamp(1.9rem,6vw,3rem)] leading-[1.1] font-medium text-mist-100">{display.title}</h1>
        <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-mist-300">{display.description}</p>
        <StoryExperience story={story} readerBase={readerBase} />
      </div>
    </div>
  </div>;
}

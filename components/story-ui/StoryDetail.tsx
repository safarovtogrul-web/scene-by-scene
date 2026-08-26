"use client";

import Image from "next/image";
import Link from "next/link";

import { PremiumBadge } from "./StoryMeta";
import { StorySection } from "./StorySection";
import { StoryExperience } from "./StoryExperience";
import { genreLabelKey, getProgress, getRelated, progressRatio } from "@/lib/catalog";
import type { Story } from "@/lib/catalog";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

/**
 * The page a story link opens.
 *
 * Deliberately a landing surface, not the reader: the reader does not exist
 * yet, and even once it does, a reader should choose a story before being
 * dropped into scene one.
 */
export function StoryDetail({ story }: { story: Story }) {
  const { t } = usePreferences();
  const genre = genreLabelKey(story.genre);
  const progress = getProgress(story.id);
  const ratio = progressRatio(story);
  const related = getRelated(story);

  return (
    <>
      {/* Backdrop — the cover, pushed far behind the content. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
        <Image
          src={story.cover}
          alt=""
          fill
          sizes="100vw"
          priority
          className="scale-125 object-cover opacity-35 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/70 via-ink-950/85 to-ink-950" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_0%,rgba(76,29,149,0.35),transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[1200px] px-6 pt-7 pb-20 md:px-10 md:pt-14 md:pb-24 lg:px-16">
        <Link
          href="/stories"
          className="group inline-flex items-center gap-2 text-[14.5px] text-mist-400 transition-colors hover:text-mist-100"
        >
          <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1">
            <path
              d="M16 10H5m0 0 4.5-4.5M5 10l4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("backToStories")}
        </Link>

        <div className="mt-6 grid gap-8 md:mt-8 md:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-800 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.1] sm:rounded-3xl">
              <Image
                src={story.cover}
                alt={`Cover scene from ${story.title}`}
                fill
                sizes="(min-width: 1024px) 52vw, 92vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/45 to-transparent" />
              {story.premium && <PremiumBadge className="absolute top-4 right-4" />}
            </div>
          </div>

          <div className="lg:pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <Pill accent>{`${t("easy")} · ${t("hard")}`}</Pill>
              <Link href={`/stories?genre=${story.genre}`}>
                <Pill interactive>{genre ? t(genre) : story.genre}</Pill>
              </Link>
              <Pill>{t("scenesCount", { count: story.scenes })}</Pill>
              <Pill>{t("minutesCount", { count: story.minutes })}</Pill>
            </div>

            <h1 className="mt-5 font-display text-[clamp(2rem,9vw,3.2rem)] leading-[1.05] font-bold tracking-[-0.03em] text-mist-100 md:mt-6">
              {story.title}
            </h1>

            <p className="mt-4 max-w-[52ch] text-[clamp(0.98rem,1.15vw,1.1rem)] leading-relaxed text-mist-300 md:mt-5">
              {story.description}
            </p>

            {progress && (
              <div className="mt-8 max-w-sm">
                <div className="flex items-baseline justify-between text-[13.5px] text-mist-400">
                  <span>
                    {t("sceneOf", { done: progress.scenesCompleted, total: story.scenes })}
                  </span>
                  <span className="tabular-nums">{Math.round(ratio * 100)}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-iris-500 to-iris-300"
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
              </div>
            )}

            <StoryExperience story={story} />

            <div className="mt-10 md:mt-12">
              <h2 className="text-[12px] font-semibold tracking-[0.16em] text-iris-300 uppercase">
                {t("youWillLearn")}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {story.vocabulary.map((word) => (
                  <li
                    key={word}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-[15px] text-mist-200"
                  >
                    {word}
                  </li>
                ))}
              </ul>
              <p className="mt-4 max-w-[46ch] text-[14px] leading-relaxed text-mist-500">
                {t("vocabularyNote")}
              </p>
            </div>
          </div>
        </div>

        <SceneStrip story={story} completed={progress?.scenesCompleted ?? 0} />
      </div>

      {related.length > 0 && (
        <div className="relative pb-24">
          <StorySection title={t("moreLikeThis")} stories={related} />
        </div>
      )}
    </>
  );
}

/**
 * Shows the shape of a story — one block per scene — without pretending to be
 * a reader or inventing per-scene artwork that does not exist yet.
 */
function SceneStrip({
  story,
  completed,
}: {
  story: Story;
  completed: number;
}) {
  const { t } = usePreferences();

  return (
    <section className="mt-12 border-t border-white/[0.06] pt-8 md:mt-16 md:pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-[19px] font-semibold tracking-tight text-mist-100">
          {t("storyStructure")}
        </h2>
        <p className="text-[14px] text-mist-500">
          {t("storyStructureNote")}
        </p>
      </div>

      <ol className="mt-6 flex flex-wrap gap-1.5" aria-label={t("sceneProgressLabel")}>
        {Array.from({ length: story.scenes }).map((_, index) => (
          <li
            key={index}
            className={
              index < completed
                ? "h-2 w-[clamp(14px,3vw,34px)] rounded-full bg-gradient-to-r from-iris-500 to-iris-300"
                : "h-2 w-[clamp(14px,3vw,34px)] rounded-full bg-white/10"
            }
          />
        ))}
      </ol>
    </section>
  );
}

function Pill({
  children,
  accent = false,
  interactive = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
  interactive?: boolean;
}) {
  const base =
    "inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-200";
  if (accent) {
    return (
      <span className={`${base} border-iris-400/45 bg-iris-500/15 text-iris-200`}>
        {children}
      </span>
    );
  }
  return (
    <span
      className={`${base} border-white/[0.09] bg-white/[0.035] text-mist-300 ${
        interactive ? "hover:border-white/20 hover:text-mist-100" : ""
      }`}
    >
      {children}
    </span>
  );
}

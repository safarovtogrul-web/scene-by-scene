"use client";

import Image from "next/image";
import Link from "next/link";

import { PremiumBadge, StoryMeta } from "./StoryMeta";
import { progressRatio } from "@/lib/catalog";
import type { Story } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export type StoryCardProps = {
  story: Story;
  /** Show the mock progress bar and "scene n of m" line. */
  showProgress?: boolean;
  /** Rendered-width hint for the image pipeline. */
  sizes?: string;
  /** Fetch priority — use on the first row only. */
  priority?: boolean;
  className?: string;
};

/**
 * The catalogue's atom.
 *
 * Artwork gets the space: a full-width 4:3 cover with everything else kept to
 * two short lines beneath it. Clicking opens the story's detail page — never
 * the reader directly.
 */
export function StoryCard({
  story,
  showProgress = false,
  sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 74vw",
  priority = false,
  className,
}: StoryCardProps) {
  const { t } = usePreferences();
  const ratio = showProgress ? progressRatio(story) : 0;

  return (
    <Link
      href={`/stories/${story.slug}`}
      className={cn("group block focus-visible:outline-none", className)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-800 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.08] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:shadow-[0_28px_60px_-24px_rgba(76,29,149,0.7)] group-hover:ring-iris-400/40 group-focus-visible:ring-2 group-focus-visible:ring-iris-400">
        <Image
          src={story.cover}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />

        {/* Grade: keeps titles legible over any artwork. */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/75 via-ink-950/10 to-transparent" />
        <div className="absolute inset-0 bg-iris-600/0 transition-colors duration-500 group-hover:bg-iris-600/10" />

        {story.premium && <PremiumBadge className="absolute top-3 right-3" />}

        {/* Play affordance, revealed on hover. */}
        <span
          aria-hidden
          className="absolute right-3 bottom-3 grid h-10 w-10 translate-y-2 place-items-center rounded-full border border-white/20 bg-ink-950/70 opacity-0 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 translate-x-[1px]">
            <path d="M3 1.6 13.4 8 3 14.4Z" fill="currentColor" />
          </svg>
        </span>

        {showProgress && ratio > 0 && (
          <div className="absolute inset-x-3 bottom-3">
            <div className="h-1 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-iris-400 to-iris-200"
                style={{ width: `${Math.round(ratio * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <h3 className="mt-3 font-display text-[15px] leading-snug font-semibold tracking-tight text-mist-100 transition-colors duration-300 group-hover:text-white sm:mt-3.5 sm:text-[16px]">
        {story.title}
      </h3>
      {showProgress && ratio > 0 ? (
        <p className="mt-1 text-[13px] text-mist-400">
          {t("sceneOf", { done: Math.round(ratio * story.scenes), total: story.scenes })}
          {" · "}
          {t(story.defaultDifficulty === "easy" ? "easy" : "hard")}
        </p>
      ) : (
        <StoryMeta story={story} className="mt-1" />
      )}
    </Link>
  );
}

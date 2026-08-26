"use client";

import Image from "next/image";
import Link from "next/link";

import type { Genre } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

/**
 * A story world, not a filter chip. The artwork carries the card; the label and
 * count sit on top of it.
 */
export function CategoryCard({
  genre,
  storyCount,
  priority = false,
  className,
}: {
  genre: Genre;
  storyCount: number;
  priority?: boolean;
  className?: string;
}) {
  const { t } = usePreferences();

  return (
    <Link
      href={`/stories?genre=${genre.id}`}
      className={cn(
        "group relative block aspect-[16/10] overflow-hidden rounded-3xl bg-ink-800 shadow-[0_28px_60px_-32px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.08] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_36px_80px_-30px_rgba(76,29,149,0.7)] hover:ring-iris-400/40 focus-visible:ring-2 focus-visible:ring-iris-400",
        className,
      )}
    >
      <Image
        src={genre.cover}
        alt=""
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
        priority={priority}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/62 to-ink-950/10" />
      <div className="absolute inset-0 bg-gradient-to-br from-iris-600/0 to-iris-600/0 transition-colors duration-500 group-hover:from-iris-500/15" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
        <div>
          <h3 className="font-display text-[clamp(1.25rem,2vw,1.6rem)] font-semibold tracking-tight text-mist-100">
            {t(genre.labelKey)}
          </h3>
          <p className="mt-1 text-[13.5px] text-mist-400">
            {t(storyCount === 1 ? "storyCountOne" : "storyCount", { count: storyCount })}
          </p>
        </div>

        <span
          aria-hidden
          className="grid h-10 w-10 shrink-0 translate-x-1 place-items-center rounded-full border border-white/15 bg-ink-950/50 text-mist-200 opacity-0 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0 group-hover:opacity-100"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
            <path
              d="M4 10h11M11 5.5 15.5 10 11 14.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      <p className="pointer-events-none absolute inset-x-6 top-6 text-[13px] text-mist-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {t(genre.taglineKey)}
      </p>
    </Link>
  );
}

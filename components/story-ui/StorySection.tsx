"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { StoryCard } from "./StoryCard";
import type { Story } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export type StorySectionProps = {
  title: string;
  /** Small line above the title, e.g. "B1 · Intermediate". */
  eyebrow?: string;
  stories: Story[];
  /** Adds a "See all" link on the right of the heading. */
  href?: string;
  showProgress?: boolean;
  priority?: boolean;
  className?: string;
};

/**
 * One horizontal shelf of stories.
 *
 * Renders nothing when it has no stories, so callers can pass a query result
 * straight through — that is how "Continue Learning" disappears for a reader
 * with no progress.
 */
export function StorySection({
  title,
  eyebrow,
  stories,
  href,
  showProgress = false,
  priority = false,
  className,
}: StorySectionProps) {
  const { t } = usePreferences();
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    const { scrollLeft, scrollWidth, clientWidth } = element;
    setEdges({
      start: scrollLeft > 8,
      end: scrollLeft + clientWidth < scrollWidth - 8,
    });
  }, []);

  useEffect(() => {
    measure();
    const element = scroller.current;
    if (!element) return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);

  const page = (direction: -1 | 1) => {
    const element = scroller.current;
    if (!element) return;
    element.scrollBy({
      left: direction * element.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  if (stories.length === 0) return null;

  return (
    <section className={cn("relative", className)}>
      <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-6 md:px-10 lg:px-16">
        <div>
          {eyebrow && (
            <p className="mb-1.5 text-[12px] font-semibold tracking-[0.14em] text-iris-300 uppercase">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-[clamp(1.35rem,2.2vw,1.75rem)] font-semibold tracking-tight text-mist-100">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {href && (
            <Link
              href={href}
              className="text-[14px] whitespace-nowrap text-mist-400 transition-colors hover:text-mist-100"
            >
              {t("seeAll")}
            </Link>
          )}
          <div className="hidden items-center gap-2 md:flex">
            <ScrollButton
              direction="left"
              disabled={!edges.start}
              onClick={() => page(-1)}
            />
            <ScrollButton
              direction="right"
              disabled={!edges.end}
              onClick={() => page(1)}
            />
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        {/* Edge fades hint at more content without a hard cut. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-ink-950 to-transparent transition-opacity duration-300",
            edges.start ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-ink-950 via-ink-950/70 to-transparent transition-opacity duration-300 md:w-24",
            edges.end ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          ref={scroller}
          onScroll={measure}
          className="scroll-slim mx-auto flex max-w-[1440px] snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 px-6 pb-4 md:scroll-px-10 md:px-10 lg:scroll-px-16 lg:px-16"
        >
          {stories.map((story, index) => (
            <div
              key={`${story.id}-${index}`}
              className="w-[72vw] shrink-0 snap-start sm:w-[46vw] md:w-[32vw] lg:w-[25vw] xl:w-[21vw] xl:max-w-[330px]"
            >
              <StoryCard
                story={story}
                showProgress={showProgress}
                priority={priority && index < 3}
                sizes="(min-width: 1280px) 21vw, (min-width: 768px) 32vw, 74vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ScrollButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = usePreferences();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? t("scrollLeft") : t("scrollRight")}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-mist-300 transition-all duration-300 hover:border-iris-400/50 hover:bg-white/[0.08] hover:text-mist-100 disabled:pointer-events-none disabled:opacity-25"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
        <path
          d={direction === "left" ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

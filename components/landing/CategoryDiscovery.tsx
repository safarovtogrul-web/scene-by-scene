"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { CategoryCard } from "./CategoryCard";
import {
  FEATURED_GENRE_IDS,
  GENRES,
  countByGenre,
  TOTAL_STORY_COUNT,
} from "@/lib/catalog";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

const featured = FEATURED_GENRE_IDS.map((id) =>
  GENRES.find((genre) => genre.id === id),
).filter((genre) => genre !== undefined);

/**
 * The first thing under the hero: the worlds Scene by Scene contains, as artwork.
 * Three per row on desktop so covers stay large.
 */
export function CategoryDiscovery() {
  const { t } = usePreferences();

  return (
    <section
      id="explore"
      className="relative scroll-mt-24 bg-ink-950 px-6 pt-16 pb-12 md:px-10 md:pt-20 lg:px-16 lg:pt-28 lg:pb-16"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <h2 className="font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold tracking-[-0.025em] text-mist-100">
              {t("exploreStories")}
            </h2>
            <p className="mt-3 max-w-[43ch] text-[clamp(0.95rem,1.1vw,1.05rem)] leading-relaxed text-mist-400">
              {t(TOTAL_STORY_COUNT === 1 ? "exploreIntroOne" : "exploreIntro", { count: TOTAL_STORY_COUNT })}
            </p>
          </div>

          <Link
            href="/stories"
            className="group inline-flex items-center gap-2 text-[15px] text-mist-300 transition-colors hover:text-mist-100"
          >
            {t("browseAllStories")}
            <svg
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path
                d="M4 10h11M11 5.5 15.5 10 11 14.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          transition={{ staggerChildren: 0.08 }}
          className="scroll-slim -mx-6 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3 lg:gap-6"
        >
          {featured.map((genre, index) => (
            <motion.li
              key={genre.id}
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-[82vw] max-w-[350px] shrink-0 snap-start sm:w-auto sm:max-w-none"
            >
              <CategoryCard
                genre={genre}
                storyCount={countByGenre(genre.id)}
                priority={index < 3}
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

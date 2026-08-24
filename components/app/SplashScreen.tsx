"use client";

import { motion } from "framer-motion";

import {
  AnimatedStoryBackground,
  MOBILE_FEATURE_COUNT,
} from "@/components/story/AnimatedStoryBackground";
import {
  MOBILE_TIMINGS,
  useFeatureSequence,
} from "@/components/story/heroFeature";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const transition = { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const };

/**
 * The Textory opening screen: a collage of six unrelated story worlds drifting
 * behind a completely static hero message and one CTA.
 *
 * Fills its parent, so it serves both the real mobile landing hero and the
 * miniature inside the phone mockups without a second implementation.
 */
export function SplashScreen({ animate = true }: { animate?: boolean }) {
  const sequence = useFeatureSequence({
    count: MOBILE_FEATURE_COUNT,
    timings: MOBILE_TIMINGS,
    enabled: animate,
  });
  return (
    <div
      data-mobile-hero-layout="stable"
      className="relative isolate flex h-full w-full flex-col overflow-hidden"
    >
      {/* Static preview surfaces pass `animate={false}`; they also opt out of
       * the featured-card sequence so the phone mockups stay calm. */}
      <AnimatedStoryBackground feature={animate} sequence={sequence} />

      <motion.div
        initial={animate ? "hidden" : false}
        animate="show"
        transition={{ staggerChildren: 0.08, delayChildren: 0.1 }}
        className="relative z-50 flex flex-1 flex-col items-center px-6 pt-[max(6.75rem,calc(env(safe-area-inset-top)+5.5rem))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center"
      >
        <motion.div variants={rise} transition={transition}>
          <h1 className="origin-top -translate-y-4 scale-[0.88] font-display text-[clamp(2.5rem,12.5vw,3.55rem)] font-bold leading-[0.98] tracking-[-0.04em] text-mist-100">
            Learn
            <br />
            languages
            <br />
            <span className="whitespace-nowrap">
              <span className="text-emphasis">through stories.</span>
            </span>
          </h1>
        </motion.div>

        <motion.p
          variants={rise}
          transition={transition}
          className="mt-3 max-w-[31ch] text-[13px] leading-[1.55] text-mist-300"
        >
          Real actions. Real scenes. A natural way to understand and remember a
          new language.
        </motion.p>

        <motion.div
          variants={rise}
          transition={transition}
          className="mt-auto w-full max-w-sm pt-10"
        >
          <PrimaryButton href="/onboarding" size="block">
            Start your journey
          </PrimaryButton>
        </motion.div>

        <motion.a
          variants={rise}
          transition={transition}
          href="#explore"
          className="mt-6 inline-flex flex-col items-center gap-1.5 text-[13px] tracking-wide text-mist-400 transition-colors hover:text-mist-100"
        >
          Explore stories
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="h-5 w-5"
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.a>
      </motion.div>
    </div>
  );
}

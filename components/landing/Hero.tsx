"use client";

import { motion } from "framer-motion";

import { AmbientGlow } from "@/components/story/AmbientGlow";
import { FloatingStoryScene } from "@/components/story/FloatingStoryScene";
import { PrimaryButton, ArrowGlyph } from "@/components/ui/PrimaryButton";

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const transition = { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const };

/**
 * Tablet + desktop hero.
 *
 * ≥ md the copy stacks above the story scene; ≥ lg it splits into the
 * reference's two-column composition with the cards bleeding off the right
 * edge. Below md the app-style {@link MobileHero} takes over instead.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate hidden overflow-hidden pt-20 md:block"
    >
      <AmbientGlow />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-8 pt-14 pb-20 lg:grid-cols-[minmax(0,47fr)_minmax(0,53fr)] lg:gap-4 lg:px-12 lg:pt-8 lg:pb-16">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
          className="relative z-20 max-w-[36rem] lg:max-w-none"
        >
          <motion.h1
            variants={rise}
            transition={transition}
            className="font-display text-[clamp(2.5rem,5vw,5.25rem)] leading-[1.02] font-bold tracking-[-0.03em] whitespace-nowrap text-mist-100"
          >
            Learn
            <br />
            languages
            <br />
            <span className="text-emphasis">through stories.</span>
          </motion.h1>

          <motion.p
            variants={rise}
            transition={transition}
            className="mt-8 max-w-[30ch] text-[clamp(1rem,1.35vw,1.3rem)] leading-[1.65] text-mist-300"
          >
            Real actions. Real scenes.
            <br className="hidden lg:block" /> A natural way to understand
            <br className="hidden lg:block" /> and remember new languages.
          </motion.p>

          <motion.div
            variants={rise}
            transition={transition}
            className="mt-10 flex flex-col items-start gap-7"
          >
            <PrimaryButton href="/onboarding" size="lg" className="px-9">
              Start your journey
              <ArrowGlyph />
            </PrimaryButton>

            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-4 text-[15px] text-mist-300 transition-colors hover:text-mist-100"
            >
              <span className="relative grid h-11 w-11 place-items-center rounded-full border border-iris-400/45 bg-white/[0.03] backdrop-blur-sm transition-all duration-300 group-hover:border-iris-400 group-hover:bg-iris-500/15">
                <span className="absolute inset-0 rounded-full shadow-glow opacity-60 transition-opacity group-hover:opacity-100" />
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 translate-x-[1px]" aria-hidden>
                  <path d="M3 1.6 13.4 8 3 14.4Z" fill="currentColor" className="text-iris-300" />
                </svg>
              </span>
              See how it works
            </a>
          </motion.div>
        </motion.div>

        <div
          id="stories"
          className="relative z-10 mx-auto w-full max-w-[720px] scroll-mt-28 lg:mx-0 lg:max-w-none lg:-mr-[7%]"
        >
          <FloatingStoryScene />
        </div>
      </div>

      {/* Fade into the showcase section below. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-900" />
    </section>
  );
}

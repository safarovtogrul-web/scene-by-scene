"use client";

import { motion } from "framer-motion";

import { PhoneFrame } from "@/components/device/PhoneFrame";
import { SplashScreen } from "@/components/app/SplashScreen";
import { LanguageStep } from "@/components/onboarding/LanguageStep";
import { LEARNING_LANGUAGES } from "@/lib/languages";

const POINTS = [
  "Installable from your browser",
  "Your place stays with you",
];

/**
 * Supporting section, not a second hero.
 *
 * One prominent phone carries the section; a second, smaller frame sits behind
 * it for depth. Both render the real app components rather than screenshots.
 */
export function MobileShowcase() {
  return (
    <section className="relative overflow-hidden bg-ink-950 px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-28">
      <div className="pointer-events-none absolute top-1/2 right-[-10%] h-[560px] w-[560px] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.22),transparent)]" />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[12px] font-semibold tracking-[0.16em] text-iris-300 uppercase">
            Web and mobile
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,3.2vw,2.7rem)] font-bold tracking-[-0.025em] text-mist-100">
            Stories that follow you
          </h2>
          <p className="mt-4 max-w-[39ch] text-[16px] leading-relaxed text-mist-400">
            Read in the browser or add Textory to your home screen. The same
            stories are ready wherever you continue.
          </p>

          <ul className="mt-7 flex flex-wrap gap-2.5">
            {POINTS.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3.5 py-2"
              >
                <span
                  aria-hidden
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-iris-500/15 text-iris-300"
                >
                  <svg viewBox="0 0 14 14" fill="none" className="h-3 w-3">
                    <path
                      d="m3 7.3 2.8 2.8L11 4.6"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-[13.5px] text-mist-300">
                  {point}
                </span>
              </li>
            ))}
          </ul>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto hidden w-full max-w-[300px] md:block md:max-w-[330px] lg:mx-0 lg:max-w-none"
        >
          {/* Secondary frame — depth only, hidden where there is no room. */}
          <div className="pointer-events-none absolute top-12 right-0 hidden w-[56%] rotate-6 opacity-70 lg:block">
            <PhoneFrame statusBarTime="21:04">
              <div className="h-full pt-[54px]">
                <LanguageStep
                  readOnly
                  step={1}
                  total={2}
                  question={"Which language\ndo you want to"}
                  emphasis="learn?"
                  hint="You can change this later."
                  languages={LEARNING_LANGUAGES}
                  value="es"
                  ctaLabel="Continue"
                />
              </div>
            </PhoneFrame>
          </div>

          <div className="relative z-10 w-full lg:w-[72%]">
            <PhoneFrame>
              <SplashScreen animate={false} />
            </PhoneFrame>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

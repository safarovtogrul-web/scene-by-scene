"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { MessageKey } from "@/lib/i18n/messages";

/**
 * The method, in three beats. Deliberately compact — this explains the product,
 * it is not a feature list.
 */
const STEPS: Array<{ icon: ReactNode; titleKey: MessageKey; bodyKey: MessageKey }> = [
  {
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M3 15.5 8 11l3.5 3L15 10l6 5.5" />
        <circle cx="9" cy="9" r="1.4" />
      </>
    ),
    titleKey: "stepSeeTitle",
    bodyKey: "stepSeeBody",
  },
  {
    icon: (
      <>
        <path d="M4 6h16M4 11h11M4 16h7" />
        <path d="m15 17 2 2 4-4.5" />
      </>
    ),
    titleKey: "stepReadTitle",
    bodyKey: "stepReadBody",
  },
  {
    icon: (
      <>
        <path d="M12 20.5s-7.5-4.3-7.5-9.7A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5.4-7.5 9.7-7.5 9.7Z" />
      </>
    ),
    titleKey: "stepRememberTitle",
    bodyKey: "stepRememberBody",
  },
];

export function HowItWorks() {
  const { t } = usePreferences();

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden bg-ink-900 px-6 py-16 md:px-10 md:py-20 lg:px-16 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iris-500/40 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-[380px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.24),transparent)]" />

      <div className="relative mx-auto max-w-[1200px]">
        <div className="max-w-[52ch]">
          <p className="text-[12px] font-semibold tracking-[0.16em] text-iris-300 uppercase">
            {t("howEyebrow")}
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.9rem,3.4vw,2.9rem)] font-bold tracking-[-0.025em] text-mist-100">
            {t("howTitleOne")}
            <br />
            <span className="text-emphasis">{t("howTitleTwo")}</span>
          </h2>
        </div>

        <motion.ol
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.12 }}
          className="mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-8 lg:gap-12"
        >
          {STEPS.map((step, index) => (
            <motion.li
              key={step.titleKey}
              variants={{
                hidden: { opacity: 0, y: 26 },
                show: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-iris-400/25 bg-iris-500/[0.08] text-iris-300">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                    aria-hidden
                  >
                    {step.icon}
                  </svg>
                </span>
                <span className="font-display text-[13px] font-semibold tracking-[0.14em] text-mist-500 tabular-nums">
                  0{index + 1}
                </span>
              </div>

              <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-mist-100">
                {t(step.titleKey)}
              </h3>
              <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-mist-400">
                {t(step.bodyKey)}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}

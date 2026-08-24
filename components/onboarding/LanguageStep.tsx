"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { LanguageSelector } from "./LanguageSelector";
import { OnboardingProgress } from "./OnboardingProgress";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import type { Language } from "@/lib/languages";

export type LanguageStepProps = {
  step: number;
  total: number;
  /** Plain first line of the question. */
  question: string;
  /** The violet-emphasised word that closes the question, e.g. "learn?" */
  emphasis: string;
  hint: string;
  languages: readonly Language[];
  value: string | null;
  ctaLabel: ReactNode;
  onChange?: (code: string) => void;
  onBack?: () => void;
  onSubmit?: () => void;
  /** Static presentation for the landing-page phone mockups. */
  readOnly?: boolean;
};

/**
 * One onboarding question. The same component backs the real `/onboarding`
 * route and the miniature screens inside the landing-page phone mockups.
 */
export function LanguageStep({
  step,
  total,
  question,
  emphasis,
  hint,
  languages,
  value,
  ctaLabel,
  onChange,
  onBack,
  onSubmit,
  readOnly = false,
}: LanguageStepProps) {
  const [firstLine, secondLine] = question.split("\n");

  return (
    <div className="flex h-full w-full flex-col px-6 pt-[max(1.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <button
        type="button"
        onClick={onBack}
        disabled={readOnly}
        aria-label="Go back"
        className="-ml-2 grid h-9 w-9 shrink-0 place-items-center rounded-full text-mist-300 transition-colors hover:bg-white/[0.06] hover:text-mist-100 disabled:pointer-events-none"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
          <path
            d="M19 12H5m0 0 6-6m-6 6 6 6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <OnboardingProgress step={step} total={total} className="mt-3 shrink-0" />

      <motion.div
        key={step}
        initial={readOnly ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <h1 className="mt-8 shrink-0 font-display text-[clamp(1.6rem,7vw,2rem)] leading-[1.2] font-bold tracking-[-0.02em] text-mist-100">
          {firstLine}
          {secondLine && (
            <>
              <br />
              {secondLine}{" "}
            </>
          )}
          <span className="text-emphasis">{emphasis}</span>
        </h1>

        <p className="mt-3 shrink-0 text-[13.5px] text-mist-400">{hint}</p>

        <div className="scroll-slim mt-7 min-h-0 flex-1 overflow-y-auto pb-4">
          <LanguageSelector
            name={`${firstLine} ${secondLine ?? ""} ${emphasis}`.trim()}
            languages={languages}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
          />
        </div>
      </motion.div>

      <div className="shrink-0 pt-2">
        <PrimaryButton
          size="block"
          onClick={onSubmit}
          disabled={readOnly ? undefined : !value}
        >
          {ctaLabel}
        </PrimaryButton>
      </div>
    </div>
  );
}

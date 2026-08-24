"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { LanguageStep } from "./LanguageStep";
import { TextoryLogo } from "@/components/brand/TextoryLogo";
import { PrimaryButton, ArrowGlyph } from "@/components/ui/PrimaryButton";
import { LEARNING_LANGUAGES, SPOKEN_LANGUAGES, getLanguage } from "@/lib/languages";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { TextoryPreferences } from "@/lib/preferences";

const TOTAL_STEPS = 2;

/**
 * Visual shell for language setup. Two questions, then a short confirmation.
 * The shared product preference model backs setup, account settings and menu
 * controls, so onboarding is the first entry point rather than a parallel one.
 */
export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { preferences, updatePreferences } = usePreferences();

  const update = (patch: Partial<TextoryPreferences>) => {
    void updatePreferences(patch);
  };

  const goBack = () => {
    if (step === 1) router.push("/");
    else setStep((current) => current - 1);
  };

  return (
    <div className="relative z-10 flex h-full w-full flex-col">
      <AnimatePresence mode="wait" initial={false}>
        {step === 1 && (
          <Panel key="step-1">
            <LanguageStep
              step={1}
              total={TOTAL_STEPS}
              question={"Which language\ndo you want to"}
              emphasis="learn?"
              hint="You can change this later."
              languages={LEARNING_LANGUAGES}
              value={preferences.learningLanguage}
              onChange={(code) => update({ learningLanguage: code as TextoryPreferences["learningLanguage"] })}
              onBack={goBack}
              onSubmit={() => setStep(2)}
              ctaLabel="Continue"
            />
          </Panel>
        )}

        {step === 2 && (
          <Panel key="step-2">
            <LanguageStep
              step={2}
              total={TOTAL_STEPS}
              question={"Which language\nshould Textory"}
              emphasis="use?"
              hint="This is the language of the interface and scene translations."
              languages={SPOKEN_LANGUAGES}
              value={preferences.interfaceLanguage}
              onChange={(code) => update({ interfaceLanguage: code as TextoryPreferences["interfaceLanguage"] })}
              onBack={goBack}
              onSubmit={() => setStep(3)}
              ctaLabel="Start Textory ✨"
            />
          </Panel>
        )}

        {step === 3 && (
          <Panel key="done">
            <Confirmation preferences={preferences} onRestart={() => setStep(1)} />
          </Panel>
        )}
      </AnimatePresence>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function Confirmation({
  preferences,
  onRestart,
}: {
  preferences: TextoryPreferences;
  onRestart: () => void;
}) {
  const learning = getLanguage(preferences.learningLanguage);
  const interfaceLanguage = getLanguage(preferences.interfaceLanguage);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-8 text-center">
      <TextoryLogo size="lg" markOnly />

      <div>
        <h1 className="font-display text-[clamp(1.7rem,7vw,2.1rem)] font-bold tracking-[-0.02em] text-mist-100">
          You&apos;re all set.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-mist-300">
          Learning{" "}
          <span className="text-emphasis font-semibold">
            {learning.nativeName}
          </span>
          , with Textory and scene translations in{" "}
          <span className="text-emphasis font-semibold">
            {interfaceLanguage.nativeName}
          </span>
          .
        </p>
        <p className="mt-6 text-[13.5px] text-mist-500">
          Your story library is coming next.
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <PrimaryButton href="/" size="block">
          Back to Textory
          <ArrowGlyph />
        </PrimaryButton>
        <PrimaryButton variant="ghost" size="block" onClick={onRestart}>
          Change my languages
        </PrimaryButton>
      </div>
    </div>
  );
}

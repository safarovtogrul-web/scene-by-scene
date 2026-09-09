"use client";

import { useState } from "react";
import { ReaderControls } from "@/components/reader/ReaderControls";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { PrimaryButton, ArrowGlyph } from "@/components/ui/PrimaryButton";
import { getLanguage } from "@/lib/languages";
import type { Difficulty, Story } from "@/lib/catalog";
import { readerHref } from "@/lib/story-packages/schema";

/** Story entry uses the existing global language/translation preferences. */
export function StoryExperience({ story, readerBase }: { story: Story; readerBase?: string }) {
  const { preferences, t } = usePreferences();
  const [difficulty, setDifficulty] = useState<Difficulty>(story.defaultDifficulty);
  const language = getLanguage(preferences.learningLanguage);
  const available = story.availableLanguages.includes(language.id);

  return (
    <section className="mt-8 border-t border-white/[0.07] pt-6 md:mt-9" aria-label={t("storyOptions")}>
      <ReaderControls difficulty={difficulty} onDifficultyChange={setDifficulty} />
      <p className="mt-4 text-[13px] text-mist-400">{t("learningLanguage")}: <bdi>{language.nativeName}</bdi></p>
      {available ? (
        <PrimaryButton href={readerHref(story.slug, difficulty, readerBase)} className="mt-5" prefetch={false}>
          {t("startStory")}<ArrowGlyph />
        </PrimaryButton>
      ) : (
        <>
        <PrimaryButton disabled className="mt-5">{t("startStory")}<ArrowGlyph /></PrimaryButton>
        <div role="status" className="mt-4 max-w-[54ch] text-[13px] leading-relaxed text-mist-400">
          <p>{t("languageNotAvailable", { language: language.nativeName })}</p>
          <p className="mt-1 text-mist-500">{t("contentComingSoon")}</p>
        </div>
        </>
      )}
    </section>
  );
}

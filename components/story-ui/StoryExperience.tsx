"use client";

import { useState } from "react";

import { LanguageSettingsButton } from "@/components/preferences/LanguageSettings";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage } from "@/lib/languages";
import { resolveStoryLanguageVariant } from "@/lib/catalog";
import type { Difficulty, Story, StoryLanguageVariant } from "@/lib/catalog";
import { cn } from "@/lib/cn";

/**
 * Data-driven reader entry point. Current catalogue records deliberately have
 * no scene variants yet, so this surface tells the truth rather than showing
 * placeholder prose. Once PDF-backed content is registered, it resolves the
 * selected learning language automatically and renders without route changes.
 */
export function StoryExperience({ story }: { story: Story }) {
  const { preferences, updatePreferences, t } = usePreferences();
  const [difficulty, setDifficulty] = useState<Difficulty>(story.defaultDifficulty);
  const learningLanguage = getLanguage(preferences.learningLanguage);
  const variant = resolveStoryLanguageVariant(story, difficulty, preferences.learningLanguage);

  return (
    <section className="mt-8 border-t border-white/[0.07] pt-6 md:mt-9" aria-label="Story options">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-iris-300 uppercase">Story options</p>
          <p className="mt-1 text-[13.5px] text-mist-400">
            {t("learningLanguage")}: <span dir={learningLanguage.dir} className="font-medium text-mist-200">{learningLanguage.nativeName}</span>
          </p>
        </div>
        <LanguageSettingsButton />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Story difficulty">
        {(["easy", "hard"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={difficulty === option}
            onClick={() => setDifficulty(option)}
            className={cn(
              "h-10 rounded-full border px-5 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
              difficulty === option
                ? "border-iris-400/60 bg-iris-500/15 text-mist-100"
                : "border-white/[0.09] bg-white/[0.03] text-mist-400 hover:border-white/20 hover:text-mist-100",
            )}
          >
            {option === "easy" ? t("easy") : t("hard")}
          </button>
        ))}
      </div>

      <label className="mt-4 flex max-w-sm cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3">
        <span className="text-[14px] text-mist-200">{t("translation")}</span>
        <input
          type="checkbox"
          checked={preferences.showTranslations}
          onChange={(event) => void updatePreferences({ showTranslations: event.target.checked })}
          className="h-4.5 w-4.5 accent-iris-500"
          aria-label={t("translation")}
        />
      </label>

      {variant ? (
        <StoryReader
          variant={variant}
          learningLanguage={preferences.learningLanguage}
          interfaceLanguage={preferences.interfaceLanguage}
          showTranslations={preferences.showTranslations}
        />
      ) : (
        <div role="status" className="mt-4 max-w-[54ch] rounded-2xl border border-amber-300/15 bg-amber-200/[0.045] px-4 py-3.5 text-[14px] leading-relaxed text-mist-300">
          <p>{t("languageNotAvailable", { language: learningLanguage.nativeName })}</p>
          <p className="mt-1 text-mist-500">{t("contentComingSoon")}</p>
        </div>
      )}
    </section>
  );
}

/**
 * The future reader is deliberately content-only: image, primary sentence,
 * optional per-scene translation and scene vocabulary all come from data.
 */
export function StoryReader({
  variant,
  learningLanguage,
  interfaceLanguage,
  showTranslations,
}: {
  variant: StoryLanguageVariant;
  learningLanguage: string;
  interfaceLanguage: string;
  showTranslations: boolean;
}) {
  const learning = getLanguage(learningLanguage);
  const interfaceLanguageConfig = getLanguage(interfaceLanguage);

  return (
    <ol className="mt-6 space-y-6" aria-label="Story scenes">
      {variant.scenes.map((scene) => {
        const translation = scene.translations?.[interfaceLanguageConfig.id];
        return (
          <li key={scene.id} className="overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900">
            <img src={scene.image} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="p-5">
              <p lang={learning.locale} dir={learning.dir} className="text-[18px] leading-relaxed font-medium text-mist-100">{scene.text}</p>
              {showTranslations && translation && (
                <p lang={interfaceLanguageConfig.locale} dir={interfaceLanguageConfig.dir} className="mt-2 text-[14px] leading-relaxed text-mist-400">{translation}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

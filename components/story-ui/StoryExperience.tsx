"use client";

import { useState } from "react";

import { SubtitlesToggle } from "@/components/language/SubtitlesToggle";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { getLanguage } from "@/lib/languages";
import { resolveStoryLanguageVariant } from "@/lib/catalog";
import type { Difficulty, Story, StoryLanguageVariant } from "@/lib/catalog";

/**
 * Data-driven reader entry point. Current catalogue records deliberately have
 * no scene variants yet, so this surface tells the truth rather than showing
 * placeholder prose. Once PDF-backed content is registered, it resolves the
 * selected learning language automatically and renders without route changes.
 *
 * Reading controls only. The learning language is chosen once in the header
 * and applies everywhere, so repeating the picker on the story page would be a
 * second place to change the same setting. The artwork stays the focus.
 */
export function StoryExperience({ story }: { story: Story }) {
  const { preferences, t } = usePreferences();
  const [difficulty, setDifficulty] = useState<Difficulty>(story.defaultDifficulty);
  const learningLanguage = getLanguage(preferences.learningLanguage);
  const variant = resolveStoryLanguageVariant(story, difficulty, preferences.learningLanguage);

  return (
    <section className="mt-8 border-t border-white/[0.07] pt-6 md:mt-9" aria-label="Story options">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <SegmentedControl
          label={t("storyLevel")}
          value={difficulty}
          onValueChange={setDifficulty}
          size="sm"
          options={[
            { value: "easy", label: t("easy") },
            { value: "hard", label: t("hard") },
          ]}
        />

        {/* On a phone this drops to its own full-width line rather than
         * hanging off the end of the level control. */}
        <SubtitlesToggle compact className="w-full sm:ms-auto sm:w-auto" />
      </div>

      {variant ? (
        <StoryReader
          variant={variant}
          learningLanguage={preferences.learningLanguage}
          interfaceLanguage={preferences.interfaceLanguage}
          showTranslations={preferences.showTranslations}
        />
      ) : (
        <div role="status" className="mt-5 max-w-[54ch] rounded-2xl border border-amber-300/15 bg-amber-200/[0.045] px-4 py-3.5 text-[14px] leading-relaxed text-mist-300">
          <p>{t("languageNotAvailable", { language: learningLanguage.englishName })}</p>
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

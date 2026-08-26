"use client";

import { TOTAL_STORY_COUNT } from "@/lib/catalog";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

export function StoriesHeader() {
  const { t } = usePreferences();

  return (
    <header className="max-w-[46ch]">
      <h1 className="font-display text-[clamp(2.2rem,4.4vw,3.6rem)] leading-[1.05] font-bold tracking-[-0.03em] text-mist-100">
        {t("navStories")}
      </h1>
      <p className="mt-4 text-[clamp(1rem,1.3vw,1.2rem)] leading-relaxed text-mist-300">
        {t("storiesLeadOne")}{" "}
        <span className="text-emphasis">{t("storiesLeadTwo")}</span>
      </p>
      <p className="mt-3 text-[14.5px] text-mist-500">
        {t("storiesMeta", { count: TOTAL_STORY_COUNT })}
      </p>
    </header>
  );
}

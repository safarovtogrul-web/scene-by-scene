"use client";

import { useState, type ReactNode } from "react";
import { LanguagePicker } from "@/components/language/LanguagePicker";
import { SubtitlesToggle } from "@/components/language/SubtitlesToggle";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LanguageFlag } from "@/components/ui/FlagIcon";
import { getLanguage, shortCodeFor, type LanguageId } from "@/lib/languages";
import type { Difficulty } from "@/lib/catalog/types";
import { sceneCopy, type PackageScene } from "@/lib/story-packages/schema";
import { ReaderSheet } from "./ReaderSheet";
import styles from "./reader.module.css";

export function ReaderSettings({ open, onOpenChange, difficulty, onDifficultyChange, scene, developmentTools }: {
  open: boolean; onOpenChange: (open: boolean) => void; difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void; scene?: PackageScene; developmentTools?: ReactNode;
}) {
  const { preferences, updatePreferences, t, isSaving, syncFailed } = usePreferences();
  const [view, setView] = useState<"settings" | "learningLanguage" | "translationLanguage">("settings");
  const learning = getLanguage(preferences.learningLanguage);
  const translation = getLanguage(preferences.translationLanguage);
  const copy = sceneCopy(scene, difficulty, preferences.learningLanguage, preferences.translationLanguage);
  const changeOpen = (next: boolean) => { if (!next) setView("settings"); onOpenChange(next); };
  const select = (language: LanguageId) => {
    void updatePreferences(view === "translationLanguage"
      ? { translationLanguage: language }
      : { learningLanguage: language });
    setView("settings");
  };
  return <ReaderSheet open={open} onOpenChange={changeOpen} title={t("readerSettings")}
    trigger={<button type="button" className={styles.readerSettingsTrigger} aria-label={`${t("readerSettings")} · ${t("learningLanguage")}: ${learning.englishName}`}>
      <span className={styles.readerLanguageCode} aria-hidden>{shortCodeFor(learning.id)}</span>
      <bdi>{learning.nativeName}</bdi>
      <svg viewBox="0 0 12 12" fill="none" aria-hidden><path d="m3 4.5 3 3 3-3" stroke="currentColor" strokeWidth="1.2" /></svg>
    </button>}>
    {view === "settings" ? <div className={styles.settingsRows}>
      <button type="button" onClick={() => setView("learningLanguage")} className={styles.settingsLanguage}>
        <span>{t("learningLanguage")}</span><span><LanguageFlag language={learning.id} size="sm" /><bdi>{learning.nativeName}</bdi><span aria-hidden>›</span></span>
      </button>
      <button type="button" onClick={() => setView("translationLanguage")} className={styles.settingsLanguage}>
        <span>{t("translationLanguage")}</span><span><LanguageFlag language={translation.id} size="sm" /><bdi>{translation.nativeName}</bdi><span aria-hidden>›</span></span>
      </button>
      <div className={styles.settingsRow}><span>{t("storyLevel")}</span><SegmentedControl label={t("storyLevel")} value={difficulty} onValueChange={onDifficultyChange} size="sm"
        options={[{ value: "easy", label: t("easy") }, { value: "hard", label: t("hard") }]} className={styles.difficulty} /></div>
      <SubtitlesToggle label={t("readerTranslation")} className={styles.settingsTranslation} />
      {preferences.showTranslations && <p className={styles.settingsHint}>
        {preferences.learningLanguage === preferences.translationLanguage ? t("translationSameLanguage")
          : !copy.translation ? t("translationUnavailable", { language: translation.nativeName }) : null}
      </p>}
      {isSaving && <p role="status" className={styles.settingsHint}>{t("saving")}</p>}
      {syncFailed && <p role="status" className={styles.settingsHint}>{t("preferencesSyncFailed")}</p>}
      {developmentTools}
    </div> : <>
      <button type="button" onClick={() => setView("settings")} className={styles.sheetBack}>{t("back")} · {t(view)}</button>
      <LanguagePicker label={t(view)} value={view === "translationLanguage" ? preferences.translationLanguage : preferences.learningLanguage}
        onSelect={select} autoFocusSearch={false} listClassName={styles.settingsLanguageList} />
    </>}
  </ReaderSheet>;
}

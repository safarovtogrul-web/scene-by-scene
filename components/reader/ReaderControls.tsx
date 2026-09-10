"use client";

import { LearningLanguageControl } from "@/components/language/LanguageControls";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { Difficulty } from "@/lib/catalog/types";
import styles from "./reader.module.css";

export function ReaderControls({ difficulty, onDifficultyChange }: { difficulty: Difficulty; onDifficultyChange: (value: Difficulty) => void }) {
  const { t } = usePreferences();
  return (
    <div className={styles.controls} aria-label={t("storyOptions")}>
      <SegmentedControl
        label={t("storyLevel")} value={difficulty} onValueChange={onDifficultyChange} size="sm"
        options={[{ value: "easy", label: t("easy") }, { value: "hard", label: t("hard") }]}
        className={styles.difficulty}
      />
      <LearningLanguageControl className={styles.language} />
    </div>
  );
}

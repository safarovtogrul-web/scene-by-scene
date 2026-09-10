"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { Difficulty } from "@/lib/catalog/types";
import { getLanguage } from "@/lib/languages";
import type { StoryPackage } from "@/lib/story-packages/schema";
import { ReaderSettings } from "./ReaderSettings";
import { StoryReader, ReaderArrow } from "./StoryReader";
import styles from "./reader.module.css";

/** Dedicated cinema route. Discovery and the story portal live outside this component. */
export function ReaderExperience({ story, initialDifficulty = story.defaultDifficulty, developmentTools, exitHref }: {
  story: StoryPackage; initialDifficulty?: Difficulty; developmentTools?: ReactNode; exitHref?: string;
}) {
  const { preferences, t } = usePreferences();
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [index, setIndex] = useState(-1);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const safeIndex = Math.max(0, Math.min(index, story.scenes.length - 1));
  const ui = getLanguage(preferences.interfaceLanguage);
  const progress = index < 0 ? t("readerOpening")
    : index >= story.scenes.length ? t("readerCompleted")
      : t("sceneOf", { done: safeIndex + 1, total: story.scenes.length });
  return <main className={styles.world} style={{ "--world-color": story.background.color ?? "#131b26", "--world-accent": story.background.accent ?? "#a78bfa" } as CSSProperties} dir={ui.dir} data-reader-mode="cinema">
    <div className={styles.atmosphere} aria-hidden>
      <Image src={story.background.image} alt="" fill unoptimized={story.background.image.endsWith(".svg")} sizes="100vw" className={styles.worldImage} loading="eager" fetchPriority="low" />
    </div>
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#story-scenes">{t("readerSkip")}</a>
      <header className={styles.header}>
        <Link href={exitHref ?? `/stories/${story.slug}`} className={styles.iconButton} aria-label={t("back")}><ReaderArrow left={ui.dir !== "rtl"} /></Link>
        <div className={styles.identity}><h1>{story.title}</h1><p>{progress}</p></div>
        <ReaderSettings open={settingsOpen} onOpenChange={setSettingsOpen} difficulty={difficulty} onDifficultyChange={setDifficulty} scene={story.scenes[safeIndex]} developmentTools={developmentTools} />
      </header>
      <StoryReader story={story} difficulty={difficulty} index={index} onIndexChange={setIndex}
        onOpenSettings={() => setSettingsOpen(true)} exitHref={exitHref ?? `/stories/${story.slug}`} />
    </div>
  </main>;
}

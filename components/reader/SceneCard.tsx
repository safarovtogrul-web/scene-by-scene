"use client";

import { useState, type CSSProperties } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage } from "@/lib/languages";
import type { Difficulty } from "@/lib/catalog/types";
import { sceneCopy, sceneImageSources, type BubblePlacement, type PackageScene } from "@/lib/story-packages/schema";
import { bubbleCopySize, readerPagePose } from "@/lib/reader/presentation";
import { SceneArtwork } from "./SceneArtwork";
import styles from "./reader.module.css";

const presets = {
  "top-left": [0, 0], "top-center": [0.5, 0], "top-right": [1, 0],
  "center-left": [0, 0.5], "center-right": [1, 0.5],
  "bottom-left": [0, 1], "bottom-center": [0.5, 1], "bottom-right": [1, 1],
} as const;

function placementVariables(placement: BubblePlacement | undefined, prefix: string): CSSProperties {
  const value = placement ?? { preset: "bottom-center" };
  const [x, y] = value.preset ? presets[value.preset] : [value.x, value.y];
  return {
    [`--${prefix}-x`]: `${x * 100}%`, [`--${prefix}-y`]: `${y * 100}%`,
    [`--${prefix}-shift-x`]: `${-x * 100}%`, [`--${prefix}-shift-y`]: `${-y * 100}%`,
    [`--${prefix}-width`]: `${(value.maxWidth ?? 0.8) * 100}%`,
    [`--${prefix}-align`]: value.alignment ?? "center",
    [`--${prefix}-surface`]: value.tone === "ink" ? "rgb(15 22 31 / 72%)" : "rgb(15 22 31 / 57%)",
  } as CSSProperties;
}

export function SceneCard({ scene, difficulty, active, nearby, total, visualOffset, drag }: {
  scene: PackageScene; difficulty: Difficulty; active: boolean; nearby: boolean; total: number;
  visualOffset: number; drag: number;
}) {
  const { preferences, t } = usePreferences();
  const learning = getLanguage(preferences.learningLanguage);
  const ui = getLanguage(preferences.interfaceLanguage);
  const copy = sceneCopy(scene, difficulty, learning.id, ui.id);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const focal = scene.visual?.focalPoint ?? { x: 0.5, y: 0.5 };
  const mobileFocal = scene.visual?.mobileFocalPoint ?? focal;
  const showCaption = preferences.showTranslations && Boolean(copy.translation);
  const images = sceneImageSources(scene.image);
  const imageKey = `${images.desktop}|${images.mobile}`;
  const translationState = !preferences.showTranslations ? "hidden"
    : copy.translation ? "visible"
      : learning.id === ui.id ? "same-language" : "unavailable";
  const translationNotice = translationState === "same-language"
    ? t("translationSameLanguage")
    : translationState === "unavailable"
      ? t("translationUnavailable", { language: ui.nativeName })
      : undefined;
  const pose = readerPagePose(visualOffset, drag);
  const variables = {
    ...placementVariables(scene.bubble, "bubble"),
    ...placementVariables(scene.mobileBubble ?? scene.bubble, "mobile-bubble"),
    "--focal": `${focal.x * 100}% ${focal.y * 100}%`,
    "--mobile-focal": `${mobileFocal.x * 100}% ${mobileFocal.y * 100}%`,
    "--page-yaw": `${pose.yaw}deg`, "--page-scale": pose.scale, "--page-depth": `${pose.depth}px`,
    "--page-origin": pose.origin, "--page-fold": pose.fold, "--page-shadow-x": `${pose.shadowX}px`,
  } as CSSProperties;

  return (
    <article
      className={styles.card} style={variables} data-active={active} data-scene={scene.order}
      role="group" aria-label={t("sceneOf", { done: scene.order, total })}
      aria-hidden={!active} inert={!active}
    >
      <div className={styles.artwork}>
        {nearby && failedImage !== imageKey && <>
          <SceneArtwork image={scene.image} ambient />
          <SceneArtwork image={scene.image} alt={scene.alt?.[ui.id] ?? ""} active={active} onError={() => setFailedImage(imageKey)} />
        </>}
        <span className={styles.pageFold} aria-hidden />
        {(failedImage === imageKey || !images.desktop) && <p className={styles.imageError}>{t("sceneImageUnavailable")}</p>}
        {nearby && (
          <div className={styles.bubbleLayer}>
            <div className={styles.bubble} data-bubble-type={scene.bubble?.type ?? "narration"}
              data-copy-size={bubbleCopySize(copy.primary, copy.translation)} data-translation-state={translationState}>
              <div className={styles.bubbleCopy} tabIndex={active ? 0 : -1}>
                {scene.bubble?.speaker && <span className={styles.speaker}>{scene.bubble.speaker}</span>}
                <p className={styles.primary} lang={learning.locale} dir={learning.dir}>{copy.primary}</p>
                {preferences.showTranslations && (showCaption || translationNotice) && <div className={styles.translationBlock}
                  data-translation-language={ui.id} data-translation-state={translationState}>
                  <span className={styles.translationLabel}>{t("readerTranslation")} · <bdi>{ui.nativeName}</bdi></span>
                  <p lang={ui.locale} dir={ui.dir}
                    className={`${styles.caption} ${translationNotice ? styles.captionNotice : ""}`}>
                    {copy.translation ?? translationNotice}
                  </p>
                </div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

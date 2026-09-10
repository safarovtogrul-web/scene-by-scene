"use client";

import { useState, type CSSProperties } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage } from "@/lib/languages";
import type { Difficulty } from "@/lib/catalog/types";
import { sceneCopy, sceneImageSources, type BubblePlacement, type PackageScene } from "@/lib/story-packages/schema";
import { bubbleCopySize, readerPagePose } from "@/lib/reader/presentation";
import { SceneArtwork } from "./SceneArtwork";
import { sentenceCard, sentenceKeyFor } from "@/lib/reader/sentenceCard";
import { SentenceBubble } from "./SentenceBubble";
import styles from "./reader.module.css";

const presets = {
  "top-left": [0, 0], "top-center": [0.5, 0], "top-right": [1, 0],
  "center-left": [0, 0.5], "center-right": [1, 0.5],
  "bottom-left": [0, 1], "bottom-center": [0.5, 1], "bottom-right": [1, 1],
} as const;

function placementVariables(placement: BubblePlacement | undefined, prefix: string): CSSProperties {
  const value = placement ?? { preset: "bottom-center" };
  const [x, y] = value.preset ? presets[value.preset] : [value.x, value.y];
  const adaptiveSafeWidth = prefix === "mobile-bubble" ? 0.74 : 0.64;
  return {
    [`--${prefix}-x`]: `${x * 100}%`, [`--${prefix}-y`]: `${y * 100}%`,
    [`--${prefix}-shift-x`]: `${-x * 100}%`, [`--${prefix}-shift-y`]: `${-y * 100}%`,
    [`--${prefix}-width`]: `${(value.maxWidth ?? adaptiveSafeWidth) * 100}%`,
    [`--${prefix}-align`]: value.alignment ?? "center",
    // One card, one side at a time: the surface can be far more transparent
    // than a stacked pair could afford and still read over bright artwork.
    [`--${prefix}-surface`]: value.tone === "ink" ? "rgb(10 15 23 / 54%)" : "rgb(12 18 27 / 40%)",
    // Only set when the scene caps its bubble height to protect a face.
    [`--${prefix}-text-scale`]: value.textScale ?? 1,
  } as CSSProperties;
}

export function SceneCard({ scene, difficulty, active, nearby, total, visualOffset, drag }: {
  scene: PackageScene; difficulty: Difficulty; active: boolean; nearby: boolean; total: number;
  visualOffset: number; drag: number;
}) {
  const { preferences, t } = usePreferences();
  const learning = getLanguage(preferences.learningLanguage);
  const translation = getLanguage(preferences.translationLanguage);
  const copy = sceneCopy(scene, difficulty, preferences.learningLanguage, preferences.translationLanguage);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const focal = scene.visual?.focalPoint ?? { x: 0.5, y: 0.5 };
  const mobileFocal = scene.visual?.mobileFocalPoint ?? focal;
  const images = sceneImageSources(scene.image);
  const imageKey = `${images.desktop}|${images.mobile}`;

  const card = sentenceCard(copy, learning, translation);

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
          <SceneArtwork image={scene.image} alt={scene.alt?.[preferences.interfaceLanguage] ?? ""} active={active} onError={() => setFailedImage(imageKey)} />
        </>}
        <span className={styles.pageFold} aria-hidden />
        {(failedImage === imageKey || !images.desktop) && <p className={styles.imageError}>{t("sceneImageUnavailable")}</p>}
        {nearby && card && (
          <div className={styles.bubbleLayer}>
            {/* The card is sized for the longer of its two sides, so flipping
                reveals a translation without the surface jumping under it. */}
            <div className={styles.bubbleStack} data-copy-size={bubbleCopySize(copy.primary, copy.translation)}>
              <SentenceBubble
                card={card} type={scene.bubble?.type ?? "narration"} speaker={scene.bubble?.speaker}
                active={active} sentenceKey={sentenceKeyFor(scene.id, difficulty, learning.id)}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

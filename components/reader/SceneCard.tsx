"use client";

import { useState, type CSSProperties } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage } from "@/lib/languages";
import type { Difficulty } from "@/lib/catalog/types";
import { sceneCopy, sceneImageSources, type BubblePlacement, type PackageScene } from "@/lib/story-packages/schema";
import { bubbleCopySize, readerPagePose } from "@/lib/reader/presentation";
import { SceneArtwork } from "./SceneArtwork";
import { useSpeechSynthesis } from "./useSpeechSynthesis";
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
    [`--${prefix}-surface`]: value.tone === "ink" ? "rgb(15 22 31 / 72%)" : "rgb(15 22 31 / 57%)",
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
  const ui = getLanguage(preferences.interfaceLanguage);
  const copy = sceneCopy(scene, difficulty, preferences.learningLanguage, preferences.translationLanguage);
  const speech = useSpeechSynthesis(active);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const focal = scene.visual?.focalPoint ?? { x: 0.5, y: 0.5 };
  const mobileFocal = scene.visual?.mobileFocalPoint ?? focal;
  const showCaption = preferences.showTranslations && Boolean(copy.translation);
  const images = sceneImageSources(scene.image);
  const imageKey = `${images.desktop}|${images.mobile}`;
  const translationState = !preferences.showTranslations ? "hidden"
    : copy.translation ? "visible"
      : learning.id === translation.id ? "same-language" : "unavailable";
  const translationNotice = translationState === "same-language"
    ? t("translationSameLanguage")
    : translationState === "unavailable"
      ? t("translationUnavailable", { language: translation.nativeName })
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
          <SceneArtwork image={scene.image} alt={scene.alt?.[preferences.interfaceLanguage] ?? ""} active={active} onError={() => setFailedImage(imageKey)} />
        </>}
        <span className={styles.pageFold} aria-hidden />
        {(failedImage === imageKey || !images.desktop) && <p className={styles.imageError}>{t("sceneImageUnavailable")}</p>}
        {nearby && (
          <div className={styles.bubbleLayer}>
            <div className={styles.bubbleStack}
              data-copy-size={bubbleCopySize(copy.primary, copy.translation ?? translationNotice)}
              data-translation-state={translationState}
              data-compact={difficulty === "hard" && preferences.showTranslations && Boolean(copy.translation || translationNotice)}>
              <div className={styles.bubble} data-bubble-type={scene.bubble?.type ?? "narration"}>
                <div className={styles.bubbleHeader}>
                  {scene.bubble?.speaker ? <span className={styles.speaker}>{scene.bubble.speaker}</span> : <span />}
                  <button type="button" className={styles.audioButton} data-reader-control
                    disabled={!speech.supported || !copy.primary}
                    aria-label={speech.supported ? t(speech.speaking ? "stopSpeaking" : "speakSentence") : t("audioUnavailable")}
                    title={speech.supported ? t(speech.speaking ? "stopSpeaking" : "speakSentence") : t("audioUnavailable")}
                    aria-pressed={speech.speaking}
                    onClick={() => speech.speaking ? speech.cancel() : speech.speak(copy.primary ?? "", learning.speechLocale)}>
                    {speech.speaking
                      ? <svg viewBox="0 0 24 24" fill="none" aria-hidden><rect x="7" y="7" width="10" height="10" rx="1.5" fill="currentColor" /></svg>
                      : <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 10v4h3l4 3V7l-4 3H5Z" fill="currentColor" /><path d="M15.5 9.1a4 4 0 0 1 0 5.8M18 6.8a7.2 7.2 0 0 1 0 10.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>}
                  </button>
                </div>
                <div className={styles.bubbleCopy} tabIndex={active ? 0 : -1}>
                <p className={styles.primary} lang={learning.locale} dir={learning.dir}>{copy.primary}</p>
                </div>
              </div>
              {preferences.showTranslations && (showCaption || translationNotice) && <div className={styles.translationBubble}
                data-translation-language={translation.id} data-translation-state={translationState}>
                <p lang={copy.translation ? translation.locale : ui.locale} dir={copy.translation ? translation.dir : ui.dir}
                  className={`${styles.caption} ${translationNotice ? styles.captionNotice : ""}`}>
                  {copy.translation ?? translationNotice}
                </p>
              </div>}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

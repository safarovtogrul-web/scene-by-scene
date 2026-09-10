"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage } from "@/lib/languages";
import type { Difficulty } from "@/lib/catalog/types";
import { sceneCopy, type StoryPackage } from "@/lib/story-packages/schema";
import { SceneArtwork } from "./SceneArtwork";
import { SceneCard } from "./SceneCard";
import { SceneTimeline } from "./SceneTimeline";
import { ReaderSheet } from "./ReaderSheet";
import { useReaderFullscreen } from "./useReaderFullscreen";
import styles from "./reader.module.css";

export function ReaderArrow({ left = false }: { left?: boolean }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden style={left ? { transform: "rotate(180deg)" } : undefined}><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function BookCover({ story, difficulty, kind, onBegin, onRestart, exitHref }: {
  story: StoryPackage; difficulty: Difficulty; kind: "start" | "end";
  onBegin: () => void; onRestart: () => void; exitHref: string;
}) {
  const { preferences, t } = usePreferences();
  const learning = getLanguage(preferences.learningLanguage);
  const firstScene = story.scenes[0];
  const finalScene = story.scenes.at(-1);
  const image = kind === "start" ? firstScene?.image ?? story.cover : finalScene?.image ?? story.cover;
  return <section className={styles.bookCover} data-cover={kind} aria-labelledby={`reader-${kind}-title`}>
    <div className={styles.coverMedia} aria-hidden><SceneArtwork image={image} ambient /><SceneArtwork image={image} active /></div>
    <span className={styles.coverVeil} aria-hidden />
    <div className={styles.coverContent}>
      <span className={styles.coverKicker}>{t(kind === "start" ? "readerOpening" : "readerCompleted")}</span>
      <h2 id={`reader-${kind}-title`}>{kind === "start" ? story.title : t("storyComplete")}</h2>
      {kind === "start" ? <>
        <p className={styles.coverSubtitle}>{story.subtitle ?? story.description}</p>
        <div className={styles.coverMeta}>
          <span>{t(difficulty)}</span><i aria-hidden /><span lang={learning.locale} dir={learning.dir}><bdi>{learning.nativeName}</bdi></span>
        </div>
        <button type="button" className={styles.coverPrimary} onClick={onBegin}>{t("beginStory")}<ReaderArrow /></button>
      </> : <>
        <p className={styles.coverSubtitle}>{t("storyCompleteMessage")}</p>
        <div className={styles.coverActions}>
          <button type="button" className={styles.coverPrimary} onClick={onRestart}>{t("restartStory")}</button>
          <Link href={exitHref} className={styles.coverSecondary}>{t("backToStory")}</Link>
          <Link href="/stories" className={styles.coverTertiary}>{t("continueBrowsing")}</Link>
        </div>
      </>}
    </div>
  </section>;
}

export function StoryReader({ story, difficulty, index, onIndexChange, onOpenSettings, exitHref }: {
  story: StoryPackage; difficulty: Difficulty; index: number; onIndexChange: (index: number) => void;
  onOpenSettings: () => void; exitHref: string;
}) {
  const { preferences, t } = usePreferences();
  const rtl = getLanguage(preferences.interfaceLanguage).dir === "rtl";
  const direction = rtl ? -1 : 1;
  const total = story.scenes.length;
  const sceneIndex = Math.max(0, Math.min(total - 1, index));
  const isStart = index < 0;
  const isEnd = index >= total;
  const isScene = !isStart && !isEnd && total > 0;
  const current = story.scenes[sceneIndex];
  const copy = sceneCopy(current, difficulty, preferences.learningLanguage, preferences.translationLanguage);
  const available = story.availableLanguages.includes(preferences.learningLanguage) && Boolean(copy.primary);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set(isScene ? [sceneIndex] : []));
  const [outgoingIndex, setOutgoingIndex] = useState(sceneIndex);
  const [scenesOpen, setScenesOpen] = useState(false);
  const wheel = useRef({ last: 0, delta: 0, navigated: false });
  const viewport = useRef<HTMLDivElement>(null);
  const fullscreen = useReaderFullscreen(viewport);
  const pointer = useRef<{ id: number; x: number; y: number; dx: number; horizontal: boolean; onImage: boolean } | null>(null);

  useEffect(() => { viewport.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if ((!isScene || !available) && fullscreen.expanded) void fullscreen.exit();
  }, [available, fullscreen, isScene]);

  const select = (next: number) => {
    if (!total) return;
    const clamped = Math.max(-1, Math.min(total, next));
    if (clamped !== index && isScene) setOutgoingIndex(sceneIndex);
    onIndexChange(clamped);
    if (clamped >= 0 && clamped < total) setVisited((previous) => new Set([...previous, clamped]));
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target === viewport.current && (event.key === "Enter" || event.key === " ") && isScene && available) {
      event.preventDefault();
      if (fullscreen.expanded) fullscreen.toggleControls();
      else fullscreen.enter();
      return;
    }
    const dialog = target.closest('[role="dialog"]');
    if (target.closest("input,textarea,select,[contenteditable=true],[role=combobox]") || (dialog && dialog !== viewport.current)) return;
    if (target.closest("button,a") && !target.closest("[data-scene-nav]") && target !== viewport.current) return;
    const next = event.key === "ArrowRight" ? index + direction
      : event.key === "ArrowLeft" ? index - direction
      : event.key === "Home" ? -1 : event.key === "End" ? total : null;
    if (next !== null) { event.preventDefault(); select(next); }
  };
  const resetDrag = () => { pointer.current = null; setDrag(0); setDragging(false); };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!isScene || !available || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    const now = event.timeStamp;
    const gesture = wheel.current;
    if (now - gesture.last > 180) { gesture.delta = 0; gesture.navigated = false; }
    gesture.last = now;
    gesture.delta += event.deltaX * (event.deltaMode === 1 ? 16 : 1);
    if (!gesture.navigated && Math.abs(gesture.delta) > 52) {
      gesture.navigated = true;
      select(index + (gesture.delta > 0 ? direction : -direction));
    }
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) { resetDrag(); return; }
    if (!isScene || !available || event.button !== 0 || (event.target as Element).closest("button,a,[data-reader-control]")) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, horizontal: false,
      onImage: Boolean((event.target as HTMLElement).closest('[data-scene][data-active="true"]')) };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { resetDrag(); return; }
      if (Math.abs(dx) < 8 || Math.abs(dx) <= Math.abs(dy)) return;
      start.horizontal = true;
      setDragging(true);
    }
    start.dx = dx;
    const limit = (viewport.current?.clientWidth ?? 400) * 0.65;
    setDrag(Math.max(-limit, Math.min(limit, dx)));
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest("button,a,[data-reader-control]")) { resetDrag(); return; }
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const threshold = Math.min(100, Math.max(36, (viewport.current?.clientWidth ?? 400) * 0.09));
    if (start.horizontal && Math.abs(start.dx) > threshold) select(index + (start.dx < 0 ? direction : -direction));
    const tapped = !start.horizontal && Math.hypot(event.clientX - start.x, event.clientY - start.y) < 8;
    if (tapped) {
      if (fullscreen.expanded) fullscreen.toggleControls();
      else if (start.onImage) fullscreen.enter();
    }
    resetDrag();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const page = isStart ? "start" : isEnd ? "end" : "scene";
  return (
    <div className={styles.reader} onKeyDown={onKeyDown} data-page={page}>
      <div
        id="story-scenes" ref={viewport} className={styles.stage} tabIndex={0}
        role={fullscreen.expanded ? "dialog" : "region"} aria-modal={fullscreen.expanded || undefined}
        aria-label={t("storyScenes")} aria-describedby="reader-fullscreen-help"
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerCancel={resetDrag} onLostPointerCapture={resetDrag}
        onWheel={onWheel} data-dragging={dragging}
        data-expanded={fullscreen.expanded} data-fullscreen-mode={fullscreen.mode} data-controls-visible={fullscreen.controlsVisible}
      >
        <p id="reader-fullscreen-help" className="sr-only">{t("readerFullscreenHelp")}</p>
        {fullscreen.expanded && <button type="button" data-reader-control className={styles.fullscreenExit}
          onPointerDown={(event) => { event.stopPropagation(); resetDrag(); fullscreen.holdControls(true); }}
          onPointerUp={(event) => { event.stopPropagation(); fullscreen.holdControls(false); }}
          onPointerCancel={(event) => { event.stopPropagation(); fullscreen.holdControls(false); }}
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); resetDrag(); void fullscreen.exit(); }}
          aria-label={t("exitFullscreen")} dir={rtl ? "rtl" : "ltr"}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <span>{t("exitFullscreen")}</span>
        </button>}
        {fullscreen.exitFailed && <p role="alert" className={styles.fullscreenError}>{t("fullscreenExitFailed")}</p>}
        {isStart && <BookCover story={story} difficulty={difficulty} kind="start" onBegin={() => select(0)} onRestart={() => select(-1)} exitHref={exitHref} />}
        {isEnd && <BookCover story={story} difficulty={difficulty} kind="end" onBegin={() => select(0)} onRestart={() => select(-1)} exitHref={exitHref} />}
        {isScene && (available ? <>
          <div key={direction} className={styles.track} data-dragging={dragging} style={{
            "--index": rtl ? total - 1 - sceneIndex : sceneIndex, "--drag": `${drag}px`,
            flexDirection: rtl ? "row-reverse" : "row",
          } as CSSProperties}>
            {story.scenes.map((scene, nextIndex) => (
              <SceneCard key={scene.id} scene={scene} difficulty={difficulty} total={total}
                visualOffset={(nextIndex - sceneIndex) * direction} drag={nextIndex === sceneIndex ? drag : 0}
                active={nextIndex === sceneIndex} nearby={Math.abs(nextIndex - sceneIndex) <= 1 || nextIndex === outgoingIndex} />
            ))}
          </div>
          <button type="button" data-scene-nav className={`${styles.edge} ${rtl ? styles.edgeRight : styles.edgeLeft}`}
            onClick={() => select(index - 1)} aria-label={sceneIndex === 0 ? t("readerOpening") : t("previousScene")} aria-controls="story-scenes">
            <ReaderArrow left={!rtl} /><span>{t("previousScene")}</span>
          </button>
          <button type="button" data-scene-nav className={`${styles.edge} ${rtl ? styles.edgeLeft : styles.edgeRight}`}
            onClick={() => select(index + 1)} aria-label={sceneIndex === total - 1 ? t("storyComplete") : t("nextScene")} aria-controls="story-scenes">
            <ReaderArrow left={rtl} /><span>{t("nextScene")}</span>
          </button>
        </> : <div className={styles.unavailable} role="status">
          <p>{current ? t("languageNotAvailable", { language: getLanguage(preferences.learningLanguage).nativeName }) : t("contentComingSoon")}</p>
          <button type="button" onClick={onOpenSettings}>{t("changeLanguages")}</button>
        </div>)}
      </div>
      {isScene && <>
        <div className={styles.desktopTimeline}><SceneTimeline scenes={story.scenes} activeIndex={sceneIndex} visited={visited} onSelect={select} /></div>
        <div className={styles.readerFoot}>
          <div className={styles.mobileProgress}>
            <ReaderSheet open={scenesOpen} onOpenChange={setScenesOpen} title={t("storyScenes")}
              trigger={<button type="button" className={styles.scenesButton}>{t("readerScenes")}</button>}>
              <SceneTimeline scenes={story.scenes} activeIndex={sceneIndex} visited={visited} expanded onSelect={(next) => { select(next); setScenesOpen(false); }} />
            </ReaderSheet>
            <span className={styles.dots} aria-hidden>{story.scenes.slice(Math.max(0, Math.min(sceneIndex - 2, total - 5)), Math.max(0, Math.min(sceneIndex - 2, total - 5)) + 5).map((scene) => <i key={scene.id} data-current={scene.id === current?.id} />)}</span>
          </div>
          <p id="reader-help" className={styles.readerHelp}>{t("readerHelp")}</p>
          <span aria-hidden />
        </div>
      </>}
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isScene ? <>{t("sceneOf", { done: sceneIndex + 1, total })}. <span lang={getLanguage(preferences.learningLanguage).locale}>{available ? copy.primary : ""}</span></>
          : t(isStart ? "readerOpening" : "storyComplete")}
      </p>
    </div>
  );
}

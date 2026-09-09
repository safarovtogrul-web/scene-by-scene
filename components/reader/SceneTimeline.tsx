"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { sceneImageSources, type PackageScene } from "@/lib/story-packages/schema";
import styles from "./reader.module.css";

export function SceneTimeline({ scenes, activeIndex, visited, onSelect, expanded = false }: {
  scenes: PackageScene[]; activeIndex: number; visited: ReadonlySet<number>; onSelect: (index: number) => void;
  expanded?: boolean;
}) {
  const { preferences, t } = usePreferences();
  const strip = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const list = strip.current;
    if (!list) return;
    const revealCurrent = () => {
      const active = list.children[activeIndex];
      if (!active) return;
      const container = list.getBoundingClientRect();
      if (!container.width || !container.height) return;
      const item = active.getBoundingClientRect();
      if (expanded) {
        const top = item.top < container.top ? item.top - container.top - 8 : item.bottom > container.bottom ? item.bottom - container.bottom + 8 : 0;
        if (top) list.scrollBy({ top, behavior: "instant" });
        return;
      }
      // Scroll this strip only. scrollIntoView can also move the reader page.
      const delta = item.left < container.left ? item.left - container.left - 8
        : item.right > container.right ? item.right - container.right + 8 : 0;
      if (delta) list.scrollBy({ left: delta, behavior: "instant" });
    };
    revealCurrent();
    // Keep the current thumbnail visible after rotation or a breakpoint change.
    const resize = new ResizeObserver(revealCurrent);
    resize.observe(list);
    return () => resize.disconnect();
  }, [activeIndex, expanded, preferences.interfaceLanguage]);

  return (
    <nav className={expanded ? undefined : styles.timeline} aria-label={t("sceneProgressLabel")}>
      <ol className={expanded ? styles.sceneGrid : styles.thumbnails} ref={strip}>
        {scenes.map((scene, index) => (
          <li key={scene.id}>
            <button
              type="button" data-scene-nav data-current={index === activeIndex}
              data-visited={visited.has(index)}
              className={styles.thumbnail} onClick={() => onSelect(index)}
              aria-current={index === activeIndex ? "step" : undefined}
              aria-label={t("sceneOf", { done: index + 1, total: scenes.length })}
            >
              <Image src={sceneImageSources(scene.image)[expanded ? "mobile" : "desktop"]} alt="" fill unoptimized={sceneImageSources(scene.image)[expanded ? "mobile" : "desktop"].endsWith(".svg")} sizes={expanded ? "110px" : "80px"} loading="lazy" draggable={false} />
              <span className={styles.thumbnailNumber} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
              {visited.has(index) && index !== activeIndex && <span className={styles.visitedMark} aria-hidden />}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

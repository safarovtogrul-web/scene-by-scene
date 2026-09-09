"use client";

import { getImageProps } from "next/image";
import { READER_MOBILE_MEDIA, sceneImageSources, type SceneImage } from "@/lib/story-packages/schema";
import styles from "./reader.module.css";

/** Native picture selection avoids downloading a desktop frame on a phone. */
export function SceneArtwork({ image, alt = "", active = false, ambient = false, onError }: {
  image: SceneImage; alt?: string; active?: boolean; ambient?: boolean; onError?: () => void;
}) {
  const sources = sceneImageSources(image);
  if (!sources.desktop) return null;
  const sizes = `${READER_MOBILE_MEDIA} calc(100vw - 24px), (max-height: 500px) and (orientation: landscape) 85vw, (max-width: 1799px) 80vw, 1400px`;
  const propsFor = (src: string) => getImageProps({
    src, alt, fill: true, sizes, unoptimized: src.endsWith(".svg"),
    loading: "eager", fetchPriority: active && !ambient ? "high" : "low",
  }).props;
  const desktop = propsFor(sources.desktop);
  const mobile = propsFor(sources.mobile);
  return <picture>
    <source media={READER_MOBILE_MEDIA} srcSet={mobile.srcSet ?? mobile.src} sizes={sizes} />
    {/* Next's documented art-direction API supplies the optimized img props. */}
    <img {...desktop} alt={ambient ? "" : alt} aria-hidden={ambient || undefined}
      data-scene-art={ambient ? "ambient" : "foreground"}
      className={ambient ? styles.ambientImage : styles.sceneImage} draggable={false} onError={onError} />
  </picture>;
}

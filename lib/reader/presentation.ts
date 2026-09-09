/** Short dialogue stays compact; longer passages may use more of the authored safe area. */
export function bubbleCopySize(primary = "", translation = ""): "brief" | "regular" | "extended" {
  const mainLength = Array.from(primary.trim()).length;
  const translatedLength = Array.from(translation.trim()).length;
  if (mainLength > 72 || translatedLength > 90 || mainLength + translatedLength > 140) return "extended";
  if (mainLength > 40 || translatedLength > 50) return "regular";
  return "brief";
}

/** One small pose per page; the track still supplies all horizontal navigation. */
export function readerPagePose(visualOffset: number, dragPixels = 0) {
  const side = Math.sign(visualOffset);
  if (side) return { yaw: side * -18, scale: 0.965, depth: -28,
    origin: side < 0 ? "right center" : "left center", fold: 0.22, shadowX: side * -16 };
  const gesture = Math.max(-1, Math.min(1, dragPixels / 200));
  return { yaw: gesture * 16, scale: 1 - Math.abs(gesture) * 0.012, depth: -Math.abs(gesture) * 8,
    origin: gesture < 0 ? "left center" : "right center", fold: Math.abs(gesture) * 0.38, shadowX: gesture * -24 };
}

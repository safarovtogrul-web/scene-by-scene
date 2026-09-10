/**
 * Renders an audit sheet for every canonical Lost Map image with the bubble's
 * real footprint drawn on top.
 *
 * The reader's own placement maths is reproduced here rather than guessed, so
 * what the sheet shows is what a reader sees. Source artwork is only ever read;
 * output goes to a scratch directory and is never written back into `public/`.
 *
 * Usage: npx tsx scripts/render-bubble-audit.ts <outDir> <measuredJson>
 */
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";
import { THE_LOST_MAP_SCENES } from "../lib/story-packages/manifests/the-lost-map-copy";
import { BUBBLE_PRESETS, sceneImageSources, type BubblePlacement } from "../lib/story-packages/schema";
import { THE_LOST_MAP_OVERLAY } from "../lib/story-packages/manifests/the-lost-map-overlay";

const PRESET_ORIGIN: Record<(typeof BUBBLE_PRESETS)[number], [number, number]> = {
  "top-left": [0, 0], "top-center": [0.5, 0], "top-right": [1, 0],
  "center-left": [0, 0.5], "center-right": [1, 0.5],
  "bottom-left": [0, 1], "bottom-center": [0.5, 1], "bottom-right": [1, 1],
};

/** Mirrors `placementVariables` + the reader stylesheet's inset/translate pair. */
export function bubbleRect(placement: BubblePlacement | undefined, orientation: "wide" | "portrait", heightFraction: number, measuredWidth?: number) {
  const value = placement ?? { preset: "bottom-center" as const };
  const [ox, oy] = value.preset ? PRESET_ORIGIN[value.preset] : [value.x!, value.y!];
  const safeDefault = orientation === "portrait" ? 0.74 : 0.64;
  const width = measuredWidth ?? value.maxWidth ?? safeDefault;
  // The bubble is positioned at the anchor then pulled back by its own size.
  const x = ox - ox * width;
  const y = oy - oy * heightFraction;
  return { x, y, width, height: heightFraction };
}

const SCENE_INSET = 0.045; // The stage pads the artwork slightly on every side.

type Measured = Record<"wide" | "portrait", Record<string, { w: number; h: number }>>;

async function render(outDir: string, measuredPath: string) {
  const measured = JSON.parse(readFileSync(measuredPath, "utf8")) as Measured;
  mkdirSync(outDir, { recursive: true });
  const rows: string[] = [];

  for (const scene of THE_LOST_MAP_SCENES) {
    for (const orientation of ["wide", "portrait"] as const) {
      const sources = sceneImageSources(scene.image);
      const rel = "public" + (orientation === "wide" ? sources.desktop : sources.mobile);
      const placement = orientation === "wide" ? scene.bubble : (scene.mobileBubble ?? scene.bubble);
      // Real rendered size, measured in the reader at its worst case, scaled by
      // whatever text reduction the resolver applied to clear a protected region.
      const m = measured[orientation][scene.id];
      const scale = (placement as { textScale?: number })?.textScale ?? 1;
      const rect = bubbleRect(placement, orientation, m.h * scale, Math.min(m.w, placement?.maxWidth ?? m.w));

      // Resize first, then draw at the output size: compositing an SVG larger
      // than its base is rejected, and the sheet only needs to be legible.
      const resized = await sharp(rel).resize({ width: 760 }).toBuffer();
      const meta = await sharp(resized).metadata();
      const W = meta.width!, H = meta.height!;

      // Inset matches the reader's own padding so the overlay lands where the
      // bubble actually sits rather than flush against the raw image edge.
      const inner = { x: SCENE_INSET * W, y: SCENE_INSET * H, w: (1 - 2 * SCENE_INSET) * W, h: (1 - 2 * SCENE_INSET) * H };
      const px = Math.round(inner.x + rect.x * inner.w);
      const py = Math.round(inner.y + rect.y * inner.h);
      const pw = Math.round(rect.width * inner.w);
      const ph = Math.round(rect.height * inner.h);

      // Protected regions are drawn too, so the data the placement rests on can
      // be checked against the artwork instead of trusted.
      const COLOUR: Record<string, string> = {
        face: "#00e5ff", primaryAction: "#7CFC00", activeHand: "#ffd400", importantProp: "#ff9500",
      };
      const guards = THE_LOST_MAP_OVERLAY[scene.id][orientation].avoid.map((region) => {
        const gx = Math.round(inner.x + region.x * inner.w);
        const gy = Math.round(inner.y + region.y * inner.h);
        const gw = Math.round(region.width * inner.w);
        const gh = Math.round(region.height * inner.h);
        return `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="none" stroke="${COLOUR[region.role]}" stroke-width="3" stroke-dasharray="8 5"/>`;
      }).join("");

      const overlay = Buffer.from(
        `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
           <rect x="${px}" y="${py}" width="${pw}" height="${ph}"
                 fill="rgba(10,15,25,0.55)" stroke="#ff2d55" stroke-width="3"/>
           ${guards}
           <text x="${px + 8}" y="${py + 20}" font-family="sans-serif" font-size="17" fill="#ff2d55">${scene.id} ${orientation}</text>
         </svg>`,
      );

      const out = `${outDir}/${scene.id}-${orientation}.jpg`;
      await sharp(resized).composite([{ input: overlay, top: 0, left: 0 }])
        .jpeg({ quality: 74 })
        .toFile(out);

      rows.push(`${scene.id} ${orientation.padEnd(8)} anchor=${String(placement?.preset ?? `${placement?.x},${placement?.y}`).padEnd(13)} rect=[${rect.x.toFixed(2)},${rect.y.toFixed(2)} ${rect.width.toFixed(2)}x${rect.height.toFixed(2)}]`);
    }
  }
  console.log(rows.join("\n"));
  console.log(`\n${rows.length} sheets written to ${outDir}`);
}

const [, , outDir = "./.audit", measuredPath = "./measured.json"] = process.argv;
render(outDir, measuredPath);

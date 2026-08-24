import type { CSSProperties } from "react";

import { cn } from "@/lib/cn";

type SparkleStyle = CSSProperties & Record<`--${string}`, string>;

type Sparkle = {
  /** Position around the card, as a % of the sparkle field. */
  left: number;
  top: number;
  /** Rendered size in px. */
  size: number;
  /** Drift travelled over one twinkle, in px. */
  dx: number;
  dy: number;
  /** Seconds. Deliberately non-matching so they never pulse together. */
  duration: number;
  delay: number;
  /** Peak twinkle opacity. Defaults to fully bright. */
  peak?: number;
  kind: "star" | "dot";
  tone: "white" | "violet";
};

/**
 * Fixed, hand-placed configuration — never randomised, so the server and the
 * client render the same thing and the spacing stays art-directed.
 */
const SPARKLES: Sparkle[] = [
  { left: 4, top: 16, size: 13, dx: -10, dy: -14, duration: 3.4, delay: 0, kind: "star", tone: "white" },
  { left: 92, top: 8, size: 10, dx: 12, dy: -12, duration: 4.1, delay: 0.9, kind: "star", tone: "violet" },
  { left: 97, top: 62, size: 8, dx: 13, dy: 9, duration: 3.7, delay: 1.9, kind: "star", tone: "white" },
  { left: 12, top: 88, size: 11, dx: -11, dy: 12, duration: 4.4, delay: 2.6, kind: "star", tone: "violet" },
  { left: 68, top: 96, size: 4, dx: 5, dy: 14, duration: 2.9, delay: 1.4, kind: "dot", tone: "white" },
  { left: 2, top: 48, size: 3.5, dx: -13, dy: 4, duration: 3.2, delay: 3.1, kind: "dot", tone: "violet" },
];

/** Three restrained extras used only by the mobile presentation frame. */
const RICH_SPARKLES: Sparkle[] = [
  ...SPARKLES,
  { left: 48, top: -2, size: 6.5, dx: 2, dy: -12, duration: 3.8, delay: 0.45, peak: 0.72, kind: "dot", tone: "white" },
  { left: 99, top: 35, size: 5.5, dx: 11, dy: -2, duration: 4.3, delay: 2.15, peak: 0.62, kind: "dot", tone: "violet" },
  { left: 39, top: 99, size: 8, dx: -4, dy: 13, duration: 3.6, delay: 1.2, peak: 0.78, kind: "star", tone: "violet" },
];

/**
 * A handful of glints around the card currently being presented.
 *
 * Six absolutely-positioned elements running one CSS keyframe each — no canvas,
 * no particle engine, no dependency. Each twinkle starts and ends at zero
 * opacity, so the infinite loop has no seam, and the staggered non-matching
 * periods keep them from pulsing in unison.
 *
 * The global `prefers-reduced-motion` rule switches the animation off, and the
 * resting style is fully transparent, so they simply disappear.
 */
export function StorySparkles({
  /**
   * The scale its container is being enlarged by. Sizes and drift distances
   * are divided by it so a glint looks identical whether it is orbiting a
   * small back card or a large front one.
   */
  compensate = 1,
  rich = false,
  className,
}: {
  compensate?: number;
  /** Adds three subtle edge glints to the mobile featured frame. */
  rich?: boolean;
  className?: string;
}) {
  const sparkles = rich ? RICH_SPARKLES : SPARKLES;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-5 z-10 overflow-visible",
        className,
      )}
    >
      {sparkles.map((sparkle, index) => {
        const style: SparkleStyle = {
          left: `${sparkle.left}%`,
          top: `${sparkle.top}%`,
          width: `${sparkle.size / compensate}px`,
          height: `${sparkle.size / compensate}px`,
          "--sparkle-x": `${sparkle.dx / compensate}px`,
          "--sparkle-y": `${sparkle.dy / compensate}px`,
          "--sparkle-peak": `${sparkle.peak ?? 1}`,
          animationDuration: `${sparkle.duration}s`,
          animationDelay: `${sparkle.delay}s`,
        };

        const tone =
          sparkle.tone === "white" ? "text-white" : "text-iris-200";

        return (
          <span key={index} className={cn("sparkle", tone)} style={style}>
            {sparkle.kind === "star" ? (
              <svg viewBox="0 0 24 24" className="h-full w-full">
                <path
                  d="M12 0c.7 7.4 4.6 11.3 12 12-7.4.7-11.3 4.6-12 12-.7-7.4-4.6-11.3-12-12C7.4 11.3 11.3 7.4 12 0Z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <span className="block h-full w-full rounded-full bg-current" />
            )}
          </span>
        );
      })}
    </div>
  );
}

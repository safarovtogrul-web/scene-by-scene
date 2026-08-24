import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type AnimStyle = CSSProperties & Record<`--${string}`, string>;

/**
 * The violet nebula behind everything: two slow radial blooms plus a set of
 * flowing neon ribbons.
 *
 * Deliberately filter-free — the softness comes from radial/linear gradients
 * and stacked translucent strokes rather than `blur()`, so nothing has to be
 * re-rasterised while it moves. Only `transform` and `opacity` animate.
 *
 * No speckle or particle layer: the page background stays a clean navy-to-
 * violet field. The only glints in the product are the ones bound to the
 * currently featured story card (see `StorySparkles`).
 */
export function AmbientGlow({ className }: { className?: string }) {
  const bloomA: AnimStyle = {
    animationDuration: "53s",
    animationDelay: "-11s",
    background:
      "radial-gradient(closest-side, rgba(124,58,237,0.42), rgba(124,58,237,0.12) 55%, transparent 78%)",
  };
  const bloomB: AnimStyle = {
    animationDuration: "71s",
    animationDelay: "-31s",
    background:
      "radial-gradient(closest-side, rgba(56,32,160,0.5), rgba(88,44,220,0.14) 60%, transparent 80%)",
  };
  const bloomC: AnimStyle = {
    animationDuration: "89s",
    animationDelay: "-47s",
    background:
      "radial-gradient(closest-side, rgba(168,85,247,0.32), transparent 72%)",
  };

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      {/* Base vertical grade: near-black at the top, violet-tinted at the fold. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_18%,rgba(46,22,110,0.55),transparent_62%)]" />

      {/* Slow violet blooms. */}
      <div
        className="aurora-sway absolute top-[-18%] right-[-10%] h-[70vw] max-h-[820px] w-[70vw] max-w-[820px] rounded-full"
        style={bloomA}
      />
      <div
        className="aurora-sway absolute bottom-[-30%] left-[-14%] h-[62vw] max-h-[760px] w-[62vw] max-w-[760px] rounded-full"
        style={bloomB}
      />
      <div
        className="aurora-sway absolute top-[34%] left-[38%] h-[44vw] max-h-[520px] w-[44vw] max-w-[520px] rounded-full"
        style={bloomC}
      />

      {/* Flowing neon ribbons. */}
      <svg
        className="aurora-sway absolute inset-0 h-full w-full"
        style={{ animationDuration: "97s", animationDelay: "-23s" }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="ribbon-a" x1="0" y1="900" x2="1440" y2="0">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0" />
            <stop offset="38%" stopColor="#7c3aed" stopOpacity="0.85" />
            <stop offset="68%" stopColor="#c4b2ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ribbon-b" x1="1440" y1="700" x2="0" y2="120">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g className="glow-breathe" style={{ animationDuration: "37s" }}>
          <path
            d="M-120 812C220 742 388 618 612 520 836 422 1046 388 1236 258 1352 178 1428 96 1520 8"
            stroke="url(#ribbon-a)"
            strokeWidth="34"
            strokeLinecap="round"
            opacity="0.16"
          />
          <path
            d="M-120 812C220 742 388 618 612 520 836 422 1046 388 1236 258 1352 178 1428 96 1520 8"
            stroke="url(#ribbon-a)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M-120 812C220 742 388 618 612 520 836 422 1046 388 1236 258 1352 178 1428 96 1520 8"
            stroke="url(#ribbon-a)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </g>

        <g
          className="glow-breathe"
          style={{ animationDuration: "59s", animationDelay: "-19s" }}
        >
          <path
            d="M-80 640C180 690 402 596 566 470 730 344 902 306 1104 340 1266 368 1382 322 1500 232"
            stroke="url(#ribbon-b)"
            strokeWidth="26"
            strokeLinecap="round"
            opacity="0.14"
          />
          <path
            d="M-80 640C180 690 402 596 566 470 730 344 902 306 1104 340 1266 368 1382 322 1500 232"
            stroke="url(#ribbon-b)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M-40 880C260 828 420 742 640 660 860 578 1030 560 1240 452 1360 390 1440 330 1540 250"
            stroke="url(#ribbon-b)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
        </g>
      </svg>

    </div>
  );
}

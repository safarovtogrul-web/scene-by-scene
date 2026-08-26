"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

/**
 * Textory's globe: a small Earth with oceans and landmasses that turns slowly
 * on its own axis, rather than a line-art globe glyph.
 *
 * The rotation is a seamless loop, not a spin: the continents are drawn twice
 * side by side inside a circular clip and the pair is translated by exactly one
 * tile width, so the moment the animation restarts the second copy is sitting
 * where the first one began and nothing jumps. Only `transform` animates, so
 * the whole thing stays on the compositor, and the shared reduced-motion rule
 * in `globals.css` parks it on a still frame.
 */

/** One 24-wide tile of land. Rendered twice to make the loop seamless. */
function Landmasses({ offset }: { offset: number }) {
  return (
    <g transform={`translate(${offset} 0)`}>
      {/* Larger masses */}
      <path
        d="M1.4 5.2c2.1-1.6 5-1.4 6.9.3.9.8.6 2.2-.5 2.8-1.6.9-3.6 1-5.3.3-1.2-.5-2.2-2.5-1.1-3.4Z"
        fill="#3fbf7f"
      />
      <path
        d="M6.9 10.4c1.7-.7 3.7.2 4.2 1.9.4 1.6-.8 3.2-2.5 3.4-1.9.2-3.5-1.3-3.3-3.1.1-1 .7-1.8 1.6-2.2Z"
        fill="#35ac72"
      />
      <path
        d="M14.2 3.9c2.2-1 4.9-.2 6 1.7.6 1.1-.2 2.4-1.5 2.6-2.1.4-4.3-.2-5.7-1.6-.8-.8-.2-2.2 1.2-2.7Z"
        fill="#46c98a"
      />
      <path
        d="M16.1 12c2-.6 4 .8 4.1 2.8.1 1.8-1.7 3.2-3.5 2.8-2.1-.4-3.2-2.8-2-4.4.3-.5.8-1 1.4-1.2Z"
        fill="#3fbf7f"
      />
      <path
        d="M4.2 17.6c1.8-1 4.1-.4 5.1 1.2.5.9 0 2-1.1 2.4-1.8.5-3.8.1-5-1.1-.7-.7-.2-2 1-2.5Z"
        fill="#35ac72"
      />
      {/* Islands */}
      <circle cx="12.6" cy="6.6" r="0.75" fill="#46c98a" />
      <circle cx="21.4" cy="9.4" r="0.6" fill="#3fbf7f" />
      <circle cx="2.4" cy="12.6" r="0.62" fill="#46c98a" />
      <circle cx="13.4" cy="18.8" r="0.7" fill="#3fbf7f" />
    </g>
  );
}

export function PlanetIcon({ className }: { className?: string }) {
  // Gradients and clip paths are document-scoped, so each instance needs its
  // own ids or the first one on the page wins for all of them.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const clip = `planet-clip-${uid}`;
  const ocean = `planet-ocean-${uid}`;
  const shade = `planet-shade-${uid}`;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-[17px] shrink-0", className)}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="12" cy="12" r="9" />
        </clipPath>
        <radialGradient id={ocean} cx="34%" cy="28%" r="82%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="45%" stopColor="#2f7fe0" />
          <stop offset="100%" stopColor="#123a83" />
        </radialGradient>
        {/* Terminator: keeps the sphere from reading as a flat disc. */}
        <radialGradient id={shade} cx="32%" cy="26%" r="78%">
          <stop offset="52%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#04030c" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <circle cx="12" cy="12" r="9" fill={`url(#${ocean})`} />

      <g clipPath={`url(#${clip})`}>
        <g className="planet-spin">
          <Landmasses offset={0} />
          <Landmasses offset={24} />
        </g>
      </g>

      <circle cx="12" cy="12" r="9" fill={`url(#${shade})`} />
      {/* Thin atmosphere, tinted by whatever the trigger's text colour is. */}
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
        strokeWidth="1"
      />
    </svg>
  );
}

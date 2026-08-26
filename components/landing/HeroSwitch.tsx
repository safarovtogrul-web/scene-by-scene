"use client";

import { useSyncExternalStore } from "react";

import { Hero } from "./Hero";
import { MobileHero } from "./MobileHero";

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** `null` on the server, where the viewport is not knowable. */
function useIsDesktop(): boolean | null {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => null,
  );
}

/**
 * Mounts only the hero the current viewport actually shows.
 *
 * The two heroes used to be rendered together and hidden from each other with
 * `md:hidden` / `hidden md:block`. That is correct visually but expensive: the
 * hidden one still mounted its cards, still ran its feature-sequence timers and
 * the framer-motion animations those drive, and still eagerly fetched the
 * artwork its `priority` cards ask for. On desktop that meant six extra
 * animated cards and three unused hero images running behind a `display: none`
 * — the single largest source of the desktop stutter.
 *
 * The breakpoint classes stay on the sections themselves, so server-rendered
 * HTML (where the viewport is unknown and both are emitted) still paints the
 * right hero immediately. The moment hydration resolves the media query, the
 * one that does not apply unmounts.
 */
export function HeroSwitch() {
  const isDesktop = useIsDesktop();

  if (isDesktop === null) {
    return (
      <>
        <MobileHero />
        <Hero />
      </>
    );
  }

  return isDesktop ? <Hero /> : <MobileHero />;
}

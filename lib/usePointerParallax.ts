"use client";

import { useEffect } from "react";
import {
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";

export type ParallaxField = {
  /** −1 … 1, springed. Multiply by a per-layer depth factor. */
  x: MotionValue<number>;
  y: MotionValue<number>;
};

/**
 * Very subtle pointer parallax for the desktop hero.
 *
 * Deliberately restrained: the raw pointer position is normalised to −1…1,
 * heavily damped by a soft spring, and each card scales it by its own depth.
 * Cards never "follow" the cursor — they lean.
 *
 * Disabled entirely for coarse pointers (touch) and for users who asked for
 * reduced motion; the motion values then stay pinned at 0 and the cards keep
 * their ambient drift only.
 */
export function usePointerParallax(): ParallaxField {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const x = useSpring(rawX, { stiffness: 40, damping: 22, mass: 1.1 });
  const y = useSpring(rawY, { stiffness: 40, damping: 22, mass: 1.1 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;

    const flush = () => {
      frame = 0;
      rawX.set(pendingX);
      rawY.set(pendingY);
    };

    const onPointerMove = (event: PointerEvent) => {
      pendingX = (event.clientX / window.innerWidth) * 2 - 1;
      pendingY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!frame) frame = window.requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [prefersReducedMotion, rawX, rawY]);

  return { x, y };
}

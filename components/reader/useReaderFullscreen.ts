"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/** The browser owns native state. CSS fullscreen is used only after native is unavailable/rejected. */
export function useReaderFullscreen(viewportRef: RefObject<HTMLDivElement | null>) {
  const [fallback, setFallback] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [controlsHeld, setControlsHeld] = useState(false);
  const [exitFailed, setExitFailed] = useState(false);
  const mounted = useRef(false);
  const entering = useRef(false);
  const exiting = useRef(false);
  const wanted = useRef(false);

  const subscribe = useCallback((notify: () => void) => {
    const sync = () => {
      setFallback(false);
      setExitFailed(false);
      wanted.current = document.fullscreenElement === viewportRef.current;
      notify();
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [viewportRef]);
  const getNativeSnapshot = useCallback(() => Boolean(viewportRef.current && document.fullscreenElement === viewportRef.current), [viewportRef]);
  const native = useSyncExternalStore(subscribe, getNativeSnapshot, () => false);
  const mode = native ? "native" : fallback ? "fallback" : "normal";
  const expanded = mode !== "normal";

  const enter = useCallback(async () => {
    const element = viewportRef.current;
    if (!element || entering.current || exiting.current || wanted.current) return;
    wanted.current = true;
    entering.current = true;
    setControlsVisible(false);
    setExitFailed(false);
    element.focus({ preventScroll: true });
    try {
      if (!element.requestFullscreen || !document.fullscreenEnabled) {
        setFallback(true);
        return;
      }
      await element.requestFullscreen({ navigationUI: "hide" });
      if ((!mounted.current || !wanted.current) && document.fullscreenElement === element) {
        await document.exitFullscreen();
      }
    } catch {
      if (mounted.current && wanted.current && !document.fullscreenElement) setFallback(true);
    } finally {
      entering.current = false;
    }
  }, [viewportRef]);

  const exit = useCallback(async () => {
    if (exiting.current) return;
    wanted.current = false;
    exiting.current = true;
    setControlsHeld(false);
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else setFallback(false);
      if (mounted.current) {
        setControlsVisible(false);
        setExitFailed(false);
        viewportRef.current?.focus({ preventScroll: true });
      }
    } catch {
      if (mounted.current) {
        setExitFailed(true);
        setControlsVisible(true);
      }
    } finally {
      exiting.current = false;
    }
  }, [viewportRef]);

  useEffect(() => {
    mounted.current = true;
    const element = viewportRef.current;
    return () => {
      mounted.current = false;
      wanted.current = false;
      if (document.fullscreenElement === element) void document.exitFullscreen().catch(() => {});
    };
  }, [viewportRef]);

  useEffect(() => {
    if (!expanded) return;
    const html = document.documentElement;
    const body = document.body;
    const previous = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow,
      position: body.style.position, top: body.style.top, width: body.style.width,
      x: window.scrollX, y: window.scrollY };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `${-previous.y}px`;
    body.style.width = "100%";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement) { event.preventDefault(); void exit(); }
      if (event.key === "Tab") setControlsVisible(true);
    };
    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !viewportRef.current?.contains(event.target)) {
        viewportRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", keepFocusInside);
    return () => {
      html.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(previous.x, previous.y);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", keepFocusInside);
    };
  }, [expanded, exit, viewportRef]);

  useEffect(() => {
    if (!expanded || !controlsVisible || controlsHeld || exitFailed) return;
    const timeout = window.setTimeout(() => {
      if (!viewportRef.current?.querySelector("button:focus-visible")) setControlsVisible(false);
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [expanded, controlsVisible, controlsHeld, exitFailed, viewportRef]);

  return { expanded, mode, controlsVisible, exitFailed, enter, exit,
    holdControls: setControlsHeld, toggleControls: () => setControlsVisible((visible) => !visible) };
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Logical iPhone-class stage the screen content is authored against. */
const STAGE_WIDTH = 390;
const STAGE_HEIGHT = 844;

/**
 * A device mockup that renders *real* screens, not screenshots.
 *
 * Children are laid out on a fixed 390 × 844 stage and uniformly scaled to the
 * frame's measured width, so the mockups on the landing page stay pixel-exact
 * miniatures of what the app actually renders on a phone.
 */
export function PhoneFrame({
  children,
  className,
  statusBarTime = "9:41",
}: {
  children: ReactNode;
  className?: string;
  statusBarTime?: string;
}) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const element = screenRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / STAGE_WIDTH);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "relative aspect-[390/844] w-full rounded-[13%/6%] bg-gradient-to-b from-ink-600 via-ink-800 to-ink-700 p-[2.6%] shadow-[0_50px_90px_-40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.07)]",
        className,
      )}
    >
      {/* Polished edge highlight. */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/12" />
      <div className="pointer-events-none absolute inset-[1.2%] rounded-[12%/5.6%] ring-1 ring-inset ring-black/60" />

      <div
        ref={screenRef}
        className="relative h-full w-full overflow-hidden rounded-[11%/5.2%] bg-ink-950"
      >
        <div
          className="relative origin-top-left"
          style={{
            width: STAGE_WIDTH,
            height: STAGE_HEIGHT,
            transform: `scale(${scale})`,
            visibility: scale ? "visible" : "hidden",
          }}
        >
          <StatusBar time={statusBarTime} />
          <div className="h-full w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBar({ time }: { time: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] flex h-[54px] items-center justify-between px-8 text-[15px] font-semibold text-mist-100">
      <span>{time}</span>

      {/* Dynamic Island */}
      <span className="absolute left-1/2 top-[11px] h-[30px] w-[104px] -translate-x-1/2 rounded-full bg-black" />

      <span className="flex items-center gap-1.5">
        {/* signal */}
        <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor" aria-hidden>
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4" />
        </svg>
        {/* wifi */}
        <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" aria-hidden>
          <path d="M1 4.2a10.5 10.5 0 0 1 14 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.6 6.9a6.8 6.8 0 0 1 8.8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6.2 9.5a3 3 0 0 1 3.6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {/* battery */}
        <svg viewBox="0 0 26 12" className="h-3 w-[26px]" fill="none" aria-hidden>
          <rect x="0.6" y="0.6" width="21" height="10.8" rx="3" stroke="currentColor" strokeOpacity="0.45" />
          <rect x="2.2" y="2.2" width="17" height="7.6" rx="1.8" fill="currentColor" />
          <path d="M23.4 4.2c1.1.3 1.1 3.3 0 3.6V4.2Z" fill="currentColor" fillOpacity="0.45" />
        </svg>
      </span>
    </div>
  );
}

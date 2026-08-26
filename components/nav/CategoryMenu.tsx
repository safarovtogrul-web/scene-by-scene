"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { DIFFICULTY_OPTIONS, GENRES, countByGenre } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

/**
 * Desktop categories mega-menu.
 *
 * Difficulty and genre are shown as independent dimensions. Both sides
 * deep-link into `/stories` with the selected filter applied.
 *
 * Opens on hover and on focus, closes on Escape, outside click, or route
 * change via the links themselves.
 */
export function CategoryMenu({ label }: { label: string }) {
  const { t } = usePreferences();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const menuId = useId();

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  return (
    <div
      ref={container}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
        className={cn(
          "inline-flex items-center gap-1.5 text-[15px] transition-colors duration-200",
          open ? "text-mist-100" : "text-mist-300 hover:text-mist-100",
        )}
      >
        {label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-300",
            open && "rotate-180",
          )}
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-1/2 z-50 w-[min(680px,calc(100vw-4rem))] -translate-x-1/2 pt-4"
          >
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-850/92 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iris-400/50 to-transparent" />

              <div className="grid gap-8 p-7 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                <div>
                  <MenuHeading>{t("byLevel")}</MenuHeading>
                  <ul className="mt-3 space-y-0.5">
                    {DIFFICULTY_OPTIONS.map((difficulty) => (
                      <li key={difficulty.id}>
                        <Link
                          href={`/stories?difficulty=${difficulty.id}`}
                          onClick={() => setOpen(false)}
                          className="group flex items-baseline gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.05]"
                        >
                          <span className="font-display text-[15px] font-semibold text-mist-100">
                            {t(difficulty.labelKey)}
                          </span>
                          <span className="text-[13px] text-mist-500 transition-colors group-hover:text-mist-400">
                            {t(difficulty.id === "easy" ? "easyHint" : "hardHint")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <MenuHeading>{t("byGenre")}</MenuHeading>
                  <ul className="mt-3 grid grid-cols-2 gap-0.5">
                    {GENRES.map((genre) => (
                      <li key={genre.id}>
                        <Link
                          href={`/stories?genre=${genre.id}`}
                          onClick={() => setOpen(false)}
                          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.05]"
                        >
                          <span className="text-[14px] text-mist-300 transition-colors group-hover:text-mist-100">
                            {t(genre.labelKey)}
                          </span>
                          <span className="text-[12px] text-mist-500 tabular-nums">
                            {countByGenre(genre.id)}
                          </span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href="/stories?length=short"
                        onClick={() => setOpen(false)}
                        className="group flex items-center rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.05]"
                      >
                        <span className="text-[14px] text-mist-300 transition-colors group-hover:text-mist-100">
                          {t("shortStories")}
                        </span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/stories"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] px-7 py-4 text-[14px] text-mist-300 transition-colors duration-200 hover:bg-white/[0.05] hover:text-mist-100"
              >
                {t("browseWholeLibrary")}
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                  <path
                    d="M4 10h11M11 5.5 15.5 10 11 14.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 text-[11px] font-semibold tracking-[0.16em] text-mist-500 uppercase">
      {children}
    </p>
  );
}

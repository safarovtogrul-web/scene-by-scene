"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";

import { displayNameFor, initialsFor, useAuth } from "./AuthProvider";
import { POST_SIGN_OUT_PATH } from "@/lib/auth/redirects";
import { LanguageSettingsSheet } from "@/components/language/LanguageSettingsSheet";
import { LanguageFlag } from "@/components/ui/FlagIcon";
import { PlanetIcon } from "@/components/ui/PlanetIcon";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { cn } from "@/lib/cn";

/**
 * The signed-in control in the header: initials avatar, name, and a small
 * menu. Deliberately minimal — proving the session is real is the whole job
 * here; the profile surface itself is a later phase.
 *
 * The avatar is drawn from initials rather than the provider's photo URL, so
 * no third-party image request leaves the page on every view.
 */
export function AccountMenu({ user }: { user: User }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const { preferences, t } = usePreferences();
  const container = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const name = displayNameFor(user);
  const initials = initialsFor(name);

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

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setOpen(false);
    setSigningOut(false);
    router.push(POST_SIGN_OUT_PATH);
    router.refresh();
  };

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex items-center gap-2.5 rounded-full border py-1.5 pr-2.5 pl-1.5 transition-all duration-300",
          open
            ? "border-iris-400/50 bg-white/[0.08]"
            : "border-white/[0.1] bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]",
        )}
      >
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-iris-400 to-iris-700 text-[12.5px] font-semibold text-white"
        >
          {initials}
        </span>
        <span className="hidden max-w-[12ch] truncate text-[14.5px] text-mist-200 lg:block">
          {name}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className={cn(
            "hidden h-3.5 w-3.5 text-mist-400 transition-transform duration-300 lg:block",
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
        <span className="sr-only">{t("accountMenu")}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full right-0 z-50 mt-3 w-[260px] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-850/95 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
          >
            <div className="border-b border-white/[0.06] px-4 py-3.5">
              <p className="truncate text-[14.5px] font-medium text-mist-100">
                {name}
              </p>
              {user.email && (
                <p className="mt-0.5 truncate text-[12.5px] text-mist-500">
                  {user.email}
                </p>
              )}
            </div>

            <div className="p-1.5">
              <button
                type="button"
                role="menuitem"
                aria-haspopup="dialog"
                onClick={() => {
                  // The menu closes on outside pointer events, so it hands the
                  // dialog off rather than owning it while unmounting.
                  setOpen(false);
                  setLanguageOpen(true);
                }}
                className="mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] text-mist-200 transition-colors duration-200 hover:bg-white/[0.06] hover:text-mist-100"
              >
                <PlanetIcon className="size-4 text-mist-400" />
                <span className="flex-1 truncate">{t("languageSettings")}</span>
                <LanguageFlag
                  language={preferences.interfaceLanguage}
                  size="xs"
                />
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[14px] text-mist-200 transition-colors duration-200 hover:bg-white/[0.06] hover:text-mist-100 disabled:opacity-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                  className="h-4 w-4"
                >
                  <path
                    d="M15 17l5-5-5-5M20 12H9M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {signingOut ? t("signingOut") : t("signOut")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <LanguageSettingsSheet open={languageOpen} onOpenChange={setLanguageOpen} />
    </div>
  );
}

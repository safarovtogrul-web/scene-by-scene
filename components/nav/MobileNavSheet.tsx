"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import {
  displayNameFor,
  initialsFor,
  useAuth,
} from "@/components/auth/AuthProvider";
import { LOGIN_PATH } from "@/lib/auth/redirects";
import { LanguageSettingsButton } from "@/components/preferences/LanguageSettings";
import type { NavItem } from "@/lib/navigation";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

/**
 * Small-screen navigation. The desktop mega-menu becomes one clear catalogue
 * destination so the sheet stays short and easy to scan.
 */
export function MobileNavSheet({
  open,
  onClose,
  items,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
}) {
  const { status, user, signOut } = useAuth();
  const { t } = usePreferences();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] bg-ink-950/95 backdrop-blur-2xl lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
        >
          <div className="flex h-full flex-col overflow-y-auto px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
            <div className="flex h-14 items-center justify-between">
              <Link href="/" onClick={onClose}>
                <BrandLogo size="sm" />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("closeMenu")}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-mist-300"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                  <path
                    d="m6 6 12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <motion.nav
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.35 }}
              className="mt-8"
            >
              <ul className="space-y-1">
                {items.map((item) => (
                    <li key={`${item.labelKey}-${item.href}`}>
                      <Link
                        href={item.menu === "categories" ? "/#explore" : item.href}
                        onClick={onClose}
                        className="block min-h-12 py-2.5 font-display text-[25px] font-semibold tracking-tight text-mist-100"
                      >
                        {t(item.labelKey)}
                      </Link>
                    </li>
                  ))}
              </ul>
            </motion.nav>

            <div className="mt-auto space-y-3 pt-10">
              <LanguageSettingsButton variant="row" />
              {status === "authenticated" && user ? (
                <>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
                    <span
                      aria-hidden
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-iris-400 to-iris-700 text-[13px] font-semibold text-white"
                    >
                      {initialsFor(displayNameFor(user))}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-mist-100">
                        {displayNameFor(user)}
                      </span>
                      {user.email && (
                        <span className="block truncate text-[12.5px] text-mist-500">
                          {user.email}
                        </span>
                      )}
                    </span>
                  </div>
                  <PrimaryButton
                    variant="ghost"
                    size="block"
                    onClick={async () => {
                      await signOut();
                      onClose();
                    }}
                  >
                    {t("signOut")}
                  </PrimaryButton>
                </>
              ) : (
                <>
                  <PrimaryButton href="/onboarding" size="block" onClick={onClose}>
                    {t("getStarted")}
                  </PrimaryButton>
                  <PrimaryButton
                    href={LOGIN_PATH}
                    variant="ghost"
                    size="block"
                    onClick={onClose}
                  >
                    {t("signIn")}
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

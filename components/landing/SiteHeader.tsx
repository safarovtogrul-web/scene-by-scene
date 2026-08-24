"use client";

import Link from "next/link";
import { useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";

import { CategoryMenu } from "@/components/nav/CategoryMenu";
import { MobileNavSheet } from "@/components/nav/MobileNavSheet";
import { TextoryLogo } from "@/components/brand/TextoryLogo";
import { HeaderAuth } from "@/components/auth/HeaderAuth";
import { LanguageSettingsButton } from "@/components/preferences/LanguageSettings";
import { navFor, type NavAudience } from "@/lib/navigation";
import { cn } from "@/lib/cn";

/**
 * The one header for the whole product.
 *
 * `audience` decides which navigation set renders. It is hard-wired to
 * "public" today; once accounts exist, the signed-in shell passes "member" and
 * nothing else about this component changes.
 *
 * On small screens it remains compact and available over the full-bleed hero;
 * the navigation itself moves into a dedicated sheet.
 */
export function SiteHeader({
  audience = "public",
}: {
  audience?: NavAudience;
}) {
  const { scrollY } = useScroll();
  const [lifted, setLifted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const items = navFor(audience);

  useMotionValueEvent(scrollY, "change", (value) => {
    setLifted(value > 24);
  });

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          lifted
            ? "border-b border-white/[0.06] bg-ink-950/72 backdrop-blur-xl"
            : "border-b border-transparent max-md:bg-gradient-to-b max-md:from-ink-950/80 max-md:to-transparent",
        )}
      >
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6 px-4 md:h-20 md:px-10 lg:px-12">
          <Link href="/" aria-label="Textory home" className="shrink-0">
            <span className="md:hidden">
              <TextoryLogo size="sm" />
            </span>
            <span className="hidden md:inline-flex">
              <TextoryLogo size="md" />
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
            {items.map((item) =>
              item.menu === "categories" ? (
                <CategoryMenu key={item.label} label={item.label} />
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[15px] text-mist-300 transition-colors duration-200 hover:text-mist-100"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="flex items-center gap-2">
            <LanguageSettingsButton className="hidden lg:inline-flex" />
            <HeaderAuth />

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-950/45 text-mist-200 backdrop-blur-md lg:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <MobileNavSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={items}
      />
    </>
  );
}

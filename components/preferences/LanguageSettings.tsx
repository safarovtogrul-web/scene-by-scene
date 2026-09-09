"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { LanguageSettingsSheet } from "@/components/language/LanguageSettingsSheet";
import { LanguageFlag } from "@/components/ui/FlagIcon";
import { PlanetIcon } from "@/components/ui/PlanetIcon";
import { getLanguage } from "@/lib/languages";
import { cn } from "@/lib/cn";
import { usePreferences } from "./PreferencesProvider";

export { LanguageSettingsSheet } from "@/components/language/LanguageSettingsSheet";
export { HeaderLanguageControls } from "@/components/language/LanguageControls";

type Variant = "pill" | "row";

/**
 * Opens the interface-language surface. The two variants exist because the same
 * action appears as a compact pill beside other controls and as a full-width
 * row inside menus — the panel behind them is identical either way.
 */
export function LanguageSettingsButton({
  variant = "pill",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const { preferences, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const interfaceLanguage = getLanguage(preferences.interfaceLanguage);

  return (
    <>
      {variant === "pill" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={`${t("interfaceLanguage")}: ${interfaceLanguage.englishName}`}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] ps-2.5 pe-3",
            "text-[13px] font-medium text-mist-200 transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "hover:border-white/20 hover:bg-white/[0.07]",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
            className,
          )}
        >
          <PlanetIcon className="text-mist-400" />
          <LanguageFlag language={interfaceLanguage.id} size="sm" />
          <span className="max-w-[14ch] truncate">{interfaceLanguage.englishName}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className={cn(
            "flex min-h-14 w-full items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-start",
            "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.16] hover:bg-white/[0.06]",
            className,
          )}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-iris-500/[0.14] text-iris-300">
            <PlanetIcon />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-[12px] leading-tight text-mist-500">
              {t("interfaceLanguage")}
            </span>
            <span className="mt-1 flex items-center gap-2 text-[14px] leading-tight font-medium text-mist-200">
              <LanguageFlag language={interfaceLanguage.id} size="xs" />
              <span className="truncate">{interfaceLanguage.englishName}</span>
            </span>
          </span>

          <ChevronRight
            aria-hidden
            strokeWidth={1.9}
            className="size-[18px] shrink-0 text-mist-500 rtl:-scale-x-100"
          />
        </button>
      )}

      <LanguageSettingsSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

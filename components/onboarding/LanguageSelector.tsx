"use client";

import { FlagIcon } from "@/components/ui/FlagIcon";
import type { Language } from "@/lib/languages";
import { cn } from "@/lib/cn";

export type LanguageSelectorProps = {
  languages: readonly Language[];
  value: string | null;
  onChange?: (code: string) => void;
  /** Non-interactive presentation (phone mockups on the landing page). */
  readOnly?: boolean;
  name: string;
  className?: string;
};

export function LanguageSelector({
  languages,
  value,
  onChange,
  readOnly = false,
  name,
  className,
}: LanguageSelectorProps) {
  return (
    <ul
      role={readOnly ? "list" : "radiogroup"}
      aria-label={name}
      className={cn("flex flex-col gap-2.5", className)}
    >
      {languages.map((language) => {
        const selected = language.id === value;

        return (
          <li key={language.id}>
            <button
              type="button"
              role={readOnly ? undefined : "radio"}
              aria-checked={readOnly ? undefined : selected}
              tabIndex={readOnly ? -1 : 0}
              disabled={readOnly}
              onClick={() => onChange?.(language.id)}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-all duration-300",
                "disabled:cursor-default disabled:opacity-100",
                selected
                  ? "border-iris-400/60 bg-iris-500/[0.14] shadow-[0_0_0_1px_rgba(167,139,250,0.25),0_12px_30px_-16px_rgba(124,58,237,0.9)]"
                  : "border-white/[0.07] bg-white/[0.035] hover:border-white/15 hover:bg-white/[0.06]",
              )}
            >
              <FlagIcon code={language.flag} />
              <span
                dir={language.dir}
                className={cn(
                  "flex-1 text-[15px] font-medium",
                  language.dir === "rtl" && "text-left",
                  selected ? "text-mist-100" : "text-mist-300",
                )}
              >
                {language.nativeName}
              </span>
              <span
                aria-hidden
                className={cn(
                  "grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full transition-all duration-300",
                  selected
                    ? "scale-100 bg-gradient-to-br from-iris-400 to-iris-600 opacity-100 shadow-glow"
                    : "scale-75 border border-white/12 opacity-0",
                )}
              >
                <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none">
                  <path
                    d="m3 7.3 2.8 2.8L11 4.6"
                    stroke="#fff"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

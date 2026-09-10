"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";

import { LanguageFlag } from "@/components/ui/FlagIcon";
import { PlanetIcon } from "@/components/ui/PlanetIcon";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage, type CatalogueLanguage, type LanguageId } from "@/lib/languages";
import { cn } from "@/lib/cn";
import { LanguagePicker } from "./LanguagePicker";

type View = "root" | "interface";

/**
 * The site-language surface. One component serves both sizes: a bottom sheet
 * with generous touch targets on phones, and a centred panel from `sm` up.
 *
 * Radix's Dialog supplies the focus trap, ESC handling, scroll lock and
 * `aria-modal`; the two-level navigation is ours so a twenty-item list never
 * has to share space with the summary rows.
 */
export function LanguageSettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { preferences, updatePreferences, isSaving, t } = usePreferences();
  const [view, setView] = useState<View>("root");

  // Rewinding on the way out means the panel always reopens on the summary,
  // never on whichever list happened to be showing last.
  const handleOpenChange = (next: boolean) => {
    if (!next) setView("root");
    onOpenChange(next);
  };

  const interfaceLanguage = getLanguage(preferences.interfaceLanguage);

  const select = (id: LanguageId) => {
    void updatePreferences({ interfaceLanguage: id });
    setView("root");
  };

  const title =
    view === "interface"
      ? t("interfaceLanguage")
      : t("languageSettings");

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[88] bg-ink-950/70 backdrop-blur-sm",
            "motion-safe:data-[state=open]:animate-[overlay-in_180ms_ease-out]",
            "motion-safe:data-[state=closed]:animate-[overlay-out_140ms_ease-in]",
          )}
        />

        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-[90] flex flex-col overflow-hidden border border-white/[0.09] bg-ink-900",
            "shadow-[0_40px_100px_-35px_rgba(0,0,0,0.95)] outline-none",
            // Phone: a bottom sheet that respects the home indicator.
            "inset-x-0 bottom-0 max-h-[86dvh] rounded-t-[26px] border-b-0",
            "motion-safe:data-[state=open]:animate-[sheet-in_240ms_cubic-bezier(0.22,1,0.36,1)]",
            "motion-safe:data-[state=closed]:animate-[sheet-out_180ms_ease-in]",
            // Tablet and up: centred without a transform, so the settle
            // animation below has the box to itself.
            "sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[min(78dvh,640px)] sm:w-[min(430px,calc(100vw-3rem))]",
            "sm:rounded-[24px] sm:border-b",
            "sm:motion-safe:data-[state=open]:animate-[dialog-in_200ms_cubic-bezier(0.22,1,0.36,1)]",
            "sm:motion-safe:data-[state=closed]:animate-[dialog-out_150ms_ease-in]",
          )}
        >
          {/* Grabber — a phone affordance only. */}
          <span
            aria-hidden
            className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-white/15 sm:hidden"
          />

          <header className="flex shrink-0 items-center gap-3 px-4 pt-3 pb-3.5 sm:px-5 sm:pt-5">
            {view !== "root" && (
              <button
                type="button"
                onClick={() => setView("root")}
                aria-label={t("back")}
                className="-ms-1 grid size-11 shrink-0 place-items-center rounded-full text-mist-300 sm:size-9 transition-colors duration-200 hover:bg-white/[0.07] hover:text-mist-100"
              >
                <ArrowLeft aria-hidden strokeWidth={1.9} className="size-[18px] rtl:-scale-x-100" />
              </button>
            )}

            <Dialog.Title className="min-w-0 flex-1 truncate font-display text-[18px] font-semibold tracking-tight text-mist-100">
              {title}
            </Dialog.Title>

            <Dialog.Close
              aria-label={t("close")}
              className="-me-1 grid size-11 shrink-0 place-items-center rounded-full text-mist-400 sm:size-9 transition-colors duration-200 hover:bg-white/[0.07] hover:text-mist-100"
            >
              <X aria-hidden strokeWidth={1.9} className="size-[18px]" />
            </Dialog.Close>
          </header>

          {view === "root" ? (
            <div
              key="root"
              className="flex min-h-0 flex-col gap-2.5 motion-safe:animate-[view-in_180ms_cubic-bezier(0.22,1,0.36,1)] overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5 sm:pb-5"
            >
              <SummaryRow
                icon={<PlanetIcon />}
                label={t("interfaceLanguage")}
                language={interfaceLanguage}
                onClick={() => setView("interface")}
              />

              {!interfaceLanguage.hasInterfaceMessages && (
                <p className="px-1 pt-1 text-[12.5px] leading-relaxed text-mist-500">
                  {t("uiTranslationPending")}
                </p>
              )}
              {isSaving && (
                <p className="px-1 text-[12px] text-mist-500" role="status">
                  {t("saving")}
                </p>
              )}
            </div>
          ) : (
            <div
              key={view}
              className="flex min-h-0 flex-1 flex-col motion-safe:animate-[view-in_180ms_cubic-bezier(0.22,1,0.36,1)] pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-2"
            >
              <LanguagePicker
                label={title}
                value={preferences.interfaceLanguage}
                onSelect={select}
                // A phone would open the on-screen keyboard over the list.
                autoFocusSearch={typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches}
                listClassName="min-h-[40dvh] sm:min-h-0 sm:max-h-[380px]"
              />
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SummaryRow({
  icon,
  label,
  language,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  language: CatalogueLanguage;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-start",
        "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:border-white/[0.16] hover:bg-white/[0.06]",
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-iris-500/[0.14] text-iris-300">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[12px] leading-tight text-mist-500">{label}</span>
        <span className="mt-1 flex items-center gap-2">
          <LanguageFlag language={language.id} size="sm" />
          <span className="truncate text-[15px] leading-tight font-medium text-mist-100">
            {language.englishName}
          </span>
        </span>
      </span>

      <ChevronRight
        aria-hidden
        strokeWidth={1.9}
        className="size-[18px] shrink-0 text-mist-500 rtl:-scale-x-100"
      />
    </button>
  );
}

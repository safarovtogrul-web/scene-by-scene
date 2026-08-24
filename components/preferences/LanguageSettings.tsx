"use client";

import { useEffect, useId, useState } from "react";

import { LanguageSelector } from "@/components/onboarding/LanguageSelector";
import { FlagIcon } from "@/components/ui/FlagIcon";
import { LANGUAGE_REGISTRY, getLanguage, type LanguageId } from "@/lib/languages";
import { cn } from "@/lib/cn";
import { usePreferences } from "./PreferencesProvider";

type SelectorTarget = "interface" | "learning" | null;

/**
 * Shared account/menu surface for the two independent language preferences.
 * It opens a focused sheet rather than putting a long select in the header.
 */
export function LanguageSettingsButton({
  className,
  label = false,
}: {
  className?: string;
  /** Show a descriptive label where room allows, such as the account menu. */
  label?: boolean;
}) {
  const { preferences, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const language = getLanguage(preferences.interfaceLanguage);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 text-[13px] font-medium text-mist-200 transition-colors hover:border-white/20 hover:bg-white/[0.07] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
          className,
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4 text-iris-200">
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.9 12h16.2M12 3.75c2.05 2.24 3.12 4.99 3.12 8.25S14.05 18.01 12 20.25C9.95 18.01 8.88 15.26 8.88 12S9.95 5.99 12 3.75Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {label && <span>{t("interfaceLanguage")}</span>}
        <FlagIcon code={language.flag} className="h-[16px] w-[22px] rounded-[4px]" />
        <span dir={language.dir} className="max-w-[10ch] truncate">{language.nativeName}</span>
      </button>

      {open && <LanguageSettingsDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function LanguageSettingsDialog({ onClose }: { onClose: () => void }) {
  const { preferences, updatePreferences, isSaving, t } = usePreferences();
  const [target, setTarget] = useState<SelectorTarget>(null);
  const titleId = useId();
  const interfaceLanguage = getLanguage(preferences.interfaceLanguage);
  const learningLanguage = getLanguage(preferences.learningLanguage);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const selectLanguage = async (id: LanguageId) => {
    if (target === "interface") await updatePreferences({ interfaceLanguage: id });
    if (target === "learning") await updatePreferences({ learningLanguage: id });
    setTarget(null);
  };

  const selectedLanguage = target === "interface" ? preferences.interfaceLanguage : preferences.learningLanguage;
  const targetLabel = target === "interface" ? t("interfaceLanguage") : t("learningLanguage");

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-ink-950/75 p-3 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/[0.1] bg-ink-900 shadow-[0_40px_100px_-35px_rgba(0,0,0,0.95)]"
      >
        <header className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div>
            <h2 id={titleId} className="font-display text-[19px] font-semibold text-mist-100">{target ? targetLabel : t("languageSettings")}</h2>
            {target && <p className="mt-0.5 text-[12.5px] text-mist-500">{t("chooseLanguage")}</p>}
          </div>
          <button type="button" onClick={target ? () => setTarget(null) : onClose} className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] text-mist-300 transition-colors hover:bg-white/[0.06]" aria-label={target ? "Back to language settings" : "Close language settings"}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4"><path d={target ? "M15 18l-6-6 6-6" : "m6 6 12 12M18 6 6 18"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </header>

        {target ? (
          <div className="scroll-slim max-h-[min(64dvh,540px)] overflow-y-auto p-4 sm:p-5">
            <LanguageSelector name={targetLabel} languages={LANGUAGE_REGISTRY.filter((language) => language.enabled)} value={selectedLanguage} onChange={(id) => void selectLanguage(id as LanguageId)} />
          </div>
        ) : (
          <div className="space-y-3 p-4 sm:p-5">
            <PreferenceRow label={t("interfaceLanguage")} language={interfaceLanguage} onClick={() => setTarget("interface")} />
            <PreferenceRow label={t("learningLanguage")} language={learningLanguage} onClick={() => setTarget("learning")} />
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5">
              <span>
                <span className="block text-[14.5px] font-medium text-mist-100">{t("translation")}</span>
                <span className="mt-0.5 block text-[12.5px] text-mist-500">{preferences.showTranslations ? t("showTranslation") : t("hideTranslation")}</span>
              </span>
              <input type="checkbox" checked={preferences.showTranslations} onChange={(event) => void updatePreferences({ showTranslations: event.target.checked })} className="h-5 w-5 accent-iris-500" aria-label={t("translation")} />
            </label>
            {!interfaceLanguage.hasInterfaceMessages && <p className="px-1 text-[12.5px] leading-relaxed text-mist-500">{t("uiTranslationPending")}</p>}
            {isSaving && <p className="px-1 text-[12px] text-mist-500">Saving preferences…</p>}
          </div>
        )}
      </section>
    </div>
  );
}

function PreferenceRow({ label, language, onClick }: { label: string; language: ReturnType<typeof getLanguage>; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]">
      <FlagIcon code={language.flag} />
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] text-mist-500">{label}</span>
        <span dir={language.dir} className="mt-0.5 block truncate text-[15px] font-medium text-mist-100">{language.nativeName}</span>
      </span>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4 text-mist-500"><path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  );
}

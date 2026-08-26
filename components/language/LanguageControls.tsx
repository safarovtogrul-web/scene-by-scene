"use client";

import * as Popover from "@radix-ui/react-popover";
import { BookOpen, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

import { LanguageFlag } from "@/components/ui/FlagIcon";
import { PlanetIcon } from "@/components/ui/PlanetIcon";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getLanguage, shortCodeFor, type LanguageId } from "@/lib/languages";
import { cn } from "@/lib/cn";
import { LanguagePicker } from "./LanguagePicker";
import { LanguageSettingsSheet } from "./LanguageSettingsSheet";
import { SubtitlesToggle } from "./SubtitlesToggle";

const POPOVER_CLASSES = cn(
  "z-[80] w-[286px] overflow-hidden rounded-2xl border border-white/[0.08]",
  "bg-ink-850/95 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.95)] backdrop-blur-2xl",
  // Radix drives these state attributes; 180ms keeps the panel feeling instant.
  // The transform origin follows the side Radix actually placed the panel on.
  "origin-[var(--radix-popover-content-transform-origin)]",
  "motion-safe:data-[state=open]:animate-[popover-in_180ms_cubic-bezier(0.22,1,0.36,1)]",
  "motion-safe:data-[state=closed]:animate-[popover-out_140ms_ease-in]",
);

/** Shared shell so both header controls sit on exactly the same baseline. */
function TriggerShell({
  children,
  open,
  emphasis = false,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  open: boolean;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-full border ps-2 pe-1.5",
        "transition-[background-color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
        emphasis
          ? "border-white/[0.1] bg-white/[0.05] hover:border-white/20 hover:bg-white/[0.08]"
          : "border-transparent bg-transparent hover:border-white/[0.1] hover:bg-white/[0.05]",
        open && "border-iris-400/45 bg-white/[0.08]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function TriggerCode({ children }: { children: ReactNode }) {
  return (
    <span className="text-[12.5px] font-semibold tracking-[0.06em] text-mist-200 tabular-nums">
      {children}
    </span>
  );
}

function TriggerChevron({ open }: { open: boolean }) {
  return (
    <ChevronDown
      aria-hidden
      strokeWidth={2}
      className={cn(
        "size-3.5 text-mist-500 transition-transform duration-200",
        open && "rotate-180 text-iris-300",
      )}
    />
  );
}

/** Small caption above each list, so a bare popover never loses its meaning. */
function PanelHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 border-b border-white/[0.06] px-3.5 py-3 text-[12px] font-semibold tracking-[0.08em] text-mist-400 uppercase">
      <span className="text-iris-300">{icon}</span>
      {children}
    </p>
  );
}

/**
 * Interface language — the quieter of the two header controls, because it
 * changes the chrome rather than what the reader is here to learn.
 */
export function InterfaceLanguageControl({ className }: { className?: string }) {
  const { preferences, updatePreferences, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const language = getLanguage(preferences.interfaceLanguage);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <TriggerShell open={open} aria-label={`${t("interfaceLanguage")}: ${language.englishName}`} className={className}>
          <PlanetIcon className="text-mist-400 transition-colors duration-200 group-hover:text-iris-200" />
          <LanguageFlag language={language.id} size="sm" />
          <TriggerCode>{shortCodeFor(language.id)}</TriggerCode>
          <TriggerChevron open={open} />
        </TriggerShell>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content align="end" sideOffset={10} collisionPadding={12} className={POPOVER_CLASSES}>
          <PanelHeading icon={<PlanetIcon className="size-[15px]" />}>
            {t("interfaceLanguage")}
          </PanelHeading>
          <LanguagePicker
            label={t("interfaceLanguage")}
            value={preferences.interfaceLanguage}
            listClassName="max-h-[288px]"
            onSelect={(id) => {
              void updatePreferences({ interfaceLanguage: id });
              setOpen(false);
            }}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * Learning language — carries the flag and a little more visual weight, since
 * it decides which language the story itself is told in.
 */
export function LearningLanguageControl({ className }: { className?: string }) {
  const { preferences, updatePreferences, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const language = getLanguage(preferences.learningLanguage);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <TriggerShell open={open} emphasis aria-label={`${t("learningLanguage")}: ${language.englishName}`} className={className}>
          <LanguageFlag language={language.id} size="sm" />
          <TriggerCode>{shortCodeFor(language.id)}</TriggerCode>
          <TriggerChevron open={open} />
        </TriggerShell>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content align="end" sideOffset={10} collisionPadding={12} className={POPOVER_CLASSES}>
          <PanelHeading icon={<BookOpen aria-hidden strokeWidth={2} className="size-[15px]" />}>
            {t("learningLanguage")}
          </PanelHeading>
          <LanguagePicker
            label={t("learningLanguage")}
            value={preferences.learningLanguage}
            listClassName="max-h-[252px]"
            onSelect={(id) => {
              void updatePreferences({ learningLanguage: id });
              setOpen(false);
            }}
          />
          <div className="border-t border-white/[0.06] px-3.5 py-2.5">
            <SubtitlesToggle compact />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * The narrower desktop fallback: one trigger showing interface → learning, for
 * viewports where two separate controls would crowd the navigation.
 */
export function CombinedLanguageControl({ className }: { className?: string }) {
  const { preferences, updatePreferences, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<"interface" | "learning">("learning");
  const interfaceLanguage = getLanguage(preferences.interfaceLanguage);
  const learningLanguage = getLanguage(preferences.learningLanguage);

  const apply = (id: LanguageId) => {
    void updatePreferences(target === "interface" ? { interfaceLanguage: id } : { learningLanguage: id });
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <TriggerShell
          open={open}
          emphasis
          aria-label={`${t("languageSettings")} — ${interfaceLanguage.englishName}, ${learningLanguage.englishName}`}
          className={className}
        >
          <PlanetIcon className="text-mist-400 transition-colors duration-200 group-hover:text-iris-200" />
          <LanguageFlag language={interfaceLanguage.id} size="sm" />
          <TriggerChevron open={open} />
        </TriggerShell>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content align="end" sideOffset={10} collisionPadding={12} className={POPOVER_CLASSES}>
          <div className="flex gap-1 border-b border-white/[0.06] p-1.5">
            <PanelTab active={target === "learning"} onClick={() => setTarget("learning")} icon={<BookOpen aria-hidden strokeWidth={2} className="size-[15px]" />}>
              {t("learningShort")}
            </PanelTab>
            <PanelTab active={target === "interface"} onClick={() => setTarget("interface")} icon={<PlanetIcon className="size-[15px]" />}>
              {t("interfaceShort")}
            </PanelTab>
          </div>

          <LanguagePicker
            key={target}
            label={target === "interface" ? t("interfaceLanguage") : t("learningLanguage")}
            value={target === "interface" ? preferences.interfaceLanguage : preferences.learningLanguage}
            listClassName="max-h-[248px]"
            onSelect={apply}
          />

          <div className="border-t border-white/[0.06] px-3.5 py-2.5">
            <SubtitlesToggle compact />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function PanelTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[12px] font-medium",
        "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        active
          ? "bg-iris-500/[0.18] text-mist-100 ring-1 ring-iris-400/35 ring-inset"
          : "text-mist-400 hover:bg-white/[0.05] hover:text-mist-200",
      )}
    >
      <span className={active ? "text-iris-300" : "text-mist-500"}>{icon}</span>
      <span className="truncate">{children}</span>
    </button>
  );
}

/**
 * The phone header control.
 *
 * Deliberately not a popover: anchored to a 44px trigger at the very edge of a
 * 375px screen, the desktop panel would open as a cramped, scrolling column
 * with a search field the on-screen keyboard then covers. This opens the same
 * bottom sheet the menu uses instead — a full-width surface with real touch
 * targets — and the trigger itself carries only a flag and a code so it sits
 * beside the menu button without crowding the wordmark.
 */
export function MobileLanguageControl({ className }: { className?: string }) {
  const { preferences, t } = usePreferences();
  const [open, setOpen] = useState(false);
  const interfaceLanguage = getLanguage(preferences.interfaceLanguage);
  const learningLanguage = getLanguage(preferences.learningLanguage);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t("languageSettings")} — ${interfaceLanguage.englishName}, ${learningLanguage.englishName}`}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-full border border-white/10 bg-ink-950/45 ps-2 pe-2.5",
          "text-mist-200 backdrop-blur-md transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:border-white/20 hover:bg-white/[0.07]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-iris-300",
          className,
        )}
      >
        <LanguageFlag language={interfaceLanguage.id} size="sm" />
        <TriggerCode>{shortCodeFor(interfaceLanguage.id)}</TriggerCode>
      </button>

      <LanguageSettingsSheet open={open} onOpenChange={setOpen} />
    </>
  );
}

/**
 * What `SiteHeader` renders: two focused controls where there is room, a single
 * combined control where there is not, and the sheet-backed trigger on phones.
 */
export function HeaderLanguageControls() {
  return (
    <>
      <div className="hidden items-center gap-1 2xl:flex">
        <InterfaceLanguageControl />
        <LearningLanguageControl />
      </div>
      {/* Wrapped rather than given a `hidden` class: the trigger's own
       * `inline-flex` sits in the same CSS layer and would win. */}
      <span className="hidden lg:inline-flex 2xl:hidden">
        <CombinedLanguageControl />
      </span>
      <span className="inline-flex lg:hidden">
        <MobileLanguageControl />
      </span>
    </>
  );
}

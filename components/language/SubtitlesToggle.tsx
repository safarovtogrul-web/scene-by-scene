"use client";

import { useId } from "react";

import { Switch } from "@/components/ui/Switch";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { cn } from "@/lib/cn";

/**
 * The subtitle preference — the reader's own language shown under each scene.
 *
 * It reads from and writes to the existing preferences store directly (the
 * `showTranslations` field is unchanged), so every copy of the control stays in
 * sync and the persistence path is untouched. Only the wording changed:
 * "subtitles" is what a reader actually sees on the artwork.
 *
 * `compact` is the inline form used beside other controls; the default form is
 * a full row for the settings sheet.
 */
export function SubtitlesToggle({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const { preferences, updatePreferences, t } = usePreferences();
  const labelId = useId();
  const on = preferences.showTranslations;

  const control = (
    <Switch
      checked={on}
      onCheckedChange={(checked) => void updatePreferences({ showTranslations: checked })}
      aria-labelledby={labelId}
    />
  );

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between gap-3", className)}>
        <span
          id={labelId}
          className={cn(
            "text-[13px] transition-colors duration-200",
            on ? "text-mist-200" : "text-mist-400",
          )}
        >
          {t("subtitles")}
        </span>
        {control}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5",
        className,
      )}
    >
      <span className="min-w-0">
        <span id={labelId} className="block text-[14.5px] font-medium text-mist-100">
          {t("subtitles")}
        </span>
        <span className="mt-0.5 block text-[12.5px] text-mist-500">
          {on ? t("subtitlesShown") : t("subtitlesHidden")}
        </span>
      </span>
      {control}
    </div>
  );
}

"use client";

import { genreLabelKey } from "@/lib/catalog";
import type { Story } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/components/preferences/PreferencesProvider";

/**
 * The one-line story signature: `Easy · Hard · Mystery · 8 min`.
 * Single source of truth so metadata never drifts between surfaces.
 */
export function StoryMeta({
  story,
  className,
  withScenes = false,
}: {
  story: Story;
  className?: string;
  withScenes?: boolean;
}) {
  const { t } = usePreferences();
  const genre = genreLabelKey(story.genre);

  const parts = [
    `${t("easy")} · ${t("hard")}`,
    ...(genre ? [t(genre)] : []),
    t("minutesCount", { count: story.minutes }),
    ...(withScenes ? [t("scenesCount", { count: story.scenes })] : []),
  ];

  return (
    <p className={cn("text-[13px] text-mist-400", className)}>
      {parts.join(" · ")}
    </p>
  );
}

/** Understated premium marker. No paywall behaviour is attached to it yet. */
export function PremiumBadge({ className }: { className?: string }) {
  const { t } = usePreferences();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-iris-300/30 bg-ink-950/70 px-2 py-[3px] text-[10px] font-semibold tracking-[0.08em] text-iris-200 uppercase backdrop-blur-sm",
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" aria-hidden>
        <path
          d="M6 1 7.4 4.3 11 4.7 8.3 7.1 9.1 10.6 6 8.8 2.9 10.6 3.7 7.1 1 4.7l3.6-.4z"
          fill="currentColor"
        />
      </svg>
      {t("premium")}
    </span>
  );
}

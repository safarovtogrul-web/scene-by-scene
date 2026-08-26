"use client";

import type { ChangeEvent } from "react";

import { DIFFICULTY_OPTIONS, GENRES, LENGTH_BUCKETS } from "@/lib/catalog";
import type { StoryQuery } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import type { MessageKey } from "@/lib/i18n/messages";

export type StoryFiltersProps = {
  value: Required<StoryQuery>;
  onChange: (patch: Partial<StoryQuery>) => void;
  onReset: () => void;
  resultCount: number;
};

const SORT_OPTIONS: Array<{ value: string; labelKey: MessageKey }> = [
  { value: "recommended", labelKey: "sortRecommended" },
  { value: "newest", labelKey: "sortNewest" },
  { value: "shortest", labelKey: "sortShortest" },
];

/**
 * Presentational filter bar. It owns no state — `/stories` keeps the query in
 * the URL so a filtered catalogue can be linked to from the navigation menu.
 */
export function StoryFilters({
  value,
  onChange,
  onReset,
  resultCount,
}: StoryFiltersProps) {
  const { t } = usePreferences();
  const isFiltered =
    value.search !== "" ||
    value.difficulty !== "all" ||
    value.genre !== "all" ||
    value.length !== "all";

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-5 h-[18px] w-[18px] -translate-y-1/2 text-mist-500"
        >
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="m16 16 4 4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="search"
          value={value.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder={t("searchStories")}
          aria-label={t("searchStories")}
          className="h-13 w-full rounded-2xl border border-white/[0.08] bg-white/[0.035] pr-5 pl-13 text-[15px] text-mist-100 placeholder:text-mist-500 transition-colors duration-300 outline-none focus:border-iris-400/50 focus:bg-white/[0.06] sm:h-14"
        />
      </div>

      <div className="scroll-slim -mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <DifficultyPill
          label={t("all")}
          active={value.difficulty === "all"}
          onClick={() => onChange({ difficulty: "all" })}
        />
        {DIFFICULTY_OPTIONS.map((difficulty) => (
          <DifficultyPill
            key={difficulty.id}
            label={t(difficulty.labelKey)}
            active={value.difficulty === difficulty.id}
            onClick={() => onChange({ difficulty: difficulty.id })}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <FilterSelect
          label={t("filterGenre")}
          value={value.genre}
          onChange={(event) =>
            onChange({ genre: event.target.value as StoryQuery["genre"] })
          }
          options={[
            { value: "all", label: t("allGenres") },
            ...GENRES.map((genre) => ({
              value: genre.id,
              label: t(genre.labelKey),
            })),
          ]}
        />
        <FilterSelect
          label={t("filterLength")}
          value={value.length}
          onChange={(event) =>
            onChange({ length: event.target.value as StoryQuery["length"] })
          }
          options={[
            { value: "all", label: t("anyLength") },
            ...LENGTH_BUCKETS.map((bucket) => ({
              value: bucket.id,
              label: t(bucket.labelKey),
            })),
          ]}
        />
        <FilterSelect
          label={t("filterSort")}
          value={value.sort}
          onChange={(event) =>
            onChange({ sort: event.target.value as StoryQuery["sort"] })
          }
          options={SORT_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))}
        />

        <p className="col-span-3 mt-1 text-[13.5px] text-mist-400 sm:col-auto sm:mt-0 sm:ml-auto sm:text-[14px]">
          {t(resultCount === 1 ? "storyCountOne" : "storyCount", { count: resultCount })}
          {isFiltered && (
            <button
              type="button"
              onClick={onReset}
              className="ml-4 text-iris-300 transition-colors hover:text-iris-200"
            >
              {t("clearFilters")}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

function DifficultyPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 rounded-full border px-5 text-[14px] font-medium transition-all duration-300",
        active
          ? "border-iris-400/60 bg-iris-500/15 text-mist-100 shadow-[0_0_24px_-10px_rgba(139,92,246,0.9)]"
          : "border-white/[0.08] bg-white/[0.03] text-mist-400 hover:border-white/20 hover:text-mist-100",
      )}
    >
      {label}
    </button>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="relative inline-flex min-w-0 items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-10 w-full min-w-0 appearance-none rounded-full border border-white/[0.08] bg-white/[0.03] py-0 pr-8 pl-3 text-[13px] text-mist-300 transition-colors duration-300 outline-none hover:border-white/20 focus:border-iris-400/50 sm:w-auto sm:pr-10 sm:pl-4 sm:text-[14px]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-ink-800">
            {option.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute right-2.5 h-4 w-4 text-mist-500 sm:right-3.5"
      >
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </label>
  );
}

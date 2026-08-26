"use client";

import { Check, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

import { LanguageFlag } from "@/components/ui/FlagIcon";
import {
  enabledLanguages,
  searchLanguages,
  type Language,
  type LanguageId,
} from "@/lib/languages";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { cn } from "@/lib/cn";

/**
 * The one language list in the product: used inside the desktop popovers and
 * inside the mobile sheet, so both stay identical as the registry grows.
 *
 * It is a combobox rather than a scrolling menu — with twenty languages,
 * typing "es", "Español" or "Spanish" has to be the fastest route, and the
 * matching rules themselves live in the language registry.
 */
export function LanguagePicker({
  value,
  onSelect,
  label,
  languages = enabledLanguages(),
  autoFocusSearch = true,
  searchPlaceholder,
  emptyLabel,
  listClassName,
}: {
  value: LanguageId;
  onSelect: (id: LanguageId) => void;
  /** Accessible name for the list, e.g. "Interface language". */
  label: string;
  languages?: readonly Language[];
  autoFocusSearch?: boolean;
  searchPlaceholder?: string;
  emptyLabel?: string;
  listClassName?: string;
}) {
  const { t } = usePreferences();
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<LanguageId | null>(null);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchLanguages(query, languages), [languages, query]);

  // Derived rather than stored: whenever the highlighted language falls out of
  // the results, the highlight lands back on the current choice, so opening the
  // list and pressing Enter is a no-op instead of an accidental change.
  const activeIndex = useMemo(() => {
    const highlighted = activeId ? results.findIndex((language) => language.id === activeId) : -1;
    if (highlighted >= 0) return highlighted;
    // While searching, the best match leads; otherwise the current choice does.
    if (query.trim()) return 0;
    return Math.max(
      results.findIndex((language) => language.id === value),
      0,
    );
  }, [activeId, query, results, value]);

  useEffect(() => {
    if (!autoFocusSearch) return;
    // One frame after the popover's own opening focus, so it is not stolen back.
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [autoFocusSearch]);

  const moveActive = (delta: number) => {
    if (results.length === 0) return;
    const next = (activeIndex + delta + results.length) % results.length;
    setActiveId(results[next].id);
    listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveActive(-activeIndex);
    } else if (event.key === "End") {
      event.preventDefault();
      moveActive(results.length - 1 - activeIndex);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const language = results[activeIndex];
      if (language) onSelect(language.id);
    }
    // Escape is deliberately left alone so the surrounding popover or sheet
    // handles dismissal.
  };

  const activeOptionId = results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="relative shrink-0 px-2 pt-2 pb-1.5">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 start-5 size-4 -translate-y-1/2 text-mist-500"
          strokeWidth={1.8}
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            // A new query re-ranks the list, so the old highlight is dropped.
            setActiveId(null);
          }}
          onKeyDown={onKeyDown}
          placeholder={searchPlaceholder ?? t("searchLanguages")}
          aria-label={`${label} — search`}
          aria-expanded
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "h-10 w-full rounded-xl bg-white/[0.04] ps-9 pe-3 text-[14px] text-mist-100",
            "placeholder:text-mist-500 outline-none",
            "border border-transparent transition-colors duration-200",
            "hover:bg-white/[0.06] focus:border-iris-400/45 focus:bg-white/[0.07]",
          )}
        />
      </div>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={label}
        className={cn("scroll-slim min-h-0 flex-1 overflow-y-auto px-2 pb-2", listClassName)}
      >
        {results.map((language, index) => {
          const selected = language.id === value;
          const active = index === activeIndex;

          return (
            <li key={language.id}>
              <button
                type="button"
                id={`${listId}-${language.id}`}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onMouseMove={() => setActiveId(language.id)}
                onClick={() => onSelect(language.id)}
                className={cn(
                  // 44px minimum on touch screens; tighter once there is a pointer.
                  "flex min-h-11 w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start sm:min-h-0",
                  "transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  active && "bg-white/[0.07]",
                  selected && !active && "bg-white/[0.04]",
                )}
              >
                <LanguageFlag language={language.id} size="md" />

                <span className="min-w-0 flex-1">
                  {/* English leads so every row starts on the same edge and in
                   * the same script — a right-to-left native name as the
                   * primary label pushes the line to the opposite side and the
                   * list stops scanning as a column. */}
                  <span
                    className={cn(
                      "block truncate text-[14.5px] leading-tight",
                      selected ? "font-semibold text-mist-100" : "font-medium text-mist-200",
                    )}
                  >
                    {language.englishName}
                  </span>
                  {language.nativeName !== language.englishName && (
                    <span
                      lang={language.locale}
                      // Isolated rather than given its own `dir`: the run still
                      // renders right-to-left internally, but the line stays
                      // anchored to the list's own direction.
                      className="mt-0.5 block truncate text-[12px] leading-tight text-mist-500 [unicode-bidi:isolate]"
                    >
                      {language.nativeName}
                    </span>
                  )}
                </span>

                <Check
                  aria-hidden
                  strokeWidth={2.6}
                  className={cn(
                    "size-4 shrink-0 text-iris-300 transition-opacity duration-150",
                    selected ? "opacity-100" : "opacity-0",
                  )}
                />
              </button>
            </li>
          );
        })}

        {results.length === 0 && (
          <li className="px-2.5 py-6 text-center text-[13.5px] text-mist-500">{emptyLabel ?? t("noLanguageFound")}</li>
        )}
      </ul>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { StoryFilters } from "@/components/story-ui/StoryFilters";
import { StoryGrid } from "@/components/story-ui/StoryGrid";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { filterStories, type StoryQuery } from "@/lib/catalog";

type ResolvedQuery = Required<StoryQuery>;

const DEFAULTS: ResolvedQuery = {
  search: "",
  difficulty: "all",
  genre: "all",
  length: "all",
  sort: "recommended",
};

function readQuery(params: URLSearchParams): ResolvedQuery {
  return {
    search: params.get("q") ?? DEFAULTS.search,
    difficulty: (params.get("difficulty") as ResolvedQuery["difficulty"]) ?? DEFAULTS.difficulty,
    genre: (params.get("genre") as ResolvedQuery["genre"]) ?? DEFAULTS.genre,
    length: (params.get("length") as ResolvedQuery["length"]) ?? DEFAULTS.length,
    sort: (params.get("sort") as ResolvedQuery["sort"]) ?? DEFAULTS.sort,
  };
}

function toSearchString(query: ResolvedQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("q", query.search);
  if (query.difficulty !== "all") params.set("difficulty", query.difficulty);
  if (query.genre !== "all") params.set("genre", query.genre);
  if (query.length !== "all") params.set("length", query.length);
  if (query.sort !== "recommended") params.set("sort", query.sort);
  return params.toString();
}

/**
 * The full catalogue.
 *
 * Filter state lives in the URL so the navigation menu, the footer and the
 * category cards can all deep-link into a pre-filtered view. Typing is kept in
 * local state and pushed to the URL on a short debounce, so the address bar
 * doesn't thrash on every keystroke.
 */
export function StoryCatalogue() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = useMemo(
    () => readQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const [query, setQuery] = useState<ResolvedQuery>(urlQuery);

  // Follow the URL when it changes from the outside (menu link, back button).
  // Adjusted during render rather than in an effect, so the grid never paints
  // a frame with the previous filters.
  const urlKey = toSearchString(urlQuery);
  const [lastUrlKey, setLastUrlKey] = useState(urlKey);
  if (urlKey !== lastUrlKey) {
    setLastUrlKey(urlKey);
    setQuery(readQuery(new URLSearchParams(urlKey)));
  }

  // Mirror local state back into the URL, debounced for the search field.
  const nextKey = toSearchString(query);
  useEffect(() => {
    if (nextKey === urlKey) return;
    const timer = setTimeout(() => {
      router.replace(nextKey ? `${pathname}?${nextKey}` : pathname, {
        scroll: false,
      });
    }, 220);
    return () => clearTimeout(timer);
  }, [nextKey, urlKey, pathname, router]);

  const onChange = useCallback((patch: Partial<StoryQuery>) => {
    setQuery((current) => ({ ...current, ...patch }));
  }, []);

  const onReset = useCallback(() => setQuery(DEFAULTS), []);
  const { t } = usePreferences();

  const results = useMemo(() => filterStories(query), [query]);

  return (
    <>
      <StoryFilters
        value={query}
        onChange={onChange}
        onReset={onReset}
        resultCount={results.length}
      />

      {results.length > 0 ? (
        <StoryGrid stories={results} className="mt-12" />
      ) : (
        <div className="mt-16 rounded-3xl border border-white/[0.07] bg-white/[0.02] px-8 py-16 text-center">
          <p className="font-display text-[20px] font-semibold text-mist-100">
            {t("noStoriesTitle")}
          </p>
          <p className="mx-auto mt-2 max-w-[42ch] text-[15px] leading-relaxed text-mist-400">
            {t("noStoriesBody")}
          </p>
          <PrimaryButton
            variant="ghost"
            size="md"
            className="mt-7"
            onClick={onReset}
          >
            {t("clearFilters")}
          </PrimaryButton>
        </div>
      )}
    </>
  );
}

"use client";

import { StorySection } from "@/components/story-ui/StorySection";
import { usePreferences } from "@/components/preferences/PreferencesProvider";
import { getContinueLearning } from "@/lib/catalog";

/**
 * The homepage catalogue shelves.
 *
 * Only "Continue Learning" remains: the discovery rows ("New Stories",
 * "Recommended for You") were pulled while the catalogue is still placeholder
 * artwork, so the homepage does not recommend stories that cannot be read yet.
 * `CategoryDiscovery` above already covers browsing.
 *
 * The whole section disappears rather than rendering an empty band when there
 * is no progress to resume.
 */
export function StoryRows() {
  const { t } = usePreferences();
  const inProgress = getContinueLearning();

  if (inProgress.length === 0) return null;

  return (
    <section className="relative bg-ink-950 py-12 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(76,29,149,0.18),transparent)]" />

      <div className="relative">
        <StorySection title={t("continueLearning")} stories={inProgress} showProgress />
      </div>
    </section>
  );
}

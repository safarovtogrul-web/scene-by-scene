import { StorySection } from "@/components/story-ui/StorySection";
import {
  getContinueLearning,
  getNewStories,
  getRecommended,
} from "@/lib/catalog";

/**
 * The homepage catalogue shelves.
 *
 * Every row has a distinct job: resume, discover what is new, or get a broad
 * recommendation. "Continue Learning" renders
 * only when mock progress exists — `StorySection` returns null for an empty
 * set, so no conditional is needed here.
 */
export function StoryRows() {
  return (
    <section className="relative bg-ink-950 py-12 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(76,29,149,0.18),transparent)]" />

      <div className="relative space-y-14 md:space-y-16">
        <StorySection
          title="Continue Learning"
          stories={getContinueLearning()}
          showProgress
        />

        <StorySection
          title="New Stories"
          stories={getNewStories()}
          href="/stories?sort=newest"
        />

        <StorySection
          title="Recommended for You"
          stories={getRecommended()}
          href="/stories"
        />

      </div>
    </section>
  );
}

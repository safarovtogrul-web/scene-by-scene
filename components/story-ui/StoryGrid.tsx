import { StoryCard } from "./StoryCard";
import type { Story } from "@/lib/catalog";
import { cn } from "@/lib/cn";

/**
 * The full-catalogue layout: 4 columns on large desktop, 3 on medium, 2 on
 * tablet, 1 on phones. Column counts drop before the artwork does.
 */
export function StoryGrid({
  stories,
  className,
}: {
  stories: Story[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {stories.map((story, index) => (
        <li key={story.id}>
          <StoryCard
            story={story}
            priority={index < 4}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 46vw"
          />
        </li>
      ))}
    </ul>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { StoryDetail } from "@/components/story-ui/StoryDetail";
import { STORIES, genreSlugLabel, getStoryBySlug } from "@/lib/catalog";
import { getServerPreferences } from "@/lib/i18n/server";
import { storyDisplay } from "@/lib/story-packages/schema";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) return { title: "Story not found" };

  // The tab title is user-visible story metadata, so it follows the interface
  // language too. A crawler arrives without the cookie and gets English.
  const { interfaceLanguage } = await getServerPreferences();
  const display = storyDisplay(story, interfaceLanguage);

  return {
    title: display.title,
    description: `Easy and Hard · ${genreSlugLabel(story.genre)} · ${story.scenes} scenes. ${display.description}`,
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);
  if (!story) notFound();

  return (
    <>
      <SiteHeader />

      <main className="relative min-h-dvh overflow-hidden bg-ink-950 pt-16 md:pt-20">
        <StoryDetail story={story} />
      </main>

    </>
  );
}

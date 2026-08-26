import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/landing/SiteHeader";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { StoryDetail } from "@/components/story-ui/StoryDetail";
import { STORIES, genreSlugLabel, getStory } from "@/lib/catalog";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return STORIES.map((story) => ({ slug: story.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) return { title: "Story not found" };

  return {
    title: story.title,
    description: `Easy and Hard · ${genreSlugLabel(story.genre)} · ${story.scenes} scenes. ${story.description}`,
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  return (
    <>
      <SiteHeader />

      <main className="relative min-h-dvh overflow-hidden bg-ink-950 pt-16 md:pt-20">
        <StoryDetail story={story} />
      </main>

      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReaderExperience } from "@/components/reader/ReaderExperience";
import { getStoryPackage } from "@/lib/story-packages/registry";
import { validateRegisteredStories } from "@/lib/story-packages/validate-files";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ difficulty?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const story = getStoryPackage((await params).slug);
  return { title: story?.title ?? "Story not found", robots: { index: false } };
}

export default async function ReadStoryPage({ params, searchParams }: PageProps) {
  // Production assets may be served from a CDN rather than the function's
  // filesystem. The build already validates them; repeat file checks for HMR only.
  if (process.env.NODE_ENV === "development") validateRegisteredStories();
  const story = getStoryPackage((await params).slug);
  if (!story) notFound();
  const { difficulty } = await searchParams;
  return <ReaderExperience key={story.id} story={story} initialDifficulty={difficulty === "easy" || difficulty === "hard" ? difficulty : story.defaultDifficulty} />;
}

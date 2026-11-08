import { notFound } from "next/navigation";
import {
  GuideItemPage,
  guideItemDescription,
  guideItemTitle,
} from "@/components/site/SeoPages";
import { JourneyPage, journeyDescription, journeyTitle } from "@/components/site/JourneyPages";
import { isJourneySlug, JOURNEY_SLUGS } from "@/content/journey";
import {
  getQuestion,
  getTopic,
  GUIDE_BASE,
  QUESTIONS,
  TOPICS,
} from "@/content/guideTopics";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...TOPICS.map((x) => x.slug), ...QUESTIONS.map((x) => x.slug), ...JOURNEY_SLUGS].map((topic) => ({ topic }));
}

const known = (s: string) => !!(getTopic(s) ?? getQuestion(s)) || isJourneySlug(s);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!known(topic)) return {};
  return pageMeta({
    lang: "hi",
    path: `${GUIDE_BASE}/${topic}`,
    title: `${isJourneySlug(topic) ? journeyTitle(topic, "hi") : guideItemTitle(topic, "hi")} | Guniyo`,
    description: isJourneySlug(topic) ? journeyDescription(topic, "hi") : guideItemDescription(topic, "hi"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!known(topic)) notFound();
  if (isJourneySlug(topic)) return <JourneyPage lang="hi" slug={topic} />;
  return <GuideItemPage lang="hi" slug={topic} />;
}

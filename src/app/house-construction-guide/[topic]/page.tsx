import { notFound } from "next/navigation";
import {
  GuideItemPage,
  guideItemDescription,
  guideItemTitle,
} from "@/components/site/SeoPages";
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
  return [...TOPICS, ...QUESTIONS].map((x) => ({ topic: x.slug }));
}

const known = (s: string) => !!(getTopic(s) ?? getQuestion(s));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!known(topic)) return {};
  return pageMeta({
    lang: "en",
    path: `${GUIDE_BASE}/${topic}`,
    title: `${guideItemTitle(topic, "en")} | BOQFather`,
    description: guideItemDescription(topic, "en"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (!known(topic)) notFound();
  return <GuideItemPage lang="en" slug={topic} />;
}

import { notFound } from "next/navigation";
import { NakshaPage, nakshaDescription } from "@/components/site/NakshaPages";
import { getNaksha, NAKSHE, nakshaTitle } from "@/content/naksha";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return NAKSHE.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const n = getNaksha(slug);
  if (!n) return {};
  return pageMeta({
    lang: "hi",
    path: `naksha/${slug}`,
    title: `${nakshaTitle(n, "hi")} | BOQFather`,
    description: nakshaDescription(slug, "hi"),
    image: `/naksha/img/${n.slug}.webp`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getNaksha(slug)) notFound();
  return <NakshaPage lang="hi" slug={slug} />;
}

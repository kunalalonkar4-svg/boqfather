import { notFound } from "next/navigation";
import { NakshaPage, nakshaDescription } from "@/components/site/NakshaPages";
import { getNaksha, NAKSHE, nakshaTitle } from "@/content/naksha";
import { nakshaPreview } from "@/content/nakshaPreview";
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
    title: `${nakshaTitle(n, "hi")} | Guniyo`,
    description: nakshaDescription(slug, "hi"),
    image: nakshaPreview(n).src,
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

import { notFound } from "next/navigation";
import {
  GajPage,
  gajDescription,
  gajTitle,
} from "@/components/site/NakshaPages";
import { GAJ, getGaj } from "@/content/naksha";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return GAJ.map((g) => ({ gaj: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gaj: string }>;
}) {
  const { gaj } = await params;
  if (!getGaj(gaj)) return {};
  return pageMeta({
    lang: "hi",
    path: `naksha/gaj/${gaj}`,
    title: `${gajTitle(gaj, "hi")} | Guniyo`,
    description: gajDescription(gaj, "hi"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ gaj: string }>;
}) {
  const { gaj } = await params;
  if (!getGaj(gaj)) notFound();
  return <GajPage lang="hi" slug={gaj} />;
}

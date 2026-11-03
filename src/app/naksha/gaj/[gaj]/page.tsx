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
    lang: "en",
    path: `naksha/gaj/${gaj}`,
    title: `${gajTitle(gaj, "en")} | BOQFather`,
    description: gajDescription(gaj, "en"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ gaj: string }>;
}) {
  const { gaj } = await params;
  if (!getGaj(gaj)) notFound();
  return <GajPage lang="en" slug={gaj} />;
}

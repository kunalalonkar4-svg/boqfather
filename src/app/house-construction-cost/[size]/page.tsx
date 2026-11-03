import { notFound } from "next/navigation";
import {
  SqftPage,
  sqftDescription,
  sqftTitle,
} from "@/components/site/SeoPages";
import { getSqft, SQFT_SIZES, sqftSlug } from "@/content/plots";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SQFT_SIZES.map((n) => ({ size: sqftSlug(n) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ size: string }>;
}) {
  const { size } = await params;
  const n = getSqft(size);
  if (!n) return {};
  return pageMeta({
    lang: "en",
    path: `house-construction-cost/${size}`,
    title: `${sqftTitle(n, "en")} | BOQFather`,
    description: sqftDescription(n, "en"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ size: string }>;
}) {
  const { size } = await params;
  const n = getSqft(size);
  if (!n) notFound();
  return <SqftPage lang="en" n={n} />;
}

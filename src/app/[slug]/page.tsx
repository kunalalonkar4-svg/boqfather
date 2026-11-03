import { notFound } from "next/navigation";
import { CalculatorPage } from "@/components/site/CalculatorPage";
import { CALCULATORS, CalcSlug, getCalc } from "@/content/calculators";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCalc(slug);
  if (!c) return {};
  return pageMeta({
    lang: "en",
    path: slug,
    title: c.en.metaTitle,
    description: c.en.metaDescription,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getCalc(slug)) notFound();
  return <CalculatorPage lang="en" slug={slug as CalcSlug} />;
}

import { notFound } from "next/navigation";
import {
  PlotPage,
  plotDescription,
  plotTitle,
} from "@/components/site/SeoPages";
import { getPlot, PLOTS, plotSlug } from "@/content/plots";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return PLOTS.map((p) => ({ size: plotSlug(p) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ size: string }>;
}) {
  const { size } = await params;
  if (!getPlot(size)) return {};
  return pageMeta({
    lang: "en",
    path: `house-plan/${size}`,
    title: `${plotTitle(size, "en")} | Guniyo`,
    description: plotDescription(size, "en"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ size: string }>;
}) {
  const { size } = await params;
  if (!getPlot(size)) notFound();
  return <PlotPage lang="en" slug={size} />;
}

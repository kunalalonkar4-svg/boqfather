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
    lang: "hi",
    path: `house-plan/${size}`,
    title: `${plotTitle(size, "hi")} | BOQFather`,
    description: plotDescription(size, "hi"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ size: string }>;
}) {
  const { size } = await params;
  if (!getPlot(size)) notFound();
  return <PlotPage lang="hi" slug={size} />;
}

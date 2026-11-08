import { notFound } from "next/navigation";
import { ElevationPage, elevationDescription, elevationTitle } from "@/components/site/ElevationPages";
import { ELEVATIONS, elevationImage, getElevation } from "@/content/elevations";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return ELEVATIONS.map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const x = getElevation(slug);
  if (!x) return {};
  return pageMeta({
    lang: "hi",
    path: `elevations/${slug}`,
    title: `${elevationTitle(x, "hi")} | BOQFather`,
    description: elevationDescription(x, "hi"),
    image: elevationImage(x),
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getElevation(slug)) notFound();
  return <ElevationPage lang="hi" slug={slug} />;
}

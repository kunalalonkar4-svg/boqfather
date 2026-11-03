import { notFound } from "next/navigation";
import {
  CityPage,
  cityDescription,
  cityTitle,
} from "@/components/site/CityPages";
import { CITIES, getCity } from "@/content/cities";
import { pageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!getCity(city)) return {};
  return pageMeta({
    lang: "hi",
    path: `house-construction-cost-in/${city}`,
    title: `${cityTitle(city, "hi")} | BOQFather`,
    description: cityDescription(city, "hi"),
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  if (!getCity(city)) notFound();
  return <CityPage lang="hi" slug={city} />;
}

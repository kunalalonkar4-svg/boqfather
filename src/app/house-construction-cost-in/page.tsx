import { CityIndexPage } from "@/components/site/CityPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "house-construction-cost-in",
  title: "House Construction Cost by City in India (2026) | BOQFather",
  description:
    "Construction rate per sq ft in 45 Indian cities — Indore, Bhopal, Jaipur, Lucknow, Delhi, Mumbai, Pune and more — for basic, standard and premium finish.",
});

export default function Page() {
  return <CityIndexPage lang="en" />;
}

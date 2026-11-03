import { SqftIndexPage } from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "house-construction-cost",
  title:
    "House Construction Cost per Sq Ft in India (2026) – 500 to 3000 sq ft | BOQFather",
  description:
    "House construction cost in India by built-up area: 600, 800, 1000, 1200, 1500, 2000 sq ft and more — total cost, cement, steel, sand, bricks and stage-wise cost.",
});

export default function Page() {
  return <SqftIndexPage lang="en" />;
}

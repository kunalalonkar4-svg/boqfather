import { HomePage } from "@/components/site/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "/",
  title:
    "BOQFather – House Construction Cost Calculator & Construction Estimates (India)",
  description:
    "Free house construction cost calculator and construction calculators for India: cement, steel, bricks, plaster, tiles, paint. Step-by-step working, PDF report, Hindi and English.",
});

export default function Page() {
  return <HomePage lang="en" />;
}

import { HomeLight as HomePage } from "@/components/site/home/light/HomeLight";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "/",
  title:
    "Guniyo – House Construction Cost Calculator, BOQ & House Plans (India)",
  description:
    "Free house construction cost calculator for India: cost per sq ft, item-wise BOQ, house plans by plot size (30x40, 20x40, 25x50), elevations and a step-by-step building guide. Hindi and English.",
});

export default function Page() {
  return <HomePage lang="en" />;
}

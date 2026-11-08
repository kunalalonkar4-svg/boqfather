import { PlotIndexPage } from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "house-plan",
  title:
    "House Plans by Plot Size with Cost – 20×40, 25×50, 30×40, 30×50, 30×60 | Guniyo",
  description:
    "Free G+1 house plans drawn to scale for 20×40, 20×50, 25×40, 25×50, 30×40, 30×50, 30×60, 40×50 and 40×60 plots, with parking, and construction cost and material for each.",
});

export default function Page() {
  return <PlotIndexPage lang="en" />;
}

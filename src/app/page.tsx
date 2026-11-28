import { HomeLight as HomePage } from "@/components/site/home/light/HomeLight";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "/",
  title:
    "House Construction Cost Calculator & BOQ India | Guniyo",
  description:
    "Estimate your house construction cost in India. Calculate materials, create an item-wise BOQ with editable rates, and explore house plans. Free tools in English and Hindi.",
});

export default function Page() {
  return <HomePage lang="en" />;
}

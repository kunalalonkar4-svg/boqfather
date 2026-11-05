import { HomePage } from "@/components/site/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "/",
  title:
    "BOQFather – 3D House Planning & Construction Cost Calculator (India)",
  description:
    "Design house plans in 3D, estimate construction cost, cement, steel, bricks, and download itemized BOQ measurement book. IS 1200 compliant.",
});

export default function Page() {
  return <HomePage lang="en" />;
}

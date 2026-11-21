import { CalculatorsIndex } from "@/components/site/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "calculators",
  title:
    "Free Construction Calculators: Concrete, Brick, Steel | Guniyo",
  description:
    "Free construction calculators for India with step-by-step working: house cost, concrete, bricks, plaster, steel, tiles, paint, excavation and unit converter.",
});

export default function Page() {
  return <CalculatorsIndex lang="en" />;
}

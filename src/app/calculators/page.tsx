import { CalculatorsIndex } from "@/components/site/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "calculators",
  title:
    "Construction Calculators – Concrete, Brick, Plaster, Steel, Tiles, Paint | BOQFather",
  description:
    "Free construction calculators for India with step-by-step working: house cost, concrete, bricks, plaster, steel, tiles, paint, excavation and unit converter.",
});

export default function Page() {
  return <CalculatorsIndex lang="en" />;
}

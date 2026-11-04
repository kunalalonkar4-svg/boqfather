import { HouseOwnerGuide } from "@/components/site/HouseOwnerGuide";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "house-owner-guide",
  title: "House Owner Construction Guide — Checks, Payments & Handover | BOQFather",
  description:
    "A practical, stage-by-stage house construction guide for owners: site inspections, saved checklists, contractor payment tracking and handover.",
});

export default function Page() {
  return <HouseOwnerGuide lang="en" />;
}

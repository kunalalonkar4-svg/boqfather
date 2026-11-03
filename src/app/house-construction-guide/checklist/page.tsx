import {
  ChecklistPage,
  checklistDescription,
  checklistTitle,
} from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "house-construction-guide/checklist",
  title: `${checklistTitle("en")} | BOQFather`,
  description: checklistDescription("en"),
});

export default function Page() {
  return <ChecklistPage lang="en" />;
}

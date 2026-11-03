import {
  ChecklistPage,
  checklistDescription,
  checklistTitle,
} from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "house-construction-guide/checklist",
  title: `${checklistTitle("hi")} | BOQFather`,
  description: checklistDescription("hi"),
});

export default function Page() {
  return <ChecklistPage lang="hi" />;
}

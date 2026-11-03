import {
  GuidePage,
  guideDescription,
  guideTitle,
} from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "house-construction-guide",
  title: `${guideTitle("hi")} | BOQFather`,
  description: guideDescription("hi"),
});

export default function Page() {
  return <GuidePage lang="hi" />;
}

import {
  GuidePage,
  guideDescription,
  guideTitle,
} from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "house-construction-guide",
  title: `${guideTitle("en")} | BOQFather`,
  description: guideDescription("en"),
});

export default function Page() {
  return <GuidePage lang="en" />;
}

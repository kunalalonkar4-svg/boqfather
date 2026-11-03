import { PLAN_UPLOAD_META, PlanUploadPage } from "@/components/site/PlanUploadPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "plan-to-estimate",
  title: PLAN_UPLOAD_META.title[0],
  description: PLAN_UPLOAD_META.description[0],
});

export default function Page() {
  return <PlanUploadPage lang="en" />;
}

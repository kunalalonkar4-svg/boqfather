import { PLAN_UPLOAD_META, PlanUploadPage } from "@/components/site/PlanUploadPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "plan-to-estimate",
  title: PLAN_UPLOAD_META.title[1],
  description: PLAN_UPLOAD_META.description[1],
});

export default function Page() {
  return <PlanUploadPage lang="hi" />;
}

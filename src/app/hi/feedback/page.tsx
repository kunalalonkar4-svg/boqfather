import { FeedbackPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "feedback",
  title: INFO_META.feedback.title[1],
  description: INFO_META.feedback.description[1],
});

export default function Page() {
  return <FeedbackPage lang="hi" />;
}

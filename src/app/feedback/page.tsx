import { FeedbackPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "feedback",
  title: INFO_META.feedback.title[0],
  description: INFO_META.feedback.description[0],
});

export default function Page() {
  return <FeedbackPage lang="en" />;
}

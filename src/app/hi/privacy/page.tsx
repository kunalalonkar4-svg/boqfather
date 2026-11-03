import { PrivacyPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "privacy",
  title: INFO_META.privacy.title[1],
  description: INFO_META.privacy.description[1],
});

export default function Page() {
  return <PrivacyPage lang="hi" />;
}

import { PrivacyPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "privacy",
  title: INFO_META.privacy.title[0],
  description: INFO_META.privacy.description[0],
});

export default function Page() {
  return <PrivacyPage lang="en" />;
}

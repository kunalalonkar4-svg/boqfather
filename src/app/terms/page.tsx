import { TermsPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "terms",
  title: INFO_META.terms.title[0],
  description: INFO_META.terms.description[0],
});

export default function Page() {
  return <TermsPage lang="en" />;
}

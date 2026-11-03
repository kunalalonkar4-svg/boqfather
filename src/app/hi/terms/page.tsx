import { TermsPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "terms",
  title: INFO_META.terms.title[1],
  description: INFO_META.terms.description[1],
});

export default function Page() {
  return <TermsPage lang="hi" />;
}

import { AboutPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "about",
  title: INFO_META.about.title[1],
  description: INFO_META.about.description[1],
});

export default function Page() {
  return <AboutPage lang="hi" />;
}

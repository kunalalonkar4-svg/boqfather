import { AboutPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "about",
  title: INFO_META.about.title[0],
  description: INFO_META.about.description[0],
});

export default function Page() {
  return <AboutPage lang="en" />;
}

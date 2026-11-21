import { ALL_PAGES_META, AllPagesPage } from "@/components/site/AllPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "all-pages",
  title: ALL_PAGES_META.title[0],
  description: ALL_PAGES_META.description[0],
});

export default function Page() {
  return <AllPagesPage lang="en" />;
}

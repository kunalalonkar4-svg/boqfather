import { ALL_PAGES_META, AllPagesPage } from "@/components/site/AllPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "all-pages",
  title: ALL_PAGES_META.title[1],
  description: ALL_PAGES_META.description[1],
});

export default function Page() {
  return <AllPagesPage lang="hi" />;
}

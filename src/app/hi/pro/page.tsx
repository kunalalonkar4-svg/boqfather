import { ProPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    lang: "hi",
    path: "pro",
    title: INFO_META.pro.title[1],
    description: INFO_META.pro.description[1],
  }),
};

export default function Page() {
  return <ProPage lang="hi" />;
}

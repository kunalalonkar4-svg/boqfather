import { ProPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    lang: "en",
    path: "pro",
    title: INFO_META.pro.title[0],
    description: INFO_META.pro.description[0],
  }),
};

export default function Page() {
  return <ProPage lang="en" />;
}

import { AccountShell, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    lang: "hi",
    path: "account",
    title: INFO_META.account.title[1],
    description: INFO_META.account.description[1],
  }),
  robots: { index: false },
};

export default function Page() {
  return <AccountShell lang="hi" />;
}

import { AccountShell, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = {
  ...pageMeta({
    lang: "en",
    path: "account",
    title: INFO_META.account.title[0],
    description: INFO_META.account.description[0],
  }),
  robots: { index: false },
};

export default function Page() {
  return <AccountShell lang="en" />;
}

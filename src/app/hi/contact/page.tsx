import { ContactPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "contact",
  title: INFO_META.contact.title[1],
  description: INFO_META.contact.description[1],
});

export default function Page() {
  return <ContactPage lang="hi" />;
}

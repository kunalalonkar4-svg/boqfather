import { ContactPage, INFO_META } from "@/components/site/InfoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "contact",
  title: INFO_META.contact.title[0],
  description: INFO_META.contact.description[0],
});

export default function Page() {
  return <ContactPage lang="en" />;
}

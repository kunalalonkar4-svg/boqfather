import {
  NakshaIndexPage,
  naksheDescription,
  naksheTitle,
} from "@/components/site/NakshaPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "naksha",
  title: `${naksheTitle("hi")} | BOQFather`,
  description: naksheDescription("hi"),
  image: "/naksha/img/30x50-east-facing.webp",
});

export default function Page() {
  return <NakshaIndexPage lang="hi" />;
}

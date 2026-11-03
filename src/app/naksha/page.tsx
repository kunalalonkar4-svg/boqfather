import {
  NakshaIndexPage,
  naksheDescription,
  naksheTitle,
} from "@/components/site/NakshaPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "naksha",
  title: `${naksheTitle("en")} | BOQFather`,
  description: naksheDescription("en"),
  image: "/naksha/img/30x50-east-facing.png",
});

export default function Page() {
  return <NakshaIndexPage lang="en" />;
}

import { SqftIndexPage } from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "house-construction-cost",
  title: "घर बनाने का खर्च per sq ft (2026) – 500 से 3000 sq ft | BOQFather",
  description:
    "बिल्ट-अप एरिया के हिसाब से घर बनाने का खर्च: 600, 800, 1000, 1200, 1500, 2000 sq ft और ज़्यादा — कुल खर्च, सीमेंट, सरिया, रेत, ईंट और स्टेज-वार खर्च।",
});

export default function Page() {
  return <SqftIndexPage lang="hi" />;
}

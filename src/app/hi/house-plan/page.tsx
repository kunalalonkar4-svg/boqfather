import { PlotIndexPage } from "@/components/site/SeoPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "house-plan",
  title:
    "प्लॉट साइज़ के हिसाब से घर के नक्शे और खर्च – 20×40, 25×50, 30×40, 30×50, 30×60 | BOQFather",
  description:
    "20×40, 20×50, 25×40, 25×50, 30×40, 30×50, 30×60, 40×50 और 40×60 प्लॉट के लिए पार्किंग के साथ स्केल पर बने G+1 घर के नक्शे मुफ़्त, हर एक का खर्च और सामग्री।",
});

export default function Page() {
  return <PlotIndexPage lang="hi" />;
}

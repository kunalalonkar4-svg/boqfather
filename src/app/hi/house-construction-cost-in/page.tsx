import { CityIndexPage } from "@/components/site/CityPages";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "house-construction-cost-in",
  title: "शहर के हिसाब से घर बनाने का खर्च (2026) | BOQFather",
  description:
    "45 भारतीय शहरों में per sq ft निर्माण रेट — इंदौर, भोपाल, जयपुर, लखनऊ, दिल्ली, मुंबई, पुणे और भी — बेसिक, स्टैंडर्ड और प्रीमियम फ़िनिश।",
});

export default function Page() {
  return <CityIndexPage lang="hi" />;
}

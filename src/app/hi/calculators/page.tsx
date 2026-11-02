import { CalculatorsIndex } from "@/components/site/HomePage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "calculators",
  title: "निर्माण कैलकुलेटर – कंक्रीट, ईंट, प्लास्टर, सरिया, टाइल्स, पेंट | BOQFather",
  description: "भारत के लिए मुफ़्त निर्माण कैलकुलेटर, पूरी गणना के साथ: घर का खर्च, कंक्रीट, ईंट, प्लास्टर, सरिया, टाइल्स, पेंट, खुदाई और यूनिट कन्वर्टर।",
});

export default function Page() {
  return <CalculatorsIndex lang="hi" />;
}

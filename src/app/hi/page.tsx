import { PremiumHome } from "@/components/site/home/PremiumHome";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "/",
  title: "BOQFather – घर बनाने का खर्च कैलकुलेटर और निर्माण एस्टिमेट",
  description:
    "घर बनाने का खर्च, सीमेंट, सरिया, ईंट, प्लास्टर, टाइल्स और पेंट के मुफ़्त कैलकुलेटर। हिंदी और अंग्रेज़ी में चरण-दर-चरण हिसाब और PDF रिपोर्ट।",
});

export default function Page() {
  return <PremiumHome lang="hi" />;
}

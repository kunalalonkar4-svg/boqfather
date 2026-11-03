import { HomeLight as HomePage } from "@/components/site/home/light/HomeLight";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "/",
  title: "BOQFather – घर बनाने का खर्च कैलकुलेटर और निर्माण एस्टिमेट",
  description:
    "घर बनाने का खर्च, सीमेंट, सरिया, ईंट, प्लास्टर, टाइल्स और पेंट के मुफ़्त कैलकुलेटर। पूरी गणना, PDF रिपोर्ट, हिंदी और अंग्रेज़ी में।",
});

export default function Page() {
  return <HomePage lang="hi" />;
}

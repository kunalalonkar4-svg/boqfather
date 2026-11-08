import { HomeLight as HomePage } from "@/components/site/home/light/HomeLight";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "/",
  title: "Guniyo – घर बनाने का खर्च कैलकुलेटर, BOQ और घर के नक्शे",
  description:
    "घर बनाने का खर्च per sq ft, आइटम-वार BOQ, प्लॉट साइज़ के हिसाब से घर का नक्शा (30x40, 20x40, 25x50), एलिवेशन और क़दम-दर-क़दम गाइड। मुफ़्त, हिंदी और अंग्रेज़ी में।",
});

export default function Page() {
  return <HomePage lang="hi" />;
}

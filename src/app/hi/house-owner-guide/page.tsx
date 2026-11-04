import { HouseOwnerGuide } from "@/components/site/HouseOwnerGuide";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "house-owner-guide",
  title: "घर-मालिक निर्माण गाइड — जांच, भुगतान और handover | BOQFather",
  description:
    "घर-मालिकों के लिए चरण-दर-चरण निर्माण गाइड: साइट निरीक्षण, सेव चेकलिस्ट, ठेकेदार भुगतान ट्रैकर और handover।",
});

export default function Page() {
  return <HouseOwnerGuide lang="hi" />;
}

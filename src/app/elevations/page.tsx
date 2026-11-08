import { ElevationIndexPage, elevationsDescription, elevationsTitle } from "@/components/site/ElevationPages";
import { elevationImage, ELEVATIONS } from "@/content/elevations";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "en",
  path: "elevations",
  title: `${elevationsTitle("en")} | Guniyo`,
  description: elevationsDescription("en"),
  image: elevationImage(ELEVATIONS[0], true),
});

export default function Page() {
  return <ElevationIndexPage lang="en" />;
}

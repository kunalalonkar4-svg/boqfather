import { ElevationIndexPage, elevationsDescription, elevationsTitle } from "@/components/site/ElevationPages";
import { elevationImage, ELEVATIONS } from "@/content/elevations";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  lang: "hi",
  path: "elevations",
  title: `${elevationsTitle("hi")} | Guniyo`,
  description: elevationsDescription("hi"),
  image: elevationImage(ELEVATIONS[0], true),
});

export default function Page() {
  return <ElevationIndexPage lang="hi" />;
}

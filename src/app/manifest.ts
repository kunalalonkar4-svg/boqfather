import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BOQFather – Construction Estimates",
    short_name: "BOQFather",
    description:
      "House construction cost and construction calculators for India.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f3ef",
    theme_color: "#16181a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

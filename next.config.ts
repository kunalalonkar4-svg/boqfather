import type { NextConfig } from "next";

// Static export: every page is pre-rendered HTML (fast, SEO-friendly, can be hosted on Vercel or any CDN).
// When accounts / payments arrive (Phase 3) this switches to the normal Vercel server build.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

import type { NextConfig } from "next";

// Pages are still pre-rendered (static HTML, fast and SEO-friendly); the server build adds the
// API routes for login-backed features: payments, saved projects and reading uploaded plans / bills.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  // guniyo.com used to host a different app (a contractor accounts app). Old addresses that Google still has
  // go to the closest page on this site, with a permanent redirect.
  async redirects() {
    return [
      { source: "/disclaimer", destination: "/about/", permanent: true },
      { source: "/disclaimer/", destination: "/about/", permanent: true },
    ];
  },
};

export default nextConfig;

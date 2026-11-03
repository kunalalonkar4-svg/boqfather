import type { NextConfig } from "next";

// Pages are still pre-rendered (static HTML, fast and SEO-friendly); the server build adds the
// API routes for login-backed features: payments, saved projects and reading uploaded plans / bills.
const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;

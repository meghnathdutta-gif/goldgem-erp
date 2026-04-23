import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output automatically — no "standalone" needed
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    domains: [],
  },
};

export default nextConfig;

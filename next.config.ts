import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Enable PWA features
    webVitalsAttribution: ['CLS', 'LCP'],
  },
  compiler: {
    // Remove console.log in production builds
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // PWA specific optimizations
  generateBuildId: async () => {
    // Use consistent build IDs for better caching
    return 'workout-tracker-build'
  },
};

export default nextConfig;

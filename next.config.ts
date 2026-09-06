import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/1/:path*",
        destination: "/api/1/:path*",
      },
    ];
  },
};

export default nextConfig;

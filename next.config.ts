import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
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

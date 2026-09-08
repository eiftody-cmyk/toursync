import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/1/",
        destination: "/api/1/",
      },
      {
        source: "/1/1/:path*/",
        destination: "/api/1/:path*/",
      },
      {
        source: "/1/1/:path*",
        destination: "/api/1/:path*",
      },
      {
        source: "/1/:path*/",
        destination: "/api/1/:path*/",
      },
      {
        source: "/1/:path*",
        destination: "/api/1/:path*",
      },
    ];
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) => {
    initOpenNextCloudflareForDev();
  });
}

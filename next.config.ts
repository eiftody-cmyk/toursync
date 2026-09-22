import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight|GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-User|PerplexityBot|Google-Extended|anthropic-ai|Google-CloudVertexBot|Amazonbot|cohere-ai|Bytespider/i,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yxqhxmurckdjiulfdvpc.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
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

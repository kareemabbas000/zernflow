import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase storage
      { protocol: "https", hostname: "*.supabase.co" },
      // Social platform avatars and media
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "*.fbsbx.com" },
      { protocol: "https", hostname: "lookaside.fbsbx.com" },
      { protocol: "https", hostname: "*.whatsapp.net" },
      { protocol: "https", hostname: "*.facebook.com" },
      { protocol: "https", hostname: "*.twimg.com" },
      { protocol: "https", hostname: "*.telegram.org" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // Zernio CDN
      { protocol: "https", hostname: "*.zernio.com" },
      // Gravatar
      { protocol: "https", hostname: "*.gravatar.com" },
    ],
  },

  // Security headers applied to all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(self), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // CORS for API routes
      {
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // Optimize server-side packages
  serverExternalPackages: ["@zernio/node"],

  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable logging in development
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default withNextIntl(nextConfig);

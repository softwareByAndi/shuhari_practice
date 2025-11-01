import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network IPs during development
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "development" ? "*" : "",
          },
        ],
      },
    ];
  },

  allowedDevOrigins: [
    'local-origin.dev', 
    '*.local-origin.dev',
    "//localhost",
    "//127.0.0.1",
    "172.16.0.*", // Your local network IP
    // Add any other IPs you might access from
    // You can also use wildcards like "http://172.16.*.*:3000"
  ],

  // Explicitly allow development from network IPs
  // This will be required in future Next.js versions
  experimental: {

  },
};

export default nextConfig;

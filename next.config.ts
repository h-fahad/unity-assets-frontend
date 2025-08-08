import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '3001',
      },
      // Add your production backend domain here
      // {
      //   protocol: 'https',
      //   hostname: 'your-backend-domain.com',
      // },
    ],
  },
};

export default nextConfig;

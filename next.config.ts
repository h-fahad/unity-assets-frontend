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
      // AWS S3 buckets - pattern for any S3 bucket
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      // Specific S3 bucket (more secure)
      {
        protocol: 'https',
        hostname: 'unity-assets-fahadyounas.s3.eu-north-1.amazonaws.com',
      },
      // CloudFront CDN (if you set it up later)
      {
        protocol: 'https',
        hostname: '*.cloudfront.net',
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/blog/crafting-perfect-resume-for-mbb',
        destination: '/blog/crafting-perfect-resume-for-mbb-consulting',
        permanent: true,
      },
      {
        source: '/blog/crafting-perfect-resume-for-big4',
        destination: '/blog/crafting-perfect-resume-for-big4-consulting',
        permanent: true,
      },
    ]
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  poweredByHeader: false,
};

export default nextConfig;

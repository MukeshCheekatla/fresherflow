import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fresherflow/types", "@fresherflow/schemas", "@fresherflow/constants"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

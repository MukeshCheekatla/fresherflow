import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fresherflow/types", "@fresherflow/schemas", "@fresherflow/constants"],
};

export default nextConfig;

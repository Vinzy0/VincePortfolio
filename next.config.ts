import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["tegaki"],
  experimental: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.ttf$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;

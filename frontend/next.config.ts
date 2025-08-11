import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  eslint: {
    // Avoid failing production builds due to lint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Enables Static HTML Export
  env: {
    NEXT_PUBLIC_API_BASE: "http://127.0.0.1:8000",
  },
  /* config options here */
};

export default nextConfig;

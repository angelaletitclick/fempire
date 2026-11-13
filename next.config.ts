import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Profilfotos bis 3 MB plus Formular-Overhead
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;

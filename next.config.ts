import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images-assets.nasa.gov",
      },
      {
        protocol: "https",
        hostname: "mars.nasa.gov", // Just in case we pull direct rover links
      },
      {
        protocol: "https",
        hostname: "assets.science.nasa.gov",
      },
      {
        protocol: "https",
        hostname: "science.nasa.gov",
      },
    ],
  },
};

export default nextConfig;

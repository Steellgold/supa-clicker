import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://s7yh4pytyr.ufs.sh/f/**")],
  }
};

export default nextConfig;

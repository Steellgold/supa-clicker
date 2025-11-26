import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://s7yh4pytyr.ufs.sh/f/**"),
      new URL("https://ludyyxcyrqfzlwhexilp.supabase.co/storage/v1/object/public/profile-assets/profile-icons/**"),
    ],
  }
};

export default nextConfig;

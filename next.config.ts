import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.189"],

  images: {
    /**
     * Story artwork ships as local SVG placeholders for now. Allowing SVG
     * through `next/image` keeps the component contract identical once real
     * raster artwork replaces the files in `public/stories/`.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
import { BRAND_NAME } from "@/lib/brand";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND_NAME} — Learn languages, scene by scene.`,
    short_name: BRAND_NAME,
    description:
      "Learn languages through illustrated stories. Real actions, real scenes, a natural way to understand and remember new languages.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#04030c",
    theme_color: "#04030c",
    categories: ["education", "books", "entertainment"],
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

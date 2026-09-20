import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/**
 * Scheda dell'app per i telefoni: nome e icona corretti quando qualcuno
 * salva ARTANTIS sulla schermata principale.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ARTANTIS — Spazio editoriale",
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d1420",
    lang: "it",
    categories: ["education", "medical", "news"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

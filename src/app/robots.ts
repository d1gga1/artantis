import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * Istruzioni per i motori di ricerca.
 *
 * Tutto ciò che è pubblico è aperto; le aree riservate e i percorsi tecnici
 * restano fuori. Non è una protezione — chi ha il collegamento entra lo
 * stesso — serve solo a tenere pulito quello che finisce nelle ricerche.
 */
export default function robots(): MetadataRoute.Robots {
  const privateAreas = [
    "/accedi",
    "/registrati",
    "/area-personale",
    "/moderazione",
    "/pubblica",
    "/password-dimenticata",
    "/nuova-password",
    "/auth/",
    "/api/",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateAreas,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}

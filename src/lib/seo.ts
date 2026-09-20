import type { Metadata } from "next";
import { AUTHOR_NAME } from "@/lib/brand";

/**
 * SEO — UN SOLO POSTO DA CAMBIARE
 *
 * Qui dentro c'è tutto quello che i motori di ricerca e i social leggono del
 * sito: indirizzo ufficiale, titolo, descrizione. Ogni pagina pesca da qui,
 * quindi per cambiare il modo in cui ARTANTIS appare su Google basta
 * modificare questo file.
 */

/**
 * L'indirizzo ufficiale del sito, senza barra finale.
 * È quello che Google indicizza: www.artantiss.com rimanda qui.
 * Si può sovrascrivere con la variabile d'ambiente NEXT_PUBLIC_SITE_URL
 * (utile per gli ambienti di prova).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://artantiss.com"
).replace(/\/+$/, "");

export const SITE_NAME = "ARTANTIS";

/** Titolo della home. Sotto i 60 caratteri: oltre, Google lo taglia. */
export const SITE_TITLE = "ARTANTIS — Spazio editoriale di ricerca, medicina e arte";

/** Descrizione della home. Sotto i 160 caratteri, stessa ragione. */
export const SITE_DESCRIPTION =
  "Lo spazio editoriale di ricercatori, medici, artisti, pittori e farmacisti. Contenuti selezionati uno a uno dalla direzione di " +
  AUTHOR_NAME +
  ".";

export const SITE_LOCALE = "it_IT";

/** Costruisce un indirizzo assoluto a partire da un percorso interno. */
export function absoluteUrl(path = "/") {
  if (!path.startsWith("/")) path = "/" + path;
  return SITE_URL + (path === "/" ? "" : path);
}

/**
 * Riduce un testo libero a una descrizione pulita per Google.
 * Toglie gli a capo, comprime gli spazi e taglia sull'ultima parola intera.
 */
export function toDescription(text: string | null | undefined, max = 158) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return SITE_DESCRIPTION;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

type PageMetaInput = {
  title: string;
  description: string;
  /** Percorso interno, es. "/esplora". Diventa il canonical. */
  path: string;
  /** "article" per i contenuti, "profile" per i profili. */
  type?: "website" | "article" | "profile";
  /** Immagine di anteprima già assoluta. Se manca, vale quella del sito. */
  image?: string;
  /** true per tenere la pagina fuori da Google. */
  noIndex?: boolean;
  /** Solo per i contenuti: data di pubblicazione e autore. */
  publishedTime?: string;
  authors?: string[];
};

/**
 * Metadati completi per una pagina pubblica: canonical, anteprima social,
 * scheda Twitter. Da usare in ogni pagina invece di scrivere a mano.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  image,
  noIndex = false,
  publishedTime,
  authors,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  // Senza immagine propria vale quella del sito: un collegamento condiviso
  // non deve mai apparire nudo.
  const images = [{ url: image ?? absoluteUrl("/opengraph-image") }];

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? NO_INDEX_RULES : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: type === "profile" ? "profile" : type,
      images,
      ...(publishedTime ? { publishedTime } : {}),
      ...(authors ? { authors } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}

/** Regole per le pagine che non devono finire su Google. */
export const NO_INDEX_RULES = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
} as const;

/**
 * Metadati per le pagine riservate (accesso, area personale, moderazione…).
 * Restano raggiungibili da chi ha il collegamento, ma fuori dalle ricerche.
 */
export function privateMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description: description ?? SITE_DESCRIPTION,
    robots: NO_INDEX_RULES,
  };
}

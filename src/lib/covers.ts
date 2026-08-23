import type { Profession } from "@/lib/types";

/**
 * Copertina di riserva per i profili che non ne hanno caricata una.
 * Ogni disciplina ha la propria, così i profili non si somigliano tutti.
 */
const COVERS: Record<string, string> = {
  ricercatore: "/immagini/copertine/ricerca.svg",
  medico: "/immagini/copertine/medicina.svg",
  artista: "/immagini/copertine/arte.svg",
  pittore: "/immagini/copertine/pittura.svg",
  arte_e_benessere: "/immagini/copertine/benessere.svg",
  farmacista: "/immagini/copertine/farmacia.svg",
  altro: "/immagini/copertine/generale.svg",
};

export function coverFor(profession?: Profession | string | null) {
  return COVERS[profession ?? "altro"] ?? COVERS.altro;
}

export const AUTH_PANEL = "/immagini/pannello-accesso.svg";

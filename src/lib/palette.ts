/**
 * Ogni disciplina ha il proprio colore. Serve a due cose: rendere il sito vivo
 * senza renderlo chiassoso, e far riconoscere a colpo d'occhio di che ambito
 * parla un contenuto. Tutte le tinte sono desaturate e abbastanza scure da
 * restare leggibili su fondo bianco.
 */
export type Tint = {
  /** testo ed elementi in primo piano */
  ink: string;
  /** versione più profonda, per gli stati attivi */
  deep: string;
  /** fondo tenue */
  soft: string;
  /** alone colorato */
  glow: string;
};

export const TINTS: Record<string, Tint> = {
  ricercatore:      { ink: "#0F6F8C", deep: "#0A4F65", soft: "#E7F2F6", glow: "15,111,140" },
  medico:           { ink: "#15704A", deep: "#0E5236", soft: "#E6F3ED", glow: "21,112,74" },
  artista:          { ink: "#6D4AA8", deep: "#4F3480", soft: "#F0EBF9", glow: "109,74,168" },
  pittore:          { ink: "#B4562B", deep: "#8A3F1D", soft: "#FBEDE5", glow: "180,86,43" },
  arte_e_benessere: { ink: "#A8497B", deep: "#7E325A", soft: "#FAEBF3", glow: "168,73,123" },
  farmacista:       { ink: "#2B5FA8", deep: "#1D4479", soft: "#E9F0FA", glow: "43,95,168" },
  altro:            { ink: "#4A5568", deep: "#2D3748", soft: "#EEF1F5", glow: "74,85,104" },
};

export function tint(profession?: string | null): Tint {
  return TINTS[profession ?? "altro"] ?? TINTS.altro;
}

/** Variabili CSS da applicare a un contenitore per colorarne i discendenti. */
export function tintVars(profession?: string | null) {
  const t = tint(profession);
  return {
    "--t-ink": t.ink,
    "--t-deep": t.deep,
    "--t-soft": t.soft,
    "--t-glow": t.glow,
  } as React.CSSProperties;
}

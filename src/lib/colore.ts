/**
 * MANOPOLA DEL COLORE
 * ===================
 * Tutto il colore del sito si regola da qui. Alza i numeri per un sito più
 * acceso, abbassali per tornare sobrio: cambiano insieme sfondo, pastiglie
 * delle discipline e schede del feed.
 *
 * Valori di riferimento:
 *   sobrio   → sfondo 0.95 · velo "bg-white/58 sm:bg-white/50" · scheda 0.07
 *   attuale  → vedi sotto
 *   acceso   → sfondo 1.7  · velo "bg-white/28 sm:bg-white/20" · scheda 0.24
 */
export const COLORE = {
  /** Forza degli aloni e della rete sullo sfondo (1 = taratura di base). */
  sfondo: 1.35,

  /** Quanti nodi nella rete: più alto = trama più fitta. */
  densita: 0.85,

  /**
   * Velo bianco steso sopra lo sfondo animato.
   * Più basso il numero, più colore passa. Il primo valore vale su telefono
   * (dove non c'è la sfocatura), il secondo da tablet in su.
   */
  velo: "bg-white/40 sm:bg-white/32",

  /** Velatura colorata dentro le schede del feed (0 = schede bianche). */
  scheda: 0.16,

  /** Fondo colorato delle pastiglie delle discipline. */
  pastiglia: 0.16,

  /** Bordo delle stesse pastiglie. */
  bordoPastiglia: 0.5,
};

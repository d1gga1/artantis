/**
 * Firma editoriale del sito.
 * Un solo posto da cambiare: tutti i componenti leggono da qui.
 */
export const AUTHOR_NAME = "Dott. Vincenzo Silvano";

/** L'attacco della firma completa. */
export const CLAIM = "Spazio editoriale curato by";

/** Firma completa: è quella che compare in tutto il sito. */
export const FIRMA = `${CLAIM} ${AUTHOR_NAME}`;

/** Versione corta, dove non c'è spazio per la firma intera. */
export const BYLINE = `By ${AUTHOR_NAME}`;

/** Firma estesa, usata dove si parla della revisione dei contenuti. */
export const EDITORIAL_LINE = `Direzione editoriale · ${AUTHOR_NAME}`;

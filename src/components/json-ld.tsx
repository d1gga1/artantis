/**
 * Dati strutturati (JSON-LD).
 *
 * È la scheda tecnica che Google legge per capire *cosa* è una pagina:
 * un articolo, una persona, un sito. Non si vede, ma è ciò che permette di
 * comparire con autore, data e anteprima arricchita nei risultati.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Le parentesi angolari vanno neutralizzate: impedisce che un testo
      // scritto da un utente possa chiudere il tag e iniettare codice.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

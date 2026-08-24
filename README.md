# ARTANTIS — by Silvano Vincenzo

Piattaforma editoriale per ricercatori, medici, artisti, pittori, farmacisti e
professionisti di arte e benessere. Lettura libera per tutti; interazioni riservate a
chi ha un profilo; **ogni contenuto proposto passa dall'approvazione della direzione
editoriale prima di comparire nel feed**.

> **Devi metterlo online e non sei un tecnico?** Apri [`GUIDA.md`](./GUIDA.md):
> è scritta passo per passo, senza gergo.

---

## Cosa fa

- **Feed pubblico** — chiunque legge senza registrarsi.
- **Interazioni riservate** — apprezzamenti, commenti e ricondivisioni richiedono l'accesso;
  a chi non è registrato compare un invito, non un errore.
- **Proposta di contenuti** — testo, immagini, video e GIF (fino a 8 file per post).
  Alla pubblicazione il contenuto entra in coda di revisione.
- **Pannello di moderazione** — riservato all'amministratore (Vincenzo Silva): coda,
  anteprima completa, approvazione o rifiuto con motivazione visibile all'autore.
- **Area personale** — bio, professione, data di nascita, telefono, email, città,
  Instagram, Facebook, sito web, immagine del profilo e copertina.
- **Rete sociale** — follow reciproci; **gli elenchi di follower e seguiti sono visibili
  solo a chi segue quella persona** (regola applicata nel database, non solo nella pagina).
- **Esplora** — directory dei profili con ricerca e filtro per disciplina.

## Colore e movimento

Ogni disciplina ha una propria tinta (`src/lib/palette.ts`), usata in modo coerente
su etichette, iniziali degli avatar, filtri, aloni delle schede e copertine di riserva:
il sito resta chiaro e leggibile, ma un contenuto di pittura si distingue a colpo
d'occhio da uno di farmacia.

Il movimento è tutto in `framer-motion` e rispetta `prefers-reduced-motion`:
sfondo animato a macchie di colore (`aurora.tsx`), barra di avanzamento della lettura,
titoli che salgono a scaglioni, numeri che contano, schede che si sollevano con un
alone del proprio colore, filo colorato che attraversa la scheda al passaggio del mouse.

## Impianto tecnico

| | |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Linguaggio | TypeScript |
| Grafica | Tailwind CSS 3 · caratteri Inter e Fraunces inclusi nel progetto |
| Animazioni | Framer Motion |
| Dati, accessi, file | Supabase (PostgreSQL + Auth + Storage) |
| Pubblicazione | Vercel |

Nessuna chiamata a servizi esterni in fase di build: i caratteri sono inclusi nel
pacchetto, quindi la pubblicazione funziona anche su reti chiuse.

## Struttura

```
src/
  app/
    page.tsx                  feed pubblico
    esplora/                  directory dei profili
    post/[id]/                pagina del singolo contenuto + commenti
    profilo/[username]/       profilo pubblico, follower, seguiti
    area-personale/           gestione account e stato delle proprie proposte
    pubblica/                 editor di proposta con caricamento media
    moderazione/              pannello riservato all'amministratore
    accedi/ registrati/       accesso e registrazione
    auth/                     conferma email e scambio codice
  components/                 interfaccia e animazioni
  lib/
    supabase/                 client browser, server e middleware
    queries.ts                letture dal database
    actions.ts                scritture (Server Actions)
supabase/
  schema.sql                  struttura completa: tabelle, regole, permessi, archivio file
  collaudo/                   verifica locale delle regole di sicurezza
```

## Sicurezza

Le regole non stanno nell'interfaccia ma nel database (Row Level Security):

- un post nasce **sempre** in stato `pending`, qualunque cosa invii il client;
- solo un amministratore può cambiarne lo stato;
- nessuno può nominarsi amministratore modificando il proprio profilo;
- i contatori (apprezzamenti, commenti, follower) non sono scrivibili dagli utenti;
- gli elenchi follower/seguiti sono leggibili solo da chi segue quel profilo;
- nell'archivio file ciascuno scrive solo nella propria cartella.

Queste regole sono verificate da `supabase/collaudo/verifiche.sql`, che simula quattro
utenti diversi (un autore, due lettori, l'amministratore) e controlla 17 comportamenti.

## Sviluppo in locale

```bash
npm install
cp .env.example .env.local     # e incolla i due valori Supabase
npm run dev                    # http://localhost:3000
```

Per vedere l'aspetto del sito senza database:

```bash
ARTANTIS_DEMO=1 npm run dev
```

## Variabili d'ambiente

| Nome | Obbligatoria | A cosa serve |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sì | indirizzo del progetto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sì | chiave pubblica di Supabase |
| `ARTANTIS_DEMO` | no | `1` mostra contenuti di esempio senza database |

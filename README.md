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
- **Membri** — elenco completo degli iscritti con distintivo di ruolo: `ADMIN` per la
  direzione editoriale, `MEMBRO` per tutti gli altri, più la disciplina di ciascuno.
- **Notifiche** — campanella con pallino rosso e conteggio, pannello a tendina e
  riquadro temporaneo in alto a destra all'arrivo di una novità. Le notifiche nascono
  da trigger nel database (esito della revisione, apprezzamenti, commenti,
  ricondivisioni, nuovi follower): nessun client può fabbricarle.

## Colore e movimento

Ogni disciplina ha una propria tinta (`src/lib/palette.ts`), usata in modo coerente
su etichette, iniziali degli avatar, filtri, aloni delle schede e copertine di riserva:
il sito resta chiaro e leggibile, ma un contenuto di pittura si distingue a colpo
d'occhio da uno di farmacia.

Lo sfondo è vivo **su tutte le pagine**: una sola tela fissa dietro al sito intero
(`site-background.tsx`), così la rete fa da fondale mentre il contenuto scorre.
`living-background.tsx` disegna su canvas una rete di nodi alla
deriva che si collegano quando si avvicinano, con impulsi colorati che corrono lungo
i collegamenti e campi di colore che si spostano lentamente. Il puntatore scosta i
nodi vicini, quindi la pagina reagisce a chi la guarda.

**Regola non negoziabile: niente deve apparire o muoversi a scatti.** Un fondo che
sfarfalla affatica gli occhi in pochi secondi. Ogni posizione è quindi una funzione
continua del tempo, e tutto entra ed esce in dissolvenza.

Perché resti fluido *e* liscio, i due strati stanno su due tele distinte:

- i campi di colore su una tela grande un quarto, ridisegnata **a ogni fotogramma**
  e ingrandita dal browser (che la sfuma da solo). Costa un quarto del lavoro senza
  introdurre scatti;
- la rete su una tela a piena risoluzione, limitata a 1,5× di densità di pixel,
  con al massimo 70 nodi.

L'animazione si ferma da sola quando la scheda passa in secondo piano.
Misurato a 60 fps e con una variazione media fra fotogrammi consecutivi di 0,13 su
255 — sotto la soglia percepibile — anche senza accelerazione grafica.

Il resto del movimento è in `framer-motion`: transizione in dissolvenza a ogni cambio
di pagina, alone che segue il puntatore dentro le schede, scintille quando si mette un
apprezzamento, barra di avanzamento della lettura,
titoli che salgono a scaglioni, numeri che contano, schede che si sollevano con un
alone del proprio colore, filo colorato che attraversa la scheda al passaggio del mouse.
Tutto rispetta `prefers-reduced-motion`: chi ha chiesto meno animazioni vede una
versione ferma.

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
    membri/                   elenco degli iscritti con i distintivi di ruolo
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
  utenti-di-prova.sql         tre profili italiani completi, con contenuti, collegamenti
                              e cinque proposte in coda di moderazione
  collaudo/                   verifica locale delle regole di sicurezza
```

## Sicurezza

Le regole non stanno nell'interfaccia ma nel database (Row Level Security):

- un post nasce **sempre** in stato `pending`, qualunque cosa invii il client;
- solo un amministratore può cambiarne lo stato;
- nessuno può nominarsi amministratore modificando il proprio profilo;
- i contatori (apprezzamenti, commenti, follower) non sono scrivibili dagli utenti;
- gli elenchi follower/seguiti sono leggibili solo da chi segue quel profilo;
- nell'archivio file ciascuno scrive solo nella propria cartella;
- le notifiche sono leggibili solo dal destinatario e non sono creabili dai client:
  nascono unicamente dai trigger del database.

Queste regole sono verificate da `supabase/collaudo/verifiche.sql`, che simula quattro
utenti diversi (un autore, due lettori, l'amministratore) e controlla 20 comportamenti,
compreso che la sicurezza a livello di riga sia **attiva** su ogni tabella: le policy
da sole non filtrano nulla se quella riga manca.

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

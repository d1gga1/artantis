# ARTANTIS — Guida per metterlo online

*Scritta per chi non è tecnico. Segui i passi in ordine: non serve saper programmare,
serve solo copiare e incollare con attenzione.*

Tempo necessario: circa **40 minuti** la prima volta.

---

## Cosa ti serve prima di cominciare

Tre account, tutti **gratuiti**, da creare con la stessa email:

1. **GitHub** — [github.com](https://github.com) → qui vive il codice del sito
2. **Supabase** — [supabase.com](https://supabase.com) → qui vivono gli account, i post e i file
3. **Vercel** — [vercel.com](https://vercel.com) → qui il sito diventa raggiungibile da tutti

Tieni a portata di mano la cartella `artantis` che hai scaricato.

---

## PASSO 1 — Crea l'archivio dati su Supabase

1. Vai su [supabase.com](https://supabase.com) e clicca **Start your project**. Accedi con GitHub.
2. Clicca **New project**.
3. Compila:
   - **Name**: `artantis`
   - **Database Password**: clicca *Generate a password* e **salvala** in un posto sicuro
     (ti servirà solo in casi eccezionali, ma non è recuperabile)
   - **Region**: `West EU (Ireland)` oppure `Central EU (Frankfurt)` — le più vicine all'Italia
4. Clicca **Create new project** e aspetta 2-3 minuti che finisca di prepararsi.

---

## PASSO 2 — Costruisci le tabelle

1. Nel menu a sinistra clicca l'icona **SQL Editor** (simbolo `>_`).
2. Clicca **New query**.
3. Apri sul tuo computer il file `supabase/schema.sql` (con Blocco note, TextEdit o
   qualunque editor di testo), **seleziona tutto** (Ctrl+A / Cmd+A) e **copia**.
4. Incolla nel riquadro bianco di Supabase.
5. Clicca **Run** in basso a destra.

Deve comparire **Success. No rows returned**. Se compare un errore in rosso, non
proseguire: riparti dal punto 3 assicurandoti di aver copiato *tutto* il file.

> Questo passo si esegue **una sola volta**. Non va ripetuto a ogni aggiornamento del sito.

---

## PASSO 3 — Sistema l'accesso degli utenti

Nel menu a sinistra: **Authentication** → **Sign In / Providers** → **Email**.

- Lascia **Enable Email provider** acceso.
- **Confirm email**: per iniziare ti conviene **spegnerlo**. Così chi si registra entra
  subito, senza dover confermare l'indirizzo via email.
  Quando il sito sarà avviato potrai riaccenderlo (vedi la sezione *Conferma email* in
  fondo alla guida): è più sicuro, ma richiede un passaggio in più.

Poi vai in **Authentication** → **URL Configuration** e tieni aperta questa pagina:
ci torniamo al PASSO 6, quando conoscerai l'indirizzo del sito.

---

## PASSO 4 — Carica il codice su GitHub

1. Sul tuo computer apri la cartella `artantis`.
   Se ci fossero le cartelle `node_modules` e `.next`, **cancellale**: sono file
   temporanei pesantissimi e non servono.
2. Vai su [github.com/new](https://github.com/new).
3. **Repository name**: `artantis` · seleziona **Private** · clicca **Create repository**.
4. Nella pagina che si apre clicca il link **uploading an existing file**.
5. Trascina dentro **tutto il contenuto** della cartella `artantis` (non la cartella
   stessa: apri la cartella, seleziona tutto quello che c'è dentro e trascinalo).
6. In basso clicca **Commit changes** e attendi il caricamento.

---

## PASSO 5 — Pubblica il sito con Vercel

1. Vai su [vercel.com](https://vercel.com) e accedi **con GitHub**.
2. Clicca **Add New...** → **Project**.
3. Accanto a `artantis` clicca **Import**.
4. **Non cliccare ancora Deploy.** Apri prima la sezione **Environment Variables** e
   aggiungi queste due voci:

   | Name (nome) | Value (valore) |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | il *Project URL* di Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | la chiave *anon public* di Supabase |

   **Dove trovo questi due valori?** In Supabase: menu a sinistra → **Project Settings**
   (l'ingranaggio) → **API Keys** / **Data API**. Copia il **Project URL** (comincia con
   `https://` e finisce con `.supabase.co`) e la chiave chiamata **anon** / **public**
   (è una stringa lunghissima: copiala tutta).

5. Clicca **Deploy** e aspetta 2-3 minuti.

Al termine Vercel ti mostra l'indirizzo del sito, del tipo
`artantis-xxxx.vercel.app`. **Aprilo: ARTANTIS è online.**

---

## PASSO 6 — Di' a Supabase qual è l'indirizzo del sito

Torna in Supabase → **Authentication** → **URL Configuration**:

- **Site URL**: incolla l'indirizzo del sito (es. `https://artantis-xxxx.vercel.app`)
- **Redirect URLs**: clicca *Add URL* e inserisci `https://artantis-xxxx.vercel.app/**`
  (con i due asterischi finali)

Clicca **Save**. Senza questo passaggio l'accesso può non funzionare correttamente.

---

## PASSO 7 — Rendi il Dott. Vincenzo Silvano amministratore

Questo è il passaggio che attiva la moderazione.

1. Apri il sito e clicca **Crea profilo**.
2. Registra l'account del **Dott. Vincenzo Silvano** con la sua email vera.
3. Torna in Supabase → **SQL Editor** → **New query** e incolla questo,
   sostituendo l'indirizzo con quello che hai appena usato:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'email-di-vincenzo@esempio.it');
```

4. Clicca **Run**.
5. Ricarica il sito: nella barra in alto comparirà la voce **Moderazione**.

Da quel momento ogni contenuto proposto da chiunque finisce nella sua coda, e nessuno
lo vede finché lui non lo approva.

> Lo stesso comando serve se un giorno vorrai aggiungere un secondo moderatore.
> Per togliere i permessi a qualcuno, cambia `true` in `false`.

---

## PASSO 8 (facoltativo) — Tre utenze di prova

Un sito vuoto non si valuta bene. Con un passaggio puoi popolarlo con tre profili
italiani completi — una ricercatrice, un cardiologo, una pittrice — che hanno già
i loro contenuti pubblicati, si seguono a vicenda e si commentano.

Lo stesso comando mette anche **cinque proposte in attesa** nella coda di Vincenzo,
di qualità volutamente diversa fra loro: due da pubblicare a occhi chiusi, una da
valutare, una troppo scarna, una promozionale. Servono a provare davvero il
pannello di moderazione, non solo a vederlo pieno.

1. Supabase → **SQL Editor** → **New query**
2. Apri sul computer il file `supabase/utenti-di-prova.sql`, seleziona tutto, copia
3. Incolla e clicca **Run**

Le password di accesso sono scritte in fondo a quel file, se vuoi entrare nei loro
panni per vedere il sito dal punto di vista di un membro qualsiasi.

Quando il sito sarà avviato davvero, per rimuoverle basta una riga:

```sql
delete from auth.users where email like '%@artantis.test';
```

Il comando si può rieseguire quante volte vuoi: rimette sempre le stesse tre utenze,
non ne crea di doppie.

---

## PASSO 9 (facoltativo) — Metti il tuo dominio

Se hai comprato un dominio, per esempio `artantis.it`:

1. Vercel → il progetto → **Settings** → **Domains** → **Add**.
2. Scrivi `artantis.it` e segui le istruzioni che Vercel ti mostra: dovrai copiare
   due valori nel pannello di chi ti ha venduto il dominio (Aruba, GoDaddy, Namecheap…).
3. Quando il dominio è attivo, **torna al PASSO 6** e aggiorna Site URL e Redirect URLs
   con il nuovo indirizzo.

---

## Come funziona ARTANTIS, in breve

| Chi | Cosa può fare |
|---|---|
| Chiunque, anche senza account | Leggere tutti i contenuti pubblicati, aprire i profili |
| Chi ha un profilo | Apprezzare, commentare, ricondividere, seguire, proporre contenuti |
| Chi segue una persona | Vedere l'elenco dei suoi follower e di chi segue |
| Dott. Vincenzo Silvano (amministratore) | Vedere ogni proposta e decidere se pubblicarla o rifiutarla |

Un contenuto proposto **non è visibile a nessuno** (tranne al suo autore e
all'amministratore) finché non viene approvato. Questa regola è scritta dentro il
database, non solo nelle pagine: nemmeno chi provasse a forzare il sito dall'esterno
potrebbe pubblicare qualcosa saltando la revisione.

---

## Domande frequenti

**Come funzionano le notifiche?**
In alto a destra c'è una campanella. Quando arriva qualcosa compare un pallino rosso
con il numero, e per qualche secondo si affaccia un riquadro sulla destra. Arrivano
quando la direzione editoriale approva o rifiuta una proposta, e quando qualcuno
mette un apprezzamento, commenta, ricondivide o inizia a seguire. Il sito controlla
se c'è qualcosa di nuovo ogni venticinque secondi e appena si torna sulla scheda.

**Dove vedo tutti gli iscritti?**
Nella voce **Membri** della barra in alto. Ci sono tutti, in ordine: prima chi ha
i permessi di direzione editoriale (con il distintivo nero **ADMIN**), poi tutti
gli altri con il distintivo **MEMBRO** e la loro disciplina.

**Come modifico un testo del sito?**
Su GitHub apri il file, clicca l'icona della matita, cambia il testo e clicca *Commit
changes*. Vercel ripubblica il sito da solo in un paio di minuti.

**Dove finiscono le immagini e i video caricati?**
Nell'archivio di Supabase, sezione **Storage** → cartella `media`. Ogni utente ha una
sua sottocartella e può scrivere solo dentro la propria.

**Quanto costa?**
I piani gratuiti bastano per partire: Supabase offre 500 MB di database e 1 GB di file,
Vercel 100 GB di traffico al mese. Quando cresci, il primo limite che incontrerai è
lo spazio per i video.

**Un utente ha caricato qualcosa di inappropriato che era già stato approvato.**
Dal pannello **Moderazione** → *Storico decisioni* puoi ritrovare il contenuto.
Per rimuoverlo dal feed, in Supabase → **Table Editor** → tabella `posts` → cambia
il campo `status` da `approved` a `rejected`.

**Voglio vedere com'è il sito prima di configurare tutto.**
Aggiungi su Vercel la variabile `ARTANTIS_DEMO` con valore `1`: il sito mostrerà
contenuti di esempio senza toccare il database. **Ricordati di rimuoverla** prima
di aprirlo al pubblico.

**Conferma email: come la riattivo?**
In Supabase → Authentication → Providers → Email → accendi *Confirm email*.
Poi vai in **Authentication → Emails → Confirm signup** e sostituisci il link del
modello con:
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
Il sito è già predisposto per gestirlo.

---

## Nota sulla riservatezza dei dati

I campi *email di contatto*, *telefono* e *data di nascita* dell'area personale sono
pensati per essere **pubblici**: chiunque visiti un profilo li vede. È una scelta
voluta, perché servono a farsi contattare.

Nel modulo lo diciamo esplicitamente all'utente («inserisci solo ciò che vuoi
condividere»), ma se preferisci renderli visibili solo a chi ha un account, scrivimelo
e ti preparo la modifica: sono poche righe da cambiare.

---

## Se qualcosa non funziona

- **Il sito mostra "Manca ancora un passaggio"** → le due variabili di Vercel sono
  sbagliate o mancanti. Rifai il PASSO 5, punto 4, poi Vercel → *Deployments* →
  sui tre puntini dell'ultimo → **Redeploy**.
- **Non riesco ad accedere dopo la registrazione** → controlla il PASSO 3
  (*Confirm email* spento) e il PASSO 6 (Site URL corretto).
- **La voce Moderazione non compare** → il comando del PASSO 7 non è andato a buon
  fine: verifica di aver scritto l'email esatta usata in fase di registrazione.
- **Un caricamento di file fallisce** → controlla che il file rispetti i limiti
  (immagini fino a 12 MB, video fino a 90 MB).

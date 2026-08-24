-- =============================================================================
-- ARTANTIS — tre utenze di prova
--
-- Da incollare nell'SQL Editor di Supabase DOPO aver eseguito schema.sql.
-- Crea tre profili italiani completi, con i loro contenuti già pubblicati e
-- qualche collegamento fra loro, così il sito non è mai vuoto.
--
-- Password di accesso per tutti e tre:  artantis2026
--
-- Si può rieseguire quante volte si vuole: rimuove e ricrea le stesse tre
-- utenze. Per cancellarle definitivamente vedi l'ultima riga del file.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ripulisce eventuali esecuzioni precedenti
-- -----------------------------------------------------------------------------
delete from auth.users
where email in ('sofia.marchetti@artantis.test',
                'davide.colombo@artantis.test',
                'chiara.bruno@artantis.test');

-- -----------------------------------------------------------------------------
-- 2. Crea le tre utenze
--    Il trigger on_auth_user_created genera in automatico i profili
--    leggendo nome, nome utente e professione da qui sotto.
-- -----------------------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000000',
   'a1000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated',
   'sofia.marchetti@artantis.test',
   extensions.crypt('artantis2026', extensions.gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Sofia Marchetti","username":"sofiamarchetti","profession":"ricercatore"}',
   now() - interval '54 days', now()),

  ('00000000-0000-0000-0000-000000000000',
   'a1000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated',
   'davide.colombo@artantis.test',
   extensions.crypt('artantis2026', extensions.gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Davide Colombo","username":"davidecolombo","profession":"medico"}',
   now() - interval '41 days', now()),

  ('00000000-0000-0000-0000-000000000000',
   'a1000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated',
   'chiara.bruno@artantis.test',
   extensions.crypt('artantis2026', extensions.gen_salt('bf')),
   now(),
   '{"provider":"email","providers":["email"]}',
   '{"full_name":"Chiara Bruno","username":"chiarabruno","profession":"pittore"}',
   now() - interval '27 days', now());

-- -----------------------------------------------------------------------------
-- 3. Registra il metodo di accesso "email" per ciascuna utenza.
--    Il blocco si adatta da solo alle diverse versioni di Supabase.
-- -----------------------------------------------------------------------------
do $$
declare
  has_provider_id boolean;
  u record;
begin
  select exists (
    select 1 from information_schema.columns
    where table_schema = 'auth' and table_name = 'identities' and column_name = 'provider_id'
  ) into has_provider_id;

  for u in
    select id, email from auth.users
    where email in ('sofia.marchetti@artantis.test',
                    'davide.colombo@artantis.test',
                    'chiara.bruno@artantis.test')
  loop
    if has_provider_id then
      execute $q$
        insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        values (gen_random_uuid(), $1, $1::text,
                jsonb_build_object('sub', $1::text, 'email', $2, 'email_verified', true),
                'email', now(), now(), now())
        on conflict do nothing
      $q$ using u.id, u.email;
    else
      execute $q$
        insert into auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        values (gen_random_uuid(), $1,
                jsonb_build_object('sub', $1::text, 'email', $2, 'email_verified', true),
                'email', now(), now(), now())
        on conflict do nothing
      $q$ using u.id, u.email;
    end if;
  end loop;
end $$;

-- -----------------------------------------------------------------------------
-- 4. Completa i tre profili
-- -----------------------------------------------------------------------------
update public.profiles set
  bio = 'Biologa molecolare all''Università di Padova. Studio come il microbiota intestinale anticipa i segnali dell''infiammazione cronica. Scrivo di ricerca in modo che si capisca.',
  city = 'Padova',
  public_email = 'sofia.marchetti@artantis.test',
  instagram = 'sofia.marchetti.lab',
  birth_date = '1989-03-14',
  created_at = now() - interval '54 days'
where username = 'sofiamarchetti';

update public.profiles set
  bio = 'Cardiologo, ospedale di Milano. Mi occupo di prevenzione e di far capire alle persone cosa c''è scritto davvero nei loro referti.',
  city = 'Milano',
  public_email = 'davide.colombo@artantis.test',
  phone = '+39 02 0000000',
  facebook = 'davide.colombo.cardiologia',
  birth_date = '1978-11-02',
  created_at = now() - interval '41 days'
where username = 'davidecolombo';

update public.profiles set
  bio = 'Pittura a olio, ritratti e interni. Lavoro sulla luce delle stanze vuote. Studio in un ex laboratorio tessile a Prato.',
  city = 'Firenze',
  public_email = 'chiara.bruno@artantis.test',
  instagram = 'chiarabruno.studio',
  website = 'https://chiarabruno.example',
  birth_date = '1992-06-27',
  created_at = now() - interval '27 days'
where username = 'chiarabruno';

-- -----------------------------------------------------------------------------
-- 5. I loro contenuti, già approvati e visibili nel feed
-- -----------------------------------------------------------------------------
insert into public.posts (id, author_id, title, content, category, created_at)
values
  ('b1000000-0000-4000-8000-000000000001',
   (select id from public.profiles where username = 'sofiamarchetti'),
   'Quello che i nostri dati dicono davvero sul microbiota',
   'Abbiamo seguito 214 persone per diciotto mesi. La domanda era semplice: la composizione del microbiota intestinale cambia prima o dopo la comparsa dei marcatori infiammatori?

La risposta breve è: prima. Nei soggetti che hanno poi sviluppato un quadro infiammatorio, la diversità batterica iniziava a ridursi in media undici settimane prima che qualunque esame del sangue mostrasse un''alterazione.

Questo non significa che il microbiota causi l''infiammazione. Significa che potrebbe essere un segnale precoce, e che vale la pena studiarlo come tale. Nei prossimi mesi pubblicheremo il dataset completo.',
   'ricerca', now() - interval '6 days'),

  ('b1000000-0000-4000-8000-000000000002',
   (select id from public.profiles where username = 'davidecolombo'),
   'Come si legge un referto cardiologico senza spaventarsi',
   'Ogni settimana ricevo messaggi di persone terrorizzate da una sigla su un foglio. Facciamo ordine su tre voci che compaiono quasi sempre e che quasi sempre vengono fraintese.

1. Frazione di eiezione. È la percentuale di sangue che il ventricolo sinistro espelle a ogni battito. Sopra il 50% si considera normale. Un 55% non è "quasi malato": è normale.

2. Extrasistoli sporadiche. Il cuore di chiunque ne fa. Il numero conta più della presenza.

3. Insufficienza valvolare lieve. La parola insufficienza suona grave, ma nella grande maggioranza dei referti descrive un reperto che non richiede nulla, se non un controllo nel tempo.',
   'divulgazione', now() - interval '4 days'),

  ('b1000000-0000-4000-8000-000000000003',
   (select id from public.profiles where username = 'chiarabruno'),
   'Stanza con finestra a nord',
   'Tre mesi su una tela di un metro e venti. La luce del nord non cambia quasi mai durante il giorno: è la ragione per cui i pittori l''hanno sempre cercata, e la ragione per cui a un certo punto diventa insopportabile.

Ho dipinto la stessa parete undici volte prima di trovare il grigio giusto. Le prime dieci erano tutte più belle di quella definitiva, e tutte sbagliate.',
   'opera', now() - interval '2 days'),

  ('b1000000-0000-4000-8000-000000000004',
   (select id from public.profiles where username = 'sofiamarchetti'),
   'Tre cose che nessuno dice sui campioni biologici',
   'Il novanta per cento del lavoro di un laboratorio non è l''esperimento: è tenere in ordine i campioni. Etichette, temperature, catena del freddo, moduli firmati.

Non è la parte che finisce nelle fotografie, ma è quella che decide se uno studio vale qualcosa oppure no.',
   'ricerca', now() - interval '18 days');

-- approvazione (qui l'SQL Editor agisce con i permessi della direzione editoriale)
update public.posts
set status = 'approved', published_at = created_at
where id in ('b1000000-0000-4000-8000-000000000001',
             'b1000000-0000-4000-8000-000000000002',
             'b1000000-0000-4000-8000-000000000003',
             'b1000000-0000-4000-8000-000000000004');

-- -----------------------------------------------------------------------------
-- 6. Qualche collegamento fra loro, così la rete non è vuota
-- -----------------------------------------------------------------------------
insert into public.follows (follower_id, following_id)
select a.id, b.id from public.profiles a, public.profiles b
where (a.username, b.username) in (
  ('davidecolombo', 'sofiamarchetti'),
  ('chiarabruno',   'sofiamarchetti'),
  ('sofiamarchetti','davidecolombo'),
  ('chiarabruno',   'davidecolombo'),
  ('sofiamarchetti','chiarabruno')
)
on conflict do nothing;

-- qualche apprezzamento e un commento
insert into public.likes (post_id, user_id)
select p.id, u.id
from public.posts p, public.profiles u
where p.id in ('b1000000-0000-4000-8000-000000000001','b1000000-0000-4000-8000-000000000003')
  and u.username in ('davidecolombo','chiarabruno','sofiamarchetti')
  and u.id <> p.author_id
on conflict do nothing;

insert into public.comments (post_id, author_id, content)
values
  ('b1000000-0000-4000-8000-000000000001',
   (select id from public.profiles where username = 'davidecolombo'),
   'Dato interessantissimo. Avete controllato l''effetto della dieta nelle undici settimane precedenti?'),
  ('b1000000-0000-4000-8000-000000000003',
   (select id from public.profiles where username = 'sofiamarchetti'),
   'Le prime dieci sbagliate sono la parte che mi interessa di più. Le mostrerai mai?');

-- =============================================================================
-- FATTO. Ora sul sito compaiono tre membri con i loro contenuti.
--
-- Accesso di prova:
--   sofia.marchetti@artantis.test   /  artantis2026
--   davide.colombo@artantis.test    /  artantis2026
--   chiara.bruno@artantis.test      /  artantis2026
--
-- Per rimuoverle quando il sito sarà avviato, esegui solo questa riga:
--
-- delete from auth.users where email like '%@artantis.test';
-- =============================================================================

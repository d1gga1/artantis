-- Collaudo delle regole di sicurezza (solo ambiente di test locale).
\set ON_ERROR_STOP on
\pset pager off

-- Tre persone si registrano + l'amministratore.
insert into auth.users (id, email, raw_user_meta_data) values
 ('11111111-1111-1111-1111-111111111111','anna@test.it','{"full_name":"Anna Ricci","username":"anna","profession":"ricercatore"}'),
 ('22222222-2222-2222-2222-222222222222','bruno@test.it','{"full_name":"Bruno Testa","username":"bruno","profession":"medico"}'),
 ('33333333-3333-3333-3333-333333333333','carla@test.it','{"full_name":"Carla Neri","username":"carla","profession":"pittore"}'),
 ('99999999-9999-9999-9999-999999999999','vincenzo@test.it','{"full_name":"Vincenzo Silva","username":"vincenzo"}');

update public.profiles set is_admin = true where id = '99999999-9999-9999-9999-999999999999';

\echo '--- 1. Il trigger crea i profili con nome utente corretto'
select username, full_name, profession, is_admin from public.profiles order by username;

set role authenticated;

\echo '--- 2. Anna propone un post: lo stato deve essere forzato a pending'
set test.uid = '11111111-1111-1111-1111-111111111111';
insert into public.posts (id, author_id, title, content, status, published_at)
values ('aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',
        'Studio sul microbiota','Testo di prova','approved', now());
select status is not distinct from 'pending' as forzato_a_pending,
       published_at is null as senza_data_pubblicazione
from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';

\echo '--- 3. Anna prova ad auto-approvarsi: deve restare pending'
update public.posts set status = 'approved' where id = 'aaaaaaa1-0000-0000-0000-000000000001';
select status as stato_dopo_tentativo from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';

\echo '--- 4. Anna prova a nominarsi amministratore: deve restare falso'
update public.profiles set is_admin = true where id = '11111111-1111-1111-1111-111111111111';
select is_admin as e_admin from public.profiles where id = '11111111-1111-1111-1111-111111111111';

\echo '--- 5. Un visitatore non registrato NON deve vedere il post in attesa'
reset role; set role anon; set test.uid = '';
select count(*) as post_visibili_ai_visitatori from public.posts;

\echo '--- 6. Vincenzo (admin) vede la coda e approva'
reset role; set role authenticated;
set test.uid = '99999999-9999-9999-9999-999999999999';
select count(*) as post_visibili_all_admin from public.posts;
update public.posts set status = 'approved' where id = 'aaaaaaa1-0000-0000-0000-000000000001';
select status, published_at is not null as ha_data, reviewed_by = '99999999-9999-9999-9999-999999999999' as revisore_corretto
from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';
select post_count as post_pubblici_di_anna from public.profiles where username = 'anna';

\echo '--- 7. Ora il visitatore non registrato vede il post approvato'
reset role; set role anon; set test.uid = '';
select count(*) as post_visibili_ai_visitatori from public.posts;

\echo '--- 8. Il visitatore non registrato NON puo mettere like'
do $$
begin
  insert into public.likes (post_id, user_id)
  values ('aaaaaaa1-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111');
  raise notice 'PROBLEMA: like consentito a un non registrato';
exception when insufficient_privilege or others then
  raise notice 'OK: like bloccato per i non registrati';
end $$;

\echo '--- 9. Bruno mette like e commenta: i contatori salgono'
reset role; set role authenticated;
set test.uid = '22222222-2222-2222-2222-222222222222';
insert into public.likes (post_id, user_id) values ('aaaaaaa1-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222');
insert into public.comments (post_id, author_id, content) values ('aaaaaaa1-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222','Molto interessante.');
insert into public.reposts (post_id, user_id) values ('aaaaaaa1-0000-0000-0000-000000000001','22222222-2222-2222-2222-222222222222');
select like_count, comment_count, repost_count from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';

\echo '--- 10. Bruno segue Anna: i contatori dei follower si aggiornano'
insert into public.follows (follower_id, following_id) values ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111');
select follower_count from public.profiles where username = 'anna';
select following_count from public.profiles where username = 'bruno';

\echo '--- 11. REGOLA CHIAVE: Bruno segue Anna, quindi vede i follower di Anna'
select count(*) as follower_di_anna_visti_da_bruno from public.follows where following_id = '11111111-1111-1111-1111-111111111111';

\echo '--- 12. REGOLA CHIAVE: Carla NON segue Anna, quindi non vede la sua rete'
set test.uid = '33333333-3333-3333-3333-333333333333';
select count(*) as follower_di_anna_visti_da_carla from public.follows where following_id = '11111111-1111-1111-1111-111111111111';

\echo '--- 13. Anna vede sempre i propri follower'
set test.uid = '11111111-1111-1111-1111-111111111111';
select count(*) as follower_di_anna_visti_da_anna from public.follows where following_id = '11111111-1111-1111-1111-111111111111';

\echo '--- 14. Rifiuto con motivazione'
set test.uid = '33333333-3333-3333-3333-333333333333';
insert into public.posts (id, author_id, content) values ('aaaaaaa1-0000-0000-0000-000000000002','33333333-3333-3333-3333-333333333333','Bozza da rivedere');
set test.uid = '99999999-9999-9999-9999-999999999999';
update public.posts set status = 'rejected', rejection_reason = 'Serve una fonte' where id = 'aaaaaaa1-0000-0000-0000-000000000002';
select status, rejection_reason from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000002';

\echo '--- 15. Il post rifiutato resta invisibile al pubblico'
reset role; set role anon; set test.uid = '';
select count(*) as post_visibili_ai_visitatori from public.posts;

\echo '--- 16. Bruno toglie il like: il contatore torna indietro'
reset role; set role authenticated;
set test.uid = '22222222-2222-2222-2222-222222222222';
delete from public.likes where post_id = 'aaaaaaa1-0000-0000-0000-000000000001' and user_id = '22222222-2222-2222-2222-222222222222';
select like_count from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';

\echo '--- 17. Bruno non puo cancellare i commenti altrui ne i post altrui'
delete from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';
select count(*) as post_ancora_presente from public.posts where id = 'aaaaaaa1-0000-0000-0000-000000000001';

reset role;
\echo '--- COLLAUDO COMPLETATO ---'

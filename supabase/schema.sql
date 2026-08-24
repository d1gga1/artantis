-- =============================================================================
-- ARTANTIS by Silvano Vincenzo — struttura completa del database
-- Da incollare nell'SQL Editor di Supabase ed eseguire UNA SOLA VOLTA.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILI
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text unique not null,
  full_name      text not null default '',
  bio            text default '',
  profession     text default 'altro',
  birth_date     date,
  phone          text,
  public_email   text,
  instagram      text,
  facebook       text,
  website        text,
  city           text,
  avatar_url     text,
  cover_url      text,
  is_admin       boolean not null default false,
  post_count     integer not null default 0,
  follower_count integer not null default 0,
  following_count integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_.]{3,30}$'),
  constraint profession_valid check (profession in (
    'ricercatore','medico','artista','pittore','arte_e_benessere','farmacista','altro'
  ))
);

-- -----------------------------------------------------------------------------
-- 2. POST (con coda di approvazione)
-- -----------------------------------------------------------------------------
create table if not exists public.posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,
  title         text default '',
  content       text not null default '',
  category      text default 'generale',
  status        text not null default 'pending',
  rejection_reason text,
  reviewed_by   uuid references public.profiles(id) on delete set null,
  reviewed_at   timestamptz,
  published_at  timestamptz,
  like_count    integer not null default 0,
  comment_count integer not null default 0,
  repost_count  integer not null default 0,
  created_at    timestamptz not null default now(),
  constraint status_valid check (status in ('pending','approved','rejected'))
);
create index if not exists posts_status_published_idx on public.posts (status, published_at desc);
create index if not exists posts_author_idx on public.posts (author_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 3. MEDIA ALLEGATI AL POST (immagini, video, gif)
-- -----------------------------------------------------------------------------
create table if not exists public.post_media (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  url        text not null,
  media_type text not null default 'image',
  position   integer not null default 0,
  constraint media_type_valid check (media_type in ('image','video','gif'))
);
create index if not exists post_media_post_idx on public.post_media (post_id, position);

-- -----------------------------------------------------------------------------
-- 4. LIKE / COMMENTI / REPOST / FOLLOW
-- -----------------------------------------------------------------------------
create table if not exists public.likes (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

create table if not exists public.reposts (
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);

-- -----------------------------------------------------------------------------
-- 4-bis. NOTIFICHE
-- -----------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,  -- chi la riceve
  actor_id   uuid references public.profiles(id) on delete cascade,           -- chi l'ha provocata
  type       text not null,
  post_id    uuid references public.posts(id) on delete cascade,
  read       boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notification_type_valid check (type in (
    'post_approved','post_rejected','like','comment','repost','follow'
  ))
);

create index if not exists notifications_inbox_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_unread_idx
  on public.notifications (user_id) where read = false;

-- Evita il diluvio: se qualcuno toglie e rimette un apprezzamento, la notifica
-- resta una sola. Stessa cosa per follow e ricondivisioni.
create unique index if not exists notifications_dedup_idx on public.notifications (
  user_id, type,
  coalesce(actor_id, '00000000-0000-0000-0000-000000000000'::uuid),
  coalesce(post_id,  '00000000-0000-0000-0000-000000000000'::uuid)
);

-- -----------------------------------------------------------------------------
-- 5. FUNZIONI DI SUPPORTO (security definer: leggono ignorando le RLS,
--    servono a evitare ricorsioni infinite nelle policy)
-- -----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Vero quando l'operazione arriva dall'amministratore oppure dall'SQL Editor di
-- Supabase / dalle funzioni di servizio (dove non esiste un utente collegato).
create or replace function public.is_privileged()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is null or public.is_admin();
$$;

create or replace function public.viewer_follows(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.follows f
    where f.follower_id = auth.uid() and f.following_id = target
  );
$$;

-- Chi può vedere la lista follower/following di un profilo:
-- il profilo stesso, chi lo segue, oppure l'amministratore.
create or replace function public.can_see_network(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() = target
      or public.viewer_follows(target)
      or public.is_admin();
$$;

create or replace function public.post_is_visible(p_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.posts p
    where p.id = p_id
      and (p.status = 'approved' or p.author_id = auth.uid() or public.is_admin())
  );
$$;

-- -----------------------------------------------------------------------------
-- 6. CREAZIONE AUTOMATICA DEL PROFILO ALLA REGISTRAZIONE
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  suffix integer := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    '[^a-z0-9_.]', '', 'g'
  ));
  if length(base_username) < 3 then
    base_username := 'utente' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  base_username := substr(base_username, 1, 24);
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, profession, public_email)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'profession', 'altro'),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 7. CONTATORI AUTOMATICI
-- -----------------------------------------------------------------------------
create or replace function public.bump_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
  else
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists likes_counter on public.likes;
create trigger likes_counter after insert or delete on public.likes
  for each row execute function public.bump_like_count();

create or replace function public.bump_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
  else
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists comments_counter on public.comments;
create trigger comments_counter after insert or delete on public.comments
  for each row execute function public.bump_comment_count();

create or replace function public.bump_repost_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set repost_count = repost_count + 1 where id = new.post_id;
  else
    update public.posts set repost_count = greatest(repost_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;
drop trigger if exists reposts_counter on public.reposts;
create trigger reposts_counter after insert or delete on public.reposts
  for each row execute function public.bump_repost_count();

create or replace function public.bump_follow_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.profiles set following_count = following_count + 1 where id = new.follower_id;
    update public.profiles set follower_count  = follower_count  + 1 where id = new.following_id;
  else
    update public.profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update public.profiles set follower_count  = greatest(follower_count  - 1, 0) where id = old.following_id;
  end if;
  return null;
end;
$$;
drop trigger if exists follows_counter on public.follows;
create trigger follows_counter after insert or delete on public.follows
  for each row execute function public.bump_follow_counts();

-- Il contatore dei post pubblici si aggiorna solo quando un post viene approvato.
create or replace function public.sync_post_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.status = 'approved' and old.status <> 'approved' then
      update public.profiles set post_count = post_count + 1 where id = new.author_id;
    elsif old.status = 'approved' and new.status <> 'approved' then
      update public.profiles set post_count = greatest(post_count - 1, 0) where id = new.author_id;
    end if;
  elsif tg_op = 'DELETE' and old.status = 'approved' then
    update public.profiles set post_count = greatest(post_count - 1, 0) where id = old.author_id;
  end if;
  return null;
end;
$$;
drop trigger if exists posts_count_sync on public.posts;
create trigger posts_count_sync after update or delete on public.posts
  for each row execute function public.sync_post_count();

-- Ogni post nasce SEMPRE in attesa di approvazione, qualunque cosa invii il client.
create or replace function public.force_pending_on_insert()
returns trigger language plpgsql set search_path = public as $$
begin
  new.status := 'pending';
  new.published_at := null;
  new.reviewed_by := null;
  new.reviewed_at := null;
  new.like_count := 0;
  new.comment_count := 0;
  new.repost_count := 0;
  return new;
end;
$$;
drop trigger if exists posts_force_pending on public.posts;
create trigger posts_force_pending before insert on public.posts
  for each row execute function public.force_pending_on_insert();

-- L'autore può correggere testo e titolo finché il post è in attesa,
-- ma non può cambiarne lo stato: quello lo decide solo l'amministratore.
create or replace function public.guard_post_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.is_privileged() then
    new.status := old.status;
    new.published_at := old.published_at;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.rejection_reason := old.rejection_reason;
  else
    if new.status = 'approved' and old.status <> 'approved' then
      new.published_at := coalesce(new.published_at, now());
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
      new.rejection_reason := null;
    elsif new.status = 'rejected' and old.status <> 'rejected' then
      new.reviewed_at := now();
      new.reviewed_by := auth.uid();
      new.published_at := null;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists posts_guard_update on public.posts;
create trigger posts_guard_update before update on public.posts
  for each row execute function public.guard_post_update();

-- Nessuno può auto-nominarsi amministratore modificando il proprio profilo.
create or replace function public.guard_profile_update()
returns trigger language plpgsql set search_path = public as $$
begin
  if not public.is_privileged() then
    new.is_admin := old.is_admin;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update before update on public.profiles
  for each row execute function public.guard_profile_update();

-- -----------------------------------------------------------------------------
-- 7-bis. CHI RICEVE COSA
--   Le notifiche nascono solo qui dentro: nessun client può fabbricarle.
-- -----------------------------------------------------------------------------
create or replace function public.notify(
  p_user uuid, p_actor uuid, p_type text, p_post uuid
) returns void language plpgsql security definer set search_path = public as $$
begin
  -- nessuno viene avvisato delle proprie azioni
  if p_user is null or p_user = p_actor then return; end if;

  insert into public.notifications (user_id, actor_id, type, post_id)
  values (p_user, p_actor, p_type, p_post)
  on conflict do nothing;
end;
$$;

create or replace function public.notify_like()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(
    (select author_id from public.posts where id = new.post_id),
    new.user_id, 'like', new.post_id
  );
  return null;
end;
$$;
drop trigger if exists likes_notify on public.likes;
create trigger likes_notify after insert on public.likes
  for each row execute function public.notify_like();

create or replace function public.notify_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(
    (select author_id from public.posts where id = new.post_id),
    new.author_id, 'comment', new.post_id
  );
  return null;
end;
$$;
drop trigger if exists comments_notify on public.comments;
create trigger comments_notify after insert on public.comments
  for each row execute function public.notify_comment();

create or replace function public.notify_repost()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(
    (select author_id from public.posts where id = new.post_id),
    new.user_id, 'repost', new.post_id
  );
  return null;
end;
$$;
drop trigger if exists reposts_notify on public.reposts;
create trigger reposts_notify after insert on public.reposts
  for each row execute function public.notify_repost();

create or replace function public.notify_follow()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(new.following_id, new.follower_id, 'follow', null);
  return null;
end;
$$;
drop trigger if exists follows_notify on public.follows;
create trigger follows_notify after insert on public.follows
  for each row execute function public.notify_follow();

-- L'esito della revisione: l'autore viene avvisato in entrambi i casi.
create or replace function public.notify_decision()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = old.status then return null; end if;

  if new.status = 'approved' then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (new.author_id, new.reviewed_by, 'post_approved', new.id)
    on conflict do nothing;
  elsif new.status = 'rejected' then
    insert into public.notifications (user_id, actor_id, type, post_id)
    values (new.author_id, new.reviewed_by, 'post_rejected', new.id)
    on conflict do nothing;
  end if;
  return null;
end;
$$;
drop trigger if exists posts_notify_decision on public.posts;
create trigger posts_notify_decision after update on public.posts
  for each row execute function public.notify_decision();

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.posts      enable row level security;
alter table public.post_media enable row level security;
alter table public.likes      enable row level security;
alter table public.comments   enable row level security;
alter table public.reposts    enable row level security;
alter table public.follows    enable row level security;
alter table public.notifications enable row level security;

-- PROFILI: schede pubbliche, modificabili solo dal proprietario.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- POST: chiunque vede gli approvati; l'autore vede anche i propri in attesa;
-- l'amministratore vede tutto.
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select using (
  status = 'approved' or author_id = auth.uid() or public.is_admin()
);

drop policy if exists posts_insert_own on public.posts;
create policy posts_insert_own on public.posts for insert
  with check (auth.uid() = author_id);

drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update
  using ((author_id = auth.uid() and status = 'pending') or public.is_admin())
  with check ((author_id = auth.uid()) or public.is_admin());

drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete
  using (author_id = auth.uid() or public.is_admin());

-- MEDIA: seguono la visibilità del post a cui appartengono.
drop policy if exists media_read on public.post_media;
create policy media_read on public.post_media for select
  using (public.post_is_visible(post_id));

drop policy if exists media_insert on public.post_media;
create policy media_insert on public.post_media for insert
  with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = auth.uid()));

drop policy if exists media_delete on public.post_media;
create policy media_delete on public.post_media for delete
  using (exists (select 1 from public.posts p where p.id = post_id and (p.author_id = auth.uid() or public.is_admin())));

-- LIKE: visibili a tutti, ma solo chi ha fatto l'accesso può metterli.
drop policy if exists likes_read on public.likes;
create policy likes_read on public.likes for select using (public.post_is_visible(post_id));

drop policy if exists likes_insert on public.likes;
create policy likes_insert on public.likes for insert
  with check (auth.uid() = user_id and public.post_is_visible(post_id));

drop policy if exists likes_delete on public.likes;
create policy likes_delete on public.likes for delete using (auth.uid() = user_id);

-- COMMENTI
drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments for select using (public.post_is_visible(post_id));

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments for insert
  with check (auth.uid() = author_id and public.post_is_visible(post_id));

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments for delete
  using (auth.uid() = author_id or public.is_admin());

-- REPOST
drop policy if exists reposts_read on public.reposts;
create policy reposts_read on public.reposts for select using (public.post_is_visible(post_id));

drop policy if exists reposts_insert on public.reposts;
create policy reposts_insert on public.reposts for insert
  with check (auth.uid() = user_id and public.post_is_visible(post_id));

drop policy if exists reposts_delete on public.reposts;
create policy reposts_delete on public.reposts for delete using (auth.uid() = user_id);

-- FOLLOW: la regola chiave richiesta.
-- Le liste follower/following di una persona sono leggibili SOLO da chi la segue
-- (oltre alla persona stessa e all'amministratore).
drop policy if exists follows_read on public.follows;
create policy follows_read on public.follows for select using (
  follower_id = auth.uid()
  or public.can_see_network(following_id)
  or public.can_see_network(follower_id)
);

drop policy if exists follows_insert on public.follows;
create policy follows_insert on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists follows_delete on public.follows;
create policy follows_delete on public.follows for delete
  using (auth.uid() = follower_id);

-- NOTIFICHE: ciascuno vede soltanto le proprie, e può solo segnarle come lette.
drop policy if exists notifications_read on public.notifications;
create policy notifications_read on public.notifications for select
  using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notifications_delete_own on public.notifications;
create policy notifications_delete_own on public.notifications for delete
  using (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 8-bis. PERMESSI SULLE COLONNE
-- I contatori (like, commenti, follower...) sono gestiti solo dal database:
-- togliamo agli utenti il permesso di scriverli direttamente.
-- -----------------------------------------------------------------------------
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert on public.profiles to authenticated;
grant update (
  username, full_name, bio, profession, birth_date, phone, public_email,
  instagram, facebook, website, city, avatar_url, cover_url, is_admin, updated_at
) on public.profiles to authenticated;

revoke all on public.posts from anon, authenticated;
grant select on public.posts to anon, authenticated;
grant insert, delete on public.posts to authenticated;
grant update (title, content, category, status, rejection_reason) on public.posts to authenticated;

grant select on public.post_media, public.likes, public.comments, public.reposts, public.follows
  to anon, authenticated;

-- le notifiche non si creano da fuori: si leggono, si segnano lette, si eliminano
revoke all on public.notifications from anon, authenticated;
grant select, delete on public.notifications to authenticated;
grant update (read) on public.notifications to authenticated;
grant insert, delete on public.post_media, public.likes, public.comments, public.reposts, public.follows
  to authenticated;

-- -----------------------------------------------------------------------------
-- 9. ARCHIVIO FILE (immagini, video, gif, foto profilo e copertina)
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 104857600)
on conflict (id) do update set public = true, file_size_limit = 104857600;

drop policy if exists "media pubblici in lettura" on storage.objects;
create policy "media pubblici in lettura" on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "carica nella propria cartella" on storage.objects;
create policy "carica nella propria cartella" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "aggiorna i propri file" on storage.objects;
create policy "aggiorna i propri file" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "elimina i propri file" on storage.objects;
create policy "elimina i propri file" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

-- -----------------------------------------------------------------------------
-- 10. RICERCA PROFILI (usata dalla pagina Esplora)
-- -----------------------------------------------------------------------------
create index if not exists profiles_search_idx
  on public.profiles using gin (to_tsvector('simple', coalesce(full_name,'') || ' ' || coalesce(username,'') || ' ' || coalesce(bio,'')));

-- =============================================================================
-- FATTO. Ultimo passaggio, da eseguire DOPO che Vincenzo si è registrato sul
-- sito: sostituisci l'indirizzo qui sotto con la sua email e lancia la riga.
-- =============================================================================
-- update public.profiles set is_admin = true
-- where id = (select id from auth.users where email = 'email-di-vincenzo@esempio.it');

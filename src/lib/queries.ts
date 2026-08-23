import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor, Post, Profile } from "@/lib/types";
import {
  DEMO_COMMENTS,
  DEMO_PENDING,
  DEMO_POSTS,
  DEMO_PROFILES,
} from "@/lib/demo-data";

/**
 * MODALITÀ ANTEPRIMA
 * Impostando la variabile d'ambiente ARTANTIS_DEMO=1 il sito mostra contenuti
 * di esempio senza collegarsi a Supabase: serve solo per vedere l'aspetto del
 * sito prima di configurare l'archivio dati. In produzione va lasciata spenta.
 */
const DEMO = process.env.ARTANTIS_DEMO === "1";

export const POST_SELECT = `
  id, author_id, title, content, category, status, rejection_reason,
  published_at, created_at, like_count, comment_count, repost_count,
  author:profiles!posts_author_id_fkey ( id, username, full_name, avatar_url, profession ),
  media:post_media ( id, post_id, url, media_type, position )
`;

function sortMedia(posts: Post[]) {
  posts.forEach((p) => p.media?.sort((a, b) => a.position - b.position));
  return posts;
}

export async function getSessionUser() {
  if (DEMO) return { id: DEMO_PROFILES[0].id } as { id: string };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  if (DEMO) {
    // ARTANTIS_DEMO_GUEST=1 mostra l'anteprima come la vede un visitatore.
    if (process.env.ARTANTIS_DEMO_GUEST === "1") return null;
    return { ...DEMO_PROFILES[0], is_admin: true };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? null;
}

export async function getFeed({
  limit = 20,
  profession,
  followingOf,
}: {
  limit?: number;
  profession?: string;
  followingOf?: string;
} = {}): Promise<Post[]> {
  if (DEMO) return DEMO_POSTS;
  const supabase = await createClient();

  let authorFilter: string[] | null = null;
  if (followingOf) {
    const { data: rows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", followingOf);
    authorFilter = (rows ?? []).map((r) => r.following_id as string);
    if (authorFilter.length === 0) return [];
  }

  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (authorFilter) query = query.in("author_id", authorFilter);

  const { data } = await query;
  let posts = (data ?? []) as unknown as Post[];

  if (profession) {
    posts = posts.filter((p) => p.author?.profession === profession);
  }
  return sortMedia(posts);
}

export async function getPost(id: string): Promise<Post | null> {
  if (DEMO) return DEMO_POSTS.find((p) => p.id === id) ?? DEMO_POSTS[0];
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
  if (!data) return null;
  return sortMedia([data as unknown as Post])[0];
}

export async function getComments(postId: string): Promise<CommentWithAuthor[]> {
  if (DEMO) return DEMO_COMMENTS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select(
      `id, content, created_at, author_id,
       author:profiles!comments_author_id_fkey ( id, username, full_name, avatar_url )`
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  if (DEMO) return DEMO_PROFILES.find((p) => p.username === username) ?? DEMO_PROFILES[0];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function getPostsByAuthor(authorId: string, includePending = false): Promise<Post[]> {
  if (DEMO) return DEMO_POSTS.filter((p) => p.author_id === authorId);
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false });

  if (!includePending) query = query.eq("status", "approved");

  const { data } = await query;
  return sortMedia((data ?? []) as unknown as Post[]);
}

/** Stato delle interazioni dell'utente collegato sui post mostrati. */
export async function getViewerInteractions(postIds: string[], userId?: string | null) {
  const empty = { liked: new Set<string>(), reposted: new Set<string>() };
  if (DEMO) return { liked: new Set(["post2"]), reposted: new Set<string>() };
  if (!userId || postIds.length === 0) return empty;

  const supabase = await createClient();
  const [{ data: likes }, { data: reposts }] = await Promise.all([
    supabase.from("likes").select("post_id").eq("user_id", userId).in("post_id", postIds),
    supabase.from("reposts").select("post_id").eq("user_id", userId).in("post_id", postIds),
  ]);

  return {
    liked: new Set((likes ?? []).map((r) => r.post_id as string)),
    reposted: new Set((reposts ?? []).map((r) => r.post_id as string)),
  };
}

export async function isFollowing(followerId: string | null | undefined, targetId: string) {
  if (DEMO) return targetId !== DEMO_PROFILES[0].id;
  if (!followerId || followerId === targetId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", targetId)
    .maybeSingle();
  return Boolean(data);
}

/**
 * Liste follower / following. Le policy del database restituiscono righe
 * soltanto a chi ha il permesso di vederle: se l'elenco torna vuoto per un
 * profilo che ha follower, significa che il visitatore non lo segue.
 */
export async function getNetwork(profileId: string, kind: "followers" | "following") {
  if (DEMO) return DEMO_PROFILES.slice(1, 4);
  const supabase = await createClient();
  const column = kind === "followers" ? "following_id" : "follower_id";
  const joinTable =
    kind === "followers"
      ? "profile:profiles!follows_follower_id_fkey"
      : "profile:profiles!follows_following_id_fkey";

  const { data } = await supabase
    .from("follows")
    .select(`created_at, ${joinTable} ( id, username, full_name, avatar_url, profession, bio )`)
    .eq(column, profileId)
    .order("created_at", { ascending: false })
    .limit(100);

  return ((data ?? []) as unknown as { profile: Profile | null }[])
    .map((r) => r.profile)
    .filter((p): p is Profile => Boolean(p));
}

export async function getPendingPosts(): Promise<Post[]> {
  if (DEMO) return DEMO_PENDING;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  return sortMedia((data ?? []) as unknown as Post[]);
}

export async function getReviewedPosts(limit = 30): Promise<Post[]> {
  if (DEMO) return DEMO_POSTS;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .in("status", ["approved", "rejected"])
    .order("created_at", { ascending: false })
    .limit(limit);
  return sortMedia((data ?? []) as unknown as Post[]);
}

export async function searchProfiles(term: string, profession?: string): Promise<Profile[]> {
  if (DEMO) return DEMO_PROFILES;
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("*")
    .order("follower_count", { ascending: false })
    .limit(48);

  if (term.trim()) {
    const safe = term.trim().replace(/[%,()]/g, "");
    query = query.or(`full_name.ilike.%${safe}%,username.ilike.%${safe}%,bio.ilike.%${safe}%`);
  }
  if (profession) query = query.eq("profession", profession);

  const { data } = await query;
  return (data ?? []) as Profile[];
}

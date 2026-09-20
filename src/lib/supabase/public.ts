import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase "anonimo", senza cookie e senza sessione.
 *
 * Serve alle parti del sito che girano fuori da una richiesta vera e propria
 * — la mappa del sito e le immagini di anteprima — dove i cookie non esistono.
 * Vede esattamente quello che vede un visitatore non registrato: è il
 * comportamento giusto, perché su Google deve finire solo ciò che è pubblico.
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    return createSupabaseClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

export type SitemapPost = {
  id: string;
  title: string | null;
  published_at: string | null;
  created_at: string;
};

export type SitemapProfile = {
  username: string;
  created_at: string;
};

/** I contenuti approvati, gli unici che possono comparire nelle ricerche. */
export async function listPublicPosts(limit = 5000): Promise<SitemapPost[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, published_at, created_at")
      .eq("status", "approved")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as SitemapPost[];
  } catch {
    return [];
  }
}

/** I profili pubblici dei membri. */
export async function listPublicProfiles(limit = 5000): Promise<SitemapProfile[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as SitemapProfile[];
  } catch {
    return [];
  }
}

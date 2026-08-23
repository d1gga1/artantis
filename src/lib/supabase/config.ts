/** Verifica che le due chiavi Supabase siano state inserite davvero. */
export function isSupabaseConfigured() {
  if (process.env.ARTANTIS_DEMO === "1") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (url.includes("xxxxxxxxxxxx") || url.includes("placeholder")) return false;
  if (key.startsWith("incolla") || key.length < 30) return false;

  try {
    new URL(url);
  } catch {
    return false;
  }
  return true;
}

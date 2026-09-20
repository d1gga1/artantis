import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { listPublicPosts, listPublicProfiles } from "@/lib/supabase/public";

/**
 * Mappa del sito.
 *
 * L'elenco che Google usa per sapere cosa esiste su ARTANTIS senza doverlo
 * scoprire seguendo i collegamenti: le pagine principali, ogni contenuto
 * approvato e ogni profilo pubblico.
 *
 * Viene rigenerata ogni ora: i contenuti nuovi entrano da soli.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/esplora"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/membri"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ];

  // Se l'archivio dati non risponde, la mappa esce comunque con le pagine
  // principali invece di far fallire la pubblicazione del sito.
  const [posts, profiles] = await Promise.all([
    listPublicPosts(),
    listPublicProfiles(),
  ]);

  const postPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(`/post/${post.id}`),
    lastModified: new Date(post.published_at ?? post.created_at),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const profilePages: MetadataRoute.Sitemap = profiles
    .filter((p) => Boolean(p.username))
    .map((profile) => ({
      url: absoluteUrl(`/profilo/${profile.username}`),
      lastModified: new Date(profile.created_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  return [...staticPages, ...postPages, ...profilePages];
}

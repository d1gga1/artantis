import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import {
  NO_INDEX_RULES,
  absoluteUrl,
  pageMetadata,
  toDescription,
} from "@/lib/seo";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { MediaGallery } from "@/components/media-gallery";
import { InteractionBar } from "@/components/interaction-bar";
import { CommentSection } from "@/components/comment-section";
import { FollowButton } from "@/components/follow-button";
import { Reveal } from "@/components/motion";
import {
  getComments,
  getCurrentProfile,
  getPost,
  getViewerInteractions,
  isFollowing,
} from "@/lib/queries";
import { professionLabel } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "Contenuto non trovato", robots: NO_INDEX_RULES };

  const title = post.title || `${post.author?.full_name ?? "ARTANTIS"} su ARTANTIS`;
  const firstImage = post.media?.find((m) => m.media_type === "image")?.url;

  return pageMetadata({
    title,
    description: toDescription(post.content),
    path: `/post/${post.id}`,
    type: "article",
    image: firstImage ?? absoluteUrl(`/post/${post.id}/opengraph-image`),
    // Solo i contenuti approvati possono comparire nelle ricerche: quelli in
    // attesa di revisione o respinti restano fuori da Google.
    noIndex: post.status !== "approved",
    publishedTime: post.published_at ?? post.created_at,
    authors: post.author?.full_name ? [post.author.full_name] : undefined,
  });
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, viewer] = await Promise.all([getPost(id), getCurrentProfile()]);
  if (!post) notFound();

  const [comments, interactions, following] = await Promise.all([
    getComments(post.id),
    getViewerInteractions([post.id], viewer?.id),
    post.author ? isFollowing(viewer?.id, post.author.id) : Promise.resolve(false),
  ]);

  // Scheda per Google: di che articolo si tratta, chi lo firma, quando è
  // uscito. Solo per i contenuti approvati: gli altri non sono pubblici.
  const articleJsonLd =
    post.status === "approved"
      ? [
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": absoluteUrl(`/post/${post.id}#article`),
            headline: (post.title || post.content).replace(/\s+/g, " ").trim().slice(0, 110),
            description: toDescription(post.content),
            datePublished: post.published_at ?? post.created_at,
            dateModified: post.published_at ?? post.created_at,
            inLanguage: "it-IT",
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": absoluteUrl(`/post/${post.id}`),
            },
            image:
              post.media?.find((m) => m.media_type === "image")?.url ??
              absoluteUrl(`/post/${post.id}/opengraph-image`),
            author: post.author
              ? {
                  "@type": "Person",
                  name: post.author.full_name,
                  url: absoluteUrl(`/profilo/${post.author.username}`),
                }
              : undefined,
            publisher: { "@id": absoluteUrl("/#organization") },
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: post.like_count,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/CommentAction",
                userInteractionCount: post.comment_count,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "ARTANTIS", item: absoluteUrl("/") },
              {
                "@type": "ListItem",
                position: 2,
                name: post.title || "Contenuto",
                item: absoluteUrl(`/post/${post.id}`),
              },
            ],
          },
        ]
      : null;

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12">
      {articleJsonLd && <JsonLd data={articleJsonLd} />}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-[14px] text-ink-faint transition-colors hover:text-accent"
      >
        <ArrowLeft size={15} />
        Torna al feed
      </Link>

      {post.status !== "approved" && (
        <div className="surface-quiet mb-8 border-signal-warn/25 bg-signal-warn/5 p-5">
          <p className="text-[14px] font-medium text-signal-warn">
            {post.status === "pending"
              ? "Questo contenuto è in attesa di revisione: al momento lo vedi solo tu."
              : "Questo contenuto non è stato approvato dalla direzione editoriale."}
          </p>
          {post.rejection_reason && (
            <p className="mt-1.5 text-[13.5px] text-ink-soft">Motivo: {post.rejection_reason}</p>
          )}
        </div>
      )}

      <Reveal>
        <article>
          <header className="mb-7 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-center gap-3.5">
              <Link href={`/profilo/${post.author?.username ?? ""}`}>
                <Avatar url={post.author?.avatar_url} name={post.author?.full_name} size="md" />
              </Link>
              <div>
                <Link
                  href={`/profilo/${post.author?.username ?? ""}`}
                  className="text-[16px] font-semibold hover:text-accent"
                >
                  {post.author?.full_name || post.author?.username}
                </Link>
                <p className="text-[12.5px] text-ink-faint">
                  <span className="uppercase tracking-[0.1em] text-accent">
                    {professionLabel(post.author?.profession)}
                  </span>
                  {" · "}
                  {timeAgo(post.published_at ?? post.created_at)}
                </p>
              </div>
            </div>

            {post.author && viewer?.id !== post.author.id && (
              <FollowButton
                targetId={post.author.id}
                initialFollowing={following}
                isAuthenticated={Boolean(viewer)}
                size="sm"
              />
            )}
          </header>

          {post.title && (
            <h1 className="mb-5 text-[32px] font-semibold leading-[1.15] sm:text-[42px]">
              {post.title}
            </h1>
          )}

          {post.content && (
            <div className="whitespace-pre-wrap text-[17px] leading-[1.8] text-ink-soft">
              {post.content}
            </div>
          )}

          {post.media?.length > 0 && (
            <div className="mt-8">
              <MediaGallery media={post.media} />
            </div>
          )}

          {post.status === "approved" && (
            <div className="mt-8 border-y border-line py-2">
              <InteractionBar
                postId={post.id}
                likes={post.like_count}
                comments={post.comment_count}
                reposts={post.repost_count}
                liked={interactions.liked.has(post.id)}
                reposted={interactions.reposted.has(post.id)}
                isAuthenticated={Boolean(viewer)}
                title={post.title}
              />
            </div>
          )}
        </article>
      </Reveal>

      {post.status === "approved" && (
        <div className="mt-12">
          <CommentSection postId={post.id} comments={comments} viewer={viewer} />
        </div>
      )}
    </div>
  );
}

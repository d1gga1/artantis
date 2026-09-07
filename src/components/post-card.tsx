"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Avatar } from "@/components/avatar";
import { MediaGallery } from "@/components/media-gallery";
import { InteractionBar } from "@/components/interaction-bar";
import { professionLabel, type Post } from "@/lib/types";
import { tint, tintVars } from "@/lib/palette";
import { COLORE } from "@/lib/colore";
import { cn, timeAgo } from "@/lib/utils";

export function PostCard({
  post,
  liked = false,
  reposted = false,
  isAuthenticated = false,
  index = 0,
}: {
  post: Post;
  liked?: boolean;
  reposted?: boolean;
  isAuthenticated?: boolean;
  index?: number;
}) {
  const router = useRouter();
  const long = post.content.length > 460;
  const t = tint(post.author?.profession);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{
        ...tintVars(post.author?.profession),
        borderColor: `rgba(${t.glow}, 0.45)`,
        backgroundImage: `linear-gradient(180deg, rgba(${t.glow},${COLORE.scheda}) 0%, rgba(255,255,255,0) 240px)`,
      }}
      className="group surface tint-glow spotlight relative overflow-hidden p-5 sm:p-6"
    >
      {/* filo del colore della disciplina: sempre acceso, più pieno al passaggio */}
      <span
        className="tinted-rule absolute left-0 top-0 h-[4px] w-full origin-left transition-opacity duration-500 ease-out"
        aria-hidden
      />
      <header className="flex items-start gap-3">
        <Link href={`/profilo/${post.author?.username ?? ""}`} className="shrink-0">
          <Avatar url={post.author?.avatar_url} name={post.author?.full_name} size="sm" profession={post.author?.profession} />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Link
              href={`/profilo/${post.author?.username ?? ""}`}
              className="truncate text-[15px] font-semibold leading-snug hover:text-accent"
            >
              {post.author?.full_name || post.author?.username || "Autore"}
            </Link>
            <span className="text-[13px] text-ink-faint">·</span>
            <span className="text-[13px] text-ink-faint">{timeAgo(post.published_at ?? post.created_at)}</span>
          </div>
          <p
            className="mt-0.5 inline-flex items-center gap-1.5 text-[12.5px] uppercase tracking-[0.1em]"
            style={{ color: t.ink }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.ink }} aria-hidden />
            {professionLabel(post.author?.profession)}
          </p>
        </div>

        {post.status !== "approved" && (
          <span
            className={cn(
              "chip shrink-0",
              post.status === "pending" && "border-signal-warn/25 bg-signal-warn/8 text-signal-warn",
              post.status === "rejected" && "border-signal-bad/25 bg-signal-bad/8 text-signal-bad"
            )}
          >
            {post.status === "pending" ? "In revisione" : "Non approvato"}
          </span>
        )}
      </header>

      <div className="mt-4">
        {post.title && (
          <Link href={`/post/${post.id}`}>
            <h2 className="hover-tint mb-2 text-[21px] font-semibold leading-snug sm:text-[23px]">
              {post.title}
            </h2>
          </Link>
        )}

        {post.content && (
          <div
            className={cn(
              "whitespace-pre-wrap text-[15.5px] leading-[1.75] text-ink-soft",
              long && "line-clamp-[10]"
            )}
          >
            {post.content}
          </div>
        )}

        {long && (
          <Link
            href={`/post/${post.id}`}
            className="mt-2 inline-block text-[14px] font-medium text-accent hover:text-accent-deep"
          >
            Continua a leggere →
          </Link>
        )}
      </div>

      {post.media?.length > 0 && (
        <div className="mt-4">
          <MediaGallery media={post.media} compact />
        </div>
      )}

      {post.status === "rejected" && post.rejection_reason && (
        <p className="mt-4 rounded-xl border border-signal-bad/20 bg-signal-bad/5 px-4 py-3 text-[13.5px] text-signal-bad">
          <strong className="font-semibold">Motivo:</strong> {post.rejection_reason}
        </p>
      )}

      {post.status === "approved" && (
        <div className="mt-2 border-t border-line pt-1">
          <InteractionBar
            postId={post.id}
            likes={post.like_count}
            comments={post.comment_count}
            reposts={post.repost_count}
            liked={liked}
            reposted={reposted}
            isAuthenticated={isAuthenticated}
            title={post.title}
            onCommentClick={() => router.push(`/post/${post.id}#commenti`)}
          />
        </div>
      )}
    </motion.article>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Eye, Heart, MessageCircle, Repeat2, Trash2, XCircle, CheckCircle2 } from "lucide-react";
import { deleteOwnPost } from "@/lib/actions";
import { cn, timeAgo, formatCount } from "@/lib/utils";
import type { Post } from "@/lib/types";

const STATUS = {
  pending: {
    label: "In revisione",
    className: "border-signal-warn/25 bg-signal-warn/8 text-signal-warn",
    icon: Clock,
  },
  approved: {
    label: "Pubblicato",
    className: "border-signal-ok/25 bg-signal-ok/8 text-signal-ok",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Non approvato",
    className: "border-signal-bad/25 bg-signal-bad/8 text-signal-bad",
    icon: XCircle,
  },
} as const;

export function MyPosts({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (posts.length === 0) {
    return (
      <div className="surface-quiet px-8 py-14 text-center">
        <h3 className="text-[19px] font-semibold">Non hai ancora proposto nulla</h3>
        <p className="mx-auto mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
          Quando invii un contenuto lo ritrovi qui, con lo stato della revisione sempre aggiornato.
        </p>
        <Link href="/pubblica" className="btn-accent mt-6">
          Proponi un contenuto
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {posts.map((post, i) => {
          const meta = STATUS[post.status];
          const Icon = meta.icon;
          const preview = post.title || post.content.slice(0, 110) || "Contenuto con soli allegati";

          return (
            <motion.div
              key={post.id}
              layout
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.035, ease: [0.22, 1, 0.36, 1] }}
              className="surface p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className={cn("chip", meta.className)}>
                    <Icon size={12} />
                    {meta.label}
                  </span>
                  <p className="mt-2.5 line-clamp-2 text-[15.5px] font-medium leading-snug">
                    {preview}
                  </p>
                  <p className="mt-1.5 text-[12.5px] text-ink-faint">
                    Inviato {timeAgo(post.created_at)}
                    {post.media?.length > 0 && ` · ${post.media.length} allegato/i`}
                  </p>

                  {post.status === "rejected" && post.rejection_reason && (
                    <p className="mt-3 rounded-xl border border-signal-bad/20 bg-signal-bad/5 px-3.5 py-2.5 text-[13px] leading-relaxed text-signal-bad">
                      <strong className="font-semibold">Motivo: </strong>
                      {post.rejection_reason}
                    </p>
                  )}

                  {post.status === "approved" && (
                    <div className="mt-3 flex gap-4 text-[12.5px] text-ink-faint">
                      <span className="inline-flex items-center gap-1">
                        <Heart size={12} /> {formatCount(post.like_count)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle size={12} /> {formatCount(post.comment_count)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Repeat2 size={13} /> {formatCount(post.repost_count)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 gap-1.5">
                  <Link
                    href={`/post/${post.id}`}
                    className="rounded-lg p-2.5 text-ink-faint transition-colors hover:bg-paper-sunk hover:text-accent"
                    aria-label="Apri"
                  >
                    <Eye size={15} />
                  </Link>
                  <button
                    onClick={() => setConfirm(confirm === post.id ? null : post.id)}
                    className="rounded-lg p-2.5 text-ink-faint transition-colors hover:bg-paper-sunk hover:text-signal-bad"
                    aria-label="Elimina"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {confirm === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper-warm px-4 py-3">
                      <p className="text-[13.5px] text-ink-soft">
                        Eliminare definitivamente questo contenuto?
                      </p>
                      <div className="flex gap-2">
                        <button onClick={() => setConfirm(null)} className="btn-quiet !py-1.5 !text-[13px]">
                          Annulla
                        </button>
                        <button
                          onClick={() =>
                            startTransition(async () => {
                              await deleteOwnPost(post.id);
                              setConfirm(null);
                              router.refresh();
                            })
                          }
                          className="btn !bg-signal-bad !py-1.5 !text-[13px] text-white hover:opacity-90"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

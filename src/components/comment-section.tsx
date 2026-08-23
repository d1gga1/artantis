"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { addComment, deleteComment } from "@/lib/actions";
import { timeAgo } from "@/lib/utils";
import type { CommentWithAuthor, Profile } from "@/lib/types";

export function CommentSection({
  postId,
  comments,
  viewer,
}: {
  postId: string;
  comments: CommentWithAuthor[];
  viewer: Profile | null;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const value = text;
    setText("");
    setError(null);
    startTransition(async () => {
      const res = await addComment(postId, value);
      if (!res.ok) {
        setError(res.error === "auth" ? "Sessione scaduta." : (res.error ?? "Errore"));
        setText(value);
      }
      router.refresh();
    });
  };

  return (
    <section id="commenti" className="scroll-mt-24">
      <h2 className="mb-5 text-[19px] font-semibold">
        Commenti{" "}
        <span className="font-sans text-[15px] font-normal text-ink-faint">({comments.length})</span>
      </h2>

      {viewer ? (
        <form onSubmit={submit} className="mb-8 flex gap-3">
          <Avatar url={viewer.avatar_url} name={viewer.full_name} size="sm" />
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Scrivi un commento..."
              rows={text.length > 80 ? 4 : 2}
              className="field resize-none"
            />
            {error && <p className="mt-1.5 text-[13px] text-signal-bad">{error}</p>}
            <div className="mt-2 flex justify-end">
              <button type="submit" disabled={pending || !text.trim()} className="btn-accent">
                <Send size={14} />
                {pending ? "Invio..." : "Pubblica commento"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="surface-quiet mb-8 flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
          <p className="text-[14.5px] text-ink-soft">
            Accedi per lasciare un commento a questo contenuto.
          </p>
          <div className="flex gap-2">
            <Link href={`/accedi?redirect=/post/${postId}`} className="btn-ghost">
              Accedi
            </Link>
            <Link href={`/registrati?redirect=/post/${postId}`} className="btn-primary">
              Crea profilo
            </Link>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="group flex gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-paper-warm"
            >
              <Link href={`/profilo/${c.author?.username ?? ""}`} className="shrink-0">
                <Avatar url={c.author?.avatar_url} name={c.author?.full_name} size="sm" />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/profilo/${c.author?.username ?? ""}`}
                    className="text-[14px] font-semibold hover:text-accent"
                  >
                    {c.author?.full_name || c.author?.username || "Utente"}
                  </Link>
                  <span className="text-[12.5px] text-ink-faint">{timeAgo(c.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-soft">
                  {c.content}
                </p>
              </div>

              {(viewer?.id === c.author_id || viewer?.is_admin) && (
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await deleteComment(c.id, postId);
                      router.refresh();
                    })
                  }
                  className="h-fit rounded-lg p-2 text-ink-faint opacity-0 transition-all hover:bg-white hover:text-signal-bad group-hover:opacity-100"
                  aria-label="Elimina commento"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="py-8 text-center text-[14px] text-ink-faint">
            Ancora nessun commento. Puoi essere il primo.
          </p>
        )}
      </div>
    </section>
  );
}

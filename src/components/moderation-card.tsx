"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageSquareWarning, X } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { MediaGallery } from "@/components/media-gallery";
import { moderatePost } from "@/lib/actions";
import { professionLabel, type Post } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const QUICK_REASONS = [
  "Contenuto non pertinente alle discipline di ARTANTIS",
  "Serve una fonte o un riferimento verificabile",
  "Qualità delle immagini insufficiente",
  "Testo da rivedere nella forma",
];

export function ModerationCard({ post, index = 0 }: { post: Post; index?: number }) {
  const router = useRouter();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const decide = (decision: "approved" | "rejected") => {
    setError(null);
    startTransition(async () => {
      const res = await moderatePost(post.id, decision, reason);
      if (!res.ok) {
        setError(res.error ?? "Operazione non riuscita.");
        return;
      }
      setDone(decision);
      setTimeout(() => router.refresh(), 900);
    });
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: done ? 0.5 : 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="surface overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line bg-paper-warm px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Link href={`/profilo/${post.author?.username ?? ""}`}>
            <Avatar url={post.author?.avatar_url} name={post.author?.full_name} size="xs" />
          </Link>
          <div>
            <Link
              href={`/profilo/${post.author?.username ?? ""}`}
              className="text-[14px] font-semibold hover:text-accent"
            >
              {post.author?.full_name || post.author?.username}
            </Link>
            <p className="text-[12px] text-ink-faint">
              {professionLabel(post.author?.profession)} · inviato {timeAgo(post.created_at)}
            </p>
          </div>
        </div>

        {post.category && <span className="chip capitalize">{post.category}</span>}
      </div>

      <div className="p-5 sm:p-6">
        {post.title && (
          <h2 className="mb-3 text-[21px] font-semibold leading-snug">{post.title}</h2>
        )}
        {post.content && (
          <div className="whitespace-pre-wrap text-[15px] leading-[1.75] text-ink-soft">
            {post.content}
          </div>
        )}
        {post.media?.length > 0 && (
          <div className="mt-5">
            <MediaGallery media={post.media} compact />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 border-t border-line px-5 py-4 text-[14px] font-medium"
          >
            {done === "approved" ? (
              <span className="flex items-center gap-2 text-signal-ok">
                <Check size={16} /> Pubblicato nel feed
              </span>
            ) : (
              <span className="flex items-center gap-2 text-signal-bad">
                <X size={16} /> Rifiutato
              </span>
            )}
          </motion.div>
        ) : rejecting ? (
          <motion.div
            key="reject"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-line bg-paper-warm"
          >
            <div className="p-5">
              <label className="label flex items-center gap-1.5">
                <MessageSquareWarning size={13} />
                Motivo del rifiuto (visibile all&apos;autore)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Spiega brevemente perché il contenuto non viene pubblicato."
                className="field resize-none"
              />
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {QUICK_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className="rounded-full border border-line bg-white px-3 py-1 text-[12px] text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
                  >
                    {r}
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 text-[13px] text-signal-bad">{error}</p>}

              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setRejecting(false)} className="btn-quiet">
                  Annulla
                </button>
                <button
                  onClick={() => decide("rejected")}
                  disabled={pending}
                  className="btn !bg-signal-bad text-white hover:opacity-90"
                >
                  Conferma rifiuto
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4"
          >
            <Link href={`/post/${post.id}`} className="text-[13.5px] text-ink-faint hover:text-accent">
              Apri in una pagina →
            </Link>
            <div className="flex gap-2">
              <button onClick={() => setRejecting(true)} className="btn-ghost">
                <X size={15} />
                Rifiuta
              </button>
              <button onClick={() => decide("approved")} disabled={pending} className="btn-accent">
                <Check size={15} />
                {pending ? "Un attimo..." : "Approva e pubblica"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !rejecting && (
        <p className="border-t border-line px-5 py-3 text-[13px] text-signal-bad">{error}</p>
      )}
    </motion.article>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Send } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { MediaUploader, type DraftMedia } from "@/components/media-uploader";
import { ErrorNote } from "@/components/sign-in-form";
import { createPost } from "@/lib/actions";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AUTHOR_NAME } from "@/lib/brand";
import { Firma } from "@/components/firma";

const CATEGORIES = [
  "generale",
  "ricerca",
  "clinica",
  "opera",
  "processo creativo",
  "benessere",
  "divulgazione",
  "annuncio",
];

const MAX_CHARS = 8000;

export function PostComposer({ profile }: { profile: Profile }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("generale");
  const [media, setMedia] = useState<DraftMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createPost({
        title,
        content,
        category,
        media: media.map((m) => ({ url: m.url, media_type: m.media_type })),
      });
      if (!res.ok) {
        setError(res.error === "auth" ? "Sessione scaduta: rifai l'accesso." : (res.error ?? "Errore"));
        return;
      }
      setSent(true);
    });
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="surface p-9 text-center"
      >
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12, type: "spring", stiffness: 260, damping: 18 }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-ok/10 text-signal-ok"
        >
          <CheckCircle2 size={26} />
        </motion.div>

        <h2 className="text-[25px] font-semibold leading-tight">Proposta inviata</h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-soft">
          Il tuo contenuto è stato trasmesso alla direzione editoriale.{" "}
          <strong className="font-semibold text-ink">{AUTHOR_NAME}</strong> lo esaminerà
          e, se approvato, comparirà nel feed pubblico di ARTANTIS.
        </p>

        <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-paper-warm px-4 py-2 text-[13px] text-ink-soft">
          <Clock size={14} className="text-signal-warn" />
          Stato attuale: in revisione
        </div>

        <Firma variante="riga" className="mt-6 text-[13px]" />

        <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
          <Link href="/area-personale" className="btn-primary">
            Vedi i miei contenuti
          </Link>
          <button
            onClick={() => {
              setSent(false);
              setTitle("");
              setContent("");
              setMedia([]);
              setCategory("generale");
            }}
            className="btn-ghost"
          >
            Proponi un altro contenuto
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="surface p-5 sm:p-7">
        <div className="mb-5 flex items-center gap-3 border-b border-line pb-5">
          <Avatar url={profile.avatar_url} name={profile.full_name} size="sm" />
          <div>
            <p className="text-[14.5px] font-semibold leading-tight">
              {profile.full_name || profile.username}
            </p>
            <p className="text-[12.5px] text-ink-faint">Stai proponendo come @{profile.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="title">
              Titolo <span className="font-normal text-ink-faint">(facoltativo)</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              placeholder="Un titolo che dica di cosa si tratta"
              className="field !text-[17px] !font-medium"
            />
          </div>

          <div>
            <label className="label" htmlFor="content">
              Il tuo contenuto
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
              rows={9}
              placeholder="Racconta il tuo lavoro, uno studio, un'opera, una riflessione..."
              className="field resize-y leading-[1.75]"
            />
            <div className="mt-1.5 flex justify-end">
              <span
                className={cn(
                  "text-[12px] tabular-nums",
                  content.length > MAX_CHARS * 0.92 ? "text-signal-warn" : "text-ink-faint"
                )}
              >
                {content.length} / {MAX_CHARS}
              </span>
            </div>
          </div>

          <div>
            <span className="label">Argomento</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-[13px] capitalize transition-all duration-200",
                    category === c
                      ? "border-accent bg-accent text-white shadow-card"
                      : "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Immagini, video e GIF</span>
            <MediaUploader userId={profile.id} items={media} onChange={setMedia} />
          </div>
        </div>
      </div>

      <AnimatePresence>{error && <ErrorNote message={error} />}</AnimatePresence>

      <div className="flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
        <p className="text-[13px] leading-relaxed text-ink-faint">
          La proposta viene inviata alla direzione editoriale e pubblicata solo dopo approvazione.
        </p>
        <button
          type="submit"
          disabled={pending || (!content.trim() && media.length === 0)}
          className="btn-accent w-full !px-7 !py-3 text-[15px] sm:w-auto"
        >
          <Send size={15} />
          {pending ? "Invio in corso..." : "Invia per l'approvazione"}
        </button>
      </div>
    </form>
  );
}

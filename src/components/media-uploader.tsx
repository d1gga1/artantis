"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Film, ImagePlus, Loader2, X } from "lucide-react";
import { uploadFile, validateFile, MAX_IMAGE_MB, MAX_VIDEO_MB } from "@/lib/upload";
import { detectMediaType, cn } from "@/lib/utils";
import type { MediaType } from "@/lib/types";

export type DraftMedia = { id: string; url: string; media_type: MediaType; name: string };

export function MediaUploader({
  userId,
  items,
  onChange,
  max = 8,
}: {
  userId: string;
  items: DraftMedia[];
  onChange: (items: DraftMedia[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = async (files: FileList | File[]) => {
    setError(null);
    const list = Array.from(files).slice(0, max - items.length);
    if (list.length === 0) return;

    const problems = list.map(validateFile).filter(Boolean) as string[];
    if (problems.length > 0) {
      setError(problems[0]);
      return;
    }

    setBusy((n) => n + list.length);
    const uploaded: DraftMedia[] = [];

    for (const file of list) {
      try {
        const { url } = await uploadFile(file, userId);
        uploaded.push({
          id: url,
          url,
          media_type: detectMediaType(file),
          name: file.name,
        });
      } catch (e) {
        setError(
          e instanceof Error && e.message.toLowerCase().includes("size")
            ? "File troppo grande per l'archivio."
            : "Caricamento non riuscito. Controlla la connessione e riprova."
        );
      } finally {
        setBusy((n) => Math.max(n - 1, 0));
      }
    }

    if (uploaded.length) onChange([...items, ...uploaded]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-all duration-300",
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line-strong bg-paper-warm hover:border-accent/50 hover:bg-accent-soft/40"
        )}
      >
        <motion.div
          animate={dragging ? { scale: 1.12, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white text-accent"
        >
          {busy > 0 ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
        </motion.div>

        <p className="text-[14.5px] font-medium">
          {busy > 0
            ? `Caricamento in corso (${busy})...`
            : "Trascina qui i file oppure clicca per sceglierli"}
        </p>
        <p className="mt-1 text-[12.5px] text-ink-faint">
          Immagini e GIF fino a {MAX_IMAGE_MB} MB · Video fino a {MAX_VIDEO_MB} MB · massimo {max} file
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*,.gif"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-2.5 text-[13px] text-signal-bad">{error}</p>}

      <AnimatePresence>
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4"
          >
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-line bg-paper-sunk"
              >
                {item.media_type === "video" ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-faint">
                    <Film size={20} />
                    <span className="max-w-full truncate px-2 text-[10.5px]">{item.name}</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt="" className="h-full w-full object-cover" />
                )}

                <button
                  type="button"
                  onClick={() => onChange(items.filter((i) => i.id !== item.id))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-ink/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Rimuovi"
                >
                  <X size={12} />
                </button>

                {item.media_type === "gif" && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-ink/75 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                    gif
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

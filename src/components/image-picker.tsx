"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { uploadFile, validateFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

export function AvatarPicker({
  userId,
  name,
  value,
  onChange,
}: {
  userId: string;
  name: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File) => {
    const problem = validateFile(file);
    if (problem || file.type.startsWith("video/")) {
      setError(problem ?? "Scegli un'immagine.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { url } = await uploadFile(file, userId, "profilo");
      onChange(url);
    } catch {
      setError("Caricamento non riuscito.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4">
        <motion.button
          type="button"
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative rounded-full"
        >
          <Avatar url={value} name={name} size="lg" ring />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/45 opacity-0 transition-opacity group-hover:opacity-100">
            {busy ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Camera size={18} className="text-white" />
            )}
          </span>
        </motion.button>

        <div>
          <p className="text-[14px] font-medium">Immagine del profilo</p>
          <p className="mt-0.5 text-[12.5px] text-ink-faint">JPG, PNG o GIF · fino a 12 MB</p>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint transition-colors hover:text-signal-bad"
            >
              <Trash2 size={12} />
              Rimuovi
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-[13px] text-signal-bad">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function CoverPicker({
  userId,
  value,
  onChange,
}: {
  userId: string;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const pick = async (file: File) => {
    const problem = validateFile(file);
    if (problem || file.type.startsWith("video/")) {
      setError(problem ?? "Scegli un'immagine.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { url } = await uploadFile(file, userId, "copertina");
      onChange(url);
    } catch {
      setError("Caricamento non riuscito.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) pick(f);
        }}
        className={cn(
          "group relative h-40 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 sm:h-48",
          drag ? "border-accent bg-accent-soft" : "border-line-strong bg-paper-warm hover:border-accent/50"
        )}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Copertina" className="h-full w-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-[13px] font-medium">
                <Camera size={14} />
                Cambia copertina
              </span>
            </span>
          </>
        ) : (
          <div className="cover-blank flex h-full flex-col items-center justify-center gap-2 text-ink-faint">
            {busy ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
            <p className="text-[13.5px] font-medium">
              {busy ? "Caricamento..." : "Aggiungi un'immagine di copertina"}
            </p>
            <p className="text-[12px]">Consigliata orizzontale, almeno 1600 px di larghezza</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        {error ? (
          <p className="text-[13px] text-signal-bad">{error}</p>
        ) : (
          <span className="text-[12.5px] text-ink-faint">Copertina del tuo profilo pubblico</span>
        )}
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-faint transition-colors hover:text-signal-bad"
          >
            <Trash2 size={12} />
            Rimuovi
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) pick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

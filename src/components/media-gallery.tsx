"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PostMedia } from "@/lib/types";

export function MediaGallery({ media, compact = false }: { media: PostMedia[]; compact?: boolean }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  if (!media || media.length === 0) return null;

  const layout =
    media.length === 1
      ? "grid-cols-1"
      : media.length === 2
        ? "grid-cols-2"
        : media.length === 3
          ? "grid-cols-2"
          : "grid-cols-2";

  return (
    <>
      <div className={cn("grid gap-1.5 overflow-hidden rounded-xl", layout)}>
        {media.slice(0, 4).map((item, i) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setLightbox(i)}
            whileHover={{ scale: 1.012 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={cn(
              "group relative overflow-hidden bg-paper-sunk",
              media.length === 3 && i === 0 && "row-span-2",
              media.length === 1
                ? compact
                  ? "aspect-[16/10]"
                  : "max-h-[560px] min-h-[220px]"
                : "aspect-square"
            )}
          >
            {item.media_type === "video" ? (
              <>
                <video
                  src={item.url}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/20 transition-colors group-hover:bg-ink/30">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-ink shadow-lift">
                    <Play size={18} className="ml-0.5" fill="currentColor" />
                  </span>
                </span>
              </>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt=""
                loading="lazy"
                className={cn(
                  "h-full w-full transition-transform duration-500 group-hover:scale-[1.04]",
                  media.length === 1 ? "object-contain bg-paper-sunk" : "object-cover"
                )}
              />
            )}

            {item.media_type === "gif" && (
              <span className="absolute bottom-2 left-2 rounded-md bg-ink/75 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                gif
              </span>
            )}

            {i === 3 && media.length > 4 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/60 font-display text-[26px] font-semibold text-white">
                +{media.length - 4}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <Lightbox media={media} index={lightbox} onClose={() => setLightbox(null)} onMove={setLightbox} />
    </>
  );
}

function Lightbox({
  media,
  index,
  onClose,
  onMove,
}: {
  media: PostMedia[];
  index: number | null;
  onClose: () => void;
  onMove: (i: number) => void;
}) {
  const item = index !== null ? media[index] : null;

  return (
    <AnimatePresence>
      {item && index !== null && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/92 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Chiudi"
          >
            <X size={18} />
          </button>

          {media.length > 1 && (
            <>
              <NavButton
                side="left"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove((index - 1 + media.length) % media.length);
                }}
              />
              <NavButton
                side="right"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove((index + 1) % media.length);
                }}
              />
            </>
          )}

          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[88vh] max-w-[92vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {item.media_type === "video" ? (
              <video
                src={item.url}
                controls
                autoPlay
                className="max-h-[88vh] max-w-[92vw] rounded-xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.url}
                alt=""
                className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain"
              />
            )}
          </motion.div>

          {media.length > 1 && (
            <p className="absolute bottom-6 text-[13px] tracking-wide text-white/70">
              {index + 1} / {media.length}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "absolute z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20",
        side === "left" ? "left-4" : "right-4"
      )}
      aria-label={side === "left" ? "Precedente" : "Successivo"}
    >
      {side === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}

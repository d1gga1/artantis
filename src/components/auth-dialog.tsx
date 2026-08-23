"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import { useEffect } from "react";

export function AuthDialog({
  open,
  onClose,
  action = "interagire",
}: {
  open: boolean;
  onClose: () => void;
  action?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/25 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-lift"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-ink-faint transition-colors hover:bg-paper-sunk hover:text-ink"
              aria-label="Chiudi"
            >
              <X size={16} />
            </button>

            <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
              <Lock size={18} strokeWidth={2.2} />
            </div>

            <h2 className="text-[23px] font-semibold leading-tight">
              Accedi per {action}
            </h2>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-ink-soft">
              La lettura su ARTANTIS è libera per tutti. Per mettere un apprezzamento,
              commentare o ricondividere serve un profilo: bastano trenta secondi.
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href={`/registrati?redirect=${encodeURIComponent(pathname)}`}
                className="btn-primary flex-1"
              >
                Crea il tuo profilo
              </Link>
              <Link
                href={`/accedi?redirect=${encodeURIComponent(pathname)}`}
                className="btn-ghost flex-1"
              >
                Ho già un account
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import { Check, Clock, Send } from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const STEPS = [
  {
    icon: Send,
    title: "Proposta inviata",
    detail: "Testo, immagini, video, GIF",
    tone: "muted",
  },
  {
    icon: Clock,
    title: "In revisione",
    detail: "Direzione editoriale · Vincenzo Silva",
    tone: "active",
  },
  {
    icon: Check,
    title: "Pubblicato nel feed",
    detail: "Visibile a tutti, anche senza account",
    tone: "done",
  },
] as const;

export function ReviewFlow() {
  return (
    <div className="relative w-full max-w-[360px]">
      <div
        className="absolute left-[27px] top-8 bottom-8 w-px bg-gradient-to-b from-line via-accent/35 to-line"
        aria-hidden
      />

      <div className="space-y-3">
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.9 + i * 0.18, ease }}
            className="relative flex items-center gap-4 rounded-2xl border border-line bg-white/85 p-4 shadow-card backdrop-blur"
          >
            <span
              className={[
                "relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full",
                step.tone === "done"
                  ? "bg-signal-ok text-white"
                  : step.tone === "active"
                    ? "bg-accent text-white"
                    : "border border-line-strong bg-white text-ink-faint",
              ].join(" ")}
            >
              <step.icon size={12} strokeWidth={2.6} />
              {step.tone === "active" && (
                <motion.span
                  className="absolute inset-0 rounded-full bg-accent"
                  animate={{ scale: [1, 1.9], opacity: [0.35, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </span>

            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-tight">{step.title}</p>
              <p className="mt-0.5 truncate text-[12.5px] text-ink-faint">{step.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        className="mt-5 pl-1 text-[12px] leading-relaxed text-ink-faint"
      >
        Nessun contenuto compare nel feed senza passare da questa revisione.
      </motion.p>
    </div>
  );
}

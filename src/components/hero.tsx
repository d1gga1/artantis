"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ReviewFlow } from "@/components/review-flow";
import { PROFESSIONS } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-line">
      <div className="grid-canvas absolute inset-0 mask-fade-b" aria-hidden />

      <motion.div
        className="pointer-events-none absolute -right-40 -top-32 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-accent-soft via-white to-transparent blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.95, 0.7] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <motion.div style={{ y, opacity }} className="container-page relative py-20 sm:py-28">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/70 px-3.5 py-1.5 backdrop-blur"
        >
          <Sparkles size={13} className="text-accent" />
          <span className="text-[12px] font-medium tracking-wide text-ink-soft">
            Spazio editoriale curato · by Silvano Vincenzo
          </span>
        </motion.div>

        <h1 className="max-w-4xl text-[42px] font-semibold leading-[1.04] tracking-tight sm:text-[62px] lg:text-[76px]">
          {["Il sapere che", "merita di essere", "guardato da vicino."].map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block"
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.85, delay: 0.08 + i * 0.09, ease }}
              >
                {i === 2 ? (
                  <span className="bg-gradient-to-r from-accent-deep via-accent to-accent-deep bg-clip-text text-transparent">
                    {line}
                  </span>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42, ease }}
          className="mt-7 max-w-xl text-[17px] leading-relaxed text-ink-soft"
        >
          Ricercatori, medici, artisti, pittori, farmacisti e professionisti di arte e
          benessere pubblicano qui il proprio lavoro. Leggere è libero per chiunque.
          Ogni contenuto proposto passa da una revisione prima di comparire nel feed.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link href="/registrati" className="btn-primary !px-7 !py-3 text-[15px]">
            Crea il tuo profilo
            <ArrowRight size={16} />
          </Link>
          <Link href="/esplora" className="btn-ghost !px-7 !py-3 text-[15px]">
            Esplora i professionisti
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-14 flex flex-wrap items-center gap-x-2.5 gap-y-2"
        >
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium uppercase tracking-[0.14em] text-ink-faint">
            <ShieldCheck size={13} className="text-accent" />
            Discipline
          </span>
          {PROFESSIONS.filter((p) => p.value !== "altro").map((p, i) => (
            <motion.div
              key={p.value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.75 + i * 0.06, ease }}
            >
              <Link
                href={`/esplora?professione=${p.value}`}
                className="chip transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent hover:shadow-card"
              >
                {p.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
        </div>

          <div className="hidden lg:block lg:pt-24">
            <ReviewFlow />
          </div>
        </div>
      </motion.div>
    </section>
  );
}

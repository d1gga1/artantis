"use client";

import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ReviewFlow } from "@/components/review-flow";
import { PROFESSIONS } from "@/lib/types";
import { tint } from "@/lib/palette";
import { AUTHOR_NAME } from "@/lib/brand";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} className="relative overflow-hidden border-b border-line">
      <div className="grid-canvas pointer-events-none absolute inset-0 mask-fade-b opacity-40" aria-hidden />
      {/* velo che tiene il testo perfettamente leggibile sopra il movimento */}

      {/* alone bianco sotto il blocco di testo: la rete resta viva attorno, le parole restano nitide */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(62% 68% at 27% 50%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.5) 45%, rgba(255,255,255,0) 76%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent"
        aria-hidden
      />

      <motion.div style={{ y, opacity }} className="container-page relative py-20 sm:py-28">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="mb-7 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-3xl border border-line bg-white/90 px-4 py-2 sm:rounded-full sm:bg-white/75 sm:backdrop-blur"
            >
              <Sparkles size={14} className="shrink-0 text-accent" />
              <span className="text-[13px] font-medium tracking-wide text-ink-soft">
                Spazio editoriale curato by
              </span>
              <span className="text-[14px] font-semibold uppercase tracking-[0.06em] text-ink">
                {AUTHOR_NAME}
              </span>
            </motion.div>

            <h1 className="max-w-4xl text-[42px] font-semibold leading-[1.04] tracking-tight sm:text-[62px] lg:text-[76px]">
              {["Il sapere che", "merita di essere", "guardato da vicino."].map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.85, delay: 0.08 + i * 0.09, ease }}
                  >
                    {i === 2 ? <span className="text-gradient">{line}</span> : line}
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
              <Link href="/registrati" className="btn-accent !px-7 !py-3 text-[15px]">
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
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
                <ShieldCheck size={13} className="text-accent" />
                Discipline
              </span>
              {PROFESSIONS.filter((p) => p.value !== "altro").map((p, i) => {
                const t = tint(p.value);
                return (
                  <motion.div
                    key={p.value}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.75 + i * 0.06, ease }}
                    whileHover={reduce ? undefined : { y: -3 }}
                  >
                    <Link
                      href={`/esplora?professione=${p.value}`}
                      className="chip transition-all duration-300"
                      style={{
                        borderColor: `rgba(${t.glow}, 0.42)`,
                        color: t.deep,
                        background: `rgba(${t.glow}, 0.11)`,
                        boxShadow: `0 10px 24px -16px rgba(${t.glow}, 0.95)`,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: t.ink }}
                        aria-hidden
                      />
                      {p.label}
                    </Link>
                  </motion.div>
                );
              })}
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

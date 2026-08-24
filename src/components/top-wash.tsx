"use client";

import { LivingBackground } from "@/components/living-background";

/**
 * Fascia viva in cima alle pagine interne: stessa rete della home, più discreta,
 * così il contenuto resta il protagonista.
 */
export function TopWash() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden>
      <LivingBackground intensity={0.95} density={0.8} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/60 to-paper" />
    </div>
  );
}

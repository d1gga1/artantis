"use client";

import { LivingBackground } from "@/components/living-background";
import { COLORE } from "@/lib/colore";

/**
 * Fascia viva in cima alle pagine interne: stessa rete della home, più discreta,
 * così il contenuto resta il protagonista.
 */
export function TopWash() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden" aria-hidden>
      <LivingBackground intensity={COLORE.sfondo} density={COLORE.densita} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-white/45 to-paper" />
    </div>
  );
}

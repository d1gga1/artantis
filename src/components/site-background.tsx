"use client";

import { LivingBackground } from "@/components/living-background";

/**
 * Sfondo del sito: una sola tela fissa dietro a tutte le pagine.
 * Resta ferma rispetto alla finestra mentre il contenuto scorre sopra,
 * così la rete non "insegue" la pagina ma le fa da fondale.
 */
export function SiteBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <LivingBackground intensity={0.9} density={0.62} />
      {/* velo che tiene tutto leggibile: la rete si vede, il testo vince sempre */}
      <div className="absolute inset-0 bg-white/58" />
    </div>
  );
}

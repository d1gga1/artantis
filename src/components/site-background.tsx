"use client";

import { LivingBackground } from "@/components/living-background";

/**
 * Sfondo del sito: una sola tela fissa dietro a tutte le pagine.
 * Resta ferma rispetto alla finestra mentre il contenuto scorre sopra,
 * così la rete non "insegue" la pagina ma le fa da fondale.
 *
 * L'altezza è `h-screen` e non `inset-0` di proposito: su telefono `100vh`
 * resta costante anche quando la barra degli indirizzi si ritrae, mentre
 * `inset-0` cambiava altezza a ogni scorrimento e faceva ridisegnare la tela.
 * `transform-gpu` e `isolate` tengono lo sfondo su un livello grafico suo,
 * così il testo sopra non viene ridipinto insieme a lui.
 */
export function SiteBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-screen isolate transform-gpu overflow-hidden"
      aria-hidden
    >
      <LivingBackground intensity={0.95} density={0.72} />
      {/* velo che tiene tutto leggibile: la rete si vede, il testo vince sempre */}
      <div className="absolute inset-0 bg-white/58 sm:bg-white/50" />
    </div>
  );
}

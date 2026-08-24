"use client";

import { useEffect } from "react";

/**
 * Alone che segue il puntatore dentro le schede con classe `spotlight`.
 * Un solo ascoltatore per tutta la pagina, aggiornato al ritmo dello schermo:
 * costa quasi nulla anche con decine di schede.
 */
export function SpotlightLayer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    let raf = 0;
    let pending: { el: HTMLElement; x: number; y: number } | null = null;

    const apply = () => {
      raf = 0;
      if (!pending) return;
      pending.el.style.setProperty("--mx", `${pending.x}px`);
      pending.el.style.setProperty("--my", `${pending.y}px`);
      pending = null;
    };

    const onMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(".spotlight") as HTMLElement | null;
      if (!target) return;
      const r = target.getBoundingClientRect();
      pending = { el: target, x: e.clientX - r.left, y: e.clientY - r.top };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}

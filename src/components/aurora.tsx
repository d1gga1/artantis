"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Sfondo vivo: macchie di colore sfocate che si muovono lentamente.
 * Sono i sei colori delle discipline, tenuti bassissimi di opacità: danno
 * calore alla pagina senza mai competere con il testo.
 */
const BLOBS = [
  { c: "#0F6F8C", x: "8%",  y: "-14%", s: 620, d: 26, dx: 70,  dy: 50 },
  { c: "#6D4AA8", x: "62%", y: "-24%", s: 700, d: 32, dx: -90, dy: 60 },
  { c: "#B4562B", x: "78%", y: "24%",  s: 520, d: 29, dx: 60,  dy: -70 },
  { c: "#15704A", x: "34%", y: "34%",  s: 560, d: 35, dx: -60, dy: -40 },
  { c: "#A8497B", x: "-8%", y: "36%",  s: 480, d: 24, dx: 80,  dy: 30 },
];

export function Aurora({ intensity = 1 }: { intensity?: number }) {
  const reduce = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: b.x,
            top: b.y,
            width: b.s,
            height: b.s,
            background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, transparent 68%)`,
            opacity: 0.32 * intensity,
            filter: "blur(58px)",
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [0, b.dx, 0],
                  y: [0, b.dy, 0],
                  scale: [1, 1.12, 1],
                }
          }
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      {/* velo che riporta tutto verso il bianco: il colore resta un'atmosfera */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/45 to-paper" />
    </div>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Velo di colore in cima alle pagine interne: dà calore alla parte alta
 * senza toccare la leggibilità del contenuto, che resta su bianco.
 */
export function TopWash() {
  const reduce = useReducedMotion();
  const blobs = [
    { c: "#0F6F8C", left: "-6%", w: 560, d: 22, dx: 60 },
    { c: "#6D4AA8", left: "34%", w: 620, d: 27, dx: -70 },
    { c: "#B4562B", left: "72%", w: 520, d: 24, dx: 55 },
  ];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] overflow-hidden" aria-hidden>
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className="absolute -top-56 rounded-full"
          style={{
            left: b.left,
            width: b.w,
            height: b.w,
            background: `radial-gradient(circle at 50% 50%, ${b.c} 0%, transparent 68%)`,
            opacity: 0.2,
            filter: "blur(60px)",
          }}
          animate={reduce ? undefined : { x: [0, b.dx, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/65 to-paper" />
    </div>
  );
}

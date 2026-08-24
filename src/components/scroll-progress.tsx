"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Filo colorato in cima alla pagina che segue lo scorrimento. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      style={{ scaleX: width }}
      className="fixed left-0 top-0 z-[60] h-[2.5px] w-full origin-left bg-gradient-to-r from-accent via-[#6D4AA8] to-[#B4562B]"
      aria-hidden
    />
  );
}

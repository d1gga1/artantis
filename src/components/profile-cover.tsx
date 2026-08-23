"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { coverFor } from "@/lib/covers";
import type { Profession } from "@/lib/types";

export function ProfileCover({
  url,
  profession,
}: {
  url: string | null;
  profession?: Profession | string | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const src = url ?? coverFor(profession);

  return (
    <div ref={ref} className="relative h-52 overflow-hidden border-b border-line bg-paper-warm sm:h-72">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper to-transparent" />
    </div>
  );
}

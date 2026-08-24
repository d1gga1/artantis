"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { PROFESSIONS } from "@/lib/types";
import { tint } from "@/lib/palette";
import { cn } from "@/lib/utils";

export function ExploreControls() {
  const router = useRouter();
  const params = useSearchParams();
  const [term, setTerm] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const profession = params.get("professione") ?? "";

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (term === current) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (term) next.set("q", term);
      else next.delete("q");
      startTransition(() => router.replace(`/esplora?${next.toString()}`, { scroll: false }));
    }, 350);
    return () => clearTimeout(timer);
  }, [term, params, router]);

  const setProfession = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value && value !== profession) next.set("professione", value);
    else next.delete("professione");
    startTransition(() => router.replace(`/esplora?${next.toString()}`, { scroll: false }));
  };

  return (
    <div>
      <div className="relative">
        <Search
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint"
        />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Cerca per nome, nome utente o parole della biografia..."
          className="field !py-3.5 pl-11 pr-11 !text-[15px]"
        />
        {pending && (
          <Loader2
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-accent"
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FilterChip active={!profession} onClick={() => setProfession("")}>
          Tutte le discipline
        </FilterChip>
        {PROFESSIONS.map((p) => (
          <FilterChip
            key={p.value}
            active={profession === p.value}
            onClick={() => setProfession(p.value)}
            tone={tint(p.value)}
          >
            {p.label}
          </FilterChip>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: { ink: string; deep: string; soft: string; glow: string };
}) {
  const style = tone
    ? active
      ? {
          background: tone.ink,
          borderColor: tone.ink,
          color: "#fff",
          boxShadow: `0 12px 26px -14px rgba(${tone.glow}, 0.95)`,
        }
      : { color: tone.deep, borderColor: `rgba(${tone.glow}, 0.28)` }
    : undefined;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
      style={style}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13.5px] font-medium transition-all duration-200",
        !tone && (active
          ? "border-accent bg-accent text-white shadow-card"
          : "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink"),
        tone && !active && "bg-white"
      )}
    >
      {tone && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: active ? "#fff" : tone.ink }}
          aria-hidden
        />
      )}
      {children}
    </motion.button>
  );
}

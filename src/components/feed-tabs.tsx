"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FeedTabs({ active, showFollowing }: { active: string; showFollowing: boolean }) {
  const tabs = [
    { key: "tutto", label: "Tutto il feed", href: "/" },
    ...(showFollowing ? [{ key: "seguiti", label: "Chi segui", href: "/?tab=seguiti" }] : []),
  ];

  return (
    <div className="flex items-center gap-1 border-b border-line">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={cn(
            "relative px-4 py-3 text-[14.5px] font-medium transition-colors",
            active === tab.key ? "text-ink" : "text-ink-faint hover:text-ink-soft"
          )}
        >
          {tab.label}
          {active === tab.key && (
            <motion.span
              layoutId="feed-tab-underline"
              className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-accent"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
        </Link>
      ))}
    </div>
  );
}

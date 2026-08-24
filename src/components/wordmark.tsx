import Link from "next/link";
import { cn } from "@/lib/utils";
import { BYLINE } from "@/lib/brand";

export function Wordmark({
  className,
  subtitle = true,
  size = "md",
}: {
  className?: string;
  subtitle?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const type = {
    sm: "text-[17px]",
    md: "text-[20px]",
    lg: "text-[26px]",
  }[size];

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex flex-col items-start leading-none sm:flex-row sm:items-baseline sm:gap-2.5",
        className
      )}
    >
      <span
        className={cn(
          "font-display font-semibold uppercase tracking-[0.24em] text-ink transition-colors group-hover:text-accent-deep",
          type
        )}
      >
        Artantis
      </span>
      {subtitle && (
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:mt-0 sm:text-[12px]">
          {BYLINE}
        </span>
      )}
    </Link>
  );
}

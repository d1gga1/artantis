import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <Link href="/" className={cn("group inline-flex items-baseline gap-2.5", className)}>
      <span
        className={cn(
          "font-display font-semibold uppercase tracking-[0.24em] text-ink transition-colors group-hover:text-accent-deep",
          type
        )}
      >
        Artantis
      </span>
      {subtitle && (
        <span className="hidden text-[10.5px] font-medium uppercase tracking-[0.16em] text-ink-faint sm:inline">
          by Silvano Vincenzo
        </span>
      )}
    </Link>
  );
}

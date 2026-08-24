import { tint } from "@/lib/palette";
import { cn, initials } from "@/lib/utils";

const sizes = {
  xs: "h-8 w-8 text-[11px]",
  sm: "h-10 w-10 text-[12px]",
  md: "h-12 w-12 text-[14px]",
  lg: "h-20 w-20 text-[20px]",
  xl: "h-28 w-28 text-[28px]",
};

export function Avatar({
  url,
  name,
  size = "sm",
  className,
  ring = false,
  profession,
}: {
  url?: string | null;
  name?: string | null;
  size?: keyof typeof sizes;
  className?: string;
  ring?: boolean;
  profession?: string | null;
}) {
  const t = tint(profession);
  const base = cn(
    "relative shrink-0 overflow-hidden rounded-full bg-paper-sunk",
    sizes[size],
    ring && "ring-4 ring-white shadow-card",
    className
  );

  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={name ?? "Profilo"} className={cn(base, "object-cover")} />;
  }

  return (
    <div
      className={cn(base, "flex items-center justify-center border font-display font-semibold")}
      style={{ background: t.soft, borderColor: `rgba(${t.glow}, 0.22)` }}
      aria-hidden
    >
      <span
        className="bg-clip-text text-transparent"
        style={{ backgroundImage: `linear-gradient(135deg, ${t.ink}, ${t.deep})` }}
      >
        {initials(name)}
      </span>
    </div>
  );
}

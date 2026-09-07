import { TECH_PARTNER } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * Firma tecnica del sito: "Powered by" + logo.
 * Il logo ha il suo fondo scuro, quindi viene mostrato come targhetta
 * arrotondata: sul bianco del footer sembra voluto e il marchio resta intatto.
 */
export function PoweredBy({ className }: { className?: string }) {
  return (
    <a
      href={TECH_PARTNER.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Powered by ${TECH_PARTNER.name}`}
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="text-[11px] uppercase tracking-[0.16em] text-ink-faint transition-colors duration-300 group-hover:text-ink-soft">
        Powered by
      </span>
      <span className="overflow-hidden rounded-lg ring-1 ring-line transition-all duration-300 group-hover:ring-line-strong group-hover:shadow-card">
        <img
          src={TECH_PARTNER.logo}
          alt={TECH_PARTNER.name}
          width={292}
          height={83}
          loading="lazy"
          decoding="async"
          className="block h-8 w-auto"
        />
      </span>
    </a>
  );
}

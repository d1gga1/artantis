import { Sparkles } from "lucide-react";
import { AUTHOR_NAME, CLAIM } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * La firma del sito: "Spazio editoriale curato by DOTT. VINCENZO SILVANO".
 * Un solo componente, così la firma è identica ovunque compaia e si cambia
 * da un posto solo.
 *
 *  - variante "pastiglia": il badge con la scintilla, sotto ai titoli di pagina
 *  - variante "riga": una riga di testo, per piè di pagina e pannelli
 */
export function Firma({
  variante = "pastiglia",
  className,
}: {
  variante?: "pastiglia" | "riga";
  className?: string;
}) {
  const testo = (
    <>
      <span className="font-medium tracking-wide text-ink-soft">{CLAIM}</span>{" "}
      <span className="whitespace-nowrap font-semibold uppercase tracking-[0.06em] text-ink">
        {AUTHOR_NAME}
      </span>
    </>
  );

  if (variante === "riga") {
    return (
      <p className={cn("text-[13.5px] leading-relaxed", className)}>{testo}</p>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-start gap-2 rounded-2xl leading-snug",
        "border border-line bg-white/90 px-4 py-2 text-[13px]",
        "sm:items-center sm:rounded-full sm:bg-white/75 sm:backdrop-blur",
        className
      )}
    >
      <Sparkles size={14} className="mt-[3px] shrink-0 text-accent sm:mt-0" />
      <span className="min-w-0">{testo}</span>
    </span>
  );
}

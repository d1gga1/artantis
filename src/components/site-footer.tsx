import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { PROFESSIONS } from "@/lib/types";
import { EDITORIAL_LINE } from "@/lib/brand";
import { Firma } from "@/components/firma";
import { PoweredBy } from "@/components/powered-by";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line bg-white/85 sm:bg-white/55 sm:backdrop-blur-sm">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark subtitle={false} size="lg" />
          <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-ink-soft">
            Uno spazio curato dove ricerca, medicina, arte e benessere si incontrano.
            Ogni contenuto passa da una revisione editoriale prima di essere pubblicato.
          </p>
          <Firma variante="riga" className="mt-6" />
          <p className="mt-2 text-[12.5px] uppercase tracking-[0.14em] text-ink-faint">
            {EDITORIAL_LINE}
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink">
            Discipline
          </h3>
          <ul className="space-y-2.5">
            {PROFESSIONS.filter((p) => p.value !== "altro").map((p) => (
              <li key={p.value}>
                <Link
                  href={`/esplora?professione=${p.value}`}
                  className="text-[14px] text-ink-soft transition-colors hover:text-accent"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink">
            Piattaforma
          </h3>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="text-[14px] text-ink-soft hover:text-accent">
                Feed pubblico
              </Link>
            </li>
            <li>
              <Link href="/esplora" className="text-[14px] text-ink-soft hover:text-accent">
                Esplora i profili
              </Link>
            </li>
            <li>
              <Link href="/membri" className="text-[14px] text-ink-soft hover:text-accent">
                Membri
              </Link>
            </li>
            <li>
              <Link href="/pubblica" className="text-[14px] text-ink-soft hover:text-accent">
                Proponi un contenuto
              </Link>
            </li>
            <li>
              <Link href="/area-personale" className="text-[14px] text-ink-soft hover:text-accent">
                Area personale
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-[12.5px] text-ink-faint sm:flex-row sm:gap-6">
          <p className="order-1">© {new Date().getFullYear()} ARTANTIS — tutti i diritti riservati.</p>
          <Firma variante="riga" className="order-3 text-[12.5px] sm:order-2" />
          <PoweredBy className="order-2 sm:order-3" />
        </div>
      </div>
    </footer>
  );
}

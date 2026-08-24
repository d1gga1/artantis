import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { FadeIn } from "@/components/motion";
import { AUTH_PANEL } from "@/lib/covers";
import { LivingBackground } from "@/components/living-background";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="grid min-h-[calc(100vh-68px)] lg:grid-cols-[1fr_1.05fr]">
      <aside className="relative hidden overflow-hidden border-r border-line bg-paper-warm lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AUTH_PANEL} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <LivingBackground intensity={1.15} density={0.8} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/30 to-white/70" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Wordmark size="lg" subtitle={false} />

          <div>
            <p className="eyebrow">Il progetto</p>
            <h2 className="mt-4 max-w-md text-[34px] font-semibold leading-[1.15]">
              Un archivio vivo di ricerca, cura e bellezza.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft">
              ARTANTIS raccoglie il lavoro di chi studia, cura e crea. Ogni contenuto
              proposto viene letto dalla direzione editoriale prima di comparire nel feed:
              è così che lo spazio resta di qualità.
            </p>
            <p className="mt-8 text-[12.5px] uppercase tracking-[0.16em] text-ink-faint">
              Direzione editoriale · Vincenzo Silva
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Ricerca", "Medicina", "Arte", "Pittura", "Arte e benessere", "Farmacia"].map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex items-center justify-center px-5 py-14 sm:px-10">
        <FadeIn className="w-full max-w-[420px]">
          <h1 className="text-[32px] font-semibold leading-tight">{title}</h1>
          <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">{subtitle}</p>

          <div className="mt-9">{children}</div>

          <div className="mt-8 border-t border-line pt-6 text-[14px] text-ink-soft">{footer}</div>

          <p className="mt-8 text-[12.5px] leading-relaxed text-ink-faint">
            Continuando accetti di usare ARTANTIS nel rispetto delle persone e dei contenuti
            altrui.{" "}
            <Link href="/" className="underline underline-offset-2 hover:text-accent">
              Torna al sito
            </Link>
          </p>
        </FadeIn>
      </div>
    </div>
  );
}

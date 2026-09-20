import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pagina non trovata",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container-page flex max-w-lg flex-col items-center py-32 text-center">
      <p className="font-display text-[64px] font-semibold leading-none text-accent/25">404</p>
      <h1 className="mt-5 text-[28px] font-semibold">Questa pagina non esiste</h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
        Il contenuto che cerchi potrebbe essere stato rimosso, oppure l&apos;indirizzo non è corretto.
      </p>
      <div className="mt-8 flex gap-2.5">
        <Link href="/" className="btn-primary">
          Torna al feed
        </Link>
        <Link href="/esplora" className="btn-ghost">
          Esplora i profili
        </Link>
      </div>
    </div>
  );
}

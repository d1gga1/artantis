"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex max-w-lg flex-col items-center py-32 text-center">
      <h1 className="text-[28px] font-semibold">Qualcosa non ha funzionato</h1>
      <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
        Si è verificato un problema nel caricare questa pagina. Riprova: se l&apos;errore
        continua, ricarica il sito tra qualche minuto.
      </p>
      <div className="mt-8 flex gap-2.5">
        <button onClick={reset} className="btn-primary">
          Riprova
        </button>
        <Link href="/" className="btn-ghost">
          Torna al feed
        </Link>
      </div>
    </div>
  );
}

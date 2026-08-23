import { Wordmark } from "@/components/wordmark";

export function SetupNotice() {
  return (
    <div className="grid-canvas flex min-h-screen items-center justify-center px-5 py-16">
      <div className="surface w-full max-w-lg p-9">
        <Wordmark subtitle={false} size="lg" />

        <h1 className="mt-7 text-[26px] font-semibold leading-tight">
          Manca ancora un passaggio
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Il sito è installato correttamente, ma non è ancora collegato al suo archivio
          dati. Servono due valori presi da Supabase.
        </p>

        <ol className="mt-7 space-y-4">
          {[
            "Apri il tuo progetto su supabase.com e vai in Settings → API.",
            "Copia il valore \"Project URL\" e la chiave \"anon public\".",
            "Incollali nelle variabili d'ambiente del sito (su Vercel: Settings → Environment Variables) con i nomi NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
            "Rilancia la pubblicazione del sito (Deployments → Redeploy).",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[12px] font-semibold text-accent-deep">
                {i + 1}
              </span>
              <span className="text-[14.5px] leading-relaxed text-ink-soft">{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-line pt-5 text-[13px] leading-relaxed text-ink-faint">
          Trovi la procedura completa, passo per passo, nel file GUIDA.md incluso nel
          progetto.
        </p>
      </div>
    </div>
  );
}

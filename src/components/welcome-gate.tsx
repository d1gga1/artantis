"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, ShieldCheck } from "lucide-react";
import { Firma } from "@/components/firma";

const CHIAVE = "artantis:ospite";
const ESCLUSE = ["/accedi", "/registrati", "/auth"];

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Schermata di benvenuto per chi arriva sul sito senza account.
 * Propone accesso o registrazione; in fondo, in grigio, la possibilità di
 * proseguire come ospite (sola lettura). La scelta vale per la sessione:
 * riaprendo il sito la schermata ricompare.
 */
export function WelcomeGate() {
  const pathname = usePathname();
  const [aperta, setAperta] = useState(false);

  const esclusa = ESCLUSE.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (esclusa) return;
    let ospite = false;
    try {
      ospite = window.sessionStorage.getItem(CHIAVE) === "1";
    } catch {
      // se lo storage non è disponibile mostriamo comunque la schermata
    }
    if (!ospite) setAperta(true);
  }, [esclusa]);

  // blocca lo scorrimento della pagina mentre la schermata è aperta
  useEffect(() => {
    if (!aperta) return;
    const precedente = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = precedente;
    };
  }, [aperta]);

  function continuaComeOspite() {
    try {
      window.sessionStorage.setItem(CHIAVE, "1");
    } catch {
      // niente storage: la schermata riapparirà al prossimo caricamento
    }
    setAperta(false);
  }

  const redirect = encodeURIComponent(pathname || "/");

  return (
    <AnimatePresence>
      {aperta && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="benvenuto-titolo"
        >
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 20%, rgba(15,111,140,0.10) 0%, rgba(255,255,255,0) 70%)",
            }}
            aria-hidden
          />

          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.45, ease }}
            className="relative my-auto w-full max-w-[480px] rounded-3xl border border-line bg-white p-8 shadow-lift sm:p-10"
          >
            <span className="font-display text-[22px] font-semibold uppercase tracking-[0.24em] text-ink">
              Artantis
            </span>

            <h1
              id="benvenuto-titolo"
              className="mt-6 text-[27px] font-semibold leading-tight sm:text-[30px]"
            >
              Benvenuto su ARTANTIS
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
              Uno spazio editoriale di ricercatori, medici, artisti, pittori, farmacisti e
              professionisti di arte e benessere. Accedi o crea il tuo profilo per apprezzare,
              commentare, seguire e proporre i tuoi contenuti.
            </p>

            <div className="mt-8 flex flex-col gap-2.5">
              <Link href={`/registrati?redirect=${redirect}`} className="btn-accent w-full !py-3 text-[15px]">
                Crea un account
                <ArrowRight size={16} />
              </Link>
              <Link href={`/accedi?redirect=${redirect}`} className="btn-ghost w-full !py-3 text-[15px]">
                Ho già un account · Accedi
              </Link>
            </div>

            <div className="mt-7 flex items-center gap-3 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
              <span className="h-px flex-1 bg-line" aria-hidden />
              oppure
              <span className="h-px flex-1 bg-line" aria-hidden />
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={continuaComeOspite}
                className="inline-flex items-center gap-2 text-[14px] font-medium text-ink-faint underline underline-offset-4 transition-colors hover:text-ink-soft"
              >
                <Eye size={15} />
                Continua senza account
              </button>
              <p className="mx-auto mt-2.5 max-w-[330px] text-[12.5px] leading-relaxed text-ink-faint">
                Potrai soltanto leggere e guardare i contenuti: nessun apprezzamento, commento,
                ricondivisione o pubblicazione.
              </p>
            </div>

            <div className="mt-8 flex items-start gap-2.5 border-t border-line pt-6 text-[12.5px] leading-relaxed text-ink-faint">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-accent" />
              <span>
                Ogni contenuto proposto passa da una revisione della direzione editoriale prima di
                comparire nel feed.
              </span>
            </div>

            <Firma variante="riga" className="mt-6" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";
import { KeyRound, TimerOff } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { NewPasswordForm } from "@/components/new-password-form";
import { getSessionUser } from "@/lib/queries";

export const metadata: Metadata = privateMetadata("Scegli una nuova password");
export const dynamic = "force-dynamic";

export default async function NewPasswordPage() {
  const user = await getSessionUser();

  // Ci si arriva solo dal collegamento ricevuto via email, che apre una
  // sessione temporanea. Senza quella sessione il collegamento è scaduto
  // oppure è già stato usato.
  if (!user) {
    return (
      <AuthShell
        title="Il collegamento non è più valido"
        subtitle="I collegamenti per reimpostare la password scadono dopo un'ora e valgono una volta sola."
        footer={
          <>
            Hai già una password?{" "}
            <Link href="/accedi" className="font-medium text-accent hover:text-accent-deep">
              Accedi
            </Link>
          </>
        }
      >
        <div className="surface-quiet flex flex-col items-start gap-3 p-6">
          <TimerOff size={22} className="text-signal-bad" />
          <p className="text-[14.5px] leading-relaxed text-ink-soft">
            Chiedine uno nuovo: ci vogliono pochi secondi e arriva subito nella tua posta.
          </p>
          <Link href="/password-dimenticata" className="btn-primary mt-1">
            Richiedi un nuovo collegamento
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Scegli una nuova password"
      subtitle="Ultimo passaggio: imposta la password con cui entrerai da adesso in poi."
      footer={
        <span className="flex items-start gap-2">
          <KeyRound size={15} className="mt-0.5 shrink-0 text-accent" />
          Dopo il salvataggio entrerai direttamente nella tua area personale.
        </span>
      }
    >
      <NewPasswordForm />
    </AuthShell>
  );
}

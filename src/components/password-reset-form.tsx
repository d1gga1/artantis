"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { MailCheck } from "lucide-react";
import { ErrorNote, SubmitButton } from "@/components/sign-in-form";
import { requestPasswordReset } from "@/lib/actions";

/**
 * Primo passo del recupero: si chiede l'indirizzo email e si invia il
 * messaggio con il collegamento per scegliere una nuova password.
 */
export function PasswordResetForm({ defaultEmail = "" }: { defaultEmail?: string }) {
  const [state, formAction] = useActionState(requestPasswordReset, null);

  if (state?.ok && state.message) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-quiet flex flex-col items-start gap-3 p-6"
      >
        <MailCheck size={22} className="text-signal-ok" />
        <h2 className="text-[19px] font-semibold">Controlla la tua email</h2>
        <p className="text-[14.5px] leading-relaxed text-ink-soft">{state.message}</p>
        <p className="text-[13px] leading-relaxed text-ink-faint">
          Il collegamento vale un&apos;ora sola. Se non trovi il messaggio, guarda anche nella
          posta indesiderata.
        </p>
        <Link href="/accedi" className="mt-1 text-[14px] font-medium text-accent hover:text-accent-deep">
          Torna all&apos;accesso
        </Link>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">
          Indirizzo email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          placeholder="nome@esempio.it"
          className="field"
        />
        <p className="mt-1.5 text-[12.5px] text-ink-faint">
          Usa l&apos;indirizzo con cui ti sei registrato: ti mandiamo un collegamento per
          scegliere una nuova password.
        </p>
      </div>

      {state?.error && <ErrorNote message={state.error} />}

      <SubmitButton label="Inviami il collegamento" />
    </form>
  );
}

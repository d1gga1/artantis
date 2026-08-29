"use client";

import { useActionState } from "react";
import { ErrorNote, SubmitButton } from "@/components/sign-in-form";
import { updatePassword } from "@/lib/actions";

/**
 * Secondo passo del recupero: chi arriva qui dal collegamento ricevuto via
 * email ha già una sessione valida e può scegliere la nuova password.
 */
export function NewPasswordForm() {
  const [state, formAction] = useActionState(updatePassword, null);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="password">
          Nuova password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Almeno 8 caratteri"
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="password_confirm">
          Ripeti la nuova password
        </label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Scrivila una seconda volta"
          className="field"
        />
      </div>

      {state?.error && <ErrorNote message={state.error} />}

      <SubmitButton label="Salva la nuova password" />
    </form>
  );
}

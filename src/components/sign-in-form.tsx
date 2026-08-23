"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight } from "lucide-react";
import { signIn } from "@/lib/actions";

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

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
          placeholder="nome@esempio.it"
          className="field"
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="field"
        />
      </div>

      {state?.error && <ErrorNote message={state.error} />}

      <SubmitButton label="Accedi" />
    </form>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2 rounded-xl border border-signal-bad/20 bg-signal-bad/5 px-4 py-3 text-[13.5px] text-signal-bad"
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      {message}
    </motion.p>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full !py-3 text-[15px]">
      {pending ? "Un attimo..." : label}
      {!pending && <ArrowRight size={16} />}
    </button>
  );
}

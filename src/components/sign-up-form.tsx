"use client";

import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { ErrorNote, SubmitButton } from "@/components/sign-in-form";
import { signUp } from "@/lib/actions";
import { PROFESSIONS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, null);
  const [profession, setProfession] = useState("ricercatore");
  const [username, setUsername] = useState("");

  if (state?.ok && state.message) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-quiet flex flex-col items-start gap-3 p-6"
      >
        <CheckCircle2 size={22} className="text-signal-ok" />
        <h2 className="text-[19px] font-semibold">Controlla la tua email</h2>
        <p className="text-[14.5px] leading-relaxed text-ink-soft">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="label" htmlFor="full_name">
          Nome e cognome
        </label>
        <input id="full_name" name="full_name" required className="field" placeholder="Maria Rossi" />
      </div>

      <div>
        <label className="label" htmlFor="username">
          Nome utente
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-faint">
            @
          </span>
          <input
            id="username"
            name="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
            className="field pl-8"
            placeholder="mariarossi"
          />
        </div>
        <p className="mt-1.5 text-[12.5px] text-ink-faint">
          Sarà l&apos;indirizzo del tuo profilo: /profilo/{username || "nomeutente"}
        </p>
      </div>

      <div>
        <span className="label">La tua area</span>
        <input type="hidden" name="profession" value={profession} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PROFESSIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setProfession(p.value)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                profession === p.value
                  ? "border-accent bg-accent-soft shadow-card"
                  : "border-line bg-white hover:border-line-strong"
              )}
            >
              <span
                className={cn(
                  "block text-[13.5px] font-medium",
                  profession === p.value ? "text-accent-deep" : "text-ink"
                )}
              >
                {p.label}
              </span>
            </button>
          ))}
        </div>
      </div>

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
          className="field"
          placeholder="nome@esempio.it"
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
          minLength={8}
          autoComplete="new-password"
          className="field"
          placeholder="Almeno 8 caratteri"
        />
      </div>

      {state?.error && <ErrorNote message={state.error} />}

      <SubmitButton label="Crea il mio profilo" />
    </form>
  );
}

"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Facebook, Instagram } from "lucide-react";
import { AvatarPicker, CoverPicker } from "@/components/image-picker";
import { ErrorNote } from "@/components/sign-in-form";
import { updateProfile } from "@/lib/actions";
import { PROFESSIONS, type Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateProfile, null);
  const [avatar, setAvatar] = useState(profile.avatar_url);
  const [cover, setCover] = useState(profile.cover_url);
  const [profession, setProfession] = useState(profile.profession ?? "altro");
  const [username, setUsername] = useState(profile.username);
  const [fullName, setFullName] = useState(profile.full_name);
  const [bio, setBio] = useState(profile.bio ?? "");

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="avatar_url" value={avatar ?? ""} />
      <input type="hidden" name="cover_url" value={cover ?? ""} />
      <input type="hidden" name="profession" value={profession} />

      <Section title="Immagini" description="Come appare il tuo profilo agli altri.">
        <CoverPicker userId={profile.id} value={cover} onChange={setCover} />
        <div className="mt-6">
          <AvatarPicker
            userId={profile.id}
            name={fullName || profile.username}
            value={avatar}
            onChange={setAvatar}
          />
        </div>
      </Section>

      <Section title="Identità" description="Il nome con cui ti presenti su ARTANTIS.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="full_name">
              Nome e cognome
            </label>
            <input
              id="full_name"
              name="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="field"
            />
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
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                className="field pl-8"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="bio">
            Biografia
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            maxLength={600}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Racconta in poche righe chi sei e di cosa ti occupi."
            className="field resize-none leading-relaxed"
          />
          <p className="mt-1.5 text-right text-[12px] tabular-nums text-ink-faint">
            {bio.length} / 600
          </p>
        </div>

        <div className="mt-4">
          <span className="label">Professione</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                <span className="mt-0.5 block text-[11.5px] leading-tight text-ink-faint">
                  {p.blurb}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Contatti"
        description="Questi dati compaiono sul tuo profilo pubblico: inserisci solo ciò che vuoi condividere."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Email di contatto"
            name="public_email"
            type="email"
            defaultValue={profile.public_email ?? ""}
            placeholder="nome@esempio.it"
          />
          <Field
            label="Numero di telefono"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            placeholder="+39 000 0000000"
          />
          <Field
            label="Data di nascita"
            name="birth_date"
            type="date"
            defaultValue={profile.birth_date ?? ""}
          />
          <Field label="Città" name="city" defaultValue={profile.city ?? ""} placeholder="Roma" />
        </div>
      </Section>

      <Section title="Presenza online" description="Collega i tuoi canali.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="instagram">
              <span className="inline-flex items-center gap-1.5">
                <Instagram size={13} /> Instagram
              </span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-faint">
                @
              </span>
              <input
                id="instagram"
                name="instagram"
                defaultValue={profile.instagram ?? ""}
                placeholder="nomeutente"
                className="field pl-8"
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="facebook">
              <span className="inline-flex items-center gap-1.5">
                <Facebook size={13} /> Facebook
              </span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-ink-faint">
                @
              </span>
              <input
                id="facebook"
                name="facebook"
                defaultValue={profile.facebook ?? ""}
                placeholder="nomeutente"
                className="field pl-8"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <Field
              label="Sito web"
              name="website"
              type="url"
              defaultValue={profile.website ?? ""}
              placeholder="https://ilmiosito.it"
            />
          </div>
        </div>
      </Section>

      <AnimatePresence>
        {state?.error && <ErrorNote message={state.error} />}
        {state?.ok && state.message && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-signal-ok/20 bg-signal-ok/5 px-4 py-3 text-[13.5px] text-signal-ok"
          >
            <CheckCircle2 size={15} />
            {state.message}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/90 p-3 shadow-lift backdrop-blur">
        <Link
          href={`/profilo/${profile.username}`}
          className="inline-flex items-center gap-1.5 px-2 text-[13.5px] text-ink-soft hover:text-accent"
        >
          <ExternalLink size={14} />
          Vedi il profilo pubblico
        </Link>
        <SaveButton />
      </div>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-accent !px-6">
      {pending ? "Salvataggio..." : "Salva modifiche"}
    </button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="surface p-5 sm:p-7"
    >
      <h2 className="text-[19px] font-semibold leading-tight">{title}</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{description}</p>
      <div className="mt-6">{children}</div>
    </motion.section>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="field"
      />
    </div>
  );
}

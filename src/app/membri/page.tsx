import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { EmptyState } from "@/components/empty-state";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CountUp } from "@/components/count-up";
import { getCurrentProfile, searchProfiles } from "@/lib/queries";
import { PROFESSIONS, professionLabel, type Profile } from "@/lib/types";
import { tint, tintVars } from "@/lib/palette";
import { COLORE } from "@/lib/colore";
import { formatCount, formatDateIt } from "@/lib/utils";
import { Firma } from "@/components/firma";

export const metadata: Metadata = { title: "Membri" };
export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const [all, viewer] = await Promise.all([searchProfiles(""), getCurrentProfile()]);

  // amministratori in cima, poi i profili più seguiti
  const members = [...all].sort((a, b) => {
    if (a.is_admin !== b.is_admin) return a.is_admin ? -1 : 1;
    return b.follower_count - a.follower_count;
  });

  const perDiscipline = PROFESSIONS.map((p) => ({
    ...p,
    n: members.filter((m) => m.profession === p.value).length,
  })).filter((p) => p.n > 0);

  return (
    <div className="container-page py-10 sm:py-14">
      <Reveal>
        <p className="eyebrow">Comunità</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[44px]">
          I membri di ARTANTIS
        </h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-ink-soft">
          Tutte le persone iscritte alla piattaforma, dalla direzione editoriale
          all&apos;ultimo profilo registrato. Accanto a ogni nome trovi il ruolo
          e la disciplina.
        </p>
        <Firma className="mt-5" />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-8 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/92 px-4 py-2 text-[13.5px] font-medium sm:bg-white/80 sm:backdrop-blur">
            <Users size={14} className="text-accent" />
            <CountUp value={members.length} className="tabular-nums" />
            {members.length === 1 ? " membro" : " membri"}
          </span>
          {perDiscipline.map((p) => {
            const t = tint(p.value);
            return (
              <Link
                key={p.value}
                href={`/esplora?professione=${p.value}`}
                className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-transform hover:-translate-y-0.5"
                style={{
                  borderColor: `rgba(${t.glow}, ${COLORE.bordoPastiglia})`,
                  color: t.deep,
                  background: `rgba(${t.glow}, ${COLORE.pastiglia})`,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: t.ink }} />
                {p.label}
                <span className="tabular-nums opacity-60">{p.n}</span>
              </Link>
            );
          })}
        </div>
      </Reveal>

      <div className="mt-10">
        {members.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="Nessun membro ancora"
            description="Appena qualcuno creerà il proprio profilo comparirà in questo elenco."
            actionLabel="Crea il primo profilo"
            actionHref="/registrati"
          />
        ) : (
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((m) => (
              <StaggerItem key={m.id}>
                <MemberCard member={m} isViewer={viewer?.id === m.id} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, isViewer }: { member: Profile; isViewer: boolean }) {
  const t = tint(member.profession);

  return (
    <Link
      href={`/profilo/${member.username}`}
      style={tintVars(member.profession)}
      className="surface tint-glow spotlight group relative block overflow-hidden p-5 hover:-translate-y-1"
    >
      <span
        className="tinted-rule absolute left-0 top-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100"
        aria-hidden
      />

      <div className="flex items-start gap-3.5">
        <Avatar
          url={member.avatar_url}
          name={member.full_name}
          size="md"
          profession={member.profession}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="hover-tint truncate text-[16px] font-semibold leading-tight">
              {member.full_name || member.username}
            </p>
            {isViewer && (
              <span className="rounded-full border border-line bg-paper-sunk px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                tu
              </span>
            )}
          </div>
          <p className="truncate text-[12.5px] text-ink-faint">@{member.username}</p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {member.is_admin ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-white">
                <ShieldCheck size={11} strokeWidth={2.6} />
                Admin
              </span>
            ) : (
              <span className="rounded-full border border-line bg-paper-sunk px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
                Membro
              </span>
            )}
            <span
              className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em]"
              style={{ background: t.soft, color: t.deep }}
            >
              {professionLabel(member.profession)}
            </span>
          </div>
        </div>
      </div>

      {member.bio && (
        <p className="mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
          {member.bio}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12.5px] text-ink-faint">
        <span className="flex gap-3">
          <span>
            <strong className="font-semibold text-ink">{formatCount(member.post_count)}</strong> post
          </span>
          <span>
            <strong className="font-semibold text-ink">{formatCount(member.follower_count)}</strong> follower
          </span>
        </span>
        <span className="hidden sm:inline">dal {formatDateIt(member.created_at, true)}</span>
      </div>
    </Link>
  );
}

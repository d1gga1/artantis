import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Inbox, ShieldCheck, XCircle } from "lucide-react";
import { ModerationCard } from "@/components/moderation-card";
import { PostCard } from "@/components/post-card";
import { Reveal } from "@/components/motion";
import { getCurrentProfile, getPendingPosts, getReviewedPosts } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Moderazione" };
export const dynamic = "force-dynamic";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ sezione?: string }>;
}) {
  const { sezione } = await searchParams;
  const section = sezione === "storico" ? "storico" : "coda";

  const profile = await getCurrentProfile();
  if (!profile) redirect("/accedi?redirect=/moderazione");

  if (!profile.is_admin) {
    return (
      <div className="container-page flex max-w-lg flex-col items-center py-28 text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white text-accent">
          <ShieldCheck size={20} />
        </div>
        <h1 className="text-[26px] font-semibold">Area riservata</h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-ink-soft">
          Questa sezione è accessibile solo alla direzione editoriale di ARTANTIS.
        </p>
        <Link href="/" className="btn-primary mt-7">
          Torna al feed
        </Link>
      </div>
    );
  }

  const [pending, reviewed] = await Promise.all([getPendingPosts(), getReviewedPosts()]);
  const approved = reviewed.filter((p) => p.status === "approved").length;
  const rejected = reviewed.filter((p) => p.status === "rejected").length;

  return (
    <div className="container-page max-w-4xl py-10 sm:py-14">
      <Reveal>
        <p className="eyebrow">Direzione editoriale</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[42px]">
          Moderazione dei contenuti
        </h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">
          Ogni proposta arriva qui prima di comparire nel feed. Approva per pubblicare,
          oppure rifiuta indicando all&apos;autore il motivo.
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-9 grid grid-cols-3 gap-3">
          <StatCard icon={Clock} label="In attesa" value={pending.length} tone="warn" />
          <StatCard icon={CheckCircle2} label="Approvati" value={approved} tone="ok" />
          <StatCard icon={XCircle} label="Rifiutati" value={rejected} tone="bad" />
        </div>
      </Reveal>

      <div className="mt-10 flex items-center gap-1 border-b border-line">
        <Tab href="/moderazione" active={section === "coda"}>
          Coda di revisione
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-signal-warn/12 px-2 py-0.5 text-[11px] font-semibold text-signal-warn">
              {pending.length}
            </span>
          )}
        </Tab>
        <Tab href="/moderazione?sezione=storico" active={section === "storico"}>
          Storico decisioni
        </Tab>
      </div>

      <div className="mt-8 space-y-5">
        {section === "coda" ? (
          pending.length === 0 ? (
            <div className="surface-quiet flex flex-col items-center px-8 py-16 text-center">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white text-signal-ok">
                <Inbox size={20} />
              </div>
              <h3 className="text-[19px] font-semibold">Nessuna proposta in attesa</h3>
              <p className="mt-2 max-w-sm text-[14.5px] text-ink-soft">
                Hai esaminato tutto. Le nuove proposte compariranno qui appena vengono inviate.
              </p>
            </div>
          ) : (
            pending.map((post, i) => <ModerationCard key={post.id} post={post} index={i} />)
          )
        ) : reviewed.length === 0 ? (
          <div className="surface-quiet px-8 py-16 text-center">
            <p className="text-[14.5px] text-ink-soft">Nessuna decisione registrata finora.</p>
          </div>
        ) : (
          reviewed.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} isAuthenticated />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  tone: "ok" | "warn" | "bad";
}) {
  const tones = {
    ok: "text-signal-ok",
    warn: "text-signal-warn",
    bad: "text-signal-bad",
  };
  return (
    <div className="surface p-4">
      <Icon size={15} className={cn(tones[tone])} />
      <p className="mt-3 font-display text-[28px] font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-ink-faint">{label}</p>
    </div>
  );
}

function Tab({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "-mb-px flex items-center border-b-2 px-4 py-3 text-[14.5px] font-medium transition-colors",
        active ? "border-accent text-ink" : "border-transparent text-ink-faint hover:text-ink-soft"
      )}
    >
      {children}
    </Link>
  );
}

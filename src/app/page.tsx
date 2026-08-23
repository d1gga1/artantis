import Link from "next/link";
import { FileText, PenLine, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Hero } from "@/components/hero";
import { PostCard } from "@/components/post-card";
import { FeedTabs } from "@/components/feed-tabs";
import { EmptyState } from "@/components/empty-state";
import { ProfileMiniCard } from "@/components/profile-mini-card";
import { Reveal } from "@/components/motion";
import {
  getCurrentProfile,
  getFeed,
  getViewerInteractions,
  searchProfiles,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === "seguiti" ? "seguiti" : "tutto";

  const profile = await getCurrentProfile();
  const posts = await getFeed(
    tab === "seguiti" && profile ? { followingOf: profile.id, limit: 30 } : { limit: 30 }
  );
  const interactions = await getViewerInteractions(
    posts.map((p) => p.id),
    profile?.id
  );
  const suggested = (await searchProfiles("")).filter((p) => p.id !== profile?.id).slice(0, 5);

  return (
    <>
      {!profile && <Hero />}

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            {profile && (
              <Reveal>
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                  <div>
                    <p className="eyebrow">Bentornato</p>
                    <h1 className="mt-1.5 text-[30px] font-semibold leading-tight sm:text-[36px]">
                      {profile.full_name?.split(" ")[0] || profile.username}
                    </h1>
                  </div>
                  <Link href="/pubblica" className="btn-accent self-start sm:self-auto">
                    <PenLine size={15} />
                    Proponi un contenuto
                  </Link>
                </div>
              </Reveal>
            )}

            <FeedTabs active={tab} showFollowing={Boolean(profile)} />

            <div className="mt-7 space-y-5">
              {posts.length === 0 ? (
                tab === "seguiti" ? (
                  <EmptyState
                    icon={<Users size={20} />}
                    title="Non segui ancora nessuno"
                    description="Trova i professionisti che ti interessano e il loro lavoro comparirà qui, ordinato dal più recente."
                    actionLabel="Esplora i profili"
                    actionHref="/esplora"
                  />
                ) : (
                  <EmptyState
                    icon={<FileText size={20} />}
                    title="Il feed è ancora vuoto"
                    description="Non ci sono contenuti pubblicati. Appena la direzione editoriale approverà le prime proposte, le troverai qui."
                    actionLabel="Proponi il primo contenuto"
                    actionHref="/pubblica"
                  />
                )
              ) : (
                posts.map((post, i) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={i}
                    liked={interactions.liked.has(post.id)}
                    reposted={interactions.reposted.has(post.id)}
                    isAuthenticated={Boolean(profile)}
                  />
                ))
              )}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-[92px] lg:h-fit">
            <Reveal delay={0.05}>
              <div className="surface p-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-accent" />
                  <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                    Come funziona
                  </h2>
                </div>
                <ol className="space-y-3.5">
                  {[
                    "Leggere è libero: nessun account richiesto.",
                    "Con un profilo puoi apprezzare, commentare e ricondividere.",
                    "Chiunque può proporre un contenuto.",
                    "La direzione editoriale lo valuta e decide se pubblicarlo.",
                  ].map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-deep">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] leading-relaxed text-ink-soft">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {suggested.length > 0 && (
              <Reveal delay={0.1}>
                <div className="surface p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={15} className="text-accent" />
                    <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em]">
                      Da scoprire
                    </h2>
                  </div>
                  <div className="space-y-0.5">
                    {suggested.map((p) => (
                      <ProfileMiniCard key={p.id} profile={p} />
                    ))}
                  </div>
                  <Link
                    href="/esplora"
                    className="mt-3 block border-t border-line pt-3 text-[13.5px] font-medium text-accent hover:text-accent-deep"
                  >
                    Vedi tutti i profili →
                  </Link>
                </div>
              </Reveal>
            )}

            {!profile && (
              <Reveal delay={0.15}>
                <div className="surface-quiet p-5">
                  <h2 className="font-display text-[19px] font-semibold leading-snug">
                    Hai qualcosa da mostrare?
                  </h2>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                    Crea il tuo profilo professionale e proponi il tuo lavoro alla redazione.
                  </p>
                  <Link href="/registrati" className="btn-primary mt-4 w-full">
                    Crea profilo
                  </Link>
                </div>
              </Reveal>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}

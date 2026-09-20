import Link from "next/link";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import {
  NO_INDEX_RULES,
  absoluteUrl,
  pageMetadata,
  toDescription,
} from "@/lib/seo";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Facebook,
  Globe,
  Instagram,
  Lock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Avatar } from "@/components/avatar";
import { PostCard } from "@/components/post-card";
import { FollowButton } from "@/components/follow-button";
import { ProfileMiniCard } from "@/components/profile-mini-card";
import { Reveal } from "@/components/motion";
import { ProfileCover } from "@/components/profile-cover";
import { ShareMenu } from "@/components/share-menu";
import {
  getCurrentProfile,
  getNetwork,
  getPostsByAuthor,
  getProfileByUsername,
  getViewerInteractions,
  isFollowing,
} from "@/lib/queries";
import { professionLabel } from "@/lib/types";
import { tint, tintVars } from "@/lib/palette";
import { CountUp } from "@/components/count-up";
import { cn, formatCount, formatDateIt, socialUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) return { title: "Profilo non trovato", robots: NO_INDEX_RULES };

  return pageMetadata({
    title: profile.full_name || profile.username,
    description: toDescription(
      profile.bio ||
        `${professionLabel(profile.profession)} su ARTANTIS, lo spazio editoriale di ricerca, medicina e arte.`
    ),
    path: `/profilo/${profile.username}`,
    type: "profile",
    image: absoluteUrl(`/profilo/${profile.username}/opengraph-image`),
  });
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ sezione?: string }>;
}) {
  const { username } = await params;
  const { sezione } = await searchParams;
  const section =
    sezione === "follower" ? "follower" : sezione === "seguiti" ? "seguiti" : "contenuti";

  const [profile, viewer] = await Promise.all([
    getProfileByUsername(username),
    getCurrentProfile(),
  ]);
  if (!profile) notFound();

  const isOwn = viewer?.id === profile.id;
  const following = await isFollowing(viewer?.id, profile.id);
  const canSeeNetwork = isOwn || following || Boolean(viewer?.is_admin);

  const posts = await getPostsByAuthor(profile.id, isOwn);
  const interactions = await getViewerInteractions(
    posts.map((p) => p.id),
    viewer?.id
  );

  const network =
    section !== "contenuti" && canSeeNetwork
      ? await getNetwork(profile.id, section === "follower" ? "followers" : "following")
      : [];

  const details = [
    profile.city && { icon: MapPin, text: profile.city },
    profile.birth_date && {
      icon: CalendarDays,
      text: formatDateIt(profile.birth_date),
    },
    profile.public_email && {
      icon: Mail,
      text: profile.public_email,
      href: `mailto:${profile.public_email}`,
    },
    profile.phone && { icon: Phone, text: profile.phone, href: `tel:${profile.phone}` },
    profile.website && {
      icon: Globe,
      text: profile.website.replace(/^https?:\/\//, ""),
      href: profile.website,
    },
    profile.instagram && {
      icon: Instagram,
      text: `@${profile.instagram}`,
      href: socialUrl("instagram", profile.instagram),
    },
    profile.facebook && {
      icon: Facebook,
      text: `@${profile.facebook}`,
      href: socialUrl("facebook", profile.facebook),
    },
  ].filter(Boolean) as { icon: React.ComponentType<{ size?: number }>; text: string; href?: string }[];

  const t = tint(profile.profession);

  // Scheda per Google: chi è questa persona e cosa fa.
  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": absoluteUrl(`/profilo/${profile.username}`),
    inLanguage: "it-IT",
    isPartOf: { "@id": absoluteUrl("/#website") },
    dateCreated: profile.created_at,
    mainEntity: {
      "@type": "Person",
      "@id": absoluteUrl(`/profilo/${profile.username}#person`),
      name: profile.full_name || profile.username,
      alternateName: profile.username,
      url: absoluteUrl(`/profilo/${profile.username}`),
      jobTitle: professionLabel(profile.profession),
      description: profile.bio ?? undefined,
      image: profile.avatar_url ?? undefined,
      address: profile.city
        ? { "@type": "PostalAddress", addressLocality: profile.city }
        : undefined,
      sameAs: [
        profile.website,
        profile.instagram ? `https://instagram.com/${profile.instagram}` : null,
        profile.facebook ? `https://facebook.com/${profile.facebook}` : null,
      ].filter(Boolean),
      memberOf: { "@id": absoluteUrl("/#organization") },
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/FollowAction",
        userInteractionCount: profile.follower_count,
      },
    },
  };

  return (
    <div style={tintVars(profile.profession)}>
      <JsonLd data={profileJsonLd} />
      <ProfileCover url={profile.cover_url} profession={profile.profession} />

      <div className="container-page max-w-5xl">
        <div className="relative -mt-16 sm:-mt-20">
          <Reveal y={12}>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="flex items-end gap-5">
                <Avatar url={profile.avatar_url} name={profile.full_name} size="xl" ring profession={profile.profession} />
                <div className="pb-2">
                  <h1 className="text-[27px] font-semibold leading-tight sm:text-[33px]">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="mt-1 text-[13px] text-ink-faint">
                    @{profile.username}
                    {" · "}
                    <span
                      className="font-medium uppercase tracking-[0.1em]"
                      style={{ color: t.ink }}
                    >
                      {professionLabel(profile.profession)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pb-2">
                {isOwn ? (
                  <Link href="/area-personale" className="btn-ghost">
                    Modifica profilo
                  </Link>
                ) : (
                  <FollowButton
                    targetId={profile.id}
                    initialFollowing={following}
                    isAuthenticated={Boolean(viewer)}
                  />
                )}
                <ShareMenu
                  url={`/profilo/${profile.username}`}
                  title={`${profile.full_name || profile.username} su ARTANTIS`}
                  trigger="ghost"
                  align="right"
                  label="Condividi il profilo"
                />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-8 grid gap-9 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-[92px] lg:h-fit">
            <Reveal delay={0.05}>
              <div className="surface p-5">
                {profile.bio && (
                  <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-soft">
                    {profile.bio}
                  </p>
                )}

                {details.length > 0 && (
                  <ul className={cn("space-y-2.5", profile.bio && "mt-5 border-t border-line pt-5")}>
                    {details.map((d, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                        <d.icon size={14} />
                        {d.href ? (
                          <a
                            href={d.href}
                            target={d.href.startsWith("http") ? "_blank" : undefined}
                            rel="noopener noreferrer"
                            className="truncate transition-colors hover:text-accent"
                          >
                            {d.text}
                          </a>
                        ) : (
                          <span className="truncate">{d.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {!profile.bio && details.length === 0 && (
                  <p className="text-[14px] text-ink-faint">
                    Questo profilo non ha ancora aggiunto informazioni.
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="surface grid grid-cols-3 divide-x divide-line">
                <Stat label="Contenuti" value={profile.post_count} href={`/profilo/${profile.username}`} />
                <Stat
                  label="Follower"
                  value={profile.follower_count}
                  href={`/profilo/${profile.username}?sezione=follower`}
                  locked={!canSeeNetwork}
                />
                <Stat
                  label="Seguiti"
                  value={profile.following_count}
                  href={`/profilo/${profile.username}?sezione=seguiti`}
                  locked={!canSeeNetwork}
                />
              </div>
            </Reveal>
          </aside>

          <div>
            <div className="flex items-center gap-1 border-b border-line">
              <Tab href={`/profilo/${profile.username}`} active={section === "contenuti"}>
                Contenuti
              </Tab>
              <Tab
                href={`/profilo/${profile.username}?sezione=follower`}
                active={section === "follower"}
              >
                Follower
              </Tab>
              <Tab
                href={`/profilo/${profile.username}?sezione=seguiti`}
                active={section === "seguiti"}
              >
                Seguiti
              </Tab>
            </div>

            <div className="mt-7 space-y-5">
              {section === "contenuti" ? (
                posts.length === 0 ? (
                  <div className="surface-quiet px-8 py-14 text-center">
                    <h3 className="text-[18px] font-semibold">Nessun contenuto pubblicato</h3>
                    <p className="mx-auto mt-2 max-w-sm text-[14px] text-ink-soft">
                      {isOwn
                        ? "Quando la direzione editoriale approverà le tue proposte, le troverai qui."
                        : "Questo profilo non ha ancora contenuti pubblicati."}
                    </p>
                  </div>
                ) : (
                  posts.map((post, i) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={i}
                      liked={interactions.liked.has(post.id)}
                      reposted={interactions.reposted.has(post.id)}
                      isAuthenticated={Boolean(viewer)}
                    />
                  ))
                )
              ) : !canSeeNetwork ? (
                <LockedNetwork
                  name={profile.full_name || profile.username}
                  isAuthenticated={Boolean(viewer)}
                  targetId={profile.id}
                />
              ) : network.length === 0 ? (
                <div className="surface-quiet px-8 py-14 text-center">
                  <p className="text-[14.5px] text-ink-soft">
                    {section === "follower"
                      ? "Questo profilo non ha ancora follower."
                      : "Questo profilo non segue ancora nessuno."}
                  </p>
                </div>
              ) : (
                <div className="surface p-3">
                  {network.map((p) => (
                    <ProfileMiniCard key={p.id} profile={p} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  href,
  locked = false,
}: {
  label: string;
  value: number;
  href: string;
  locked?: boolean;
}) {
  return (
    <Link href={href} className="group px-3 py-4 text-center transition-colors hover:bg-paper-warm">
      <CountUp
        value={value}
        className="block whitespace-nowrap font-display text-[21px] font-semibold leading-none tabular-nums"
      />
      <p className="mt-1.5 inline-flex items-center gap-1 text-[12px] text-ink-faint">
        {locked && <Lock size={10} />}
        {label}
      </p>
    </Link>
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
        "-mb-px border-b-2 px-4 py-3 text-[14.5px] font-medium transition-colors",
        active ? "text-ink" : "border-transparent text-ink-faint hover:text-ink-soft"
      )}
      style={active ? { borderColor: "var(--t-ink)" } : undefined}
    >
      {children}
    </Link>
  );
}

function LockedNetwork({
  name,
  isAuthenticated,
  targetId,
}: {
  name: string;
  isAuthenticated: boolean;
  targetId: string;
}) {
  return (
    <div className="surface-quiet flex flex-col items-center px-8 py-16 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white text-accent">
        <Lock size={19} />
      </div>
      <h3 className="text-[19px] font-semibold">Rete riservata</h3>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">
        Su ARTANTIS l&apos;elenco di follower e profili seguiti è visibile soltanto a chi
        segue la persona. Segui {name} per vedere la sua rete.
      </p>
      <div className="mt-6">
        <FollowButton targetId={targetId} initialFollowing={false} isAuthenticated={isAuthenticated} />
      </div>
    </div>
  );
}

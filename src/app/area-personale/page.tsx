import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FileText, Heart, UserRound, Users } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";
import { MyPosts } from "@/components/my-posts";
import { Reveal } from "@/components/motion";
import { getCurrentProfile, getPostsByAuthor } from "@/lib/queries";
import { cn, formatCount } from "@/lib/utils";

export const metadata: Metadata = { title: "Area personale" };
export const dynamic = "force-dynamic";

export default async function PersonalAreaPage({
  searchParams,
}: {
  searchParams: Promise<{ sezione?: string }>;
}) {
  const { sezione } = await searchParams;
  const section = sezione === "contenuti" ? "contenuti" : "profilo";

  const profile = await getCurrentProfile();
  if (!profile) redirect("/accedi?redirect=/area-personale");

  const posts = await getPostsByAuthor(profile.id, true);
  const pending = posts.filter((p) => p.status === "pending").length;

  const stats = [
    { label: "Contenuti pubblicati", value: profile.post_count, icon: FileText },
    { label: "Follower", value: profile.follower_count, icon: Users },
    { label: "Profili seguiti", value: profile.following_count, icon: UserRound },
    {
      label: "Apprezzamenti ricevuti",
      value: posts.reduce((sum, p) => sum + p.like_count, 0),
      icon: Heart,
    },
  ];

  return (
    <div className="container-page max-w-5xl py-10 sm:py-14">
      <Reveal>
        <p className="eyebrow">Area personale</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[42px]">
          Il tuo spazio su ARTANTIS
        </h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">
          Da qui gestisci il tuo profilo pubblico e segui lo stato di tutto ciò che hai proposto.
        </p>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="surface p-4">
              <s.icon size={15} className="text-accent" />
              <p className="mt-3 font-display text-[26px] font-semibold leading-none tabular-nums">
                {formatCount(s.value)}
              </p>
              <p className="mt-1.5 text-[12px] leading-tight text-ink-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-10 flex items-center gap-1 border-b border-line">
        <TabLink href="/area-personale" active={section === "profilo"}>
          Il mio profilo
        </TabLink>
        <TabLink href="/area-personale?sezione=contenuti" active={section === "contenuti"}>
          I miei contenuti
          {pending > 0 && (
            <span className="ml-2 rounded-full bg-signal-warn/12 px-2 py-0.5 text-[11px] font-semibold text-signal-warn">
              {pending} in revisione
            </span>
          )}
        </TabLink>
      </div>

      <div className="mt-8">
        {section === "profilo" ? <ProfileForm profile={profile} /> : <MyPosts posts={posts} />}
      </div>
    </div>
  );
}

function TabLink({
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
        "relative -mb-px flex items-center border-b-2 px-4 py-3 text-[14.5px] font-medium transition-colors",
        active
          ? "border-accent text-ink"
          : "border-transparent text-ink-faint hover:text-ink-soft"
      )}
    >
      {children}
    </Link>
  );
}

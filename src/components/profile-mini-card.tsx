import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { professionLabel, type Profile } from "@/lib/types";
import { coverFor } from "@/lib/covers";
import { formatCount } from "@/lib/utils";

export function ProfileMiniCard({ profile }: { profile: Profile }) {
  return (
    <Link
      href={`/profilo/${profile.username}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-paper-sunk"
    >
      <Avatar url={profile.avatar_url} name={profile.full_name} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium leading-tight">
          {profile.full_name || profile.username}
        </p>
        <p className="truncate text-[12.5px] text-ink-faint">
          {professionLabel(profile.profession)} · {formatCount(profile.follower_count)} follower
        </p>
      </div>
    </Link>
  );
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <Link
      href={`/profilo/${profile.username}`}
      className="surface group block overflow-hidden transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="relative h-20 bg-paper-sunk">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.cover_url ?? coverFor(profile.profession)}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
        />
      </div>
      <div className="px-5 pb-5">
        <div className="-mt-8 mb-3">
          <Avatar url={profile.avatar_url} name={profile.full_name} size="md" ring />
        </div>
        <p className="truncate text-[16px] font-semibold leading-tight group-hover:text-accent-deep">
          {profile.full_name || profile.username}
        </p>
        <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-accent">
          {professionLabel(profile.profession)}
        </p>
        {profile.bio && (
          <p className="mt-2.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
            {profile.bio}
          </p>
        )}
        <div className="mt-4 flex gap-4 border-t border-line pt-3 text-[12.5px] text-ink-faint">
          <span>
            <strong className="font-semibold text-ink">{formatCount(profile.post_count)}</strong> post
          </span>
          <span>
            <strong className="font-semibold text-ink">{formatCount(profile.follower_count)}</strong> follower
          </span>
        </div>
      </div>
    </Link>
  );
}

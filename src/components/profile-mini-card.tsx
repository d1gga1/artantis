import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { professionLabel, type Profile } from "@/lib/types";
import { coverFor } from "@/lib/covers";
import { tint, tintVars } from "@/lib/palette";
import { formatCount } from "@/lib/utils";

export function ProfileMiniCard({ profile }: { profile: Profile }) {
  return (
    <Link
      href={`/profilo/${profile.username}`}
      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-paper-sunk"
    >
      <Avatar url={profile.avatar_url} name={profile.full_name} size="sm" profession={profile.profession} />
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
      style={tintVars(profile.profession)}
      className="surface tint-glow spotlight group relative block overflow-hidden hover:-translate-y-1"
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
          <Avatar url={profile.avatar_url} name={profile.full_name} size="md" ring profession={profile.profession} />
        </div>
        <p className="hover-tint truncate text-[16px] font-semibold leading-tight">
          {profile.full_name || profile.username}
        </p>
        <p
          className="mt-0.5 inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.1em]"
          style={{ color: tint(profile.profession).ink }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: tint(profile.profession).ink }}
            aria-hidden
          />
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

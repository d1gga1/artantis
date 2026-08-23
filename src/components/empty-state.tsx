import Link from "next/link";
import { Reveal } from "@/components/motion";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Reveal>
      <div className="surface-quiet flex flex-col items-center px-8 py-16 text-center">
        {icon && (
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-white text-accent">
            {icon}
          </div>
        )}
        <h3 className="text-[20px] font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-soft">{description}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="btn-accent mt-6">
            {actionLabel}
          </Link>
        )}
      </div>
    </Reveal>
  );
}

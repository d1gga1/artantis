import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { Users } from "lucide-react";
import { ExploreControls } from "@/components/explore-controls";
import { ProfileCard } from "@/components/profile-mini-card";
import { EmptyState } from "@/components/empty-state";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { searchProfiles } from "@/lib/queries";
import { professionLabel } from "@/lib/types";
import { Firma } from "@/components/firma";

export const metadata: Metadata = pageMetadata({
  title: "Esplora contenuti e membri",
  description:
    "Cerca fra i contenuti approvati e i professionisti di ARTANTIS: ricerca, medicina, arte, pittura, arte e benessere, farmacia.",
  path: "/esplora",
});
export const dynamic = "force-dynamic";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; professione?: string }>;
}) {
  const { q = "", professione } = await searchParams;
  const profiles = await searchProfiles(q, professione);

  return (
    <div className="container-page py-10 sm:py-14">
      <Reveal>
        <p className="eyebrow">Directory</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[44px]">
          Le persone di ARTANTIS
        </h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">
          Ricercatori, medici, artisti, pittori, farmacisti e professionisti di arte e
          benessere. Trova chi lavora su ciò che ti interessa e inizia a seguirlo.
        </p>
        <Firma className="mt-5" />
      </Reveal>

      <div className="mt-9">
        <Suspense fallback={<div className="skeleton h-14 w-full" />}>
          <ExploreControls />
        </Suspense>
      </div>

      <div className="mt-9">
        <p className="mb-5 text-[13px] text-ink-faint">
          {profiles.length === 0
            ? "Nessun risultato"
            : `${profiles.length} profil${profiles.length === 1 ? "o" : "i"}`}
          {professione && ` · ${professionLabel(professione)}`}
          {q && ` · ricerca "${q}"`}
        </p>

        {profiles.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="Nessun profilo trovato"
            description="Prova a cambiare i termini di ricerca oppure rimuovi il filtro sulla disciplina."
            actionLabel="Vedi tutti i profili"
            actionHref="/esplora"
          />
        ) : (
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <StaggerItem key={p.id}>
                <ProfileCard profile={p} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}

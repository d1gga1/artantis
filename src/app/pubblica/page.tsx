import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import { PostComposer } from "@/components/post-composer";
import { Reveal } from "@/components/motion";
import { getCurrentProfile } from "@/lib/queries";
import { Firma } from "@/components/firma";

export const metadata: Metadata = privateMetadata("Proponi un contenuto");
export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/accedi?redirect=/pubblica");

  return (
    <div className="container-page max-w-3xl py-10 sm:py-14">
      <Reveal>
        <p className="eyebrow">Nuova proposta</p>
        <h1 className="mt-2 text-[34px] font-semibold leading-tight sm:text-[42px]">
          Pubblica su ARTANTIS
        </h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">
          Scrivi liberamente e allega quello che serve: immagini, video, GIF.
          Quando invii, la proposta arriva alla direzione editoriale che decide
          se pubblicarla nel feed.
        </p>
        <Firma className="mt-5" />
      </Reveal>

      <div className="mt-10">
        <PostComposer profile={profile} />
      </div>
    </div>
  );
}

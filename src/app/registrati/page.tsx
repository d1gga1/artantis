import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/sign-up-form";
import { getSessionUser } from "@/lib/queries";

export const metadata: Metadata = { title: "Crea il tuo profilo" };
export const dynamic = "force-dynamic";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: to } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(to && to.startsWith("/") ? to : "/area-personale");

  return (
    <AuthShell
      title="Entra in ARTANTIS"
      subtitle="Crea il tuo profilo professionale: potrai proporre contenuti, seguire altri professionisti e partecipare alle conversazioni."
      footer={
        <>
          Hai già un profilo?{" "}
          <Link
            href={`/accedi${to ? `?redirect=${encodeURIComponent(to)}` : ""}`}
            className="font-medium text-accent hover:text-accent-deep"
          >
            Accedi
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}

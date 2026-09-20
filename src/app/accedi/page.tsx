import Link from "next/link";
import type { Metadata } from "next";
import { privateMetadata } from "@/lib/seo";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/sign-in-form";
import { getSessionUser } from "@/lib/queries";

export const metadata: Metadata = privateMetadata("Accedi", "Entra nel tuo profilo ARTANTIS.");
export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: to } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(to && to.startsWith("/") ? to : "/");

  return (
    <AuthShell
      title="Bentornato su ARTANTIS"
      subtitle="Accedi per apprezzare, commentare, ricondividere e proporre i tuoi contenuti."
      footer={
        <>
          Non hai ancora un profilo?{" "}
          <Link
            href={`/registrati${to ? `?redirect=${encodeURIComponent(to)}` : ""}`}
            className="font-medium text-accent hover:text-accent-deep"
          >
            Creane uno
          </Link>
        </>
      }
    >
      <SignInForm redirectTo={to ?? "/"} />
    </AuthShell>
  );
}

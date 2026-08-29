import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { PasswordResetForm } from "@/components/password-reset-form";

export const metadata: Metadata = { title: "Password dimenticata" };
export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <AuthShell
      title="Hai dimenticato la password?"
      subtitle="Capita a tutti. Scrivi qui il tuo indirizzo email e ti mandiamo un collegamento per sceglierne una nuova."
      footer={
        <>
          Te la sei ricordata?{" "}
          <Link href="/accedi" className="font-medium text-accent hover:text-accent-deep">
            Torna all&apos;accesso
          </Link>
        </>
      }
    >
      <PasswordResetForm defaultEmail={email ?? ""} />
    </AuthShell>
  );
}

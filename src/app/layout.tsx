import type { Metadata, Viewport } from "next";
// I caratteri sono inclusi nel progetto: nessuna chiamata a servizi esterni.
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteBackground } from "@/components/site-background";
import { SpotlightLayer } from "@/components/spotlight";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SetupNotice } from "@/components/setup-notice";
import { getCurrentProfile } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: {
    default: "ARTANTIS — by Dott. Vincenzo Silvano",
    template: "%s · ARTANTIS",
  },
  description:
    "ARTANTIS è lo spazio editoriale di ricercatori, medici, artisti, pittori, farmacisti e professionisti di arte e benessere. Contenuti selezionati, pubblicati dopo revisione.",
  openGraph: {
    title: "ARTANTIS — by Dott. Vincenzo Silvano",
    description:
      "Ricerca, medicina, arte e benessere in un unico spazio editoriale curato.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const profile = configured ? await getCurrentProfile() : null;

  return (
    <html lang="it">
      <body className="flex min-h-screen flex-col">
        {configured ? (
          <>
            <SiteBackground />
            <SpotlightLayer />
            <ScrollProgress />
            <SiteHeader profile={profile} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </>
        ) : (
          <SetupNotice />
        )}
      </body>
    </html>
  );
}

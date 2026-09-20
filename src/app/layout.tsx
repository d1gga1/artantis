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
import { WelcomeGate } from "@/components/welcome-gate";
import { JsonLd } from "@/components/json-ld";
import { getCurrentProfile } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AUTHOR_NAME } from "@/lib/brand";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

export const metadata: Metadata = {
  // Base per tutti gli indirizzi assoluti: senza questa, le anteprime social
  // vengono generate con percorsi relativi e i social non le vedono.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · ARTANTIS",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME }],
  creator: AUTHOR_NAME,
  publisher: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Anteprime ampie nei risultati e nessun taglio artificiale ai testi.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

/**
 * Scheda d'identità del sito per Google: chi pubblica, come si chiama,
 * come si cerca al suo interno.
 */
const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.svg"),
    description: SITE_DESCRIPTION,
    founder: { "@type": "Person", name: AUTHOR_NAME },
    knowsAbout: [
      "ricerca scientifica",
      "medicina",
      "arte",
      "pittura",
      "arte e benessere",
      "farmacia",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "it-IT",
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/esplora?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const profile = configured ? await getCurrentProfile() : null;

  return (
    <html lang="it">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={siteJsonLd} />
        {configured ? (
          <>
            <SiteBackground />
            <SpotlightLayer />
            <ScrollProgress />
            <SiteHeader profile={profile} />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            {/* prima visita senza account: invito ad accedere o registrarsi */}
            {!profile && <WelcomeGate />}
          </>
        ) : (
          <SetupNotice />
        )}
      </body>
    </html>
  );
}

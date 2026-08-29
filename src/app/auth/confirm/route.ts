import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Conferma dell'indirizzo email e recupero della password.
 * Funziona con i modelli di email impostati su:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/nuova-password
 * Accetta anche i collegamenti che arrivano con il codice (?code=...), così
 * funziona pure con i modelli lasciati come li propone Supabase.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  // Il ritorno deve restare dentro al sito: mai un indirizzo esterno.
  const richiesto = searchParams.get("next");
  const next = richiesto && richiesto.startsWith("/") && !richiesto.startsWith("//")
    ? richiesto
    : "/area-personale";

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/accedi?errore=conferma`);
}

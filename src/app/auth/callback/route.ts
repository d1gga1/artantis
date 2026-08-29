import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Scambio del codice di accesso (link magici e conferme via email). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Il ritorno deve restare dentro al sito: mai un indirizzo esterno.
  const richiesto = searchParams.get("next");
  const next = richiesto && richiesto.startsWith("/") && !richiesto.startsWith("//")
    ? richiesto
    : "/area-personale";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  return NextResponse.redirect(`${origin}/accedi?errore=conferma`);
}

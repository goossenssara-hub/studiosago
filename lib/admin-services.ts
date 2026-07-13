import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * De bestaande /admin-beveiliging van Studio SaGo bepaalt wie de adminpagina
 * mag openen. De API controleert daarom alleen of er een Supabase-sessie is.
 *
 * Hierdoor is geen aparte profiles.role = 'admin' meer nodig.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Je bent niet aangemeld. Meld je opnieuw aan via de adminlogin." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    supabase,
    user,
  };
}

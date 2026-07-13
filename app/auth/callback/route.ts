import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeNextPath(value: string | null): string {
  const next = String(value ?? "").trim();

  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//")
  ) {
    return "/account-activeren";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");

  const next = safeNextPath(
    requestUrl.searchParams.get("next")
  );

  const errorDescription =
    requestUrl.searchParams.get("error_description");

  if (errorDescription) {
    const errorUrl = new URL(
      "/account-activeren",
      requestUrl.origin
    );

    errorUrl.searchParams.set(
      "error",
      errorDescription
    );

    return NextResponse.redirect(errorUrl);
  }

  if (!code) {
    const errorUrl = new URL(
      "/account-activeren",
      requestUrl.origin
    );

    errorUrl.searchParams.set(
      "error",
      "De activatielink bevat geen geldige verificatiecode."
    );

    return NextResponse.redirect(errorUrl);
  }

  const supabase = await createClient();

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "ACCOUNT ACTIVATION CALLBACK ERROR:",
      error
    );

    const errorUrl = new URL(
      "/account-activeren",
      requestUrl.origin
    );

    errorUrl.searchParams.set(
      "error",
      "De activatielink is ongeldig of verlopen."
    );

    return NextResponse.redirect(errorUrl);
  }

  return NextResponse.redirect(
    new URL(next, requestUrl.origin)
  );
}
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export async function POST(): Promise<NextResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.id || !user.email) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Je beveiligde sessie is verlopen. Open de uitnodigingslink opnieuw.",
        },
        {
          status: 401,
        }
      );
    }

    const email = normalizeEmail(user.email);

    const supabaseAdmin =
      getSupabaseAdmin();

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from("customer_profiles")
        .select(
          `
            id,
            email,
            auth_user_id,
            account_status
          `
        )
        .ilike("email", email)
        .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Het ouderprofiel kon niet geladen worden.",
          details: profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Er werd geen ouderprofiel voor dit account gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("customer_profiles")
        .update({
          auth_user_id: user.id,
          account_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Je wachtwoord werd ingesteld, maar het profiel kon niet volledig geactiveerd worden.",
          details: updateError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
    });
  } catch (error) {
    console.error(
      "COMPLETE ACCOUNT ACTIVATION ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Het account kon niet geactiveerd worden.",
      },
      {
        status: 500,
      }
    );
  }
}
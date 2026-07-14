import {
  NextRequest,
  NextResponse,
} from "next/server";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function toNumber(
  value: unknown,
  fallback = 0
) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

export async function GET() {
  try {
    const supabaseAdmin =
      getSupabaseAdmin();

    const { data, error } =
      await supabaseAdmin
        .from("passes")
        .select("*")
        .order("customer_email", {
          ascending: true,
          nullsFirst: false,
        })
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(
        "LOAD LESSON CARDS ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Beurtenkaarten konden niet geladen worden.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      passes: data ?? [],
    });
  } catch (error) {
    console.error(
      "LOAD LESSON CARDS SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Beurtenkaarten konden niet geladen worden.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request
) {
  try {
    const body =
      await request.json();

    const id = clean(body.id);
    const title = clean(body.title);
    const status =
      clean(body.status) || "active";

    const totalCredits = Math.max(
      1,
      toNumber(
        body.totalCredits ??
          body.total_credits ??
          body.totalSessions ??
          body.total_sessions,
        1
      )
    );

    const remainingCredits = Math.max(
      0,
      toNumber(
        body.remainingCredits ??
          body.remaining_credits ??
          body.remainingSessions ??
          body.remaining_sessions,
        0
      )
    );

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Geen beurtenkaart ontvangen.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      remainingCredits >
      totalCredits
    ) {
      return NextResponse.json(
        {
          error:
            "Het resterende aantal kan niet groter zijn dan het totaal.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedStatuses = [
      "active",
      "used",
      "cancelled",
    ];

    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Ongeldige status voor de beurtenkaart.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const { data, error } =
      await supabaseAdmin
        .from("passes")
        .update({
          title:
            title || "Beurtenkaart",

          total_credits:
            totalCredits,

          remaining_credits:
            remainingCredits,

          total_sessions:
            totalCredits,

          remaining_sessions:
            remainingCredits,

          status,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) {
      console.error(
        "UPDATE LESSON CARD ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "Beurtenkaart kon niet aangepast worden.",
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Beurtenkaart werd niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      pass: data,
    });
  } catch (error) {
    console.error(
      "UPDATE LESSON CARD SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Beurtenkaart kon niet aangepast worden.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const id = clean(
      request.nextUrl.searchParams.get(
        "id"
      )
    );

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Geen beurtenkaart-id ontvangen.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseAdmin =
      getSupabaseAdmin();

    const {
      data: existingPass,
      error: findError,
    } = await supabaseAdmin
      .from("passes")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) {
      console.error(
        "FIND LESSON CARD ERROR:",
        findError
      );

      return NextResponse.json(
        {
          error:
            findError.message ||
            "Beurtenkaart kon niet gecontroleerd worden.",
        },
        {
          status: 500,
        }
      );
    }

    if (!existingPass) {
      return NextResponse.json(
        {
          error:
            "Beurtenkaart werd niet gevonden.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Eerst verwijzen uit bookings losmaken.
     * Zo wordt verwijderen niet tegengehouden
     * door een foreign-keyrelatie.
     */
    const {
      error: bookingUpdateError,
    } = await supabaseAdmin
      .from("bookings")
      .update({
        pass_id: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq("pass_id", id);

    if (bookingUpdateError) {
      console.error(
        "UNLINK PASS BOOKINGS ERROR:",
        bookingUpdateError
      );

      return NextResponse.json(
        {
          error:
            bookingUpdateError.message ||
            "Gekoppelde afspraken konden niet losgemaakt worden.",
        },
        {
          status: 500,
        }
      );
    }

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from("passes")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(
        "DELETE LESSON CARD ERROR:",
        deleteError
      );

      return NextResponse.json(
        {
          error:
            deleteError.message ||
            "Beurtenkaart kon niet verwijderd worden.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (error) {
    console.error(
      "DELETE LESSON CARD SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Beurtenkaart kon niet verwijderd worden.",
      },
      {
        status: 500,
      }
    );
  }
}
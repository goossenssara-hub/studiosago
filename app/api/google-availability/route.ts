import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeSlots(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((slot) => {
      if (typeof slot === "string") {
        return slot.trim();
      }

      if (
        slot &&
        typeof slot === "object"
      ) {
        const item = slot as Record<
          string,
          unknown
        >;

        return clean(
          item.time ??
            item.start ??
            item.startTime ??
            item.label ??
            item.value
        );
      }

      return "";
    })
    .filter(Boolean);
}

export async function GET(
  request: Request
): Promise<NextResponse> {
  try {
    const scriptUrl = clean(
      process.env
        .GOOGLE_APPS_SCRIPT_AVAILABILITY_URL
    );

    if (!scriptUrl) {
      console.error(
        "GOOGLE_APPS_SCRIPT_AVAILABILITY_URL ontbreekt."
      );

      return NextResponse.json(
        {
          slots: [],
          error:
            "De online agenda is tijdelijk niet beschikbaar.",
        },
        {
          status: 500,
        }
      );
    }

    const requestUrl = new URL(request.url);

    const date = clean(
      requestUrl.searchParams.get("date")
    );

    const duration = clean(
      requestUrl.searchParams.get(
        "duration"
      ) || "60"
    );

    const type = clean(
      requestUrl.searchParams.get("type") ||
        "begeleiding"
    );

    if (!date) {
      return NextResponse.json(
        {
          slots: [],
          error: "De datum ontbreekt.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Een HTML-dateveld stuurt YYYY-MM-DD.
     * We geven zowel date als selectedDate mee,
     * zodat het Apps Script beide kan herkennen.
     */
    const googleUrl = new URL(scriptUrl);

    googleUrl.searchParams.set(
      "date",
      date
    );

    googleUrl.searchParams.set(
      "selectedDate",
      date
    );

    googleUrl.searchParams.set(
      "duration",
      duration
    );

    googleUrl.searchParams.set(
      "type",
      type
    );

    googleUrl.searchParams.set(
      "action",
      "availability"
    );

    const googleResponse = await fetch(
      googleUrl.toString(),
      {
        method: "GET",
        cache: "no-store",
        redirect: "follow",
        headers: {
          Accept: "application/json",
        },
      }
    );

    const responseText =
      await googleResponse.text();

    if (!googleResponse.ok) {
      console.error(
        "GOOGLE AVAILABILITY HTTP ERROR:",
        googleResponse.status,
        responseText.slice(0, 500)
      );

      return NextResponse.json(
        {
          slots: [],
          error:
            "De beschikbare momenten konden niet geladen worden.",
        },
        {
          status: 502,
        }
      );
    }

    let data: unknown;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "GOOGLE AVAILABILITY GAF GEEN JSON:",
        responseText.slice(0, 500)
      );

      return NextResponse.json(
        {
          slots: [],
          error:
            "De agenda gaf een ongeldig antwoord terug.",
        },
        {
          status: 502,
        }
      );
    }

    const result =
      data &&
      typeof data === "object"
        ? (data as Record<
            string,
            unknown
          >)
        : {};

    const nestedData =
      result.data &&
      typeof result.data === "object"
        ? (result.data as Record<
            string,
            unknown
          >)
        : {};

    /*
     * Ondersteunt onder andere:
     * { slots: [...] }
     * { availableSlots: [...] }
     * { times: [...] }
     * { data: { slots: [...] } }
     */
    const slots = normalizeSlots(
      result.slots ??
        result.availableSlots ??
        result.times ??
        nestedData.slots ??
        nestedData.availableSlots
    );

    console.log(
      "GOOGLE AVAILABILITY RESULT:",
      {
        date,
        duration,
        type,
        slotCount: slots.length,
        response: result,
      }
    );

    return NextResponse.json(
      {
        slots,
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error(
      "GOOGLE AVAILABILITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        slots: [],
        error:
          error instanceof Error
            ? error.message
            : "De beschikbare momenten konden niet geladen worden.",
      },
      {
        status: 500,
      }
    );
  }
}
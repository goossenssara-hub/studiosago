import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUFFER_MINUTES = 30;

function getDatesBetween(startDate: string, endDate: string, weekDays: number[]) {
  const dates: string[] = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    if (weekDays.includes(current.getDay())) {
      dates.push(current.toISOString().slice(0, 10));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDuration(serviceType: string) {
  return serviceType === "kennismaking" ? 30 : 60;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("availability")
    .select("*")
    .order("date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Beschikbaarheden konden niet geladen worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ availability: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const serviceType = String(body.serviceType || "");
    const startDate = String(body.startDate || "");
    const endDate = String(body.endDate || "");
    const startTime = String(body.startTime || "");
    const endTime = String(body.endTime || "");
    const maxPlaces = Math.max(1, Number(body.maxPlaces || 1));
    const weekDays = Array.isArray(body.weekDays) ? body.weekDays : [];

    if (!serviceType || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
    }

    if (weekDays.length === 0) {
      return NextResponse.json(
        { error: "Duid minstens één weekdag aan." },
        { status: 400 }
      );
    }

    const duration = getDuration(serviceType);
    const dates = getDatesBetween(startDate, endDate, weekDays);

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: "Einduur moet later zijn dan startuur." },
        { status: 400 }
      );
    }

    const rows = [];

    for (const date of dates) {
      let current = startMinutes;

      while (current + duration <= endMinutes) {
        rows.push({
          date,
          start_time: minutesToTime(current),
          end_time: minutesToTime(current + duration),
          max_places: maxPlaces,
          booked_places: 0,
          active: true,
          service_type: serviceType,
        });

        current += duration + BUFFER_MINUTES;
      }
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Er konden geen momenten gemaakt worden binnen deze periode." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("availability").insert(rows);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Beschikbare momenten konden niet toegevoegd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, count: rows.length });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Er ging iets mis bij het toevoegen." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Geen id ontvangen." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("availability")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: "Beschikbaar moment kon niet verwijderd worden." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
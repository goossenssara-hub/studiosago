import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("lesson_cards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("LESSON CARDS GET ERROR:", error);

      return NextResponse.json(
        { error: "Leskaarten konden niet geladen worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      lessonCards: data ?? [],
    });
  } catch (error) {
    console.error("LESSON CARDS GET SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij laden van leskaarten." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();

    const title = String(body.title || "");
    const customerEmail = String(body.customerEmail || "");
    const studentName = String(body.studentName || "");
    const totalCredits = Number(body.totalCredits || body.totalSessions || 0);
    const remainingCredits = Number(
      body.remainingCredits || body.remainingSessions || totalCredits
    );
    const status = String(body.status || "active");

    if (!title || !customerEmail || totalCredits < 1 || remainingCredits < 0) {
      return NextResponse.json(
        { error: "Niet alle verplichte velden zijn correct ingevuld." },
        { status: 400 }
      );
    }

    if (remainingCredits > totalCredits) {
      return NextResponse.json(
        { error: "Resterende beurten mogen niet hoger zijn dan totaal." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("lesson_cards").insert({
      title,
      customer_email: customerEmail,
      student_name: studentName || null,
      total_credits: totalCredits,
      remaining_credits: remainingCredits,
      total_sessions: totalCredits,
      remaining_sessions: remainingCredits,
      status,
    });

    if (error) {
      console.error("LESSON CARDS POST ERROR:", error);

      return NextResponse.json(
        { error: "Leskaart kon niet toegevoegd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LESSON CARDS POST SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij toevoegen van leskaart." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();

    const id = String(body.id || "");
    const title = String(body.title || "");
    const totalCredits = Number(body.totalCredits || body.totalSessions || 0);
    const remainingCredits = Number(
      body.remainingCredits || body.remainingSessions || 0
    );
    const status = String(body.status || "active");

    if (!id || !title || totalCredits < 1 || remainingCredits < 0) {
      return NextResponse.json(
        { error: "Niet alle velden zijn correct ingevuld." },
        { status: 400 }
      );
    }

    if (remainingCredits > totalCredits) {
      return NextResponse.json(
        { error: "Resterende beurten mogen niet hoger zijn dan totaal." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("lesson_cards")
      .update({
        title,
        total_credits: totalCredits,
        remaining_credits: remainingCredits,
        total_sessions: totalCredits,
        remaining_sessions: remainingCredits,
        status,
      })
      .eq("id", id);

    if (error) {
      console.error("LESSON CARDS PATCH ERROR:", error);

      return NextResponse.json(
        { error: "Leskaart kon niet aangepast worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LESSON CARDS PATCH SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij aanpassen van leskaart." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Geen id ontvangen." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("lesson_cards")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("LESSON CARDS DELETE ERROR:", error);

      return NextResponse.json(
        { error: "Leskaart kon niet verwijderd worden." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LESSON CARDS DELETE SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Serverfout bij verwijderen van leskaart." },
      { status: 500 }
    );
  }
}
import { redirect } from "next/navigation";
import PageShell from "@/components/PageShell";
import AppointmentOrderForm from "@/components/AppointmentOrderForm";

export const dynamic = "force-dynamic";

type BookingType =
  | "individual"
  | "group";

type EducationLevel =
  | "primary"
  | "secondary";

type PageProps = {
  searchParams: Promise<{
    type?: string;
    level?: string;
  }>;
};

function isBookingType(
  value: string
): value is BookingType {
  return (
    value === "individual" ||
    value === "group"
  );
}

function isEducationLevel(
  value: string
): value is EducationLevel {
  return (
    value === "primary" ||
    value === "secondary"
  );
}

export default async function AppointmentOrderPage({
  searchParams,
}: PageProps) {
  const params =
    await searchParams;

  const bookingType =
    String(
      params.type ?? ""
    ).trim();

  const educationLevel =
    String(
      params.level ?? ""
    ).trim();

  if (
    !isBookingType(
      bookingType
    ) ||
    !isEducationLevel(
      educationLevel
    )
  ) {
    redirect("/afspraak");
  }

  return (
    <PageShell>
      <AppointmentOrderForm
        bookingType={bookingType}
        educationLevel={
          educationLevel
        }
      />
    </PageShell>
  );
}
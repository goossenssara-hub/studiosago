async function cancelBooking(booking: Booking) {
  if (
    !confirm(
      "Ben je zeker dat je deze afspraak wilt annuleren?"
    )
  ) {
    return;
  }

  const response = await fetch("/api/cancel-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bookingId: booking.id,
    }),
  });

  if (response.ok) {
    window.location.reload();
  } else {
    alert("Annuleren is mislukt.");
  }
}
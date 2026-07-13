STUDIO SAGO — PREMIUM AFSPRAAKFUNCTIES

INBEGREPEN
- Profielfoto en naam begeleider
- Voortgang beurtenkaart
- Huiswerkblok
- Volgende afspraak
- Chat per afspraak
- Betaling, Mollie-referentie en factuurstatus
- Apple Agenda-download
- Outlook Agenda-download

INSTALLATIE
1. Voer supabase/premium-appointments.sql uit in Supabase SQL Editor.
2. Plaats components/AppointmentPremiumPanel.tsx.
3. Plaats de API-routes in dezelfde mapstructuur.
4. Plaats app/styles/appointment-premium.css.
5. Volg INTEGRATIE.txt om het paneel in CustomerAppointments.tsx te plaatsen.
6. Voeg bij de adminroutes jouw bestaande admincontrole toe.

PROFIELFOTO
Sla een publieke of signed URL op in:
bookings.instructor_photo_url

BETALING
Deze velden worden gebruikt:
bookings.payment_id
bookings.invoice_url
bookings.payment_status

Waarden voor payment_status:
paid
open
pending
refunded
unknown

CHAT
Berichten worden per booking_id opgeslagen in appointment_messages.

APPLE EN OUTLOOK
Beide gebruiken een .ics-bestand. Dit werkt in Apple Agenda, Outlook en
de meeste andere agenda-apps.

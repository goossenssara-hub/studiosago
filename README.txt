Studio SaGo - Google Agenda en Google Meet afspraken

Bestanden:
1. components/CustomerAppointments.tsx
2. components/BackfillGoogleBookingsButton.tsx
3. app/api/customer/appointments/backfill-google/route.ts
4. app/api/cancel-booking/route.ts
5. app/styles/dashboard.css
6. google-apps-script/Code.gs

Google Apps Script:
- Voeg de geavanceerde Google Calendar API-service toe als Calendar v3.
- Gebruik als service-ID: Calendar.
- Voeg bij Scriptproperty's BOOKING_SECRET toe.
- De waarde moet exact overeenkomen met GOOGLE_APPS_SCRIPT_BOOKING_SECRET in .env.local.

.env.local:
GOOGLE_APPS_SCRIPT_AVAILABILITY_URL=JOUW_WEBAPP_URL
GOOGLE_APPS_SCRIPT_BOOKING_SECRET=DEZELFDE_GEHEIME_SLEUTEL

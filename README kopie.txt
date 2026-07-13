STUDIO SAGO — UITGEBREIDE AFSPRAAKERVARING

INBEGREPEN
- Live aftellen tot de afspraak
- Begeleider tonen
- Startuur, einduur en duur
- Google Maps-knop voor fysieke afspraken
- Bestanden uploaden en downloaden
- Lesverslag tonen
- Feedback met 1 tot 5 sterren
- Automatische e-mailherinnering 24 uur en 1 uur vooraf

BESTANDEN PLAATSEN
1. components/CustomerAppointments.tsx
2. components/AppointmentEnhancements.tsx
3. app/api/customer/appointments/route.ts
4. app/api/customer/appointments/files/route.ts
5. app/api/customer/appointments/feedback/route.ts
6. app/api/admin/appointments/report/route.ts
7. app/api/cron/appointment-reminders/route.ts
8. app/styles/appointment-experience.css
9. vercel.json in de hoofdmap

CSS IMPORTEREN
Voeg in je dashboardpagina of globale stylesheet toe:

import "@/app/styles/appointment-experience.css";

SUPABASE
Voer supabase/appointment-experience.sql één keer uit in Supabase SQL Editor.

OMGEVINGSVARIABELEN
Voeg toe aan .env.local en Vercel:

RESEND_API_KEY=re_...
REMINDER_FROM_EMAIL=Studio SaGo <afspraken@jouwdomein.be>
CRON_SECRET=een-lange-geheime-sleutel

VERCEL CRON
vercel.json controleert elke 15 minuten of een herinnering moet worden verzonden.
Na toevoegen opnieuw deployen.

BELANGRIJK
De adminroute voor lesverslagen bevat een commentaar waar je jouw bestaande
admincontrole kunt toevoegen. Gebruik dezelfde controle als in je andere
/admin API-routes.

SUPABASE STORAGE
De SQL maakt een privé bucket appointment-files aan.
Downloads worden via tijdelijke signed URLs aangeboden.

RESEND
Verifieer je verzenddomein bij Resend voordat je REMINDER_FROM_EMAIL gebruikt.

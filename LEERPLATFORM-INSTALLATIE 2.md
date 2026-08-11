# Nieuwe leerplatform-aanmeldpagina

## Toegevoegd
- Publieke pagina: `/leerplatform`
- Formulier-API: `/api/leerplatform-aanmelden`
- Bevestigingsmail via de bestaande `RESEND_API_KEY`
- Opslag in Supabase
- Vermelding in de navigatie
- Nieuwe inschrijvingen zichtbaar bij **Admin > Nieuwsbrief**

## Eenmalig uitvoeren in Supabase
Open **SQL Editor** in Supabase en voer dit bestand uit:

`supabase/migrations/20260806_learning_platform_pioneers.sql`

Zonder deze tabel kan het formulier nog geen inschrijvingen opslaan.

## E-mail
De bevestigingsmail gebruikt:
- `RESEND_API_KEY`
- optioneel `RESEND_FROM_EMAIL`

Wanneer `RESEND_FROM_EMAIL` ontbreekt, gebruikt de code de bestaande testafzender van Resend.

## Belofte op de pagina
De aanmelding wordt met het gebruikte e-mailadres geregistreerd als:
`lifetime_access_eligible = true`.

Zo blijft later controleerbaar wie via deze pionierspagina recht heeft op levenslang gratis toegang.

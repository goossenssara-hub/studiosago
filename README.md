# Studio SaGo Next.js Platform

Dit project bevat:

- Homepage in de stijl van het aangeleverde ontwerp
- Aanbodpagina
- Boekingsformulier gekoppeld aan Supabase-tabellen `contacts` en `bookings`
- Loginpagina via Supabase magic link
- Adminpagina met boekingen uit Supabase
- Klantenportaal-startpagina
- Assets in `public/assets`

## Installatie

```bash
npm install
npm run dev
```

Open daarna:

```text
http://localhost:3000
```

## Supabase

Maak een bestand `.env.local` naast `package.json`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gjnnpxfygyfwhxatnamd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=plak_hier_je_publishable_key
```

Let op: gebruik nooit de `SUPABASE_SECRET_KEY` in de frontend.

## Routes

- `/` homepage
- `/aanbod` aanbod
- `/boek-nu` boekingsformulier
- `/login` inloggen
- `/dashboard` klantenportaal
- `/admin` admin boekingen
- `/contact` contact

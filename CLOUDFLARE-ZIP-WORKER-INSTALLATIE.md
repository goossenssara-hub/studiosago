# Automatische ZIP-download voor SaGo Photography

## Wat verandert?
- Geen handmatige ZIP meer in het fotografie-dashboard.
- Eén foto: hoge-resolutie JPG rechtstreeks uit R2.
- Selectie: site maakt op aanvraag automatisch één ZIP.
- Volledige galerij: site maakt op aanvraag automatisch één ZIP.
- Supabase bewaart geen grote originelen.

## 1. Websitepatch
Kopieer de bestanden uit deze patch over je huidige Studio SaGo-project.

## 2. Twee extra `.env.local` waarden
Maak één lange geheime sleutel:

```bash
openssl rand -hex 32
```

Zet daarna in `.env.local`:

```env
PHOTOGRAPHY_ZIP_WORKER_URL=https://sago-photography-zip.<jouw-workers-subdomein>.workers.dev
PHOTOGRAPHY_ZIP_SIGNING_SECRET=DE_GEHEIME_SLEUTEL
```

Gebruik exact dezelfde geheime sleutel straks als Worker secret.

## 3. Worker deployen

```bash
cd cloudflare/photography-zip-worker
npm install
npx wrangler login
npx wrangler secret put ZIP_SIGNING_SECRET
```

Plak bij de vraag de waarde van `PHOTOGRAPHY_ZIP_SIGNING_SECRET`.

Daarna:

```bash
npm run deploy
```

Wrangler toont daarna de Worker-URL. Zet precies die URL in
`PHOTOGRAPHY_ZIP_WORKER_URL`.

De R2-binding `PHOTOS` is al geconfigureerd voor:
`sago-photography-downloads`.

## 4. Next.js herstarten

```bash
rm -rf .next
npm run dev
```

Test op `http://localhost:3000`.

## Belangrijk over Cloudflare Workers Free

R2 zelf kan de grote bestanden prima bewaren en levert geen R2-egresskosten,
maar het samenstellen van een ZIP kost Worker-CPU.

Cloudflare Workers Free heeft momenteel slechts 10 ms CPU per invocation.
Voor kleine tests kan dit lukken, maar voor grote fotoshoots is dat niet betrouwbaar.

Voor betrouwbare grote ZIP-downloads is Cloudflare Workers Standard de veilige
keuze. De site en individuele downloads blijven ook zonder automatische ZIP bruikbaar.
De ZIP-code gebruikt `level: 0` (geen extra JPEG-compressie) en streamt de bestanden,
zodat er geen volledige galerij in Worker-geheugen wordt geladen.

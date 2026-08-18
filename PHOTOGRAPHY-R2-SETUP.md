# SaGo Photography – veilige opslagconfiguratie

## Wat deze herbouw doet

- Supabase bewaart alleen geoptimaliseerde webfoto's in `photo-galleries`.
- Webfoto's: maximaal 2400 px lange zijde en maximaal 2 MB per foto.
- De bucket `photo-galleries` krijgt ook op Supabase zelf een harde limiet van 2 MB en alleen `image/jpeg`.
- Fotografie stopt met nieuwe webuploads zodra fotografie 500 MB bereikt.
- Nieuwe webuploads stoppen óók zodra alle Storage-buckets in dit Supabase-project samen 800 MB bereiken.
- Hoge-resolutie foto's worden lokaal door jou in één ZIP gezet.
- Die ZIP gaat rechtstreeks vanuit je browser naar een private Cloudflare R2-bucket; de ZIP passeert je Next.js-server en Supabase niet.
- Supabase bewaart alleen de R2-objectnaam, ZIP-naam en bestandsgrootte.
- Een klant krijgt een tijdelijke, ondertekende R2-downloadlink van 15 minuten.
- Als je in admin een nieuwe ZIP plaatst, wordt de vorige R2-ZIP automatisch verwijderd.
- Losse downloads van de kleine Supabase-webfoto's zijn uitgeschakeld.

## 1. Voer de Supabase-migratie uit

Open Supabase > SQL Editor en voer volledig uit:

`supabase/migrations/20260818_photography_r2_downloads.sql`

Dit voegt alleen downloadmetadata toe, zet de webfotolimiet en maakt een serverfunctie die het totale Storage-verbruik van dit project controleert.

## 2. Maak Cloudflare R2 aan

Maak in Cloudflare R2 één PRIVATE bucket met exact deze naam:

`sago-photography-downloads`

Maak daarna een R2 API-token met Object Read & Write voor alleen deze bucket.
Bewaar:

- Account ID
- Access Key ID
- Secret Access Key

De bucket hoeft NIET public te worden.

## 3. Stel CORS in op de R2-bucket

Gebruik in R2 bij CORS policy:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://studiosago.be",
      "https://www.studiosago.be"
    ],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Als je uiteindelijke productiedomein anders is, voeg dat domein ook toe.

## 4. Voeg vier SERVER-variabelen toe aan `.env.local`

```env
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=sago-photography-downloads
```

Belangrijk: zet hier GEEN `NEXT_PUBLIC_` voor. Deze sleutels mogen nooit naar de browserbundel.

## 5. Herstart lokaal op poort 3000

```bash
Ctrl + C
rm -rf .next
npm run dev
```

Test daarna:

- `http://localhost:3000/admin/fotografie`
- Open of maak een galerij.
- Upload de gewone galerijfoto's: die worden automatisch verkleind voor Supabase.
- Upload bij Downloads één lokale ZIP met de hoge-resolutie JPG's.
- Open de klantlink en test `Download hoge resolutie ZIP`.

## 6. Wat je NIET meer gebruikt

- `photography-originals`: niet meer gebruiken.
- `photography-web`: oud systeem; alleen verwijderen nadat je zeker weet dat er geen oude galerij meer van afhankelijk is.
- Hoge-resolutie originelen of ZIP's nooit in `photo-galleries` uploaden.

## Praktische workflow per fotoshoot

1. Exporteer de definitieve hoge-resolutie JPG's op je Mac.
2. Selecteer die JPG's in Finder > comprimeer tot één ZIP.
3. Upload je galerijfoto's in SaGo Photography. De site maakt hier automatisch lichte webversies van.
4. Upload de grote ZIP onder Downloads. Die gaat rechtstreeks naar Cloudflare R2.
5. Deel de galerijlink met de klant.
6. De klant bekijkt de lichte foto's via Supabase en downloadt de grote ZIP via R2.

## Veiligheidsgrenzen

- webfoto: max. 2 MB
- webfoto lange zijde: max. 2400 px
- max. 250 webfoto's per galerij
- max. 500 MB fotografie-webfoto's in Supabase
- hard stop voor nieuwe fotografie-upload bij 800 MB totale Storage in dit Supabase-project
- hoge-resolutie ZIP: max. 5 GB per ZIP met deze rechtstreekse uploadmethode

Voor een ZIP groter dan 5 GB: splits de levering voorlopig in twee ZIP-bestanden of bouw later multipart upload in.

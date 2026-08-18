# SaGo Photography – R2 eerst, webgalerij daarna

## Nieuwe workflow

1. Maak in `/admin/fotografie` een nieuwe galerij.
2. Stap **Foto's uploaden** mag leeg blijven.
3. De galerij wordt als concept aangemaakt en opent daarna in het bewerkscherm.
4. Ga naar **Downloads**. Daar zie je het exacte R2-pad:
   `galleries/<gallery-id>/originals/`
5. Open Cloudflare → R2 → `sago-photography-downloads` en upload de grote
   afgewerkte JPG's rechtstreeks onder dat pad.
6. Terug in Studio SaGo: klik **Synchroniseer met R2**.
7. Ga naar **Foto's & volgorde** en upload alleen kleine web-JPG's, bij voorkeur
   ongeveer 1600–2200 px. Gebruik dezelfde bestandsnamen als de originelen.
8. Bij opslaan wordt de kleine Supabase-webfoto automatisch gekoppeld aan het
   juiste R2-origineel.
9. De klant bekijkt de kleine Supabase-foto maar downloadt het grote R2-bestand.

## Belangrijk

- Grote originelen gaan niet meer via de Next.js-browserupload.
- Grote originelen komen nooit in Supabase Storage.
- De automatische ZIP Worker werkt ook met rechtstreeks naar R2 geüploade
  bestanden.
- Voor selectie-ZIP's gebruikt de site voortaan de exacte R2 object keys.
- Oude R2-bestanden die via de site werden geüpload blijven compatibel.

## Na installeren

De ZIP Worker-code is aangepast. Deploy hem opnieuw:

```bash
cd cloudflare/photography-zip-worker
npm install
npm run deploy
```

Daarna de hoofdsite:

```bash
cd /Users/saragoossens/Projects/studiosago
rm -rf .next
npm run dev
```

Geen nieuwe Supabase-migratie nodig als `20260818_photography_r2_originals.sql`
al is uitgevoerd.

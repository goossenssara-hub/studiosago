# Definitieve fotografie-opbouw
Voer `supabase/migrations/20260818_photography_r2_originals.sql` uit in Supabase SQL Editor.
Herstart daarna: `rm -rf .next && npm run dev`.

Webfoto's: geoptimaliseerd naar Supabase (max 2 MB).
Hoge resolutie: tab Downloads > Hoge-resolutie JPG's koppelen > rechtstreeks R2.
De bestandsnaam moet gelijk zijn aan die van de webfoto.
Klant: selecteren, één hoge-resolutiefoto downloaden, selectie downloaden, volledige ZIP downloaden.

De selectie-download start meerdere beveiligde R2-downloads. Dit voorkomt dat je Next.js-server
grote ZIP's in geheugen moet bouwen. De bestaande volledige ZIP-upload blijft voor 'Download alles'.

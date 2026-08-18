# Galerij verwijderen

Op elke kaart in `/admin/fotografie` staat nu naast **Bewerken** en **Bekijken**
ook **Verwijderen**.

Na bevestiging worden:
- de lichte webfoto's uit Supabase Storage verwijderd;
- de `photo_gallery_images`-rijen verwijderd;
- de galerij zelf uit `photo_galleries` verwijderd;
- alle R2-objecten onder `galleries/<gallery-id>/` verwijderd.

De bevestiging vermeldt expliciet dat dit definitief is.

Geen nieuwe SQL-migratie nodig.

Na kopiëren:
```bash
rm -rf .next
npm run dev
```

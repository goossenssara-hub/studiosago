INSTALLATIE

1. Maak in je project deze map:
   app/styles/

2. Vervang je bestaande app/globals.css door het nieuwe bestand uit deze map.

3. Zet alle bestanden uit app/styles/ in je projectmap app/styles/.

4. Controleer dat app/layout.tsx nog steeds dit bevat:
   import "./globals.css";

Je hoeft de losse style-bestanden niet apart in layout.tsx te importeren.
globals.css importeert ze automatisch.

Belangrijk:
- Verwijder oude dubbele CSS-regels uit je huidige globals.css.
- Gebruik deze nieuwe globals.css als volledige vervanging.
- De begeleiding-pagina is gescoped op .basisschool-page, zodat andere pagina’s minder snel beïnvloed worden.

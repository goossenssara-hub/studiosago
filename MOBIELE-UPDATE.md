# Grote mobiele update — Studio SaGo

## Wat werd aangepast

- Centrale responsive hardening-laag toegevoegd en als laatste stylesheet geladen.
- Teksten, e-mailadressen, links en labels breken nu correct af binnen kaarten.
- Vaste desktopbreedtes kunnen de mobiele viewport niet langer verbreden.
- Koppen schalen met `clamp()` op kleine schermen.
- Header is herschikt voor mobiel; de navigatie kan horizontaal scrollen zonder de pagina te verbreden.
- Grids worden op mobiel één kolom.
- Formulieren, velden en knoppen blijven binnen het scherm.
- Actieknoppen stapelen op zeer kleine schermen.
- Tabellen, planners en andere bewust brede interfaces scrollen lokaal in plaats van de hele pagina te verbreden.
- Modals blijven binnen de zichtbare hoogte en breedte van het toestel.
- Achtergrond gebruikt op mobiel geen fixed attachment meer, voor betere prestaties en minder renderingproblemen.

## Vercel-fout pdf-parse

Er is een lokale TypeScript-declaratie toegevoegd in:

`types/pdf-parse.d.ts`

Hierdoor kent TypeScript het pakket `pdf-parse` tijdens `next build` en verdwijnt de fout:

`Could not find a declaration file for module 'pdf-parse'`.

Er hoeft hiervoor geen extra `@types/pdf-parse`-pakket geïnstalleerd te worden.

## Controle

De build kon in de afgeschermde werkomgeving niet volledig worden uitgevoerd omdat de interne npm-registry een transitieve dependency (`zod-validation-error@4.0.2`) niet beschikbaar stelde. Dit staat los van de broncode en van Vercel. Op Vercel wordt opnieuw vanaf de publieke/ingestelde registry geïnstalleerd.

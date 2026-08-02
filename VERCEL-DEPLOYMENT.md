# Vercel deployment

1. Gebruik Node.js 20 of 22. Het projectblok in `package.json` begrenst de ondersteunde Node-versie.
2. Laat Vercel `npm ci` en daarna `npm run build` uitvoeren.
3. Upload nooit `.next` of `node_modules` naar Git of Vercel.
4. Na het vervangen van code lokaal:

```bash
rm -rf .next node_modules
npm ci
npm run typecheck
npm run build
```

## Belangrijkste herstellingen

- Het zesde leerjaar gebruikt dezelfde getypeerde oefencomponent als leerjaar 1 tot en met 5.
- De generator ondersteunt nu expliciet leerjaar 6, inclusief grenzen, spelling, wereldoriëntatie en Frans.
- Antwoordfeedback geeft de oplossing niet meer onmiddellijk prijs. Na de eerste fout krijgt de leerling een gerichte hint; mogelijke antwoorden verschijnen pas vanaf de tweede poging.
- De componenten voor lager en middelbaar gebruiken dezelfde compatibele props (`position`, `index`, `total`, `attempts`).
- Oude losse kopieën buiten de echte App Router-structuur zijn verwijderd om Vercel niet onnodig te laten typechecken.

# Studio SaGo oefenmodule

Plaats de bestanden in je Next.js project volgens deze structuur:

components/OefenpaginaClient.tsx
components/oefenen/BottomActions.tsx
components/oefenen/ExerciseCard.tsx
components/oefenen/MountainProgress.tsx
lib/oefeningen/data.ts
lib/oefeningen/generateExercises.ts
lib/oefeningen/types.ts
lib/oefeningen/utils.ts

Gebruik de inhoud van `app-dashboard-oefenen-page.tsx` voor:
app/dashboard/oefenen/page.tsx

Plak de inhoud van `oefenmodule-css.css` onderaan in `app/globals.css`.

Zorg dat je bergafbeelding hier staat:
public/assets/oefenreis-berg-zonder-tekst.png

Deze module bewaart per leerling lokaal in localStorage:
- antwoorden
- fouten
- percentage
- vrijgespeelde niveaus
- gegenereerde oefeningen

Nieuwe oefeningen werken nu met een seed, waardoor de knop echt nieuwe reeksen maakt.

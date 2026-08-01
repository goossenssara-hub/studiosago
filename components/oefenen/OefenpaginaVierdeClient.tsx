"use client";

import OefenpaginaClient from "@/components/oefenen/OefenpaginaClient";

/**
 * De pagina van het vierde leerjaar gebruikte vroeger nog de oude rasterweergave.
 * Deze wrapper laat het vierde leerjaar nu dezelfde rustige interface gebruiken
 * als het zesde leerjaar: één oefening per keer en keuze per leergebied.
 */
export default function OefenpaginaVierdeClient() {
  return <OefenpaginaClient leerjaar="vierde" />;
}

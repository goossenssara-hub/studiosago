"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteGalleryButton({
  galleryId,
  galleryTitle,
  className,
}: {
  galleryId: string;
  galleryTitle: string;
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    if (busy) return;

    const confirmed = window.confirm(
      `Galerij "${galleryTitle}" definitief verwijderen?\n\n` +
      "Hiermee verwijder je ook de kleine webfoto’s uit Supabase en de volledige galerijmap met originelen uit Cloudflare R2. Dit kan niet ongedaan worden gemaakt."
    );
    if (!confirmed) return;

    setBusy(true);
    try {
      const response = await fetch(`/api/photography/galleries/${galleryId}`, {
        method: "DELETE",
      });
      const result = await response.json() as { error?: string };

      if (!response.ok) {
        throw new Error(result.error || "De galerij kon niet worden verwijderd.");
      }

      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "De galerij kon niet worden verwijderd.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={className}
      onClick={remove}
      disabled={busy}
      aria-label={`Galerij ${galleryTitle} verwijderen`}
    >
      {busy ? "Verwijderen…" : "Verwijderen"}
    </button>
  );
}

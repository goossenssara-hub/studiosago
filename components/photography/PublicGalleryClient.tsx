"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import styles from "@/app/fotografie/galerij/[slug]/public-gallery.module.css";

type GalleryInfo = {
  title: string;
  clientName: string;
  shootDate: string;
  location?: string | null;
  introTitle: string;
  introText: string;
  galleryStyle: string;
  accentColor: string;
  downloads: string;
  favoritesEnabled: boolean;
};

type GalleryImage = {
  id: string;
  fileName: string;
  sortOrder: number;
  isCover: boolean;
  url: string;
  originalUrl: string;
};

type Props = {
  slug: string;
  token: string;
  gallery: GalleryInfo;
  images: GalleryImage[];
};

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}


function getPhotoLayoutClass() {
  return styles.standardTile;
}

function getVisitorKey() {
  const storageKey = "sago-gallery-visitor";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

export default function PublicGalleryClient({ slug, token, gallery, images }: Props) {
  const [visitorKey, setVisitorKey] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeImage, setActiveImage] = useState<number | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

  const cover = images.find((image) => image.isCover) ?? images[0];
  const visibleImages = useMemo(
    () => (showFavoritesOnly ? images.filter((image) => favorites.has(image.id)) : images),
    [favorites, images, showFavoritesOnly],
  );

  const loadFavorites = useCallback(async (key: string) => {
    if (!gallery.favoritesEnabled) return;
    const query = new URLSearchParams({ slug, token, visitorKey: key });
    const response = await fetch(`/api/photography/gallery-actions?${query.toString()}`, {
      cache: "no-store",
    });
    if (!response.ok) return;
    const result = (await response.json()) as { favoriteIds?: string[] };
    setFavorites(new Set(result.favoriteIds ?? []));
  }, [gallery.favoritesEnabled, slug, token]);

  useEffect(() => {
    const key = getVisitorKey();
    setVisitorKey(key);
    void loadFavorites(key);
  }, [loadFavorites]);

  const toggleFavorite = async (imageId: string) => {
    if (!gallery.favoritesEnabled || !visitorKey) return;
    const wasFavorite = favorites.has(imageId);
    setFavorites((current) => {
      const next = new Set(current);
      if (wasFavorite) next.delete(imageId);
      else next.add(imageId);
      return next;
    });

    const response = await fetch("/api/photography/gallery-actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "favorite", slug, token, visitorKey, imageId, value: !wasFavorite }),
    });

    if (!response.ok) {
      setFavorites((current) => {
        const next = new Set(current);
        if (wasFavorite) next.add(imageId);
        else next.delete(imageId);
        return next;
      });
      setMessage("De selectie kon niet worden bewaard. Probeer opnieuw.");
    }
  };

  const downloadZip = async (imageIds: string[]) => {
    if (!imageIds.length) {
      setMessage("Selecteer minstens één foto.");
      return;
    }

    setBusyId(imageIds.length === 1 ? imageIds[0] : "selection");
    setMessage(
      imageIds.length === 1
        ? "De ZIP met jullie foto wordt voorbereid…"
        : `De ZIP met ${imageIds.length} foto’s wordt voorbereid…`,
    );

    try {
      const response = await fetch("/api/photography/gallery-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "downloadZip", slug, token, imageIds }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMessage = "De ZIP kon niet worden gemaakt.";
        if (text) {
          try {
            const result = JSON.parse(text) as { error?: string };
            errorMessage = result.error || errorMessage;
          } catch {
            errorMessage = text;
          }
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
      const fileName = encodedName ? decodeURIComponent(encodedName) : `${gallery.title}.zip`;
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setMessage(
        imageIds.length === 1
          ? "De foto werd als ZIP gedownload."
          : `${imageIds.length} foto’s werden samen in één ZIP gedownload.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "De ZIP-download is mislukt.");
    } finally {
      setBusyId(null);
    }
  };

  const downloadImage = async (imageId: string) => {
    setBusyId(imageId);
    setMessage("De foto wordt voorbereid…");

    try {
      const response = await fetch("/api/photography/gallery-actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "downloadImage", slug, token, imageId }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "De foto kon niet worden gedownload.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const encodedName = disposition.match(/filename\*=UTF-8\'\'([^;]+)/i)?.[1];
      const selectedImage = images.find((image) => image.id === imageId);
      const fileName = encodedName
        ? decodeURIComponent(encodedName)
        : selectedImage?.fileName || "SaGo-foto.jpg";
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setMessage("De foto werd gedownload.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "De download is mislukt.");
    } finally {
      setBusyId(null);
    }
  };

  const downloadFavorites = async () => {
    const selectedIds = images.filter((image) => favorites.has(image.id)).map((image) => image.id);
    if (!selectedIds.length) {
      setMessage("Duid eerst minstens één favoriete foto aan.");
      return;
    }
    await downloadZip(selectedIds);
  };

  const canDownloadIndividual = gallery.downloads === "single" || gallery.downloads === "all";
  const canDownloadSelection = gallery.downloads === "favorites" || gallery.downloads === "all";
  const canDownloadAll = gallery.downloads === "all";

  return (
    <main className={styles.page} style={{ "--accent": gallery.accentColor } as CSSProperties}>
      <section
        className={styles.hero}
        style={cover?.url ? { backgroundImage: `linear-gradient(rgba(17,30,39,.18),rgba(17,30,39,.66)),url(${cover.url})` } : undefined}
      >
        <div className={styles.heroContent}>
          <span>{formatDate(gallery.shootDate)}</span>
          <h1>{gallery.introTitle}</h1>
          {gallery.introText && <p>{gallery.introText}</p>}
          <a href="#photos">Bekijk jullie foto&apos;s</a>
        </div>
      </section>

      <section id="photos" className={styles.content}>
        <header className={styles.galleryHeader}>
          <div>
            <span>SaGo Photography</span>
            <h2>{gallery.title}</h2>
            <p>{gallery.clientName}{gallery.location ? ` · ${gallery.location}` : ""}</p>
          </div>
          <div className={styles.headerActions}>
            {gallery.favoritesEnabled && (
              <button type="button" className={showFavoritesOnly ? styles.activeButton : styles.softButton} onClick={() => setShowFavoritesOnly((value) => !value)}>
                ♥ {favorites.size} geselecteerd
              </button>
            )}
            {canDownloadSelection && gallery.favoritesEnabled && (
              <button type="button" className={styles.primaryButton} onClick={downloadFavorites} disabled={!favorites.size || busyId !== null}>
                {busyId === "selection" ? "ZIP voorbereiden…" : "Download selectie als ZIP"}
              </button>
            )}
            {canDownloadAll && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => downloadZip(images.map((image) => image.id))}
                disabled={!images.length || busyId !== null}
              >
                {busyId === "selection" ? "ZIP voorbereiden…" : "Download volledige galerij als ZIP"}
              </button>
            )}
          </div>
        </header>

        {message && <div className={styles.notice}>{message}</div>}

        {showFavoritesOnly && visibleImages.length === 0 ? (
          <div className={styles.emptySelection}>
            <span>♡</span>
            <h3>Nog geen foto&apos;s geselecteerd</h3>
            <p>Klik bij een foto op het hartje om ze hier te verzamelen.</p>
            <button type="button" onClick={() => setShowFavoritesOnly(false)}>Bekijk alle foto&apos;s</button>
          </div>
        ) : (
          <div className={`${styles.grid} ${styles[gallery.galleryStyle] ?? ""}`}>
            {visibleImages.map((image) => {
              const originalIndex = images.findIndex((candidate) => candidate.id === image.id);
              const selected = favorites.has(image.id);
              const ratio = imageRatios[image.id] ?? 1.5;
              const layoutClass = getPhotoLayoutClass(originalIndex, gallery.galleryStyle, ratio);
              return (
                <figure
                  key={image.id}
                  className={`${layoutClass} ${selected ? styles.selectedFigure : ""}`.trim()}
                  style={{ "--photo-ratio": String(ratio) } as CSSProperties}
                >
                  <button type="button" className={styles.imageOpen} onClick={() => setActiveImage(originalIndex)} aria-label={`Open foto ${originalIndex + 1}`}>
                    <img
                      src={image.url}
                      alt={`${gallery.title} foto ${originalIndex + 1}`}
                      loading={originalIndex < 12 ? "eager" : "lazy"}
                      fetchPriority={originalIndex < 4 ? "high" : "auto"}
                      decoding="async"
                      onLoad={(event) => {
                        const target = event.currentTarget;
                        target.classList.add(styles.imageLoaded);
                        const naturalRatio = target.naturalWidth && target.naturalHeight
                          ? target.naturalWidth / target.naturalHeight
                          : 1.5;
                        setImageRatios((current) => current[image.id] === naturalRatio
                          ? current
                          : { ...current, [image.id]: naturalRatio });
                      }}
                      onError={(event) => {
                        const target = event.currentTarget;
                        if (target.dataset.fallbackUsed === "true" || !image.originalUrl) return;
                        target.dataset.fallbackUsed = "true";
                        target.src = image.originalUrl;
                      }}
                    />
                  </button>
                  <div className={styles.photoActions}>
                    {gallery.favoritesEnabled && (
                      <button type="button" className={selected ? styles.favoriteActive : styles.iconButton} onClick={() => toggleFavorite(image.id)} aria-label={selected ? "Verwijder uit selectie" : "Voeg toe aan selectie"}>
                        {selected ? "♥" : "♡"}
                      </button>
                    )}
                    {canDownloadIndividual && (
                      <button type="button" className={styles.iconButton} onClick={() => downloadImage(image.id)} disabled={busyId !== null} aria-label="Download foto">
                        {busyId === image.id ? "…" : "↓"}
                      </button>
                    )}
                  </div>
                  {selected && <span className={styles.selectedBadge}>Geselecteerd</span>}
                </figure>
              );
            })}
          </div>
        )}

        <footer>Met zorg vastgelegd door SaGo Photography</footer>
      </section>

      {activeImage !== null && images[activeImage] && (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Foto bekijken" onClick={() => setActiveImage(null)}>
          <button type="button" className={styles.closeButton} onClick={() => setActiveImage(null)} aria-label="Sluiten">×</button>
          <button type="button" className={`${styles.navButton} ${styles.previous}`} onClick={(event) => { event.stopPropagation(); setActiveImage((activeImage - 1 + images.length) % images.length); }} aria-label="Vorige foto">‹</button>
          <div className={styles.lightboxImageWrap} onClick={(event) => event.stopPropagation()}>
            <img
              src={images[activeImage].url}
              alt={`${gallery.title} foto ${activeImage + 1}`}
              decoding="async"
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallbackUsed === "true" || !images[activeImage].originalUrl) return;
                target.dataset.fallbackUsed = "true";
                target.src = images[activeImage].originalUrl;
              }}
            />
            <div className={styles.lightboxBar}>
              <span>{activeImage + 1} / {images.length}</span>
              <div>
                {gallery.favoritesEnabled && (
                  <button type="button" onClick={() => toggleFavorite(images[activeImage].id)}>
                    {favorites.has(images[activeImage].id) ? "♥ Geselecteerd" : "♡ Selecteer"}
                  </button>
                )}
                {canDownloadIndividual && <button type="button" onClick={() => downloadImage(images[activeImage].id)} disabled={busyId !== null}>{busyId === images[activeImage].id ? "Voorbereiden…" : "Download foto"}</button>}
              </div>
            </div>
          </div>
          <button type="button" className={`${styles.navButton} ${styles.next}`} onClick={(event) => { event.stopPropagation(); setActiveImage((activeImage + 1) % images.length); }} aria-label="Volgende foto">›</button>
        </div>
      )}
    </main>
  );
}

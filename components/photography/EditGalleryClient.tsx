"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/app/admin/fotografie/galerijen/[id]/edit-gallery.module.css";
import { optimizePhotoForGallery } from "@/lib/fotografie/optimizeImage";

type Gallery = {
  id: string;
  title: string;
  slug: string;
  share_token: string | null;
  client_name: string | null;
  shoot_date: string | null;
  location: string | null;
  notes: string | null;
  intro_title: string | null;
  intro_text: string | null;
  gallery_style: string | null;
  accent_color: string | null;
  expiry_setting: string | null;
  downloads: string | null;
  favorites_enabled: boolean | null;
  watermark: boolean | null;
  status: string | null;
  download_zip_key?: string | null;
  download_zip_name?: string | null;
  download_zip_size_bytes?: number | null;
};

type ImageItem = {
  id: string;
  file_name: string;
  sort_order: number;
  is_cover: boolean;
  url: string;
  storage_path: string;
  file?: File;
  isNew?: boolean;
  r2_original_key?: string | null;
  r2_original_name?: string | null;
  r2_original_size_bytes?: number | null;
};

type Props = { gallery: Gallery; initialImages: ImageItem[] };

const tabs = [
  ["gegevens", "Gegevens"],
  ["fotos", "Foto’s & volgorde"],
  ["verhaal", "Verhaal"],
  ["toegang", "Toegang"],
  ["downloads", "Downloads"],
  ["huisstijl", "Huisstijl"],
  ["publiceren", "Publiceren"],
] as const;

export default function EditGalleryClient({ gallery, initialImages }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number][0]>("gegevens");
  const [form, setForm] = useState({
    title: gallery.title || "",
    clientName: gallery.client_name || "",
    shootDate: gallery.shoot_date || "",
    location: gallery.location || "",
    notes: gallery.notes || "",
    introTitle: gallery.intro_title || gallery.title || "",
    introText: gallery.intro_text || "",
    galleryStyle: gallery.gallery_style || "editorial",
    accentColor: gallery.accent_color || "#d97045",
    expirySetting: gallery.expiry_setting || "none",
    downloads: gallery.downloads || "all",
    favoritesEnabled: gallery.favorites_enabled !== false,
    watermark: gallery.watermark === true,
    status: gallery.status || "draft",
  });
  const [images, setImages] = useState(() => [...initialImages].sort((a, b) => a.sort_order - b.sort_order));
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [deletedImages, setDeletedImages] = useState<ImageItem[]>([]);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [r2SyncBusy, setR2SyncBusy] = useState(false);
  const [r2Folder] = useState(`galleries/${gallery.id}/originals/`);
  const [r2Originals, setR2Originals] = useState<Array<{
    key: string;
    name: string;
    size: number;
    linked: boolean;
  }>>([]);

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined" || !gallery.share_token) return "";
    return `${window.location.origin}/fotografie/galerij/${gallery.slug}?token=${gallery.share_token}`;
  }, [gallery.share_token, gallery.slug]);

  const updateForm = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  };

  const moveToPosition = (imageId: string, rawPosition: number) => {
    const nextPosition = Math.max(1, Math.min(images.length, rawPosition || 1));
    setImages((current) => {
      const next = [...current];
      const from = next.findIndex((image) => image.id === imageId);
      if (from < 0) return current;
      const [item] = next.splice(from, 1);
      next.splice(nextPosition - 1, 0, item);
      return next.map((image, index) => ({ ...image, sort_order: index }));
    });
  };

  const setCover = (imageId: string) => {
    setImages((current) => current.map((image) => ({ ...image, is_cover: image.id === imageId })));
  };

  const fileStem = (value: string) =>
    value
      .toLowerCase()
      .replace(/\.(jpe?g|webp)$/i, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const syncR2 = async () => {
    setR2SyncBusy(true);
    setMessage("Cloudflare R2 uitlezen en koppelingen controleren…");
    try {
      const response = await fetch(`/api/photography/r2-sync?galleryId=${encodeURIComponent(gallery.id)}`, {
        cache: "no-store",
      });
      const result = await response.json() as {
        error?: string;
        originalCount?: number;
        linkedCount?: number;
        awaitingWebCount?: number;
        originals?: Array<{ key: string; name: string; size: number; linked: boolean }>;
      };
      if (!response.ok) throw new Error(result.error || "R2 synchroniseren mislukt.");

      const originals = result.originals ?? [];
      setR2Originals(originals);

      // Werk ook het lokale overzicht bij zodat de status meteen zichtbaar is.
      const byStem = new Map(originals.map((item) => [fileStem(item.name), item]));
      setImages((current) => current.map((image) => {
        const original = byStem.get(fileStem(image.file_name));
        return original
          ? {
              ...image,
              r2_original_key: original.key,
              r2_original_name: original.name,
              r2_original_size_bytes: original.size,
            }
          : image;
      }));

      setMessage(
        `${result.originalCount ?? 0} origineel/originelen gevonden in R2. ` +
        `${result.linkedCount ?? 0} gekoppeld aan een webfoto. ` +
        `${result.awaitingWebCount ?? 0} wachten nog op een kleine webversie.`,
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "R2 synchroniseren mislukt.");
    } finally {
      setR2SyncBusy(false);
    }
  };

  const addFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files);
    const accepted = selected.filter((file) => file.type === "image/jpeg" || /\.jpe?g$/i.test(file.name));
    const rejectedCount = selected.length - accepted.length;

    if (!accepted.length) {
      setMessage("Selecteer JPG- of JPEG-bestanden.");
      return;
    }

    setMessage("Foto’s optimaliseren vóór upload…");
    const optimized: File[] = [];
    const failures: string[] = [];

    for (const file of accepted) {
      try {
        optimized.push((await optimizePhotoForGallery(file)).file);
      } catch (error) {
        failures.push(error instanceof Error ? error.message : `${file.name} kon niet worden verwerkt.`);
      }
    }

    setImages((current) => {
      const existingKeys = new Set(current.map((item) => `${item.file_name}-${item.file?.size ?? "stored"}`));
      const additions = optimized
        .filter((file) => !existingKeys.has(`${file.name}-${file.size}`))
        .map((file, offset) => {
          const original = r2Originals.find((item) => fileStem(item.name) === fileStem(file.name));
          return {
            id: `new-${crypto.randomUUID()}`,
            file_name: file.name,
            sort_order: current.length + offset,
            is_cover: current.length === 0 && offset === 0,
            url: URL.createObjectURL(file),
            storage_path: "",
            file,
            isNew: true,
            r2_original_key: original?.key ?? null,
            r2_original_name: original?.name ?? null,
            r2_original_size_bytes: original?.size ?? 0,
          } satisfies ImageItem;
        });
      return [...current, ...additions];
    });

    const parts = [
      optimized.length ? `${optimized.length} foto’s klaar voor upload.` : "",
      rejectedCount ? `${rejectedCount} bestand(en) overgeslagen.` : "",
      failures.length ? failures.join(" ") : "",
    ].filter(Boolean);
    setMessage(parts.join(" "));
  };

  const removeImage = (imageId: string) => {
    const image = images.find((item) => item.id === imageId);
    if (!image) return;
    if (!window.confirm(`Foto ${image.file_name} verwijderen uit deze galerij?`)) return;

    if (image.isNew) {
      URL.revokeObjectURL(image.url);
    } else {
      setDeletedImages((current) => [...current, image]);
    }

    setImages((current) => {
      const remaining = current.filter((item) => item.id !== imageId);
      if (image.is_cover && remaining.length) remaining[0] = { ...remaining[0], is_cover: true };
      return remaining.map((item, index) => ({ ...item, sort_order: index }));
    });
    setMessage(image.isNew ? "Nieuwe foto verwijderd uit de wachtrij." : "Foto gemarkeerd voor verwijdering. Klik op Wijzigingen opslaan.");
  };

  const save = async () => {
    setSaving(true);
    setMessage("");
    setUploadProgress("");

    try {
      const newImages = images.filter((image) => image.isNew && image.file);
      const uploadedByTemporaryId = new Map<string, ImageItem>();

      // Upload nieuwe foto's eerst naar een veilige tijdelijke positie.
      // Daarna bewaren we in één tweede stap de definitieve volgorde van alle foto's.
      for (let index = 0; index < newImages.length; index += 1) {
        const image = newImages[index];
        if (!image.file) continue;
        setUploadProgress(`Nieuwe foto ${index + 1} van ${newImages.length} uploaden…`);

        const formData = new FormData();
        formData.set("photo", image.file);
        formData.set("sortOrder", String(900000 + index));
        formData.set("isCover", "false");
        if (image.r2_original_key) formData.set("r2OriginalKey", image.r2_original_key);
        if (image.r2_original_name) formData.set("r2OriginalName", image.r2_original_name);
        if (image.r2_original_size_bytes) formData.set("r2OriginalSizeBytes", String(image.r2_original_size_bytes));

        const uploadResponse = await fetch(`/api/photography/galleries/${gallery.id}`, {
          method: "POST",
          body: formData,
        });
        const uploadText = await uploadResponse.text();
        let uploadResult: { error?: string; image?: ImageItem } = {};
        try {
          uploadResult = uploadText ? JSON.parse(uploadText) as { error?: string; image?: ImageItem } : {};
        } catch {
          throw new Error(`De server gaf een ongeldig antwoord bij ${image.file_name}.`);
        }
        if (!uploadResponse.ok || !uploadResult.image) {
          throw new Error(uploadResult.error || `Uploaden van ${image.file_name} is mislukt.`);
        }
        uploadedByTemporaryId.set(image.id, uploadResult.image);
      }

      const savedImages = images.map((image) => uploadedByTemporaryId.get(image.id) ?? image);
      setUploadProgress("Fotovolgorde en instellingen opslaan…");

      const response = await fetch(`/api/photography/galleries/${gallery.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form,
          images: savedImages.map((image, index) => ({
            id: image.id,
            sortOrder: index,
            isCover: image.is_cover,
          })),
          deletedImages: deletedImages.map((image) => ({ id: image.id, storagePath: image.storage_path })),
        }),
      });
      const responseText = await response.text();
      let result: { error?: string; warning?: string; imageCount?: number } = {};
      try {
        result = responseText ? JSON.parse(responseText) as { error?: string; warning?: string; imageCount?: number } : {};
      } catch {
        throw new Error("De server gaf een ongeldig antwoord tijdens het opslaan.");
      }
      if (!response.ok) throw new Error(result.error || "De galerij kon niet worden opgeslagen.");

      uploadedByTemporaryId.forEach((_, temporaryId) => {
        const original = images.find((image) => image.id === temporaryId);
        if (original?.isNew) URL.revokeObjectURL(original.url);
      });

      setImages(savedImages.map((image, index) => ({ ...image, sort_order: index, isNew: false, file: undefined })));
      setDeletedImages([]);
      setUploadProgress("");
      router.refresh();
      const verifiedCount = typeof result.imageCount === "number" ? ` De galerij bevat nu ${result.imageCount} foto’s.` : "";
      setMessage(result.warning || `${newImages.length ? `${newImages.length} nieuwe foto’s geüpload. ` : ""}Alle wijzigingen zijn opgeslagen.${verifiedCount}`);
    } catch (error) {
      setUploadProgress("");
      setMessage(error instanceof Error ? error.message : "Opslaan mislukt.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href="/admin/fotografie" className={styles.back}>← Alle galerijen</Link>
          <div className={styles.brand}>SaGo<small>Photography</small></div>
          <div className={styles.galleryMeta}>
            <span>{form.status === "active" ? "Actief" : "Concept"}</span>
            <h1>{form.title || "Naamloze galerij"}</h1>
            <p>{images.length} foto’s</p>
          </div>
          <nav className={styles.tabs} aria-label="Galerij bewerken">
            {tabs.map(([id, label]) => (
              <button key={id} type="button" className={activeTab === id ? styles.tabActive : styles.tab} onClick={() => setActiveTab(id)}>
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className={styles.workspace}>
          <header className={styles.header}>
            <div>
              <span>Galerij bewerken</span>
              <h2>{tabs.find(([id]) => id === activeTab)?.[1]}</h2>
              <p>Pas de galerij aan, voeg foto’s toe of wijzig de volgorde.</p>
            </div>
            <div className={styles.headerActions}>
              {publicUrl && <a href={publicUrl} target="_blank" rel="noreferrer" className={styles.previewButton}>Bekijk galerij</a>}
              <button type="button" onClick={save} disabled={saving} className={styles.saveButton}>{saving ? (uploadProgress || "Opslaan…") : "Wijzigingen opslaan"}</button>
            </div>
          </header>

          {message && <div className={styles.notice}>{message}</div>}

          <div className={styles.panel}>
            {activeTab === "gegevens" && (
              <div className={styles.formGrid}>
                <label><span>Galerijnaam</span><input value={form.title} onChange={(e) => updateForm("title", e.target.value)} /></label>
                <label><span>Klant of familie</span><input value={form.clientName} onChange={(e) => updateForm("clientName", e.target.value)} /></label>
                <label><span>Datum van de shoot</span><input type="date" value={form.shootDate} onChange={(e) => updateForm("shootDate", e.target.value)} /></label>
                <label><span>Locatie</span><input value={form.location} onChange={(e) => updateForm("location", e.target.value)} /></label>
                <label className={styles.full}><span>Interne opmerkingen</span><textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} rows={5} /></label>
              </div>
            )}

            {activeTab === "fotos" && (
              <div>
                <div className={styles.sectionIntro}><h3>Foto’s en volgorde</h3><p>Upload hier alleen kleine web-JPG’s. De zware originelen staan rechtstreeks in Cloudflare R2 en worden op bestandsnaam gekoppeld.</p></div>

                <div
                  className={`${styles.uploadZone} ${dragActive ? styles.uploadZoneActive : ""}`}
                  onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => { if (event.currentTarget === event.target) setDragActive(false); }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragActive(false);
                    void addFiles(event.dataTransfer.files);
                  }}
                >
                  <input ref={fileInputRef} type="file" accept="image/jpeg,.jpg,.jpeg" multiple hidden onChange={(event) => { if (event.target.files) void addFiles(event.target.files); event.target.value = ""; }} />
                  <div className={styles.uploadIcon}>＋</div>
                  <div><strong>Kleine webfoto’s toevoegen</strong><span>Gebruik bij voorkeur JPG’s van ongeveer 1600–2200 px. De bestandsnaam moet overeenkomen met het R2-origineel.</span></div>
                  <button type="button" onClick={() => fileInputRef.current?.click()}>Webfoto’s kiezen</button>
                </div>

                <div className={styles.photoGrid}>
                  {images.map((image, index) => (
                    <article key={image.id} className={image.is_cover ? styles.coverCard : styles.photoCard}>
                      <div className={styles.photoImageWrap}>
                        <img src={image.url} alt={image.file_name} />
                        {image.isNew && <span className={styles.newBadge}>Nieuw</span>}
                        <span className={image.r2_original_key ? styles.r2LinkedBadge : styles.r2MissingBadge}>
                          {image.r2_original_key ? "R2 gekoppeld" : "Geen R2-origineel"}
                        </span>
                      </div>
                      <div className={styles.photoBar}>
                        <label>Positie<input type="number" min={1} max={images.length} value={index + 1} onChange={(e) => moveToPosition(image.id, Number(e.target.value))} /></label>
                        <div className={styles.photoButtons}>
                          <button type="button" onClick={() => setCover(image.id)}>{image.is_cover ? "Omslagfoto" : "Maak omslag"}</button>
                          <button type="button" className={styles.deleteButton} onClick={() => removeImage(image.id)}>Verwijder</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "verhaal" && (
              <div className={styles.formGrid}>
                <label className={styles.full}><span>Titel op de welkomstpagina</span><input value={form.introTitle} onChange={(e) => updateForm("introTitle", e.target.value)} /></label>
                <label className={styles.full}><span>Persoonlijk verhaal of welkomsttekst</span><textarea value={form.introText} onChange={(e) => updateForm("introText", e.target.value)} rows={9} /></label>
              </div>
            )}

            {activeTab === "toegang" && (
              <div className={styles.optionGrid}>
                <label className={styles.optionCard}><span>Beschikbaarheid</span><select value={form.expirySetting} onChange={(e) => updateForm("expirySetting", e.target.value)}><option value="none">Geen vervaldatum</option><option value="30-days">30 dagen</option><option value="3-months">3 maanden</option><option value="6-months">6 maanden</option><option value="12-months">12 maanden</option></select></label>
                <label className={styles.optionCard}><span>Status</span><select value={form.status} onChange={(e) => updateForm("status", e.target.value)}><option value="draft">Concept</option><option value="active">Actief</option><option value="archived">Gearchiveerd</option></select></label>
              </div>
            )}

            {activeTab === "downloads" && (
              <div className={styles.r2SyncPanel}>
                <div className={styles.r2SyncHeader}>
                  <div>
                    <span>Cloudflare R2</span>
                    <h3>Originelen synchroniseren</h3>
                    <p>Upload de grote JPG’s rechtstreeks in R2. Deze site bewaart alleen de kleine webversies in Supabase.</p>
                  </div>
                  <button type="button" onClick={syncR2} disabled={r2SyncBusy} className={styles.r2SyncButton}>
                    {r2SyncBusy ? "Synchroniseren…" : "Synchroniseer met R2"}
                  </button>
                </div>

                <div className={styles.r2FolderCard}>
                  <span>Upload je originelen in deze R2-map</span>
                  <code>{r2Folder}</code>
                  <button type="button" onClick={() => navigator.clipboard.writeText(r2Folder)}>Kopieer pad</button>
                </div>

                <div className={styles.r2Steps}>
                  <div><strong>1</strong><span><b>R2</b> · Upload de grote afgewerkte JPG’s rechtstreeks naar bovenstaande map.</span></div>
                  <div><strong>2</strong><span><b>Synchroniseren</b> · Klik daarna op “Synchroniseer met R2”.</span></div>
                  <div><strong>3</strong><span><b>Website</b> · Upload onder “Foto’s & volgorde” alleen de kleine JPG-versies met dezelfde bestandsnamen.</span></div>
                </div>

                <div className={styles.r2Stats}>
                  <div><strong>{r2Originals.length}</strong><span>originelen gevonden</span></div>
                  <div><strong>{r2Originals.filter((item) => item.linked).length}</strong><span>reeds gekoppeld</span></div>
                  <div><strong>{r2Originals.filter((item) => !item.linked).length}</strong><span>wachten op webfoto</span></div>
                </div>

                {r2Originals.length > 0 && (
                  <div className={styles.r2List}>
                    {r2Originals.slice(0, 100).map((item) => (
                      <div key={item.key}>
                        <span className={item.linked ? styles.r2DotLinked : styles.r2DotWaiting} />
                        <strong>{item.name}</strong>
                        <small>{(item.size / 1024 / 1024).toFixed(1)} MB</small>
                        <em>{item.linked ? "Gekoppeld" : "Webversie ontbreekt"}</em>
                      </div>
                    ))}
                    {r2Originals.length > 100 && <p>+ {r2Originals.length - 100} extra originelen</p>}
                  </div>
                )}
              </div>
            )}

            {activeTab === "huisstijl" && (
              <div className={styles.formGrid}>
                <label><span>Galerijstijl</span><select value={form.galleryStyle} onChange={(e) => updateForm("galleryStyle", e.target.value)}><option value="editorial">Redactioneel</option><option value="masonry">Masonry</option><option value="grid">Rustig raster</option></select></label>
                <label><span>Accentkleur</span><div className={styles.colorField}><input type="color" value={form.accentColor} onChange={(e) => updateForm("accentColor", e.target.value)} /><input value={form.accentColor} onChange={(e) => updateForm("accentColor", e.target.value)} /></div></label>
                <label className={styles.switch}><input type="checkbox" checked={form.watermark} onChange={(e) => updateForm("watermark", e.target.checked)} /><span>Watermerk op webfoto’s tonen</span></label>
              </div>
            )}

            {activeTab === "publiceren" && (
              <div className={styles.publishCard}>
                <span>Galerijlink</span><h3>{form.status === "active" ? "Deze galerij staat online" : "Deze galerij is nog niet openbaar"}</h3>
                {publicUrl && <><input readOnly value={publicUrl} /><div className={styles.publishActions}><button type="button" onClick={() => navigator.clipboard.writeText(publicUrl)}>Kopieer link</button><a href={publicUrl} target="_blank" rel="noreferrer">Open galerij</a></div></>}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

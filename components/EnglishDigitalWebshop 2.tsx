"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import styles from "./WebshopCategories.module.css";

export type EnglishDigitalProduct = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  image_url: string;
  button_text: string;
  event_dates: string;
  price?: number;
};

function EyeIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
}
function DownloadIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg>;
}
function DownloadCountIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.3l7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg>;
}
function CloseIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>;
}
function DownloadCategoryIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 20h14" /></svg>;
}

export default function EnglishDigitalWebshop({ products }: { products: EnglishDigitalProduct[] }) {
  const [previewProduct, setPreviewProduct] = useState<EnglishDigitalProduct | null>(null);
  const [gateProduct, setGateProduct] = useState<EnglishDigitalProduct | null>(null);
  const [gateMode, setGateMode] = useState<"preview" | "download">("preview");
  const [email, setEmail] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [gateError, setGateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlockedEmails, setUnlockedEmails] = useState<Record<string, string>>({});
  const [downloadCounts, setDownloadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!previewProduct && !gateProduct) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewProduct(null);
        setGateProduct(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewProduct, gateProduct]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(products.map(async (product) => {
      try {
        const response = await fetch(`/api/digital-download/${encodeURIComponent(product.id)}?count=1`, { cache: "no-store" });
        if (!response.ok) return null;
        const data = await response.json() as { count?: number };
        return [product.id, Number(data.count ?? 0)] as const;
      } catch {
        return null;
      }
    })).then((results) => {
      if (cancelled) return;
      const next: Record<string, number> = {};
      for (const result of results) if (result) next[result[0]] = result[1];
      setDownloadCounts(next);
    });
    return () => { cancelled = true; };
  }, [products]);

  function openGate(product: EnglishDigitalProduct, mode: "preview" | "download") {
    const knownEmail = unlockedEmails[product.id];
    if (knownEmail) {
      if (mode === "preview") setPreviewProduct(product);
      else void startDownload(product, knownEmail);
      return;
    }
    setGateMode(mode);
    setGateProduct(product);
    setGateError("");
  }

  async function registerPreviewAccess(product: EnglishDigitalProduct, userEmail: string) {
    const response = await fetch(`/api/digital-preview/${encodeURIComponent(product.id)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, marketingConsent }),
    });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) throw new Error(data.error || "The preview could not be opened.");
  }

  async function startDownload(product: EnglishDigitalProduct, userEmail: string) {
    setIsSubmitting(true);
    setGateError("");
    try {
      const response = await fetch(`/api/digital-download/${encodeURIComponent(product.id)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, marketingConsent }),
      });
      const data = await response.json().catch(() => ({})) as { count?: number; downloadUrl?: string; error?: string };
      if (!response.ok || !data.downloadUrl) throw new Error(data.error || "The download could not be started.");
      setDownloadCounts((current) => ({ ...current, [product.id]: Number(data.count ?? current[product.id] ?? 0) }));
      setUnlockedEmails((current) => ({ ...current, [product.id]: userEmail }));
      setGateProduct(null);
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.downloadUrl.split("/").pop() || "studio-sago-download.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitGate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!gateProduct) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setGateError("Please enter a valid email address.");
      return;
    }
    setIsSubmitting(true);
    setGateError("");
    try {
      if (gateMode === "preview") {
        await registerPreviewAccess(gateProduct, normalizedEmail);
        setUnlockedEmails((current) => ({ ...current, [gateProduct.id]: normalizedEmail }));
        const product = gateProduct;
        setGateProduct(null);
        setPreviewProduct(product);
      } else {
        await startDownload(gateProduct, normalizedEmail);
      }
    } catch (error) {
      setGateError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return <main className={styles.page}>
    <section className={styles.hero}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <p className={styles.kicker}>Studio SaGo</p>
        <Link href="/webshop" className={styles.contactButton}>Nederlands</Link>
      </div>
      <h1>Educational downloads made for playful learning</h1>
      <p className={styles.heroText}>Discover printable Studio SaGo materials for learning through play, movement and curiosity. This English shop contains digital products only.</p>
    </section>

    <section className={styles.categoryGrid} aria-label="Digital products">
      <article id="digital-products" className={`${styles.categoryCard} ${styles.digitaal}`}>
        <div className={styles.cardTop}>
          <div className={styles.iconWrap}><DownloadCategoryIcon /></div>
          <div className={styles.number} aria-hidden="true">01</div>
        </div>
        <p className={styles.eyebrow}>Printables & downloads</p>
        <h2>Digital products</h2>
        <p className={styles.intro}>Download, print and start exploring. No physical products are sold in this English shop.</p>
        <div className={styles.productList}>
          {products.map((product) => {
            const count = Number(downloadCounts[product.id] ?? 0);
            return <article key={product.id} className={styles.digitalProductCard}>
              <button type="button" className={styles.productCoverButton} onClick={() => openGate(product, "preview")} aria-label={`Preview ${product.title}`}>
                <img src={product.image_url} alt={`Preview of ${product.title}`} className={styles.productCover} />
                <span className={styles.coverOverlay}><EyeIcon /> Preview</span>
              </button>
              <div className={styles.digitalProductContent}>
                <div className={styles.productCopy}>
                  <span className={styles.productTitleRow}><strong>{product.title}</strong><small>Free</small></span>
                  <span className={styles.productSubtitle}>{product.subtitle}</span>
                  <span className={styles.freeBadge}>{product.event_dates}</span>
                  <span className={styles.productDescription}>{product.description}</span>
                </div>
                <div className={styles.digitalProductFooter}>
                  <div className={styles.digitalActions}>
                    <button type="button" className={styles.previewButton} onClick={() => openGate(product, "preview")}><EyeIcon /> Browse</button>
                    <button type="button" className={styles.downloadButton} onClick={() => openGate(product, "download")}><DownloadIcon /> {product.button_text}</button>
                  </div>
                  <p className={styles.downloadCounter} aria-live="polite"><DownloadCountIcon /> {count.toLocaleString("en-GB")} {count === 1 ? "download" : "downloads"}</p>
                </div>
              </div>
            </article>;
          })}
        </div>
      </article>
    </section>

    {gateProduct ? <div className={`${styles.modalBackdrop} ${styles.downloadGateBackdrop}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isSubmitting) setGateProduct(null); }}>
      <section className={styles.downloadGateModal} role="dialog" aria-modal="true" aria-labelledby="en-email-gate-title">
        <header className={styles.modalHeader}>
          <div><span className={styles.modalEyebrow}>Free Studio SaGo resource</span><h2 id="en-email-gate-title">{gateMode === "preview" ? "Preview the resource" : "Get your free download"}</h2></div>
          <button type="button" className={styles.closeButton} onClick={() => setGateProduct(null)} aria-label="Close" disabled={isSubmitting}><CloseIcon /></button>
        </header>
        <form className={styles.downloadGateForm} onSubmit={submitGate}>
          <p className={styles.downloadGateIntro}>Enter your email address to {gateMode === "preview" ? "browse" : "download"} this free educational resource.</p>
          <label className={styles.emailField}>Email address <span aria-hidden="true">*</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="yourname@email.com" autoComplete="email" required autoFocus /></label>
          <label className={styles.consentRow}><input type="checkbox" checked={marketingConsent} onChange={(event) => setMarketingConsent(event.target.checked)} /><span>Yes, I would like to receive occasional Studio SaGo updates about educational materials, new digital resources and free learning tips. I can unsubscribe at any time.</span></label>
          <p className={styles.privacyNote}>Your email address is required to give you access to this free resource. Newsletter consent is optional and is stored separately for the English list.</p>
          {gateError ? <p className={styles.formError} role="alert">{gateError}</p> : null}
          <button type="submit" className={`${styles.downloadButton} ${styles.downloadSubmitButton}`} disabled={isSubmitting}>{gateMode === "preview" ? <EyeIcon /> : <DownloadIcon />}{isSubmitting ? "Please wait…" : gateMode === "preview" ? "Confirm and preview" : "Confirm and download"}</button>
        </form>
      </section>
    </div> : null}

    {previewProduct?.href ? <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewProduct(null); }}>
      <section className={styles.previewModal} role="dialog" aria-modal="true" aria-labelledby="en-pdf-preview-title">
        <header className={styles.modalHeader}><div><span className={styles.modalEyebrow}>Resource preview</span><h2 id="en-pdf-preview-title">{previewProduct.title}</h2></div><button type="button" className={styles.closeButton} onClick={() => setPreviewProduct(null)} aria-label="Close preview"><CloseIcon /></button></header>
        <div className={styles.pdfViewerWrap}><iframe src={`${previewProduct.href}#view=FitH&toolbar=1&navpanes=0`} title={`Browse ${previewProduct.title}`} className={styles.pdfViewer} /></div>
        <footer className={styles.modalFooter}><p>Use the arrows or scroll to browse the pages.</p><button type="button" className={styles.downloadButton} onClick={() => openGate(previewProduct, "download")}><DownloadIcon /> Free download</button></footer>
      </section>
    </div> : null}
  </main>;
}

import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { formatBelgianDate } from "@/lib/fotografie/date";
import styles from "./photography-admin.module.css";
import DeleteGalleryButton from "@/components/photography/DeleteGalleryButton";

export const dynamic = "force-dynamic";
const PHOTOGRAPHY_SOFT_BUDGET = 800 * 1024 * 1024; // interne veiligheidsgrens voor lichte webfoto’s

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes > 100 * 1024 * 1024 ? 0 : 1)} MB`;
}

export default async function PhotographyAdmin() {
  const supabase = getSupabaseAdmin();
  let galleries: any[] = [];
  let photoCount = 0;
  let knownBytes = 0;
  let usageAvailable = true;
  let errorMessage = "";

  try {
    const { data, error } = await supabase
      .from("photo_galleries")
      .select("id,title,slug,shoot_date,status,client_name,share_token")
      .order("shoot_date", { ascending: false });
    if (error) throw error;
    galleries = data ?? [];

    const usage = await supabase.from("photo_gallery_images").select("file_size_bytes");
    if (usage.error) {
      usageAvailable = false;
      const fallback = await supabase.from("photo_gallery_images").select("id", { count: "exact", head: true });
      photoCount = fallback.count ?? 0;
    } else {
      photoCount = usage.data?.length ?? 0;
      knownBytes = (usage.data ?? []).reduce((sum, row) => sum + Number(row.file_size_bytes || 0), 0);
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Onbekende fout";
  }

  const active = galleries.filter((gallery) => gallery.status === "active").length;
  const clients = new Set(galleries.map((gallery) => gallery.client_name).filter(Boolean)).size;
  const budgetPercent = Math.min(100, Math.round((knownBytes / PHOTOGRAPHY_SOFT_BUDGET) * 100));

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.side}>
          <div className={styles.logo}>SaGo<small>Photography</small></div>
          <nav className={styles.nav}>
            <Link href="/admin/fotografie"><span>▧</span>Galerijen</Link>
            <Link href="/admin/fotografie/galerijen/nieuw"><span>＋</span>Nieuwe galerij</Link>
            <Link href="/fotografie" target="_blank"><span>↗</span>Fotografiepagina</Link>
            <Link href="/galerij" target="_blank"><span>♡</span>Galerijpagina</Link>
          </nav>
          <div className={styles.help}><strong>Opslagbewust</strong>Foto&apos;s worden vóór upload verkleind tot één hoogwaardige webversie. Originelen bewaar je lokaal.</div>
        </aside>

        <section className={styles.main}>
          <header className={styles.top}>
            <div><h1>Fotografie</h1><p>Maak, beheer en deel privégalerijen vanuit één dashboard.</p></div>
            <Link className={styles.cta} href="/admin/fotografie/galerijen/nieuw">＋ Nieuwe galerij</Link>
          </header>

          <div className={styles.stats}>
            <div className={styles.stat}><strong>{galleries.length}</strong><span>Galerijen</span></div>
            <div className={styles.stat}><strong>{active}</strong><span>Actief</span></div>
            <div className={styles.stat}><strong>{photoCount}</strong><span>Foto&apos;s</span></div>
            <div className={styles.stat}><strong>{clients}</strong><span>Klanten</span></div>
          </div>

          <section style={{padding:20,borderRadius:20,background:"rgba(255,255,255,.82)",border:"1px solid rgba(40,61,78,.09)",marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",flexWrap:"wrap"}}>
              <div><strong style={{display:"block",fontSize:16}}>Fotografie-opslag</strong><span style={{color:"#6d7b87",fontSize:13}}>{usageAvailable ? `${formatBytes(knownBytes)} van interne veiligheidsgrens ${formatBytes(PHOTOGRAPHY_SOFT_BUDGET)}` : "Voer de meegeleverde fotografie-migratie uit om opslag exact te volgen."}</span></div>
              <strong>{usageAvailable ? `${budgetPercent}%` : "—"}</strong>
            </div>
            <div style={{height:9,borderRadius:999,background:"#edf0f2",overflow:"hidden",marginTop:12}}><div style={{height:"100%",width:`${usageAvailable ? budgetPercent : 0}%`,background:"#d96d43"}} /></div>
            <p style={{fontSize:12,color:"#7b8790",margin:"10px 0 0"}}>De veiligheidsgrens van 800 MB geldt alleen voor lichte webfoto’s in Supabase. Grote originelen staan in Cloudflare R2.</p>
          </section>

          {errorMessage && <section className={styles.error}><h2>Fotografie kon niet volledig laden</h2><code>{errorMessage}</code></section>}

          {!errorMessage && galleries.length === 0 && <section className={styles.empty}><div className={styles.emptyIcon}>♡</div><h2>Nog geen galerijen</h2><p>Maak je eerste privégalerij en voeg daarna de geoptimaliseerde foto&apos;s toe.</p><Link className={styles.cta} href="/admin/fotografie/galerijen/nieuw">＋ Eerste galerij maken</Link></section>}

          <div className={styles.cards}>
            {galleries.map((gallery) => (
              <article className={styles.card} key={gallery.id}>
                <small>{gallery.status === "active" ? "Actief" : "Concept"}</small>
                <h2>{gallery.title}</h2>
                <p>{gallery.client_name || "Geen klantnaam"} · {gallery.shoot_date ? formatBelgianDate(gallery.shoot_date) : "Geen datum"}</p>
                <div className={styles.links}>
                  <Link href={`/admin/fotografie/galerijen/${gallery.id}`}>Bewerken</Link>
                  {gallery.status === "active" && gallery.share_token && <Link target="_blank" href={`/fotografie/galerij/${gallery.slug}?token=${gallery.share_token}`}>Bekijken</Link>}
                  <DeleteGalleryButton
                    galleryId={gallery.id}
                    galleryTitle={gallery.title}
                    className={styles.deleteLink}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

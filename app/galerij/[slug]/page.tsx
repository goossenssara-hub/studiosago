import { notFound } from 'next/navigation';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import GalleryGrid from '@/components/fotografie/GalleryGrid';
import { formatBelgianDate } from '@/lib/fotografie/date';

export const dynamic = 'force-dynamic';

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();
  const { data: gallery } = await supabase.from('photo_galleries').select('*').eq('slug', slug).eq('status', 'active').maybeSingle();
  if (!gallery) notFound();

  const { data: photos = [] } = await supabase.from('gallery_photos').select('*').eq('gallery_id', gallery.id).order('position');
  const signed = await Promise.all(photos.map(async (photo) => {
    const { data } = await supabase.storage.from('photography-web').createSignedUrl(photo.storage_path, 3600);
    return { ...photo, signedUrl: data?.signedUrl };
  }));
  const theme = gallery.theme;
  return <main style={{background: theme.background, color: theme.text, minHeight:'100vh'}}>
    <section style={{minHeight:'82vh',display:'grid',placeItems:'center',padding:'32px',textAlign:'center'}}>
      <div style={{maxWidth:760,background:theme.surface,padding:'44px 36px',borderRadius:32,boxShadow:'0 24px 70px rgba(60,45,34,.12)'}}>
        <img src="/sago-gallery/logo.png" alt="SaGo Photography" width={190} style={{height:'auto',margin:'0 auto 22px'}} />
        <p>{gallery.shoot_type}</p>
        <h1 style={{fontSize:'clamp(2.3rem,6vw,5rem)',margin:'8px 0 14px'}}>{gallery.title}</h1>
        <p>{formatBelgianDate(gallery.shoot_date)}{gallery.location ? ` · ${gallery.location}` : ''}</p>
        {gallery.welcome_message && <p style={{fontSize:'1.1rem',lineHeight:1.8,marginTop:28}}>{gallery.welcome_message}</p>}
        {gallery.story && <div style={{marginTop:30,lineHeight:1.85,whiteSpace:'pre-wrap'}}>{gallery.story}</div>}
        <a href="#photos" style={{display:'inline-block',marginTop:32,padding:'14px 24px',borderRadius:999,background:theme.accent,color:'#fff',textDecoration:'none'}}>Bekijk de galerij</a>
      </div>
    </section>
    <section id="photos"><GalleryGrid photos={signed} theme={theme} /></section>
  </main>;
}

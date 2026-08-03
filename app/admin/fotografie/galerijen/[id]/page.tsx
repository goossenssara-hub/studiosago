import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { notFound } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function EditGallery({params}:{params:Promise<{id:string}>}){const {id}=await params;const s=getSupabaseAdmin();const {data:g}=await s.from('photo_galleries').select('*').eq('id',id).maybeSingle();if(!g)notFound();return <main style={{padding:32,maxWidth:1000,margin:'0 auto'}}><h1>{g.title}</h1><p>Hier komen de bewerkbare tabbladen: gegevens, foto's, volgorde, verhaal, toegang, downloads, favorieten, huisstijl en publiceren.</p><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(g,null,2)}</pre></main>}

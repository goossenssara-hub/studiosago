import Link from "next/link";
export default function NotFound(){return <main style={{maxWidth:760,margin:"80px auto",padding:32,textAlign:"center"}}><h1>Deze pagina bestaat niet</h1><p>De link is verouderd of werd verplaatst.</p><p><Link href="/">Naar de website</Link> · <Link href="/dashboard">Naar dashboard</Link> · <Link href="/admin">Naar admin</Link></p></main>}

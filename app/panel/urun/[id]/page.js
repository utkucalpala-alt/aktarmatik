'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function UrunDetayPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [copied, setCopied] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  async function loadProduct() {
    try {
      const res = await fetch(`/api/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setData(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  useEffect(() => { loadProduct(); }, [id]);

  async function handleScrape() {
    setScraping(true);
    try {
      await fetch('/api/scrape', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ barcodeId: id }) });
      await loadProduct();
    } catch (err) { console.error(err); }
    setScraping(false);
  }

  function copyEmbed() {
    if (!data?.widget) return;
    navigator.clipboard.writeText(`<script src="${window.location.origin}/widget.js" data-token="${data.widget.token}" data-type="${data.widget.widget_type}"><\/script>`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="panel-content"><div className="skeleton" style={{width:200,height:28}}></div></div>;
  if (!data?.barcode) return <div className="panel-content"><div className="glass-card" style={{padding:40,textAlign:'center'}}><h2>Ürün bulunamadı</h2><Link href="/panel/barkodlar" className="btn btn-secondary" style={{marginTop:16}}>← Geri</Link></div></div>;

  const { barcode, productData: pd, reviews, analysis, widget } = data;
  const d = pd || {};

  return (
    <div className="panel-content">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
        <div>
          <Link href="/panel/barkodlar" style={{fontSize:13,color:'var(--accent-secondary)',display:'inline-block',marginBottom:8}}>← Barkodlar</Link>
          <h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>{barcode.product_name || `Barkod: ${barcode.barcode}`}</h1>
          <div style={{fontSize:13,color:'var(--text-muted)',display:'flex',gap:16}}>
            <span>#{barcode.barcode}</span>
            {barcode.last_scraped_at && <span>Son: {new Date(barcode.last_scraped_at).toLocaleString('tr-TR')}</span>}
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleScrape} disabled={scraping}>{scraping ? '⏳ Çekiliyor...' : '🔄 Güncelle'}</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
        {[['Puan',`⭐ ${d.rating?parseFloat(d.rating).toFixed(1):'-'}`],['Yorum',d.review_count||0],['Favori',`❤ ${d.favorite_count||0}`],['Satış',d.sold_count||0]].map(([l,v],i)=>(
          <div key={i} className="glass-card stat-card fade-in" style={{animationDelay:`${i*0.1}s`}}><div className="stat-label">{l}</div><div className="stat-value">{v}</div></div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24}}>
        <div>
          {analysis && (
            <div className="glass-card fade-in" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>🤖 AI Analiz</h2>
              <span className={`badge ${analysis.sentiment==='positive'?'badge-success':analysis.sentiment==='neutral'?'badge-warning':'badge-danger'}`}>{analysis.sentiment==='positive'?'😊 Pozitif':analysis.sentiment==='neutral'?'😐 Nötr':'😟 Negatif'}</span>
              <p style={{color:'var(--text-secondary)',fontSize:14,lineHeight:1.7,margin:'12px 0 16px'}}>{analysis.summary}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                <div style={{padding:16,borderRadius:'var(--radius-md)',background:'rgba(0,184,148,0.05)',border:'1px solid rgba(0,184,148,0.1)'}}>
                  <h4 style={{fontSize:13,marginBottom:8}}>✅ Güçlü Yönler</h4><p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>{analysis.pros}</p>
                </div>
                <div style={{padding:16,borderRadius:'var(--radius-md)',background:'rgba(225,112,85,0.05)',border:'1px solid rgba(225,112,85,0.1)'}}>
                  <h4 style={{fontSize:13,marginBottom:8}}>⚠️ Zayıf Yönler</h4><p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>{analysis.cons}</p>
                </div>
              </div>
              {analysis.keywords && <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{analysis.keywords.split(',').map((k,i)=><span key={i} className="badge badge-info">{k.trim()}</span>)}</div>}
            </div>
          )}
          <div className="glass-card fade-in" style={{padding:24}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>💬 Yorumlar ({reviews?.length||0})</h2>
            {reviews?.length > 0 ? reviews.map((r,i) => (
              <div key={i} style={{padding:16,border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)',marginBottom:8}}>
                <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8,fontSize:13}}>
                  <span style={{fontWeight:600}}>{r.author}</span>
                  <span>{'⭐'.repeat(r.rating||5)}</span>
                  {r.review_date && <span style={{color:'var(--text-muted)'}}>{r.review_date}</span>}
                </div>
                <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.6}}>{r.content}</p>
              </div>
            )) : <p style={{color:'var(--text-muted)',fontSize:14}}>Henüz yorum yok. Verileri çekerek başlayın.</p>}
          </div>
        </div>

        <div>
          <div className="glass-card fade-in" style={{padding:24,marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>🎨 Widget Kodu</h2>
            {widget ? (<>
              <div style={{background:'var(--bg-primary)',padding:12,borderRadius:'var(--radius-sm)',overflow:'auto'}}>
                <code style={{fontSize:11,color:'var(--accent-secondary)',wordBreak:'break-all'}}>{`<script src="${typeof window!=='undefined'?window.location.origin:''}/widget.js" data-token="${widget.token}" data-type="${widget.widget_type}"></script>`}</code>
              </div>
              <button className="btn btn-primary btn-sm" onClick={copyEmbed} style={{width:'100%',marginTop:12}}>{copied?'✓ Kopyalandı!':'📋 Kopyala'}</button>
            </>) : <p style={{color:'var(--text-muted)',fontSize:14}}>Widget yok.</p>}
          </div>
          <div className="glass-card fade-in" style={{padding:24}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>📈 Sosyal Kanıt</h2>
            {[['🛒 Sepet',d.cart_count],['❤️ Favori',d.favorite_count],['📦 Satış',d.sold_count],['👁 Görüntüleme',d.view_count],['❓ Soru',d.question_count]].map(([l,v],i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:i<4?'1px solid var(--border-color)':'none',fontSize:14}}>
                <span style={{color:'var(--text-secondary)'}}>{l}</span><strong>{v||0}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

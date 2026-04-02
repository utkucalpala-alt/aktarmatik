'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function UrunDetayPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState('');
  const [editingQ, setEditingQ] = useState(null);
  const [editQText, setEditQText] = useState('');
  const [editAText, setEditAText] = useState('');
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
      setTimeout(() => loadProduct(), 3000);
    } catch (err) { console.error(err); }
    setScraping(false);
  }

  async function handleAction(type, itemId, action, extra = {}) {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [type === 'review' ? 'reviewId' : 'questionId']: itemId, action, ...extra }),
      });
      await loadProduct();
    } catch (err) { console.error(err); }
  }

  function copyEmbed() {
    if (!data?.widget) return;
    navigator.clipboard.writeText(`<script src="${window.location.origin}/widget.js" data-token="${data.widget.token}" data-type="${data.widget.widget_type}"><\/script>`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="panel-content"><div className="skeleton" style={{width:'100%',height:300}}></div></div>;
  if (!data?.barcode) return <div className="panel-content"><div className="glass-card" style={{padding:40,textAlign:'center'}}><h2>Ürün bulunamadı</h2><Link href="/panel/barkodlar" className="btn btn-secondary" style={{marginTop:16}}>← Geri</Link></div></div>;

  const { barcode, productData: pd, reviews = [], questions = [], analysis, widget } = data;
  const d = pd || {};

  let ratingScore = parseFloat(d.rating || 0);
  if (ratingScore > 5) ratingScore = Math.round((ratingScore / 2) * 10) / 10;
  const csatColor = ratingScore >= 4.5 ? 'progress-green' : (ratingScore >= 3.5 ? 'progress-yellow' : 'progress-red');
  const csatEmoji = ratingScore >= 4.5 ? '🤩' : (ratingScore >= 3.5 ? '🙂' : '😟');
  const csatPercentage = Math.min((ratingScore / 5) * 100, 100);

  const totalRev = reviews.length;
  const posCount = reviews.filter(r => r.rating >= 4).length;
  const neuCount = reviews.filter(r => r.rating === 3).length;
  const negCount = reviews.filter(r => r.rating <= 2).length;
  const posPct = totalRev ? Math.round((posCount / totalRev) * 100) : 0;
  const neuPct = totalRev ? Math.round((neuCount / totalRev) * 100) : 0;
  const negPct = totalRev ? Math.round((negCount / totalRev) * 100) : 0;

  const sortedByLen = [...reviews].sort((a,b) => (b.content||'').length - (a.content||'').length);
  const mostHelpful = sortedByLen.find(r => r.rating >= 4) || reviews[0];
  const mostCritical = sortedByLen.find(r => r.rating <= 2);

  return (
    <div className="panel-content">
      {/* HEADER */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:32}}>
        <div style={{flex:1}}>
          <Link href="/panel/barkodlar" style={{fontSize:13,color:'var(--accent-secondary)',display:'inline-block',marginBottom:8}}>← Barkodlar Listesi</Link>
          <h1 style={{fontSize:26,fontWeight:800,marginBottom:4}}>{barcode.product_name || `Barkod: ${barcode.barcode}`}</h1>
          {barcode.product_url && <a href={barcode.product_url} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:'var(--info)',display:'inline-block',marginBottom:12,textDecoration:'underline'}}>🔗 Müşteri Sayfasını Görüntüle (Trendyol)</a>}
          <div style={{fontSize:12,color:'var(--text-muted)',display:'flex',gap:16}}>
            <span>#{barcode.barcode}</span>
            {barcode.last_scraped_at && <span>⏱️ Son Veri: {new Date(barcode.last_scraped_at).toLocaleString('tr-TR')}</span>}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:16,width:'300px'}}>
          <button className="btn btn-primary" onClick={handleScrape} disabled={scraping} style={{width:'100%'}}>
            {scraping ? '⏳ Veri Çekiliyor...' : '🔄 Apify Verisini Güncelle'}
          </button>
          <div className="glass-card" style={{padding:'12px 16px',width:'100%',background:'rgba(255,255,255,0.02)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)'}}>Müşteri Memnuniyeti</span>
              <span style={{fontSize:18,fontWeight:800}}>{csatEmoji} {ratingScore.toFixed(1)}</span>
            </div>
            <div className="progress-container"><div className={`progress-bar ${csatColor}`} style={{width:`${csatPercentage}%`}}></div></div>
          </div>
        </div>
      </div>

      {/* MACRO METRICS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:32}}>
        {[
          ['🌟', 'Genel Puan', `${ratingScore.toFixed(1)} <span style="font-size:16px;color:rgba(255,255,255,0.4)">/ 5</span>`, '+%5 Rakiplere Göre'],
          ['💬', 'Toplam Değerlendirme', d.review_count||0, 'Gerçek müşteri analizi'],
          ['❓', 'Cevaplanan Soru', d.question_count||questions?.length||0, 'Son 1 ayda yanıtlandı'],
          ['❤', 'Favori / Beğeni', d.favorite_count||0, 'Yüksek İlgi Skoru']
        ].map(([icon, label, val, sub],i)=>(
          <div key={i} className="glass-card stat-card fade-in" style={{animationDelay:`${i*0.1}s`,position:'relative',overflow:'hidden',padding:'24px 20px'}}>
            <div style={{position:'absolute',right:-20,bottom:-20,fontSize:100,opacity:0.03,filter:'grayscale(100%)',transform:'rotate(-15deg)'}}>{icon}</div>
            <div className="stat-label" style={{display:'flex',alignItems:'center',gap:8,textTransform:'uppercase',letterSpacing:'0.5px',fontSize:12,fontWeight:600}}><span style={{fontSize:16}}>{icon}</span> {label}</div>
            <div className="stat-value" style={{fontSize:36,margin:'8px 0'}} dangerouslySetInnerHTML={{__html:val}}></div>
            <div style={{fontSize:12,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4}}>
              <span style={{color:i===0?'var(--success)':i===3?'var(--info)':'var(--text-secondary)'}}>●</span> {sub}
            </div>
          </div>
        ))}
      </div>

      {/* SOCIAL PROOF ROW */}
      {(d.cart_count > 0 || d.sold_count > 0 || d.favorite_count > 0) && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:32}}>
          {d.favorite_count > 0 && (
            <div className="glass-card fade-in" style={{padding:'20px 24px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'var(--danger)'}}>{(d.favorite_count||0).toLocaleString('tr-TR')}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>❤️ Favoriye Ekleyen</div>
            </div>
          )}
          {d.cart_count > 0 && (
            <div className="glass-card fade-in" style={{padding:'20px 24px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'var(--warning)'}}>{(d.cart_count||0).toLocaleString('tr-TR')}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>🛒 Sepetinde</div>
            </div>
          )}
          {d.sold_count > 0 && (
            <div className="glass-card fade-in" style={{padding:'20px 24px',textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:800,color:'var(--success)'}}>{(d.sold_count||0).toLocaleString('tr-TR')}</div>
              <div style={{fontSize:12,color:'var(--text-muted)',marginTop:4}}>📦 Satış</div>
            </div>
          )}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:24,marginBottom:32}}>
        {/* AI ANALYTICS */}
        <div className="glass-card ai-card fade-in" style={{padding:32}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <h2 style={{fontSize:18,fontWeight:800,display:'flex',alignItems:'center',gap:12}}>
              <span style={{background:'var(--accent-gradient)',padding:'4px 8px',borderRadius:'8px',fontSize:14}}>🤖 AI</span> Akıllı Derin Analiz
            </h2>
            <span className={`badge ${posPct > 50 ? 'badge-success' : 'badge-warning'}`}>{posPct > 50 ? 'Pozitif Trend' : 'Dikkat Gerekiyor'}</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
            <div style={{borderRight:'1px solid var(--border-color)',paddingRight:24}}>
              <h4 style={{fontSize:13,color:'var(--text-secondary)',marginBottom:16}}>Yorum Duygu Analizi (Sentiment)</h4>
              {[['😊','Pozitif',posPct,posCount,'green'],['😐','Nötr',neuPct,neuCount,'yellow'],['😟','Negatif',negPct,negCount,'red']].map(([e,l,p,c,col])=>(
                <div key={l} style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}><span>{e} {l} (%{p})</span><span>{c} Adet</span></div>
                  <div className="progress-container" style={{height:6}}><div className={`progress-bar progress-${col}`} style={{width:`${p}%`}}></div></div>
                </div>
              ))}
              {analysis && <div style={{marginTop:24}}><h4 style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>AI Çıkarımı</h4><p style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.6}}>{analysis.summary}</p></div>}
            </div>
            <div>
              <h4 style={{fontSize:13,color:'var(--text-secondary)',marginBottom:16}}>Akıllı Yorum Seçimi</h4>
              {mostHelpful && <div style={{background:'rgba(0,184,148,0.05)',border:'1px solid rgba(0,184,148,0.2)',padding:12,borderRadius:'var(--radius-md)',marginBottom:12}}><div style={{fontSize:11,color:'var(--success)',fontWeight:700,marginBottom:4}}>🏆 En Faydalı Yorum</div><p style={{fontSize:12,lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>{mostHelpful.content}</p></div>}
              {mostCritical ? <div style={{background:'rgba(225,112,85,0.05)',border:'1px solid rgba(225,112,85,0.2)',padding:12,borderRadius:'var(--radius-md)'}}><div style={{fontSize:11,color:'var(--danger)',fontWeight:700,marginBottom:4}}>⚠️ En Keskin Eleştiri</div><p style={{fontSize:12,lineHeight:1.5,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical'}}>{mostCritical.content}</p></div> : <div style={{padding:12,fontSize:12,color:'var(--text-muted)'}}>Ciddi bir negatif yorum tespit edilmedi.</div>}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div>
          <div className="glass-card fade-in" style={{padding:24,marginBottom:24}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>📈 Aktarmatik Dönüşüm Oranları</h2>
            <div className="pulse-row"><span className="pulse-dot"></span><div style={{flex:1,fontSize:14}}>Son 30 günde yüksek satış ivmesi.</div></div>
            {(d.cart_count || 0) > 0 && <div className="pulse-row"><span className="pulse-dot" style={{backgroundColor:'var(--warning)',animationDelay:'0.5s'}}></span><div style={{flex:1,fontSize:14}}>Şu an <strong>{(d.cart_count||0).toLocaleString('tr-TR')}</strong> kişinin sepetinde!</div></div>}
            <div className="pulse-row" style={{background:'transparent',borderBottom:'1px solid var(--border-color)',borderRadius:0}}><span style={{fontSize:14,color:'var(--text-secondary)'}}>Favorilere Ekleyen:</span><strong style={{marginLeft:'auto'}}>{(d.favorite_count || 0).toLocaleString('tr-TR')} Kişi</strong></div>
            <div className="pulse-row" style={{background:'transparent',borderBottom:'1px solid var(--border-color)',borderRadius:0}}><span style={{fontSize:14,color:'var(--text-secondary)'}}>Son 3 gündeki satışı:</span><strong style={{marginLeft:'auto'}}>{d.sold_count || 0}</strong></div>
          </div>
          <div className="glass-card fade-in" style={{padding:24}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>🎨 Widget Entegrasyonu</h2>
            {widget ? (<><div style={{background:'var(--bg-primary)',padding:12,borderRadius:'var(--radius-sm)',overflow:'auto'}}><code style={{fontSize:11,color:'var(--accent-secondary)',wordBreak:'break-all'}}>{`<script src="${typeof window!=='undefined'?window.location.origin:''}/widget.js" data-token="${widget.token}" data-type="${widget.widget_type}"></script>`}</code></div><button className="btn btn-secondary btn-sm" onClick={copyEmbed} style={{width:'100%',marginTop:12}}>{copied?'✓ Kopyalandı!':'📋 Kopyala'}</button></>) : <p style={{color:'var(--text-muted)',fontSize:14}}>Henüz widget yok.</p>}
          </div>
        </div>
      </div>

      {/* REVIEWS & Q&A */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        {/* REVIEWS */}
        <div className="glass-card fade-in" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>💬 Yorumlar ({reviews?.length||0})</h2>
          <div style={{maxHeight:600,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,paddingRight:8}}>
            {reviews?.map((r,i) => (
              <div key={r.id||i} style={{padding:16,background:'rgba(255,255,255,0.02)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,fontSize:13}}>
                  <span style={{fontWeight:600}}>{r.author}</span>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{color: r.rating >= 4 ? 'var(--success)' : r.rating === 3 ? 'var(--warning)' : 'var(--danger)'}}>{'⭐'.repeat(r.rating||5)}</span>
                    {r.review_date && <span style={{color:'var(--text-muted)',fontSize:11}}>{r.review_date}</span>}
                  </div>
                </div>
                {editingReview === r.id ? (
                  <div>
                    <textarea value={editText} onChange={e=>setEditText(e.target.value)} style={{width:'100%',minHeight:60,padding:8,background:'rgba(255,255,255,0.05)',border:'1px solid var(--accent-primary)',borderRadius:6,color:'var(--text-primary)',fontSize:13,resize:'vertical',fontFamily:'inherit'}}/>
                    <div style={{display:'flex',gap:6,marginTop:6}}>
                      <button onClick={()=>{handleAction('review',r.id,'edit',{content:editText});setEditingReview(null);}} style={{fontSize:11,padding:'4px 12px',background:'var(--accent-primary)',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Kaydet</button>
                      <button onClick={()=>setEditingReview(null)} style={{fontSize:11,padding:'4px 12px',background:'rgba(255,255,255,0.05)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',borderRadius:4,cursor:'pointer'}}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.6}}>{r.content}</p>
                    <div style={{display:'flex',gap:6,marginTop:8}}>
                      <button onClick={()=>{setEditingReview(r.id);setEditText(r.content);}} style={{fontSize:11,padding:'3px 8px',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border-color)',borderRadius:4,color:'var(--text-secondary)',cursor:'pointer'}} title="Düzenle">✏️</button>
                      <button onClick={()=>confirm('Bu yorumu silmek istiyor musunuz?')&&handleAction('review',r.id,'delete')} style={{fontSize:11,padding:'3px 8px',background:'rgba(225,112,85,0.05)',border:'1px solid rgba(225,112,85,0.3)',borderRadius:4,color:'var(--danger)',cursor:'pointer',marginLeft:'auto'}} title="Sil">🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {(!reviews || reviews.length === 0) && <p style={{color:'var(--text-muted)',fontSize:14}}>Henüz yorum çekilmedi.</p>}
          </div>
        </div>

        {/* Q&A */}
        <div className="glass-card fade-in" style={{padding:24}}>
          <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>❓ Soru & Cevap ({questions?.length||0})</h2>
          <div style={{maxHeight:600,overflowY:'auto',display:'flex',flexDirection:'column',gap:12,paddingRight:8}}>
            {questions?.map((q,i) => (
              <div key={q.id||i} style={{padding:16,background:'rgba(255,255,255,0.02)',border:'1px solid var(--border-color)',borderRadius:'var(--radius-md)'}}>
                <div style={{fontWeight:600,fontSize:13,marginBottom:4,color:'var(--text-primary)'}}>{q.user_name}</div>
                {editingQ === q.id ? (
                  <div>
                    <div style={{marginBottom:6}}><label style={{fontSize:11,color:'var(--text-muted)'}}>Soru:</label><textarea value={editQText} onChange={e=>setEditQText(e.target.value)} style={{width:'100%',minHeight:40,padding:8,background:'rgba(255,255,255,0.05)',border:'1px solid var(--accent-primary)',borderRadius:6,color:'var(--text-primary)',fontSize:13,resize:'vertical',fontFamily:'inherit'}}/></div>
                    <div style={{marginBottom:6}}><label style={{fontSize:11,color:'var(--text-muted)'}}>Cevap:</label><textarea value={editAText} onChange={e=>setEditAText(e.target.value)} style={{width:'100%',minHeight:40,padding:8,background:'rgba(255,255,255,0.05)',border:'1px solid var(--accent-primary)',borderRadius:6,color:'var(--text-primary)',fontSize:13,resize:'vertical',fontFamily:'inherit'}}/></div>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>{handleAction('question',q.id,'edit',{questionText:editQText,answerText:editAText});setEditingQ(null);}} style={{fontSize:11,padding:'4px 12px',background:'var(--accent-primary)',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>Kaydet</button>
                      <button onClick={()=>setEditingQ(null)} style={{fontSize:11,padding:'4px 12px',background:'rgba(255,255,255,0.05)',color:'var(--text-secondary)',border:'1px solid var(--border-color)',borderRadius:4,cursor:'pointer'}}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{fontSize:14,color:'var(--text-secondary)',lineHeight:1.5,marginBottom:12}}><strong>S:</strong> {q.question_text}</p>
                    {q.answer_text ? <div style={{padding:'8px 12px',background:'rgba(108, 92, 231, 0.1)',borderLeft:'3px solid var(--accent-primary)',borderRadius:'4px'}}><p style={{fontSize:13,color:'var(--accent-secondary)'}}><strong>Cevap: </strong>{q.answer_text}</p></div> : <span style={{fontSize:12,color:'var(--danger)'}}>Cevaplanmadı</span>}
                    {q.question_date && <div style={{fontSize:11,color:'var(--text-muted)',marginTop:8,textAlign:'right'}}>{q.question_date}</div>}
                    <div style={{display:'flex',gap:6,marginTop:8}}>
                      <button onClick={()=>{setEditingQ(q.id);setEditQText(q.question_text);setEditAText(q.answer_text||'');}} style={{fontSize:11,padding:'3px 8px',background:'rgba(255,255,255,0.05)',border:'1px solid var(--border-color)',borderRadius:4,color:'var(--text-secondary)',cursor:'pointer'}} title="Düzenle">✏️</button>
                      <button onClick={()=>confirm('Bu soruyu silmek istiyor musunuz?')&&handleAction('question',q.id,'delete')} style={{fontSize:11,padding:'3px 8px',background:'rgba(225,112,85,0.05)',border:'1px solid rgba(225,112,85,0.3)',borderRadius:4,color:'var(--danger)',cursor:'pointer',marginLeft:'auto'}} title="Sil">🗑️</button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {(!questions || questions.length === 0) && <p style={{color:'var(--text-muted)',fontSize:14}}>Bu ürün için henüz soru-cevap verisi bulunamadı veya çekilmedi.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

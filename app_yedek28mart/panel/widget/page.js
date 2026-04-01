'use client';
import { useState, useEffect } from 'react';

export default function WidgetPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [widgetType, setWidgetType] = useState('full');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/barcodes', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setBarcodes(data.barcodes || []);
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, []);

  function getEmbedCode() {
    if (!selected) return '';
    return `<script src="${typeof window !=='undefined'?window.location.origin:''}/widget.js" data-token="${selected}" data-type="${widgetType}" data-theme="${theme}"><\/script>`;
  }

  function copyCode() {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const types = [
    { value: 'full', label: '🎯 Tam Widget', desc: 'Puan + sosyal kanıt + yorumlar + AI özet' },
    { value: 'social', label: '📊 Sosyal Kanıt', desc: 'Sepet, favori, satış metrikleri' },
    { value: 'reviews', label: '💬 Yorumlar', desc: 'Son müşteri yorumları' },
    { value: 'ai-summary', label: '🤖 AI Özet', desc: 'Yapay zeka yorum özeti' },
  ];

  return (
    <div style={{maxWidth:1100}}>
      <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Widget Yapılandırma</h1>
      <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:32}}>Web sitenize gömülebilir widget&apos;lar oluşturun.</p>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        <div>
          {/* Ürün seçimi */}
          <div className="glass-card" style={{padding:24,marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>1. Ürün Seçin</h2>
            {loading ? <div className="skeleton" style={{height:40}}></div> : (
              <select className="form-input" style={{width:'100%'}} value={selected||''} onChange={e=>setSelected(e.target.value)}>
                <option value="">Bir ürün seçin...</option>
                {barcodes.map(b => {
                  const widgetToken = b.id;
                  return <option key={b.id} value={b.id}>{b.product_name || `Barkod: ${b.barcode}`}</option>;
                })}
              </select>
            )}
          </div>

          {/* Widget türü */}
          <div className="glass-card" style={{padding:24,marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>2. Widget Türü</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
              {types.map(t => (
                <button key={t.value} onClick={()=>setWidgetType(t.value)} style={{
                  padding:16, borderRadius:'var(--radius-md)', border:`1px solid ${widgetType===t.value?'var(--accent-primary)':'var(--border-color)'}`,
                  background: widgetType===t.value?'rgba(108,92,231,0.1)':'var(--bg-glass)', cursor:'pointer', textAlign:'left', color:'var(--text-primary)', fontFamily:'var(--font-sans)'
                }}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>{t.label}</div>
                  <div style={{fontSize:12,color:'var(--text-muted)'}}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tema */}
          <div className="glass-card" style={{padding:24}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>3. Tema</h2>
            <div style={{display:'flex',gap:8}}>
              {['dark','light'].map(t => (
                <button key={t} onClick={()=>setTheme(t)} style={{
                  flex:1, padding:'12px 16px', borderRadius:'var(--radius-md)',
                  border:`1px solid ${theme===t?'var(--accent-primary)':'var(--border-color)'}`,
                  background: theme===t?'rgba(108,92,231,0.1)':'var(--bg-glass)',
                  cursor:'pointer', fontWeight:600, fontSize:14, color:'var(--text-primary)', fontFamily:'var(--font-sans)'
                }}>
                  {t==='dark'?'🌙 Koyu':'☀️ Açık'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ panel - Önizleme ve Kod */}
        <div>
          <div className="glass-card" style={{padding:24,marginBottom:16}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Gömme Kodu</h2>
            {selected ? (<>
              <div style={{background:'var(--bg-primary)',padding:16,borderRadius:'var(--radius-sm)',marginBottom:12}}>
                <code style={{fontSize:12,color:'var(--accent-secondary)',wordBreak:'break-all',lineHeight:1.8}}>{getEmbedCode()}</code>
              </div>
              <button className="btn btn-primary" onClick={copyCode} style={{width:'100%'}}>{copied?'✓ Kopyalandı!':'📋 Kodu Kopyala'}</button>
              <p style={{fontSize:12,color:'var(--text-muted)',marginTop:12}}>Bu kodu web sitenizin HTML&apos;ine yapıştırın. Widget otomatik olarak yüklenecektir.</p>
            </>) : (
              <p style={{color:'var(--text-muted)',fontSize:14,textAlign:'center',padding:20}}>Önce bir ürün seçin.</p>
            )}
          </div>

          <div className="glass-card" style={{padding:24}}>
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Önizleme</h2>
            <div style={{background:theme==='dark'?'#0a0b14':'#f8f9fa',padding:24,borderRadius:'var(--radius-md)',border:'1px solid var(--border-color)',minHeight:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {selected ? (
                <div style={{width:'100%',color:theme==='dark'?'#f0f0ff':'#1a1a2e',fontSize:14}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                    <span style={{fontSize:20}}>⭐</span>
                    <span style={{fontSize:24,fontWeight:800}}>4.3</span>
                    <span style={{fontSize:13,opacity:0.7}}>(128 değerlendirme)</span>
                  </div>
                  {(widgetType==='full'||widgetType==='social') && (
                    <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                      {['🛒 89 sepette','❤ 2.4K favori','📦 5.2K satış'].map((s,i)=>(
                        <span key={i} style={{background:theme==='dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',padding:'4px 10px',borderRadius:20,fontSize:12}}>{s}</span>
                      ))}
                    </div>
                  )}
                  {(widgetType==='full'||widgetType==='ai-summary') && (
                    <p style={{fontSize:13,opacity:0.8,lineHeight:1.6}}>🤖 Kullanıcılar genel olarak ürün kalitesinden memnun. Hızlı kargo ve uygun fiyat öne çıkan olumlu yorumlar arasında.</p>
                  )}
                  <div style={{marginTop:8,fontSize:11,opacity:0.4}}>Powered by TrendProof</div>
                </div>
              ) : <span style={{color:'var(--text-muted)',fontSize:14}}>Önizleme için ürün seçin</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';

export default function WidgetPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [widgetType, setWidgetType] = useState('full');
  const [theme, setTheme] = useState('native');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [copiedIkas, setCopiedIkas] = useState(false);
  const [activeTab, setActiveTab] = useState('ikas'); // 'ikas' or 'manual'
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

  function getIkasCode() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `<script src="${origin}/widget-auto.js" data-theme="${theme}"><\/script>`;
  }

  function copyCode() {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyIkasCode() {
    navigator.clipboard.writeText(getIkasCode());
    setCopiedIkas(true);
    setTimeout(() => setCopiedIkas(false), 2000);
  }

  const types = [
    { value: 'full', label: 'Tam Widget', desc: 'Puan + sosyal kanit + yorumlar + AI ozet' },
    { value: 'social', label: 'Sosyal Kanit', desc: 'Sepet, favori, satis metrikleri' },
    { value: 'reviews', label: 'Yorumlar', desc: 'Son musteri yorumlari' },
    { value: 'ai-summary', label: 'AI Ozet', desc: 'Yapay zeka yorum ozeti' },
  ];

  const matchedCount = barcodes.filter(b => b.site_url).length;

  return (
    <div style={{maxWidth:1100}}>
      <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Widget Entegrasyonu</h1>
      <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>Web sitenize Trendyol verilerini gomun.</p>

      {/* Tab secimi */}
      <div style={{display:'flex',gap:0,borderBottom:'2px solid var(--border-color)',marginBottom:24}}>
        <button onClick={()=>setActiveTab('ikas')} style={{
          padding:'12px 24px',cursor:'pointer',fontSize:14,fontWeight:600,
          borderBottom: activeTab==='ikas'?'2px solid var(--accent-primary)':'2px solid transparent',
          marginBottom:'-2px',color:activeTab==='ikas'?'var(--accent-primary)':'var(--text-muted)',
          background:'transparent',border:'none',fontFamily:'var(--font-sans)'
        }}>ikas / Otomatik Entegrasyon</button>
        <button onClick={()=>setActiveTab('manual')} style={{
          padding:'12px 24px',cursor:'pointer',fontSize:14,fontWeight:600,
          borderBottom: activeTab==='manual'?'2px solid var(--accent-primary)':'2px solid transparent',
          marginBottom:'-2px',color:activeTab==='manual'?'var(--accent-primary)':'var(--text-muted)',
          background:'transparent',border:'none',fontFamily:'var(--font-sans)'
        }}>Tekil Widget (Manuel)</button>
      </div>

      {/* ==================== ikas TAB ==================== */}
      {activeTab === 'ikas' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            {/* Nasil Calisir */}
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Nasil Calisir?</h2>
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <span style={{background:'rgba(108,92,231,0.15)',color:'var(--accent-primary)',width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>1</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>Urunleri Eslestirin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>Barkodlar sayfasindan urunlerinizi Trendyol barkodu + site URL&apos;i ile ekleyin.</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <span style={{background:'rgba(108,92,231,0.15)',color:'var(--accent-primary)',width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>2</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>Tek Script Ekleyin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>Asagidaki kodu ikas panelinize bir kez ekleyin.</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:12,alignItems:'flex-start'}}>
                  <span style={{background:'rgba(108,92,231,0.15)',color:'var(--accent-primary)',width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,flexShrink:0}}>3</span>
                  <div>
                    <div style={{fontWeight:600,fontSize:14}}>Otomatik Gorunum</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>Eslesen urunlerin sayfalarinda Trendyol verileri otomatik olarak gorunur.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tema Secimi */}
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Tema</h2>
              <div style={{display:'flex',gap:8}}>
                {[
                  {value:'native', label:'Otomatik', desc:'Sitenizin temasina uyum saglar'},
                  {value:'light', label:'Acik'},
                  {value:'dark', label:'Koyu'},
                ].map(t => (
                  <button key={t.value} onClick={()=>setTheme(t.value)} style={{
                    flex:1, padding:'12px 16px', borderRadius:'var(--radius-md)',
                    border:`1px solid ${theme===t.value?'var(--accent-primary)':'var(--border-color)'}`,
                    background: theme===t.value?'rgba(108,92,231,0.1)':'var(--bg-glass)',
                    cursor:'pointer', fontWeight:600, fontSize:14, color:'var(--text-primary)', fontFamily:'var(--font-sans)',
                    textAlign:'center'
                  }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Eslesen Urunler Ozeti */}
            <div className="glass-card" style={{padding:24}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Eslesen Urunler</h2>
              {loading ? <div className="skeleton" style={{height:60}}></div> : (
                <>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                    <span style={{fontSize:32,fontWeight:800,color:'var(--accent-primary)'}}>{matchedCount}</span>
                    <span style={{fontSize:14,color:'var(--text-muted)'}}>urun eslestirildi<br/>(site URL&apos;i girilmis)</span>
                  </div>
                  {matchedCount === 0 && (
                    <div style={{padding:12,borderRadius:'var(--radius-sm)',background:'rgba(214,48,49,0.08)',border:'1px solid rgba(214,48,49,0.15)',fontSize:13,color:'#d63031'}}>
                      Henuz hicbir urune site URL&apos;i eklenmemis. Barkodlar sayfasindan urunlerinize site URL&apos;lerini ekleyin.
                    </div>
                  )}
                  {matchedCount > 0 && (
                    <div style={{maxHeight:200,overflowY:'auto'}}>
                      {barcodes.filter(b => b.site_url).map(b => (
                        <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border-color)',fontSize:13}}>
                          <span style={{fontWeight:500}}>{b.product_name || `Barkod: ${b.barcode}`}</span>
                          <span style={{color:'var(--text-muted)',fontSize:12,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.site_url}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sag panel */}
          <div>
            {/* Entegrasyon Kodu */}
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Entegrasyon Kodu</h2>
              <div style={{background:'var(--bg-primary)',padding:16,borderRadius:'var(--radius-sm)',marginBottom:12}}>
                <code style={{fontSize:13,color:'var(--accent-secondary)',wordBreak:'break-all',lineHeight:1.8}}>{getIkasCode()}</code>
              </div>
              <button className="btn btn-primary" onClick={copyIkasCode} style={{width:'100%'}}>
                {copiedIkas ? 'Kopyalandi!' : 'Kodu Kopyala'}
              </button>
            </div>

            {/* ikas Kurulum Rehberi */}
            <div className="glass-card" style={{padding:24}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>ikas Kurulum Rehberi</h2>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 1: ikas Paneline Gidin</div>
                  <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                    ikas yonetim panelinizde <strong>Satis Kanallari &gt; Magazaniz &gt; Eklentiler</strong> bolumune gidin.
                  </div>
                </div>
                <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 2: Script Ekleyin</div>
                  <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                    &quot;Scriptler&quot; alanina yukaridaki kodu yapistirin. Kodun <code style={{background:'rgba(0,0,0,0.1)',padding:'2px 6px',borderRadius:4,fontSize:12}}>&lt;script&gt;...&lt;/script&gt;</code> etiketleri arasinda olduguna emin olun.
                  </div>
                </div>
                <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 3: Kaydedin</div>
                  <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                    Degisiklikleri kaydedin. Artik eslestirdiginiz urunlerin sayfalarinda Trendyol verileri otomatik olarak gorunecektir.
                  </div>
                </div>
              </div>
              <div style={{marginTop:16,padding:12,borderRadius:'var(--radius-sm)',background:'rgba(0,184,148,0.08)',border:'1px solid rgba(0,184,148,0.15)',fontSize:13,color:'#00b894'}}>
                <strong>Ipucu:</strong> Widget, urun sayfalarinda site URL&apos;i eslesmesiyle otomatik calisir. Yeni urun ekledikce widget o sayfalarda da gorunur - ekstra islem gerekmez.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MANUAL TAB ==================== */}
      {activeTab === 'manual' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            {/* Urun secimi */}
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>1. Urun Secin</h2>
              {loading ? <div className="skeleton" style={{height:40}}></div> : (
                <select className="form-input" style={{width:'100%'}} value={selected||''} onChange={e=>setSelected(e.target.value)}>
                  <option value="">Bir urun secin...</option>
                  {barcodes.map(b => (
                    <option key={b.id} value={b.id}>{b.product_name || `Barkod: ${b.barcode}`}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Widget turu */}
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>2. Widget Turu</h2>
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
                {['dark','light','native'].map(t => (
                  <button key={t} onClick={()=>setTheme(t)} style={{
                    flex:1, padding:'12px 16px', borderRadius:'var(--radius-md)',
                    border:`1px solid ${theme===t?'var(--accent-primary)':'var(--border-color)'}`,
                    background: theme===t?'rgba(108,92,231,0.1)':'var(--bg-glass)',
                    cursor:'pointer', fontWeight:600, fontSize:14, color:'var(--text-primary)', fontFamily:'var(--font-sans)'
                  }}>
                    {t==='dark'?'Koyu':t==='light'?'Acik':'Otomatik'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sag panel - Kod */}
          <div>
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Gomme Kodu</h2>
              {selected ? (<>
                <div style={{background:'var(--bg-primary)',padding:16,borderRadius:'var(--radius-sm)',marginBottom:12}}>
                  <code style={{fontSize:12,color:'var(--accent-secondary)',wordBreak:'break-all',lineHeight:1.8}}>{getEmbedCode()}</code>
                </div>
                <button className="btn btn-primary" onClick={copyCode} style={{width:'100%'}}>{copied?'Kopyalandi!':'Kodu Kopyala'}</button>
                <p style={{fontSize:12,color:'var(--text-muted)',marginTop:12}}>Bu kodu urun sayfanizin HTML&apos;ine yapistirin.</p>
              </>) : (
                <p style={{color:'var(--text-muted)',fontSize:14,textAlign:'center',padding:20}}>Once bir urun secin.</p>
              )}
            </div>

            <div className="glass-card" style={{padding:24}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Onizleme</h2>
              <div style={{background:theme==='dark'?'#0a0b14':theme==='light'?'#f8f9fa':'#fff',padding:24,borderRadius:'var(--radius-md)',border:'1px solid var(--border-color)',minHeight:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {selected ? (
                  <div style={{width:'100%',color:theme==='dark'?'#f0f0ff':'#1a1a2e',fontSize:14}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}>
                      <span style={{fontSize:24,fontWeight:800}}>4.3</span>
                      <span style={{fontSize:13,opacity:0.7}}>(128 degerlendirme)</span>
                    </div>
                    {(widgetType==='full'||widgetType==='social') && (
                      <div style={{display:'flex',gap:12,marginBottom:12,flexWrap:'wrap'}}>
                        {['89 sepette','2.4B favori','5.2B satis'].map((s,i)=>(
                          <span key={i} style={{background:theme==='dark'?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',padding:'4px 10px',borderRadius:20,fontSize:12}}>{s}</span>
                        ))}
                      </div>
                    )}
                    {(widgetType==='full'||widgetType==='ai-summary') && (
                      <p style={{fontSize:13,opacity:0.8,lineHeight:1.6}}>Kullanicilar genel olarak urun kalitesinden memnun. Hizli kargo ve uygun fiyat one cikan olumlu yorumlar arasinda.</p>
                    )}
                    <div style={{marginTop:8,fontSize:11,opacity:0.4}}>Powered by AKTARMATIK</div>
                  </div>
                ) : <span style={{color:'var(--text-muted)',fontSize:14}}>Onizleme icin urun secin</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

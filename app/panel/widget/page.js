'use client';
import { useState, useEffect } from 'react';

export default function WidgetPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [theme, setTheme] = useState('native');
  const [loading, setLoading] = useState(true);
  const [copiedIkas, setCopiedIkas] = useState(false);
  const [platform, setPlatform] = useState('ikas');
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

  function getIkasCode() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `<script src="${origin}/widget-auto.js" data-theme="${theme}"><\/script>`;
  }

  function copyIkasCode() {
    navigator.clipboard.writeText(getIkasCode());
    setCopiedIkas(true);
    setTimeout(() => setCopiedIkas(false), 2000);
  }

  const matchedCount = barcodes.filter(b => b.site_url).length;

  return (
    <div style={{maxWidth:1100}}>
      <h1 style={{fontSize:28,fontWeight:800,marginBottom:4}}>Widget Entegrasyonu</h1>
      <p style={{color:'var(--text-secondary)',fontSize:14,marginBottom:24}}>Web sitenize Trendyol verilerini gomun.</p>

      {/* Otomatik Entegrasyon */}
      {(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            {/* Platform Secimi */}
            <div className="glass-card" style={{padding:24,marginBottom:16}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Site Altyapisi</h2>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:8}}>
                {[
                  {value:'ikas', label:'ikas', icon:'🟣'},
                  {value:'shopify', label:'Shopify', icon:'🟢'},
                  {value:'wordpress', label:'WordPress', icon:'🔵'},
                  {value:'ideasoft', label:'IdeaSoft', icon:'🟠'},
                ].map(p => (
                  <button key={p.value} onClick={()=>setPlatform(p.value)} style={{
                    padding:'14px 8px', borderRadius:'var(--radius-md)',
                    border:`2px solid ${platform===p.value?'var(--accent-primary)':'var(--border-color)'}`,
                    background: platform===p.value?'rgba(108,92,231,0.1)':'var(--bg-glass)',
                    cursor:'pointer', textAlign:'center', color:'var(--text-primary)', fontFamily:'var(--font-sans)',
                    transition:'all 0.15s'
                  }}>
                    <div style={{fontSize:24,marginBottom:4}}>{p.icon}</div>
                    <div style={{fontSize:13,fontWeight:platform===p.value?700:500}}>{p.label}</div>
                  </button>
                ))}
              </div>
            </div>

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

            {/* Platform Kurulum Rehberi */}
            <div className="glass-card" style={{padding:24}}>
              <h2 style={{fontSize:16,fontWeight:700,marginBottom:16}}>
                {platform === 'ikas' ? 'ikas' : platform === 'shopify' ? 'Shopify' : platform === 'wordpress' ? 'WordPress' : 'IdeaSoft'} Kurulum Rehberi
              </h2>
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                {platform === 'ikas' && (<>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 1: ikas Paneline Gidin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      ikas yonetim panelinizde <strong>Satis Kanallari &gt; Magazaniz &gt; Eklentiler</strong> bolumune gidin.
                    </div>
                  </div>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 2: Script Ekleyin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      &quot;Scriptler&quot; alanina yukaridaki kodu yapistirin.
                    </div>
                  </div>
                </>)}
                {platform === 'shopify' && (<>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 1: Shopify Admin Paneli</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      Shopify admin panelinizde <strong>Online Store &gt; Themes &gt; Edit Code</strong> bolumune gidin.
                    </div>
                  </div>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 2: theme.liquid Dosyasina Ekleyin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      <code style={{background:'rgba(0,0,0,0.1)',padding:'2px 6px',borderRadius:4,fontSize:12}}>theme.liquid</code> dosyasinda <code style={{background:'rgba(0,0,0,0.1)',padding:'2px 6px',borderRadius:4,fontSize:12}}>&lt;/body&gt;</code> etiketinin hemen ustune kodu yapistirin.
                    </div>
                  </div>
                </>)}
                {platform === 'wordpress' && (<>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 1: WordPress Admin Paneli</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      WordPress admin panelinizde <strong>Gorunum &gt; Tema Duzenleyici &gt; footer.php</strong> dosyasini acin.
                    </div>
                  </div>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 2: Footer&apos;a Ekleyin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      <code style={{background:'rgba(0,0,0,0.1)',padding:'2px 6px',borderRadius:4,fontSize:12}}>&lt;/body&gt;</code> etiketinin hemen ustune kodu yapistirin. Veya <strong>Insert Headers and Footers</strong> eklentisini kullanabilirsiniz.
                    </div>
                  </div>
                </>)}
                {platform === 'ideasoft' && (<>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 1: IdeaSoft Paneli</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      IdeaSoft yonetim panelinizde <strong>Tasarim &gt; Tema Ayarlari &gt; Kod Duzenleyici</strong> bolumune gidin.
                    </div>
                  </div>
                  <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Adim 2: Footer Alanina Ekleyin</div>
                    <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                      Footer bolumune yukaridaki script kodunu yapistirin ve kaydedin.
                    </div>
                  </div>
                </>)}
                <div style={{padding:16,borderRadius:'var(--radius-sm)',background:'rgba(108,92,231,0.04)',border:'1px solid rgba(108,92,231,0.1)'}}>
                  <div style={{fontWeight:600,fontSize:14,marginBottom:8}}>Son Adim: Kaydedin</div>
                  <div style={{fontSize:13,color:'var(--text-muted)',lineHeight:1.6}}>
                    Degisiklikleri kaydedin. Artik eslestirdiginiz urunlerin sayfalarinda Trendyol verileri otomatik olarak gorunecektir.
                  </div>
                </div>
              </div>
              <div style={{marginTop:16,padding:12,borderRadius:'var(--radius-sm)',background:'rgba(0,184,148,0.08)',border:'1px solid rgba(0,184,148,0.15)',fontSize:13,color:'#00b894'}}>
                <strong>Ipucu:</strong> Widget, urun sayfalarinda site URL&apos;i eslesmesiyle otomatik calisir. Yeni urun ekledikce widget o sayfalarda da gorunur.
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

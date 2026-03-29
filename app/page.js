'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

function AnimatedNum({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = Math.ceil(target / 40);
        const iv = setInterval(() => { s += step; if (s >= target) { s = target; clearInterval(iv); } setVal(s); }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <strong ref={ref}>{val.toLocaleString()}{suffix}</strong>;
}

export default function HomePage() {
  const [rotateIdx, setRotateIdx] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const socialMessages = [
    { icon: '\u2764\uFE0F', text: 'Sevilen urun!', highlight: '30.2B kisi favoriledi!' },
    { icon: '\uD83D\uDED2', text: '', highlight: '2.4B kisinin sepetinde, tukenmeden al!' },
    { icon: '\uD83D\uDCE6', text: '3 gunde', highlight: '250+ urun satildi!' },
    { icon: '\uD83D\uDD25', text: 'Populer urun!', highlight: 'Son 24 saatte 1.1B kisi goruntuledi!' },
  ];

  useEffect(() => {
    const iv = setInterval(() => setRotateIdx(p => (p + 1) % socialMessages.length), 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="lp">
      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-in">
          <Link href="/" className="logo"><span className="logo-icon">◆</span> AKTARMATIK</Link>
          <button className="mob-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? '\u2715' : '\u2630'}
          </button>
          <div className={`nav-links ${mobileMenu ? 'nav-open' : ''}`}>
            <a href="#nasil" onClick={() => setMobileMenu(false)}>Nasil Calisir?</a>
            <a href="#ozellikler" onClick={() => setMobileMenu(false)}>Ozellikler</a>
            <a href="#fiyat" onClick={() => setMobileMenu(false)}>Fiyatlandirma</a>
            <Link href="/giris" className="nav-btn" onClick={() => setMobileMenu(false)}>Giris Yap</Link>
            <Link href="/kayit" className="nav-btn nav-btn-fill" onClick={() => setMobileMenu(false)}>Ucretsiz Basla</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
        </div>
        <div className="hero-in">
          <div className="hero-left">
            <div className="badge-anim">
              <span className="badge-dot"></span> Trendyol Entegrasyonu
            </div>
            <h1>
              Trendyol Yorumlarini
              <br />
              <span className="grad-text">Sitenize Tasiyin</span>
            </h1>
            <p className="hero-p">
              Trendyol&apos;daki musteri yorumlarini, puanlari ve sosyal kanitlari e-ticaret sitenizde gosterin.
              Guvenilirliginizi artirin, donusum oranlarinizi yukseltin.
            </p>
            <div className="hero-nums">
              <div className="hero-num">
                <AnimatedNum target={45} suffix="%" />
                <span>Donusum Artisi</span>
              </div>
              <div className="hero-num">
                <AnimatedNum target={3} suffix=" dk" />
                <span>Kurulum Suresi</span>
              </div>
              <div className="hero-num">
                <strong>7/24</strong>
                <span>Oto Guncelleme</span>
              </div>
            </div>
            <div className="hero-btns">
              <Link href="/kayit" className="btn-glow">Ucretsiz Dene <span className="btn-arrow">\u2192</span></Link>
              <a href="#nasil" className="btn-ghost">Nasil Calisir?</a>
            </div>
            {/* Platform Logos */}
            <div className="platforms">
              <span className="plat-label">Uyumlu:</span>
              <span className="plat-tag">ikas</span>
              <span className="plat-tag">Shopify</span>
              <span className="plat-tag">WordPress</span>
              <span className="plat-tag">IdeaSoft</span>
            </div>
          </div>
          <div className="hero-right">
            <div className="widget-wrap">
              <div className="widget-glow"></div>
              <div className="widget-demo">
                <div className="wd-top">
                  <span className="wd-brand">SOFTTO PLUS</span>
                  <span className="wd-fav">\u2661</span>
                </div>
                <div className="wd-name">Black Hair Sampuan 350ml</div>
                <div className="wd-price">360 \u20BA</div>
                <div className="wd-line"></div>
                <div className="wd-row">
                  <span className="wd-sc">4.8</span>
                  <span className="wd-st">\u2605\u2605\u2605\u2605\u2605</span>
                  <span className="wd-d">\u00B7</span>
                  <span>2.7B Degerlendirme</span>
                  <span className="wd-d">\u00B7</span>
                  <span>1.2B Soru-Cevap</span>
                </div>
                <div className="wd-green">\u2705 Kullanicilar Begeniyor! <span>Yorumlari Incele \u203A</span></div>
                <div className="wd-social" key={rotateIdx}>
                  <span>{socialMessages[rotateIdx].icon}</span>
                  <span>{socialMessages[rotateIdx].text}</span>
                  <strong>{socialMessages[rotateIdx].highlight}</strong>
                </div>
                <div className="wd-rec">\u2705 Alicilarin <strong>%96&apos;si</strong> bu urunu tavsiye ediyor!</div>
                <div className="wd-line"></div>
                <div className="wd-rev">
                  <div className="wd-rev-h">
                    <span>\u2B50 En Faydali Yorum</span>
                    <span className="wd-st-sm">\u2605\u2605\u2605\u2605\u2605</span>
                  </div>
                  <div className="wd-rev-t">&quot;Beyaz kapamasi basarili, uygulamasi cok kolay. Sacta yapay durmuyor, dogal bir gorunum sagliyor.&quot;</div>
                  <div className="wd-rev-a">**** **** - 16.02.2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NASIL CALISIR */}
      <section className="sec" id="nasil">
        <h2 className="sec-t">Nasil Calisir?</h2>
        <p className="sec-s">3 adimda kurulum — teknik bilgi gerektirmez!</p>
        <div className="steps">
          <div className="step"><div className="step-n">1</div><div className="step-i">\uD83D\uDCDD</div><h3>Ucretsiz Kayit Ol</h3><p>E-posta adresinizle 30 saniyede kayit olun. Kredi karti gerekmez.</p></div>
          <div className="step-arr">\u2192</div>
          <div className="step"><div className="step-n">2</div><div className="step-i">\uD83D\uDD17</div><h3>Linkleri Eslestir</h3><p>Trendyol urun linkini ve sitenizin urun linkini yapistirin.</p></div>
          <div className="step-arr">\u2192</div>
          <div className="step"><div className="step-n">3</div><div className="step-i">\uD83D\uDE80</div><h3>Script&apos;i Ekle, Bitti!</h3><p>Tek satir kodu sitenize ekleyin. Widget otomatik calisir.</p></div>
        </div>
        <div className="steps-cta">
          <Link href="/kayit" className="btn-glow">Hemen Basla — Ucretsiz!</Link>
        </div>
      </section>

      {/* OZELLIKLER */}
      <section className="sec sec-grad" id="ozellikler">
        <h2 className="sec-t sec-t-w">Neler Sunuyoruz?</h2>
        <p className="sec-s sec-s-w">Trendyol verilerinizi en etkili sekilde kullanin</p>
        <div className="feats">
          {[
            ['\u2B50','Yorum & Puanlama','Trendyol\'daki tum musteri yorumlarini ve yildiz puanlarini sitenizde gosterin.'],
            ['\uD83D\uDD25','Sosyal Kanit','Favori sayisi, sepet sayisi, satis adedi gibi guven artirici veriler.'],
            ['\u2753','Soru & Cevap','Trendyol\'daki soru-cevaplari urun sayfanizda otomatik gosterin.'],
            ['\u2705','Tavsiye Orani','"Alicilarin %96\'si tavsiye ediyor" gibi guclu sosyal kanit mesajlari.'],
            ['\uD83C\uDFAF','Tum Platformlar','ikas, Shopify, WordPress, IdeaSoft — tek script ile her yerde calisir.'],
            ['\u26A1','Otomatik Guncelleme','Trendyol\'daki yeni yorumlar otomatik cekilir, siteniz her zaman guncel kalir.'],
          ].map(([ic,t,d],i) => (
            <div key={i} className="feat">
              <div className="feat-ic">{ic}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GERCEK GORUNUM */}
      <section className="sec">
        <h2 className="sec-t">Gercek Gorunum</h2>
        <p className="sec-s">Widget&apos;in sitenizde nasil gorundugunee bakin</p>
        <div className="demos">
          <div className="demo-c">
            <h4>Sosyal Kanit Bandi</h4>
            <div className="demo-w">
              <div className="wd-row" style={{fontSize:13}}><span className="wd-sc">4.8</span><span className="wd-st">\u2605\u2605\u2605\u2605\u2605</span><span className="wd-d">\u00B7</span><span>2.7B Degerlendirme</span></div>
              <div className="wd-green" style={{fontSize:12}}>\u2705 Kullanicilar Begeniyor!</div>
              <div className="wd-social" style={{fontSize:12}}><span>\u2764\uFE0F</span> <span>Sevilen urun!</span> <strong>30.2B kisi favoriledi!</strong></div>
              <div className="wd-rec" style={{fontSize:12}}>\u2705 Alicilarin <strong>%96&apos;si</strong> tavsiye ediyor!</div>
            </div>
          </div>
          <div className="demo-c">
            <h4>Yorum Bolumu</h4>
            <div className="demo-w">
              <div className="wd-rev">
                <div className="wd-rev-h"><span>\u2B50 En Faydali Yorum</span><span className="wd-st-sm">\u2605\u2605\u2605\u2605\u2605</span></div>
                <div className="wd-rev-t" style={{fontSize:12}}>&quot;Urun harika, kesinlikle tavsiye ederim.&quot;</div>
                <div className="wd-rev-a">G** A** - 07.09.2024</div>
              </div>
            </div>
          </div>
          <div className="demo-c">
            <h4>Soru-Cevap</h4>
            <div className="demo-w">
              <div style={{fontSize:12,padding:'8px 0',borderBottom:'1px solid #eee'}}><strong>S:</strong> Kadinlar icin de uygun mu?<br /><span style={{color:'#00b894'}}>C:</span> Evet uygundur</div>
              <div style={{fontSize:12,padding:'8px 0'}}><strong>S:</strong> Kaliciligi ne kadar?<br /><span style={{color:'#00b894'}}>C:</span> 2 hafta kalicilik saglar</div>
            </div>
          </div>
        </div>
      </section>

      {/* FIYATLANDIRMA */}
      <section className="sec sec-grad" id="fiyat">
        <h2 className="sec-t sec-t-w">Basit & Seffaf Fiyatlandirma</h2>
        <p className="sec-s sec-s-w">Urun basina ode — gizli maliyet yok</p>
        <div className="prices">
          <div className="pr-card">
            <div className="pr-name">Baslangic</div>
            <div className="pr-amt">Ucretsiz</div>
            <div className="pr-per">Sonsuza kadar</div>
            <ul className="pr-list">
              <li>\u2705 1 urun esleme</li>
              <li>\u2705 Tum widget ozellikleri</li>
              <li>\u2705 Sosyal kanit gosterimi</li>
              <li>\u2705 Yorum & Soru-Cevap</li>
              <li>\u2705 E-posta destegi</li>
            </ul>
            <Link href="/kayit" className="pr-btn">Ucretsiz Basla</Link>
          </div>
          <div className="pr-card pr-pop">
            <div className="pr-badge">En Populer</div>
            <div className="pr-name">Urun Basi</div>
            <div className="pr-amt">29 \u20BA<span>/urun/ay</span></div>
            <div className="pr-per">Istedigin kadar urun ekle</div>
            <ul className="pr-list">
              <li>\u2705 Sinirsiz urun esleme</li>
              <li>\u2705 Tum widget ozellikleri</li>
              <li>\u2705 Sosyal kanit gosterimi</li>
              <li>\u2705 Otomatik veri guncelleme</li>
              <li>\u2705 Oncelikli destek</li>
              <li>\u2705 Ozel widget tasarimi</li>
            </ul>
            <Link href="/kayit" className="btn-glow" style={{display:'block',textAlign:'center'}}>Hemen Basla</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-in">
          <div><strong className="foot-logo">\u25C6 AKTARMATIK</strong><p>Trendyol verilerinizi e-ticaret sitenize tasiyin.</p><p style={{fontSize:11,opacity:0.4}}>Morfil Media tarafindan gelistirilmistir.</p></div>
          <div className="foot-links">
            <a href="#nasil">Nasil Calisir?</a>
            <a href="#ozellikler">Ozellikler</a>
            <a href="#fiyat">Fiyatlandirma</a>
            <Link href="/giris">Giris Yap</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .lp{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a2e;overflow-x:hidden}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(108,92,231,0.08);box-shadow:0 1px 20px rgba(0,0,0,0.04)}
        .nav-in{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-weight:900;font-size:18px;color:#6c5ce7;text-decoration:none;letter-spacing:-0.5px;display:flex;align-items:center;gap:6px}
        .logo-icon{font-size:14px;background:linear-gradient(135deg,#6c5ce7,#e84393);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .nav-links{display:flex;align-items:center;gap:20px}
        .nav-links a{text-decoration:none;color:#555;font-size:13px;font-weight:500;transition:color 0.2s}
        .nav-links a:hover{color:#6c5ce7}
        .nav-btn{padding:8px 16px;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;color:#555;transition:all 0.2s}
        .nav-btn-fill{background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white!important;box-shadow:0 4px 15px rgba(108,92,231,0.3)}
        .nav-btn-fill:hover{box-shadow:0 6px 25px rgba(108,92,231,0.45);transform:translateY(-1px)}
        .mob-btn{display:none;background:none;border:none;font-size:24px;cursor:pointer;color:#333}

        /* HERO */
        .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden;background:#fafafe}
        .hero-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
        .orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:0.5;animation:float 8s ease-in-out infinite}
        .orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(108,92,231,0.3),transparent 70%);top:-10%;right:10%;animation-delay:0s}
        .orb2{width:400px;height:400px;background:radial-gradient(circle,rgba(232,67,147,0.2),transparent 70%);bottom:0;left:-5%;animation-delay:-3s}
        .orb3{width:300px;height:300px;background:radial-gradient(circle,rgba(0,184,148,0.15),transparent 70%);top:40%;right:-5%;animation-delay:-5s}
        @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.05)}}
        .hero-in{max-width:1200px;margin:0 auto;padding:120px 24px 80px;display:flex;align-items:center;gap:60px;position:relative;z-index:1}
        .hero-left{flex:1}
        .badge-anim{display:inline-flex;align-items:center;gap:8px;background:rgba(108,92,231,0.08);border:1px solid rgba(108,92,231,0.15);color:#6c5ce7;padding:8px 16px;border-radius:24px;font-size:13px;font-weight:600;margin-bottom:20px}
        .badge-dot{width:8px;height:8px;border-radius:50%;background:#6c5ce7;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.3)}}
        .hero-left h1{font-size:52px;font-weight:900;line-height:1.08;margin-bottom:20px;letter-spacing:-1.5px;color:#1a1a2e}
        .grad-text{background:linear-gradient(135deg,#6c5ce7,#e84393,#6c5ce7);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
        @keyframes shimmer{to{background-position:200% center}}
        .hero-p{font-size:17px;color:#666;line-height:1.7;margin-bottom:28px;max-width:480px}
        .hero-nums{display:flex;gap:36px;margin-bottom:32px}
        .hero-num strong{display:block;font-size:28px;color:#6c5ce7;font-weight:800}
        .hero-num span{font-size:12px;color:#999;font-weight:500}
        .hero-btns{display:flex;gap:12px;margin-bottom:28px}
        .btn-glow{display:inline-block;padding:15px 32px;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 30px rgba(108,92,231,0.35);transition:all 0.3s;position:relative;overflow:hidden}
        .btn-glow:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(108,92,231,0.5)}
        .btn-arrow{margin-left:6px;transition:transform 0.2s}
        .btn-glow:hover .btn-arrow{transform:translateX(4px)}
        .btn-ghost{display:inline-flex;align-items:center;padding:15px 32px;border:2px solid rgba(108,92,231,0.2);color:#6c5ce7;border-radius:12px;font-weight:600;font-size:15px;text-decoration:none;transition:all 0.2s}
        .btn-ghost:hover{border-color:#6c5ce7;background:rgba(108,92,231,0.04)}
        .platforms{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .plat-label{font-size:12px;color:#999;font-weight:500}
        .plat-tag{font-size:11px;padding:4px 10px;border-radius:6px;background:rgba(108,92,231,0.06);color:#6c5ce7;font-weight:600;border:1px solid rgba(108,92,231,0.1)}

        /* WIDGET */
        .hero-right{flex:1;max-width:420px;position:relative}
        .widget-wrap{position:relative;animation:widgetFloat 4s ease-in-out infinite}
        @keyframes widgetFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .widget-glow{position:absolute;inset:-20px;border-radius:24px;background:linear-gradient(135deg,rgba(108,92,231,0.15),rgba(232,67,147,0.1));filter:blur(30px);z-index:-1}
        .widget-demo{background:white;border-radius:20px;padding:24px;box-shadow:0 25px 80px rgba(108,92,231,0.12);border:1px solid rgba(108,92,231,0.08)}
        .wd-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
        .wd-brand{font-size:11px;color:#999;font-weight:600;letter-spacing:1px}
        .wd-fav{font-size:18px;color:#ccc}
        .wd-name{font-size:18px;font-weight:700;margin-bottom:4px}
        .wd-price{font-size:24px;font-weight:800;color:#1a1a2e;margin-bottom:12px}
        .wd-line{height:1px;background:linear-gradient(90deg,transparent,#eee,transparent);margin:12px 0}
        .wd-row{display:flex;align-items:center;gap:6px;font-size:13px;color:#666;flex-wrap:wrap}
        .wd-sc{font-weight:800;font-size:16px;color:#1a1a2e}
        .wd-st{color:#f39c12}
        .wd-d{color:#ddd}
        .wd-green{color:#00b894;font-size:13px;font-weight:600;margin:8px 0}
        .wd-green span{color:#6c5ce7;cursor:pointer;font-weight:500;margin-left:4px}
        .wd-social{font-size:13px;color:#e17055;margin:6px 0;display:flex;gap:4px;align-items:center;animation:fadeIn 0.4s}
        .wd-social strong{color:#e17055}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .wd-rec{font-size:13px;color:#00b894;margin:6px 0}
        .wd-rev{background:linear-gradient(135deg,#f8f9ff,#f0f0ff);border-radius:12px;padding:14px;margin-top:8px;border:1px solid rgba(108,92,231,0.06)}
        .wd-rev-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:700}
        .wd-st-sm{color:#f39c12;font-size:12px}
        .wd-rev-t{font-size:13px;color:#555;font-style:italic;line-height:1.5}
        .wd-rev-a{font-size:11px;color:#999;margin-top:8px}

        /* SECTIONS */
        .sec{padding:90px 24px;max-width:1200px;margin:0 auto}
        .sec-grad{background:linear-gradient(135deg,#1a1a2e 0%,#2d1b69 50%,#1a1a2e 100%);max-width:100%;color:white}
        .sec-grad .sec{max-width:1200px;margin:0 auto}
        .sec-t{text-align:center;font-size:38px;font-weight:900;margin-bottom:8px;letter-spacing:-0.5px}
        .sec-t-w{color:white}
        .sec-s{text-align:center;color:#888;font-size:16px;margin-bottom:52px}
        .sec-s-w{color:rgba(255,255,255,0.6)}

        /* STEPS */
        .steps{display:flex;align-items:flex-start;justify-content:center;gap:20px}
        .step{text-align:center;flex:1;max-width:280px;padding:36px 24px;background:white;border-radius:20px;box-shadow:0 8px 30px rgba(108,92,231,0.06);position:relative;border:1px solid rgba(108,92,231,0.06);transition:transform 0.3s,box-shadow 0.3s}
        .step:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(108,92,231,0.12)}
        .step-n{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:0 4px 12px rgba(108,92,231,0.3)}
        .step-i{font-size:40px;margin-bottom:14px}
        .step h3{font-size:17px;font-weight:700;margin-bottom:8px}
        .step p{font-size:13px;color:#888;line-height:1.6}
        .step-arr{font-size:24px;color:#ccc;margin-top:65px;font-weight:300}
        .steps-cta{text-align:center;margin-top:44px}

        /* FEATURES */
        .feats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1200px;margin:0 auto;padding:0 24px}
        .feat{background:rgba(255,255,255,0.06);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;transition:transform 0.3s,border-color 0.3s}
        .feat:hover{transform:translateY(-4px);border-color:rgba(108,92,231,0.3)}
        .feat-ic{font-size:36px;margin-bottom:14px}
        .feat h3{font-size:17px;font-weight:700;margin-bottom:8px}
        .feat p{font-size:13px;color:rgba(255,255,255,0.6);line-height:1.6}

        /* DEMOS */
        .demos{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .demo-c{background:white;border-radius:20px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,0.04);border:1px solid #f0f0f0;transition:transform 0.3s}
        .demo-c:hover{transform:translateY(-4px)}
        .demo-c h4{font-size:14px;font-weight:700;margin-bottom:12px;color:#6c5ce7}
        .demo-w{padding:8px 0}

        /* PRICING */
        .prices{display:flex;justify-content:center;gap:24px;max-width:800px;margin:0 auto;padding:0 24px}
        .pr-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:40px;flex:1;max-width:380px;position:relative;transition:transform 0.3s}
        .pr-card:hover{transform:translateY(-4px)}
        .pr-pop{border:2px solid #6c5ce7;background:rgba(108,92,231,0.08);transform:scale(1.03)}
        .pr-pop:hover{transform:scale(1.03) translateY(-4px)}
        .pr-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;padding:5px 18px;border-radius:20px;font-size:12px;font-weight:700;box-shadow:0 4px 15px rgba(108,92,231,0.3)}
        .pr-name{font-size:20px;font-weight:800;margin-bottom:8px}
        .pr-amt{font-size:44px;font-weight:900;color:#6c5ce7}
        .pr-amt span{font-size:15px;color:rgba(255,255,255,0.5);font-weight:500}
        .pr-per{font-size:13px;color:rgba(255,255,255,0.5);margin-bottom:24px}
        .pr-list{list-style:none;padding:0;margin-bottom:28px}
        .pr-list li{font-size:14px;padding:7px 0;color:rgba(255,255,255,0.8)}
        .pr-btn{display:block;text-align:center;padding:14px;border-radius:12px;font-weight:700;text-decoration:none;color:white;border:2px solid rgba(255,255,255,0.2);font-size:14px;transition:all 0.2s}
        .pr-btn:hover{border-color:#6c5ce7;background:rgba(108,92,231,0.1)}

        /* FOOTER */
        .foot{background:#0f0f1a;color:white;padding:48px 24px}
        .foot-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:flex-start}
        .foot-logo{font-size:18px;color:#6c5ce7}
        .foot-in p{font-size:13px;opacity:0.5;margin-top:8px}
        .foot-links{display:flex;gap:24px}
        .foot-links a{color:rgba(255,255,255,0.5);text-decoration:none;font-size:13px;transition:color 0.2s}
        .foot-links a:hover{color:white}

        /* RESPONSIVE */
        @media(max-width:1024px){
          .hero-in{gap:40px}
          .hero-left h1{font-size:42px}
          .feats{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:768px){
          .mob-btn{display:block}
          .nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:white;flex-direction:column;padding:20px 24px;gap:12px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border-top:1px solid #eee}
          .nav-open{display:flex}
          .hero-in{flex-direction:column;padding-top:100px;padding-bottom:60px;text-align:center}
          .hero-left h1{font-size:34px}
          .hero-p{margin-left:auto;margin-right:auto}
          .hero-nums{justify-content:center;gap:20px}
          .hero-btns{justify-content:center;flex-wrap:wrap}
          .platforms{justify-content:center}
          .hero-right{max-width:100%;width:100%}
          .widget-wrap{max-width:360px;margin:0 auto}
          .steps{flex-direction:column;align-items:center}
          .step-arr{display:none}
          .feats{grid-template-columns:1fr;max-width:400px;margin:0 auto}
          .demos{grid-template-columns:1fr}
          .prices{flex-direction:column;align-items:center}
          .pr-pop{transform:none}
          .pr-pop:hover{transform:translateY(-4px)}
          .foot-in{flex-direction:column;gap:24px}
          .foot-links{flex-wrap:wrap;gap:16px}
        }
        @media(max-width:480px){
          .hero-left h1{font-size:28px}
          .hero-nums{flex-wrap:wrap;gap:16px}
          .hero-num strong{font-size:22px}
          .sec-t{font-size:28px}
          .btn-glow,.btn-ghost{padding:12px 24px;font-size:14px}
          .widget-demo{padding:18px}
        }
      `}</style>
    </div>
  );
}

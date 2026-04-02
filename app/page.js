'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{question}</span>
        <span className={`faq-arrow ${open ? 'faq-arrow-open' : ''}`}>▾</span>
      </div>
      <div className={`faq-a ${open ? 'faq-a-open' : ''}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

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
    { icon: '❤️', text: 'Sevilen ürün!', highlight: '30.2B kişi favoriledi!' },
    { icon: '🛒', text: '', highlight: '2.4B kişinin sepetinde, tükenmeden al!' },
    { icon: '📦', text: '3 günde', highlight: '250+ ürün satıldı!' },
    { icon: '🔥', text: 'Popüler ürün!', highlight: 'Son 24 saatte 1.1B kişi görüntüledi!' },
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
          <Link href="/" className="logo">◆ AKTARMATIK</Link>
          <button className="mob-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? '✕' : '☰'}
          </button>
          <div className={`nav-links ${mobileMenu ? 'nav-open' : ''}`}>
            <a href="#nasil" onClick={() => setMobileMenu(false)}>Nasıl Çalışır?</a>
            <a href="#ozellikler" onClick={() => setMobileMenu(false)}>Özellikler</a>
            <a href="#iletisim" onClick={() => setMobileMenu(false)}>İletişim</a>
            <Link href="/giris" className="nav-btn" onClick={() => setMobileMenu(false)}>Giriş Yap</Link>
            <a href="#iletisim" className="nav-btn nav-btn-fill" onClick={() => setMobileMenu(false)}>Hizmet Talep Et</a>
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
              Trendyol Yorumlarını
              <br />
              <span className="grad-text">Sitenize Taşıyın</span>
            </h1>
            <p className="hero-p">
              Trendyol&apos;daki müşteri yorumlarını, puanları ve sosyal kanıtları
              e-ticaret sitenizde gösterin. Güvenilirliğinizi artırın, dönüşüm oranlarınızı yükseltin.
            </p>
            <div className="hero-nums">
              <div className="hero-num">
                <AnimatedNum target={45} suffix="%" />
                <span>Dönüşüm Artışı</span>
              </div>
              <div className="hero-num">
                <AnimatedNum target={3} suffix=" dk" />
                <span>Kurulum Süresi</span>
              </div>
              <div className="hero-num">
                <strong>7/24</strong>
                <span>Oto Güncelleme</span>
              </div>
            </div>
            <div className="hero-btns">
              <a href="#iletisim" className="btn-glow">Hizmet Talep Et →</a>
              <a href="#nasil" className="btn-ghost">Nasıl Çalışır?</a>
            </div>
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
                  <span className="wd-fav">♡</span>
                </div>
                <div className="wd-name">Black Hair Şampuan 350ml</div>
                <div className="wd-price">360 ₺</div>
                <div className="wd-line"></div>
                <div className="wd-row">
                  <span className="wd-sc">4.8</span>
                  <span className="wd-st">★★★★★</span>
                  <span className="wd-d">·</span>
                  <span>2.7B Değerlendirme</span>
                  <span className="wd-d">·</span>
                  <span>1.2B Soru-Cevap</span>
                </div>
                <div className="wd-green">✅ Kullanıcılar Beğeniyor! <span>Yorumları İncele ›</span></div>
                <div className="wd-social" key={rotateIdx}>
                  <span>{socialMessages[rotateIdx].icon}</span>
                  <span>{socialMessages[rotateIdx].text}</span>
                  <strong>{socialMessages[rotateIdx].highlight}</strong>
                </div>
                <div className="wd-rec">✅ Alıcıların <strong>%96&apos;sı</strong> bu ürünü tavsiye ediyor!</div>
                <div className="wd-line"></div>
                <div className="wd-rev">
                  <div className="wd-rev-h">
                    <span>⭐ En Faydalı Yorum</span>
                    <span className="wd-st-sm">★★★★★</span>
                  </div>
                  <div className="wd-rev-t">&quot;Beyaz kapaması başarılı, uygulaması çok kolay. Saçta yapay durmuyor, doğal bir görünüm sağlıyor.&quot;</div>
                  <div className="wd-rev-a">**** **** - 16.02.2026</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NASIL CALISIR */}
      <section className="sec" id="nasil">
        <h2 className="sec-t">Nasıl Çalışır?</h2>
        <p className="sec-s">3 adımda kurulum — teknik bilgi gerektirmez!</p>
        <div className="steps">
          <div className="step"><div className="step-n">1</div><div className="step-i">📝</div><h3>Ücretsiz Kayıt Ol</h3><p>E-posta adresinizle 30 saniyede kayıt olun. Kredi kartı gerekmez.</p></div>
          <div className="step-arr">→</div>
          <div className="step"><div className="step-n">2</div><div className="step-i">🔗</div><h3>Linkleri Eşleştir</h3><p>Trendyol ürün linkini ve sitenizin ürün linkini yapıştırın.</p></div>
          <div className="step-arr">→</div>
          <div className="step"><div className="step-n">3</div><div className="step-i">🚀</div><h3>Script&apos;i Ekle, Bitti!</h3><p>Tek satır kodu sitenize ekleyin. Widget otomatik çalışır.</p></div>
        </div>
        <div className="steps-cta">
          <a href="#iletisim" className="btn-glow">Hizmet Talep Et</a>
        </div>
      </section>

      {/* OZELLIKLER */}
      <section className="sec sec-alt" id="ozellikler">
        <h2 className="sec-t">Neler Sunuyoruz?</h2>
        <p className="sec-s" style={{opacity:0.5}}>Trendyol verilerinizi en etkili şekilde kullanın</p>
        <div className="feats">
          {[
            ['⭐','Yorum & Puanlama','Trendyol\'daki tüm müşteri yorumlarını ve yıldız puanlarını sitenizde gösterin.'],
            ['🔥','Sosyal Kanıt','Favori sayısı, sepet sayısı, satış adedi gibi güven artırıcı veriler.'],
            ['❓','Soru & Cevap','Trendyol\'daki soru-cevapları ürün sayfanızda otomatik gösterin.'],
            ['✅','Tavsiye Oranı','"Alıcıların %96\'sı tavsiye ediyor" gibi güçlü sosyal kanıt mesajları.'],
            ['🎯','Tüm Platformlar','ikas, Shopify, WordPress, IdeaSoft — tek script ile her yerde çalışır.'],
            ['⚡','Otomatik Güncelleme','Trendyol\'daki yeni yorumlar otomatik çekilir, siteniz her zaman güncel kalır.'],
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
        <h2 className="sec-t">Gerçek Görünüm</h2>
        <p className="sec-s" style={{opacity:0.5}}>Widget&apos;ın sitenizde nasıl göründüğüne bakın</p>
        <div className="demos">
          <div className="demo-c">
            <h4>Sosyal Kanıt Bandı</h4>
            <div className="demo-w">
              <div className="wd-row" style={{fontSize:13}}><span className="wd-sc">4.8</span><span className="wd-st">★★★★★</span><span className="wd-d">·</span><span>2.7B Değerlendirme</span></div>
              <div className="wd-green" style={{fontSize:12}}>✅ Kullanıcılar Beğeniyor!</div>
              <div className="wd-social" style={{fontSize:12}}>❤️ Sevilen ürün! <strong>30.2B kişi favoriledi!</strong></div>
              <div className="wd-rec" style={{fontSize:12}}>✅ Alıcıların <strong>%96&apos;sı</strong> tavsiye ediyor!</div>
            </div>
          </div>
          <div className="demo-c">
            <h4>Yorum Bölümü</h4>
            <div className="demo-w">
              <div className="wd-rev">
                <div className="wd-rev-h"><span>⭐ En Faydalı Yorum</span><span className="wd-st-sm">★★★★★</span></div>
                <div className="wd-rev-t" style={{fontSize:12}}>&quot;Ürün harika, kesinlikle tavsiye ederim.&quot;</div>
                <div className="wd-rev-a">G** A** - 07.09.2024</div>
              </div>
            </div>
          </div>
          <div className="demo-c">
            <h4>Soru-Cevap</h4>
            <div className="demo-w">
              <div style={{fontSize:12,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.06)'}}><strong>S:</strong> Kadınlar için de uygun mu?<br /><span style={{color:'#00b894'}}>C:</span> Evet uygundur</div>
              <div style={{fontSize:12,padding:'8px 0'}}><strong>S:</strong> Kalıcılığı ne kadar?<br /><span style={{color:'#00b894'}}>C:</span> 2 hafta kalıcılık sağlar</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="sec sec-alt" id="yorumlar">
        <h2 className="sec-t">Müşterilerimiz Ne Diyor?</h2>
        <p className="sec-s" style={{opacity:0.5}}>Aktarmatik kullanan e-ticaret firmalarının deneyimleri</p>
        <div className="testimonials">
          <div className="testi-card">
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">&quot;Trendyol&apos;daki 4.9 puanımızı sitemizde göstermeye başladıktan sonra dönüşüm oranımız %38 arttı. Müşteriler artık doğrudan bizden sipariş veriyor.&quot;</p>
            <div className="testi-author">
              <div className="testi-avatar">AK</div>
              <div>
                <strong>Ahmet Kaya</strong>
                <span>Doğal Yaşam Kozmetik — Kurucu</span>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">&quot;Kurulumu gerçekten 3 dakika sürdü. Teknik bilgim olmamasına rağmen tek satır kodla widget&apos;ı sitemize ekledik. Sosyal kanıt etkisi inanılmaz.&quot;</p>
            <div className="testi-author">
              <div className="testi-avatar">SY</div>
              <div>
                <strong>Selin Yılmaz</strong>
                <span>BebekDünyası — E-Ticaret Müdürü</span>
              </div>
            </div>
          </div>
          <div className="testi-card">
            <div className="testi-stars">★★★★★</div>
            <p className="testi-text">&quot;Sepet terk oranımız %22 düştü. Müşteriler ürün sayfasında Trendyol yorumlarını görünce güvenip alışverişi tamamlıyor. ROI&apos;si mükemmel.&quot;</p>
            <div className="testi-author">
              <div className="testi-avatar">MÖ</div>
              <div>
                <strong>Murat Özdemir</strong>
                <span>TeknoPlus Elektronik — Genel Müdür</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="sec" id="sss">
        <h2 className="sec-t">Sıkça Sorulan Sorular</h2>
        <p className="sec-s" style={{opacity:0.5}}>Merak ettiklerinize hızlı cevaplar</p>
        <div className="faq-list">
          <FAQItem
            question="Aktarmatik nedir?"
            answer="Aktarmatik, Trendyol'daki müşteri yorumlarını, puanları ve sosyal kanıt verilerini (favori sayısı, sepet sayısı, satış adedi) kendi e-ticaret sitenizde otomatik olarak gösteren bir entegrasyon hizmetidir."
          />
          <FAQItem
            question="Hangi platformlarla çalışır?"
            answer="Aktarmatik; ikas, Shopify, WordPress (WooCommerce), IdeaSoft ve özel yazılım altyapılarıyla uyumludur. Tek satır JavaScript kodu ile her platformda çalışır."
          />
          <FAQItem
            question="Kurulumu ne kadar sürer?"
            answer="Kurulum ortalama 3 dakika sürer. Trendyol ürün linklerinizi eşleştirip, sitenize tek satır kod eklemeniz yeterlidir. Teknik bilgi gerektirmez."
          />
          <FAQItem
            question="Trendyol verisi güncel kalır mı?"
            answer="Evet, Aktarmatik Trendyol'daki yeni yorumları, puan değişikliklerini ve sosyal kanıt verilerini otomatik olarak günceller. Siteniz her zaman güncel kalır."
          />
          <FAQItem
            question="Sitemin hızını etkiler mi?"
            answer="Hayır. Widget asenkron yüklenir ve sitenizin sayfa hızını etkilemez. Google PageSpeed skorunuzda herhangi bir düşüş yaşamazsınız."
          />
          <FAQItem
            question="Hizmet nasıl başlar?"
            answer="Aşağıdaki formu doldurarak veya bizi 0850 309 20 49 numarasından arayarak hizmet talebinde bulunabilirsiniz. 24 saat içinde size dönüş yapıyoruz."
          />
        </div>
      </section>

      {/* ILETISIM FORMU */}
      <section className="sec sec-alt" id="iletisim">
        <h2 className="sec-t">Hizmet Talep Edin</h2>
        <p className="sec-s" style={{opacity:0.5}}>Formu doldurun, size 24 saat içinde dönüş yapacağız</p>
        <div className="contact-wrap">
          <form className="contact-form" action="mailto:morfilmedia@gmail.com" method="POST" encType="text/plain">
            <input type="hidden" name="subject" value="Aktarmatik Hizmet Talebi" />
            <div className="form-row">
              <div className="form-group">
                <label>Ad Soyad *</label>
                <input type="text" name="Ad Soyad" placeholder="Adınız Soyadınız" required />
              </div>
              <div className="form-group">
                <label>Firma Adı *</label>
                <input type="text" name="Firma Adi" placeholder="Firma adınız" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Telefon *</label>
                <input type="tel" name="Telefon" placeholder="05XX XXX XX XX" required />
              </div>
              <div className="form-group">
                <label>E-posta *</label>
                <input type="email" name="E-posta" placeholder="ornek@firma.com" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>E-Ticaret Site URL</label>
                <input type="url" name="Site URL" placeholder="https://www.siteniz.com" />
              </div>
              <div className="form-group">
                <label>Trendyol Magaza URL</label>
                <input type="url" name="Trendyol URL" placeholder="https://www.trendyol.com/magaza/..." />
              </div>
            </div>
            <div className="form-group form-full">
              <label>Mesaj</label>
              <textarea name="Mesaj" rows={4} placeholder="Hizmet hakkında sormak istedikleriniz..."></textarea>
            </div>
            <button type="submit" className="btn-glow form-submit">Hizmet Talep Et →</button>
          </form>
          <div className="contact-info">
            <div className="contact-info-card">
              <div className="ci-icon">📞</div>
              <div>
                <strong>Bizi Arayın</strong>
                <a href="tel:08503092049">0850 309 20 49</a>
                <a href="tel:05407275757">0540 727 57 57</a>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon">✉️</div>
              <div>
                <strong>E-posta</strong>
                <a href="mailto:morfilmedia@gmail.com">morfilmedia@gmail.com</a>
              </div>
            </div>
            <div className="contact-info-card">
              <div className="ci-icon">⏰</div>
              <div>
                <strong>Yanıt Süresi</strong>
                <span>24 saat içinde dönüş</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="foot-in">
          <div><strong className="foot-logo">◆ AKTARMATIK</strong><p>Trendyol verilerinizi e-ticaret sitenize taşıyın.</p><div className="foot-phones"><a href="tel:08503092049">📞 0850 309 20 49</a><a href="tel:05407275757">📞 0540 727 57 57</a></div><p style={{fontSize:11,opacity:0.3}}>Morfil Media tarafından geliştirilmiştir.</p></div>
          <div className="foot-links">
            <a href="#nasil">Nasıl Çalışır?</a>
            <a href="#ozellikler">Özellikler</a>
            <a href="#sss">SSS</a>
            <a href="#iletisim">İletişim</a>
            <Link href="/giris">Giriş Yap</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        *{box-sizing:border-box;margin:0;padding:0}
        .lp{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e0e0f0;background:#0a0a14;overflow-x:hidden}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(10,10,20,0.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(108,92,231,0.1)}
        .nav-in{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-weight:900;font-size:18px;color:#6c5ce7;text-decoration:none;letter-spacing:-0.5px}
        .nav-links{display:flex;align-items:center;gap:20px}
        .nav-links a{text-decoration:none;color:rgba(255,255,255,0.6);font-size:13px;font-weight:500;transition:color 0.2s}
        .nav-links a:hover{color:#6c5ce7}
        .nav-btn{padding:8px 16px;border-radius:8px;font-weight:600;font-size:13px;text-decoration:none;color:rgba(255,255,255,0.7);transition:all 0.2s}
        .nav-btn-fill{background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white!important;box-shadow:0 4px 15px rgba(108,92,231,0.3)}
        .nav-btn-fill:hover{box-shadow:0 6px 25px rgba(108,92,231,0.5);transform:translateY(-1px)}
        .mob-btn{display:none;background:none;border:none;font-size:24px;cursor:pointer;color:#e0e0f0}

        /* HERO */
        .hero{position:relative;min-height:100vh;display:flex;align-items:center;overflow:hidden}
        .hero-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
        .orb{position:absolute;border-radius:50%;filter:blur(100px);animation:float 8s ease-in-out infinite}
        .orb1{width:600px;height:600px;background:radial-gradient(circle,rgba(108,92,231,0.25),transparent 70%);top:-15%;right:5%;animation-delay:0s}
        .orb2{width:500px;height:500px;background:radial-gradient(circle,rgba(232,67,147,0.15),transparent 70%);bottom:-10%;left:-10%;animation-delay:-3s}
        .orb3{width:350px;height:350px;background:radial-gradient(circle,rgba(0,184,148,0.12),transparent 70%);top:50%;right:-8%;animation-delay:-5s}
        @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.05)}}
        .hero-in{max-width:1200px;margin:0 auto;padding:130px 24px 80px;display:flex;align-items:center;gap:60px;position:relative;z-index:1}
        .hero-left{flex:1}
        .badge-anim{display:inline-flex;align-items:center;gap:8px;background:rgba(108,92,231,0.1);border:1px solid rgba(108,92,231,0.2);color:#a78bfa;padding:8px 16px;border-radius:24px;font-size:13px;font-weight:600;margin-bottom:20px}
        .badge-dot{width:8px;height:8px;border-radius:50%;background:#6c5ce7;animation:pulse 2s infinite}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.4)}}
        .hero-left h1{font-size:52px;font-weight:900;line-height:1.08;margin-bottom:20px;letter-spacing:-1.5px;color:white}
        .grad-text{background:linear-gradient(135deg,#6c5ce7,#e84393,#6c5ce7);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite}
        @keyframes shimmer{to{background-position:200% center}}
        .hero-p{font-size:17px;color:rgba(255,255,255,0.55);line-height:1.7;margin-bottom:28px;max-width:480px}
        .hero-nums{display:flex;gap:36px;margin-bottom:32px}
        .hero-num strong{display:block;font-size:28px;color:#a78bfa;font-weight:800}
        .hero-num span{font-size:12px;color:rgba(255,255,255,0.4);font-weight:500}
        .hero-btns{display:flex;gap:12px;margin-bottom:28px}
        .btn-glow{display:inline-block;padding:15px 32px;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 8px 30px rgba(108,92,231,0.35);transition:all 0.3s}
        .btn-glow:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(108,92,231,0.55)}
        .btn-ghost{display:inline-flex;align-items:center;padding:15px 32px;border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.7);border-radius:12px;font-weight:600;font-size:15px;text-decoration:none;transition:all 0.2s}
        .btn-ghost:hover{border-color:rgba(108,92,231,0.5);color:white;background:rgba(108,92,231,0.05)}
        .platforms{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .plat-label{font-size:12px;color:rgba(255,255,255,0.35)}
        .plat-tag{font-size:11px;padding:4px 10px;border-radius:6px;background:rgba(108,92,231,0.08);color:#a78bfa;font-weight:600;border:1px solid rgba(108,92,231,0.15)}

        /* WIDGET */
        .hero-right{flex:1;max-width:420px;position:relative}
        .widget-wrap{position:relative;animation:widgetFloat 4s ease-in-out infinite}
        @keyframes widgetFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        .widget-glow{position:absolute;inset:-30px;border-radius:28px;background:linear-gradient(135deg,rgba(108,92,231,0.2),rgba(232,67,147,0.12));filter:blur(40px);z-index:-1}
        .widget-demo{background:white;border-radius:20px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1)}
        .wd-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
        .wd-brand{font-size:11px;color:#999;font-weight:600;letter-spacing:1px}
        .wd-fav{font-size:18px;color:#ccc}
        .wd-name{font-size:18px;font-weight:700;color:#1a1a2e;margin-bottom:4px}
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
        .wd-rev-h{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:13px;font-weight:700;color:#1a1a2e}
        .wd-st-sm{color:#f39c12;font-size:12px}
        .wd-rev-t{font-size:13px;color:#555;font-style:italic;line-height:1.5}
        .wd-rev-a{font-size:11px;color:#999;margin-top:8px}

        /* SECTIONS */
        .sec{padding:90px 24px;max-width:1200px;margin:0 auto}
        .sec-alt{background:rgba(108,92,231,0.03);max-width:100%;border-top:1px solid rgba(108,92,231,0.06);border-bottom:1px solid rgba(108,92,231,0.06)}
        .sec-alt > *{max-width:1200px;margin-left:auto;margin-right:auto}
        .sec-t{text-align:center;font-size:38px;font-weight:900;margin-bottom:8px;letter-spacing:-0.5px;color:white}
        .sec-s{text-align:center;color:rgba(255,255,255,0.45);font-size:16px;margin-bottom:52px}

        /* STEPS */
        .steps{display:flex;align-items:flex-start;justify-content:center;gap:20px}
        .step{text-align:center;flex:1;max-width:280px;padding:36px 24px;background:rgba(255,255,255,0.03);border-radius:20px;border:1px solid rgba(255,255,255,0.06);position:relative;transition:all 0.3s}
        .step:hover{transform:translateY(-6px);border-color:rgba(108,92,231,0.2);background:rgba(108,92,231,0.04)}
        .step-n{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#6c5ce7,#a855f7);color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;box-shadow:0 4px 15px rgba(108,92,231,0.4)}
        .step-i{font-size:40px;margin-bottom:14px}
        .step h3{font-size:17px;font-weight:700;margin-bottom:8px;color:white}
        .step p{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6}
        .step-arr{font-size:24px;color:rgba(255,255,255,0.15);margin-top:65px}
        .steps-cta{text-align:center;margin-top:44px}

        /* FEATURES */
        .feats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1200px;margin:0 auto;padding:0 24px}
        .feat{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:28px;transition:all 0.3s}
        .feat:hover{transform:translateY(-4px);border-color:rgba(108,92,231,0.25);background:rgba(108,92,231,0.04)}
        .feat-ic{font-size:36px;margin-bottom:14px}
        .feat h3{font-size:17px;font-weight:700;margin-bottom:8px;color:white}
        .feat p{font-size:13px;color:rgba(255,255,255,0.45);line-height:1.6}

        /* DEMOS */
        .demos{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
        .demo-c{background:rgba(255,255,255,0.03);border-radius:20px;padding:24px;border:1px solid rgba(255,255,255,0.06);transition:all 0.3s}
        .demo-c:hover{transform:translateY(-4px);border-color:rgba(108,92,231,0.2)}
        .demo-c h4{font-size:14px;font-weight:700;margin-bottom:12px;color:#a78bfa}
        .demo-w{padding:8px 0}

        /* TESTIMONIALS */
        .testimonials{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:1200px;margin:0 auto;padding:0 24px}
        .testi-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:28px;transition:all 0.3s}
        .testi-card:hover{transform:translateY(-4px);border-color:rgba(108,92,231,0.25);background:rgba(108,92,231,0.04)}
        .testi-stars{color:#f39c12;font-size:16px;margin-bottom:14px}
        .testi-text{font-size:14px;color:rgba(255,255,255,0.6);line-height:1.7;font-style:italic;margin-bottom:20px}
        .testi-author{display:flex;align-items:center;gap:12px}
        .testi-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#6c5ce7,#a855f7);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:white;flex-shrink:0}
        .testi-author strong{display:block;font-size:14px;color:white;font-weight:700}
        .testi-author span{font-size:12px;color:rgba(255,255,255,0.4)}

        /* FAQ */
        .faq-list{max-width:720px;margin:0 auto;display:flex;flex-direction:column;gap:8px}
        .faq-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:0;cursor:pointer;transition:all 0.3s;overflow:hidden}
        .faq-item:hover{border-color:rgba(108,92,231,0.25);background:rgba(108,92,231,0.04)}
        .faq-q{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;font-weight:700;font-size:15px;color:white}
        .faq-arrow{font-size:18px;color:#6c5ce7;transition:transform 0.3s}
        .faq-arrow-open{transform:rotate(180deg)}
        .faq-a{max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.35s ease;padding:0 24px}
        .faq-a-open{max-height:200px;padding:0 24px 20px}
        .faq-a p{font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7}

        /* CONTACT FORM */
        .contact-wrap{max-width:900px;margin:0 auto;display:grid;grid-template-columns:1fr 280px;gap:32px;padding:0 24px}
        .contact-form{display:flex;flex-direction:column;gap:16px}
        .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .form-group{display:flex;flex-direction:column;gap:6px}
        .form-group label{font-size:13px;font-weight:600;color:rgba(255,255,255,0.6)}
        .form-group input,.form-group textarea{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 16px;color:white;font-size:14px;font-family:inherit;transition:border-color 0.2s;outline:none;resize:vertical}
        .form-group input::placeholder,.form-group textarea::placeholder{color:rgba(255,255,255,0.25)}
        .form-group input:focus,.form-group textarea:focus{border-color:rgba(108,92,231,0.5)}
        .form-full{width:100%}
        .form-submit{border:none;cursor:pointer;font-family:inherit;width:100%;text-align:center}
        .contact-info{display:flex;flex-direction:column;gap:16px}
        .contact-info-card{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:20px;display:flex;gap:14px;align-items:flex-start;transition:all 0.3s}
        .contact-info-card:hover{border-color:rgba(108,92,231,0.2)}
        .ci-icon{font-size:24px}
        .contact-info-card strong{display:block;font-size:14px;color:white;margin-bottom:4px}
        .contact-info-card a,.contact-info-card span{display:block;font-size:13px;color:rgba(255,255,255,0.5);text-decoration:none;transition:color 0.2s}
        .contact-info-card a:hover{color:#a78bfa}

        /* FOOTER PHONES */
        .foot-phones{display:flex;gap:16px;margin-top:8px;margin-bottom:4px}
        .foot-phones a{color:#a78bfa;text-decoration:none;font-size:13px;font-weight:600;transition:color 0.2s}
        .foot-phones a:hover{color:white}

        /* FOOTER */
        .foot{background:#06060c;border-top:1px solid rgba(255,255,255,0.04);color:white;padding:48px 24px}
        .foot-in{max-width:1200px;margin:0 auto;display:flex;justify-content:space-between;align-items:flex-start}
        .foot-logo{font-size:18px;color:#6c5ce7}
        .foot-in p{font-size:13px;opacity:0.4;margin-top:8px}
        .foot-links{display:flex;gap:24px}
        .foot-links a{color:rgba(255,255,255,0.4);text-decoration:none;font-size:13px;transition:color 0.2s}
        .foot-links a:hover{color:white}

        /* RESPONSIVE */
        @media(max-width:1024px){
          .hero-in{gap:40px}
          .hero-left h1{font-size:42px}
          .feats{grid-template-columns:repeat(2,1fr)}
          .testimonials{grid-template-columns:repeat(2,1fr)}
          .contact-wrap{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .mob-btn{display:block}
          .nav-links{display:none;position:absolute;top:100%;left:0;right:0;background:rgba(10,10,20,0.98);flex-direction:column;padding:20px 24px;gap:12px;border-top:1px solid rgba(108,92,231,0.1)}
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
          .testimonials{grid-template-columns:1fr}
          .contact-wrap{grid-template-columns:1fr}
          .contact-info{flex-direction:row;flex-wrap:wrap}
          .form-row{grid-template-columns:1fr}
          .foot-in{flex-direction:column;gap:24px}
          .foot-phones{flex-direction:column;gap:6px}
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

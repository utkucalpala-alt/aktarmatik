'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [rotateIdx, setRotateIdx] = useState(0);
  const socialMessages = [
    { icon: '❤️', text: 'Sevilen ürün!', highlight: '30.2B kişi favoriledi!' },
    { icon: '🛒', text: '', highlight: '2.4B kişinin sepetinde, tükenmeden al!' },
    { icon: '📦', text: '3 günde', highlight: '250+ ürün satıldı!' },
    { icon: '🔥', text: 'Popüler ürün!', highlight: 'Son 24 saatte 1.1B kişi görüntüledi!' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRotateIdx(prev => (prev + 1) % socialMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-inner">
          <Link href="/" className="logo">AKTARMATIK</Link>
          <div className="nav-links">
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href="#ozellikler">Özellikler</a>
            <a href="#fiyatlandirma">Fiyatlandırma</a>
            <Link href="/giris" className="btn-nav">Giriş Yap</Link>
            <Link href="/kayit" className="btn-nav btn-primary-nav">Ücretsiz Başla</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">Trendyol Entegrasyonu</div>
            <h1>Trendyol Yorumlarını<br /><span className="gradient-text">Sitenize Taşıyın</span></h1>
            <p className="hero-desc">
              Trendyol'daki müşteri yorumlarını, puanları ve sosyal kanıtları e-ticaret sitenizde gösterin.
              Güvenilirliğinizi artırın, dönüşüm oranlarınızı yükseltin.
            </p>
            <div className="hero-stats">
              <div className="stat"><strong>%45</strong><span>Dönüşüm Artışı</span></div>
              <div className="stat"><strong>3 dk</strong><span>Kurulum Süresi</span></div>
              <div className="stat"><strong>7/24</strong><span>Otomatik Güncelleme</span></div>
            </div>
            <div className="hero-cta">
              <Link href="/kayit" className="btn-hero">Ücretsiz Dene</Link>
              <a href="#nasil-calisir" className="btn-hero-outline">Nasıl Çalışır?</a>
            </div>
          </div>
          <div className="hero-widget">
            {/* CANLI WIDGET MOCKUP */}
            <div className="widget-demo">
              <div className="wd-header">
                <span className="wd-brand">SOFTTO PLUS</span>
                <span className="wd-fav">♡</span>
              </div>
              <div className="wd-title">Black Hair Şampuan 350ml</div>
              <div className="wd-price">360 ₺</div>
              <div className="wd-divider"></div>
              <div className="wd-rating">
                <span className="wd-score">4.8</span>
                <span className="wd-stars">★★★★★</span>
                <span className="wd-dot">·</span>
                <span>2.7B Değerlendirme</span>
                <span className="wd-dot">·</span>
                <span>1.2B Soru-Cevap</span>
              </div>
              <div className="wd-badge-green">✅ Kullanıcılar Beğeniyor! <span>Yorumları İncele ›</span></div>
              <div className="wd-social" key={rotateIdx}>
                <span>{socialMessages[rotateIdx].icon}</span>
                <span>{socialMessages[rotateIdx].text}</span>
                <strong>{socialMessages[rotateIdx].highlight}</strong>
              </div>
              <div className="wd-recommend">✅ Alıcıların <strong>%96'sı</strong> bu ürünü tavsiye ediyor!</div>
              <div className="wd-divider"></div>
              <div className="wd-review-box">
                <div className="wd-review-header">
                  <span>⭐ En Faydalı Yorum</span>
                  <span className="wd-stars-sm">★★★★★</span>
                </div>
                <div className="wd-review-text">"Beyaz kapaması başarılı, uygulaması çok kolay. Saçta yapay durmuyor, doğal bir görünüm sağlıyor."</div>
                <div className="wd-review-author">**** **** - 16.02.2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NASIL CALISIR */}
      <section className="section" id="nasil-calisir">
        <h2 className="section-title">Nasıl Çalışır?</h2>
        <p className="section-sub">3 adımda kurulum — teknik bilgi gerektirmez!</p>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <div className="step-icon">📝</div>
            <h3>Ücretsiz Kayıt Ol</h3>
            <p>E-posta adresinizle 30 saniyede kayıt olun. Kredi kartı gerekmez.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <div className="step-icon">🔗</div>
            <h3>Linkleri Eşleştir</h3>
            <p>Trendyol ürün linkini ve sitenizin ürün linkini yapıştırın. Veriler otomatik çekilir.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <div className="step-icon">🚀</div>
            <h3>Script'i Ekle, Bitti!</h3>
            <p>Tek satır kodu sitenize ekleyin. Widget otomatik olarak çalışmaya başlar.</p>
          </div>
        </div>
        <div className="steps-cta">
          <Link href="/kayit" className="btn-hero">Hemen Başla — Ücretsiz!</Link>
        </div>
      </section>

      {/* OZELLIKLER */}
      <section className="section section-dark" id="ozellikler">
        <h2 className="section-title">Neler Sunuyoruz?</h2>
        <p className="section-sub">Trendyol verilerinizi en etkili şekilde kullanın</p>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">⭐</div>
            <h3>Yorum & Puanlama</h3>
            <p>Trendyol'daki tüm müşteri yorumlarını ve yıldız puanlarını sitenizde gösterin.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔥</div>
            <h3>Sosyal Kanıt</h3>
            <p>Favori sayısı, sepet sayısı, satış adedi gibi güven artırıcı veriler.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">❓</div>
            <h3>Soru & Cevap</h3>
            <p>Trendyol'daki soru-cevapları ürün sayfanızda otomatik gösterin.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">✅</div>
            <h3>Tavsiye Oranı</h3>
            <p>"Alıcıların %96'sı tavsiye ediyor" gibi güçlü sosyal kanıt mesajları.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🎯</div>
            <h3>Tüm Platformlar</h3>
            <p>ikas, Shopify, WooCommerce, Ticimax — tek script ile her yerde çalışır.</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <h3>Otomatik Güncelleme</h3>
            <p>Trendyol'daki yeni yorumlar otomatik çekilir, siteniz her zaman güncel kalır.</p>
          </div>
        </div>
      </section>

      {/* WIDGET ORNEKLERI */}
      <section className="section">
        <h2 className="section-title">Gerçek Görünüm</h2>
        <p className="section-sub">Widget'ın sitenizde nasıl göründüğüne bakın</p>
        <div className="demo-grid">
          <div className="demo-card">
            <h4>Sosyal Kanıt Bandı</h4>
            <div className="demo-widget-mini">
              <div className="wd-rating" style={{fontSize: '13px'}}>
                <span className="wd-score">4.8</span>
                <span className="wd-stars">★★★★★</span>
                <span className="wd-dot">·</span>
                <span>2.7B Değerlendirme</span>
              </div>
              <div className="wd-badge-green" style={{fontSize: '12px'}}>✅ Kullanıcılar Beğeniyor!</div>
              <div className="wd-social" style={{fontSize: '12px'}}>
                <span>❤️</span> <span>Sevilen ürün!</span> <strong>30.2B kişi favoriledi!</strong>
              </div>
              <div className="wd-recommend" style={{fontSize: '12px'}}>✅ Alıcıların <strong>%96'sı</strong> tavsiye ediyor!</div>
            </div>
          </div>
          <div className="demo-card">
            <h4>Yorum Bölümü</h4>
            <div className="demo-widget-mini">
              <div className="wd-review-box">
                <div className="wd-review-header">
                  <span>⭐ En Faydalı Yorum</span>
                  <span className="wd-stars-sm">★★★★★</span>
                </div>
                <div className="wd-review-text" style={{fontSize: '12px'}}>"Ürün harika, kesinlikle tavsiye ederim. Saçlarım çok güzel oldu."</div>
                <div className="wd-review-author">G** A** - 07.09.2024</div>
              </div>
            </div>
          </div>
          <div className="demo-card">
            <h4>Soru-Cevap</h4>
            <div className="demo-widget-mini">
              <div style={{fontSize: '12px', padding: '8px 0', borderBottom: '1px solid #eee'}}>
                <strong>S:</strong> Kadınlar için de uygun mu?<br />
                <span style={{color: '#00b894'}}>C:</span> Evet uygundur
              </div>
              <div style={{fontSize: '12px', padding: '8px 0'}}>
                <strong>S:</strong> Kalıcılığı ne kadar?<br />
                <span style={{color: '#00b894'}}>C:</span> 2 hafta kalıcılık sağlar
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FIYATLANDIRMA */}
      <section className="section section-dark" id="fiyatlandirma">
        <h2 className="section-title">Basit & Şeffaf Fiyatlandırma</h2>
        <p className="section-sub">Ürün başına öde — gizli maliyet yok</p>
        <div className="pricing">
          <div className="price-card">
            <div className="price-name">Başlangıç</div>
            <div className="price-amount">Ücretsiz</div>
            <div className="price-period">Sonsuza kadar</div>
            <ul className="price-features">
              <li>✅ 1 ürün eşleme</li>
              <li>✅ Tüm widget özellikleri</li>
              <li>✅ Sosyal kanıt gösterimi</li>
              <li>✅ Yorum & Soru-Cevap</li>
              <li>✅ E-posta desteği</li>
            </ul>
            <Link href="/kayit" className="btn-price">Ücretsiz Başla</Link>
          </div>
          <div className="price-card price-card-popular">
            <div className="price-popular-badge">En Popüler</div>
            <div className="price-name">Ürün Başı</div>
            <div className="price-amount">29 ₺<span>/ürün/ay</span></div>
            <div className="price-period">İstediğin kadar ürün ekle</div>
            <ul className="price-features">
              <li>✅ Sınırsız ürün eşleme</li>
              <li>✅ Tüm widget özellikleri</li>
              <li>✅ Sosyal kanıt gösterimi</li>
              <li>✅ Otomatik veri güncelleme</li>
              <li>✅ Öncelikli destek</li>
              <li>✅ Özel widget tasarımı</li>
            </ul>
            <Link href="/kayit" className="btn-price btn-price-primary">Hemen Başla</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <strong>AKTARMATIK</strong>
            <p>Trendyol verilerinizi e-ticaret sitenize taşıyın.</p>
            <p style={{fontSize: '11px', opacity: 0.5}}>Morfil Media tarafından geliştirilmiştir.</p>
          </div>
          <div className="footer-links">
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href="#ozellikler">Özellikler</a>
            <a href="#fiyatlandirma">Fiyatlandırma</a>
            <Link href="/giris">Giriş Yap</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .landing { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; }

        /* NAVBAR */
        .navbar { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid rgba(0,0,0,0.06); }
        .nav-inner { max-width: 1200px; margin: 0 auto; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
        .logo { font-weight: 900; font-size: 20px; color: #6c5ce7; text-decoration: none; letter-spacing: -0.5px; }
        .nav-links { display: flex; align-items: center; gap: 24px; }
        .nav-links a { text-decoration: none; color: #555; font-size: 14px; font-weight: 500; }
        .nav-links a:hover { color: #6c5ce7; }
        .btn-nav { padding: 8px 16px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none; }
        .btn-primary-nav { background: #6c5ce7; color: white !important; }

        /* HERO */
        .hero { padding: 120px 24px 60px; max-width: 1200px; margin: 0 auto; }
        .hero-content { display: flex; align-items: center; gap: 60px; }
        .hero-text { flex: 1; }
        .hero-badge { display: inline-block; background: rgba(108,92,231,0.1); color: #6c5ce7; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
        .hero h1 { font-size: 48px; font-weight: 900; line-height: 1.1; margin-bottom: 20px; letter-spacing: -1px; }
        .gradient-text { background: linear-gradient(135deg, #6c5ce7, #e84393); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero-desc { font-size: 17px; color: #666; line-height: 1.6; margin-bottom: 24px; max-width: 480px; }
        .hero-stats { display: flex; gap: 32px; margin-bottom: 32px; }
        .stat strong { display: block; font-size: 24px; color: #6c5ce7; }
        .stat span { font-size: 12px; color: #999; }
        .hero-cta { display: flex; gap: 12px; }
        .btn-hero { display: inline-block; padding: 14px 32px; background: #6c5ce7; color: white; border-radius: 10px; font-weight: 700; font-size: 15px; text-decoration: none; transition: transform 0.2s; }
        .btn-hero:hover { transform: translateY(-2px); }
        .btn-hero-outline { display: inline-block; padding: 14px 32px; border: 2px solid #ddd; color: #555; border-radius: 10px; font-weight: 600; font-size: 15px; text-decoration: none; }
        .hero-widget { flex: 1; max-width: 420px; }

        /* WIDGET DEMO */
        .widget-demo { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.12); border: 1px solid #eee; }
        .wd-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .wd-brand { font-size: 11px; color: #999; font-weight: 600; letter-spacing: 1px; }
        .wd-fav { font-size: 18px; color: #ccc; }
        .wd-title { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
        .wd-price { font-size: 24px; font-weight: 800; color: #1a1a2e; margin-bottom: 12px; }
        .wd-divider { height: 1px; background: #eee; margin: 12px 0; }
        .wd-rating { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #666; flex-wrap: wrap; }
        .wd-score { font-weight: 800; font-size: 16px; color: #1a1a2e; }
        .wd-stars { color: #f39c12; }
        .wd-dot { color: #ccc; }
        .wd-badge-green { color: #00b894; font-size: 13px; font-weight: 600; margin: 8px 0; }
        .wd-badge-green span { color: #6c5ce7; cursor: pointer; font-weight: 500; margin-left: 4px; }
        .wd-social { font-size: 13px; color: #e17055; margin: 6px 0; display: flex; gap: 4px; align-items: center; transition: opacity 0.3s; }
        .wd-social strong { color: #e17055; }
        .wd-recommend { font-size: 13px; color: #00b894; margin: 6px 0; }
        .wd-review-box { background: #f8f9fa; border-radius: 10px; padding: 14px; margin-top: 8px; }
        .wd-review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 700; }
        .wd-stars-sm { color: #f39c12; font-size: 12px; }
        .wd-review-text { font-size: 13px; color: #555; font-style: italic; line-height: 1.5; }
        .wd-review-author { font-size: 11px; color: #999; margin-top: 8px; }

        /* SECTIONS */
        .section { padding: 80px 24px; max-width: 1200px; margin: 0 auto; }
        .section-dark { background: #f8f9fa; max-width: 100%; }
        .section-dark > * { max-width: 1200px; margin-left: auto; margin-right: auto; }
        .section-title { text-align: center; font-size: 36px; font-weight: 900; margin-bottom: 8px; letter-spacing: -0.5px; }
        .section-sub { text-align: center; color: #888; font-size: 16px; margin-bottom: 48px; }

        /* STEPS */
        .steps { display: flex; align-items: flex-start; justify-content: center; gap: 24px; }
        .step { text-align: center; flex: 1; max-width: 280px; padding: 32px 24px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); position: relative; }
        .step-num { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #6c5ce7; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; }
        .step-icon { font-size: 36px; margin-bottom: 12px; }
        .step h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .step p { font-size: 13px; color: #888; line-height: 1.5; }
        .step-arrow { font-size: 28px; color: #ccc; margin-top: 60px; }
        .steps-cta { text-align: center; margin-top: 40px; }

        /* FEATURES */
        .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; padding: 0 24px; }
        .feature { background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .feature-icon { font-size: 32px; margin-bottom: 12px; }
        .feature h3 { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
        .feature p { font-size: 13px; color: #888; line-height: 1.6; }

        /* DEMO GRID */
        .demo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .demo-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .demo-card h4 { font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #6c5ce7; }
        .demo-widget-mini { padding: 8px 0; }

        /* PRICING */
        .pricing { display: flex; justify-content: center; gap: 24px; padding: 0 24px; }
        .price-card { background: white; border-radius: 20px; padding: 36px; width: 340px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); position: relative; }
        .price-card-popular { border: 2px solid #6c5ce7; transform: scale(1.05); }
        .price-popular-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #6c5ce7; color: white; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; }
        .price-name { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
        .price-amount { font-size: 42px; font-weight: 900; color: #6c5ce7; }
        .price-amount span { font-size: 15px; color: #999; font-weight: 500; }
        .price-period { font-size: 13px; color: #999; margin-bottom: 24px; }
        .price-features { list-style: none; padding: 0; margin-bottom: 28px; }
        .price-features li { font-size: 14px; padding: 6px 0; color: #555; }
        .btn-price { display: block; text-align: center; padding: 14px; border-radius: 10px; font-weight: 700; text-decoration: none; color: #6c5ce7; border: 2px solid #6c5ce7; font-size: 14px; }
        .btn-price-primary { background: #6c5ce7; color: white !important; border-color: #6c5ce7; }

        /* FOOTER */
        .footer { background: #1a1a2e; color: white; padding: 40px 24px; }
        .footer-inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-start; }
        .footer-brand strong { font-size: 18px; }
        .footer-brand p { font-size: 13px; opacity: 0.6; margin-top: 8px; }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { color: rgba(255,255,255,0.6); text-decoration: none; font-size: 13px; }
        .footer-links a:hover { color: white; }

        @media (max-width: 768px) {
          .hero-content { flex-direction: column; }
          .hero h1 { font-size: 32px; }
          .hero-widget { max-width: 100%; }
          .nav-links { display: none; }
          .steps { flex-direction: column; align-items: center; }
          .step-arrow { display: none; }
          .features { grid-template-columns: 1fr; }
          .demo-grid { grid-template-columns: 1fr; }
          .pricing { flex-direction: column; align-items: center; }
          .price-card-popular { transform: none; }
          .hero-stats { gap: 16px; }
          .footer-inner { flex-direction: column; gap: 24px; }
          .footer-links { flex-wrap: wrap; }
        }
      `}</style>
    </div>
  );
}

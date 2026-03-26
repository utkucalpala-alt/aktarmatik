'use client';
import { useState } from 'react';
import Link from 'next/link';

const modules = [
  { icon: '⭐', title: 'Trendyol Yorum Aktarma', desc: 'Trendyol mağazanızdaki ürün yorumlarınızı e-ticaret sitenizde gösterin! Güvenilirliğinizi artırın.', tag: 'Popüler', color: '#ff6b35' },
  { icon: '🔍', title: 'Search Modülü (Akıllı Arama)', desc: 'Arayan değil, bulan kazanır! Akıllı arama ile müşterileriniz istedikleri ürüne anında ulaşsın.', tag: 'Yeni', color: '#6c5ce7' },
  { icon: '📸', title: 'Instagram Feed', desc: 'Instagram\'da paylaştığınız içerikler, e-ticaret sitenizde de otomatik olarak görünsün.', tag: 'Popüler', color: '#e84393' },
  { icon: '📍', title: 'Google Yorumları Aktarma', desc: 'Mağazanızın Google puanlarını ve gerçek müşteri geri bildirimlerini sitenize ekleyin.', tag: '', color: '#4285f4' },
  { icon: '❓', title: 'Trendyol - Soru & Cevap', desc: 'Trendyol kullanıcılarının sorduğu sorular ve verilen cevapları ürün sayfanızda gösterin.', tag: '', color: '#00cec9' },
  { icon: '🏆', title: 'Kategorinin En Çok Satanları', desc: 'Kategori sayfasında en çok satan ürünlerinizi öne çıkarın ve satışlarınızı artırın.', tag: '', color: '#fdcb6e' },
  { icon: '📊', title: 'Ana Sayfada Değerlendirmeler', desc: 'Ürün sayfasındaki Trendyol değerlendirmelerinizi ana sayfanıza taşıyın!', tag: '', color: '#00b894' },
  { icon: '👕', title: 'Trendyol İle Beden Önerme', desc: 'Ziyaretçilerinize Trendyol üzerinden beden önerin ve iade oranınızı düşürün.', tag: 'Yeni', color: '#a29bfe' },
  { icon: '💬', title: 'WhatsApp Widget', desc: 'Sayfanızın kenarına WhatsApp widget ekleyin, müşterilerinize anında ulaşın.', tag: '', color: '#25d366' },
  { icon: '🌟', title: 'En Çok Değerlendirilen Ürünler', desc: 'Trendyol üzerinde en çok değerlendirilen ürünlerinizi ana sayfanızda sergileyin.', tag: '', color: '#f39c12' },
  { icon: '👁', title: 'X Kişi İnceliyor', desc: 'Güncel olarak ürünü kaç kişinin görüntülediği bilgisini göstererek FOMO etkisi yaratın.', tag: 'Popüler', color: '#e17055' },
  { icon: '✨', title: 'Arama Çubuğu Animasyonu', desc: 'Arama çubuğunuzdaki verileri dinamik olarak değiştirin, göz alıcı bir deneyim sunun.', tag: '', color: '#74b9ff' },
  { icon: '📋', title: 'Sayfadan Çıkış Anketi', desc: 'Ziyaretçiler sayfadan çıkarken neden çıktıklarını sorun, markanızı yönetin.', tag: '', color: '#636e72' },
  { icon: '🎯', title: 'Kampanya Banner', desc: 'E-ticaret sitenizin istediğiniz yerine dikkat çekici kampanya kutusu ekleyin.', tag: '', color: '#d63031' },
  { icon: '🔔', title: 'Kampanya Çanı', desc: 'Kampanya bilgilerinizi çan bildirimi ile kullanıcılarınıza anında duyurun.', tag: '', color: '#e84393' },
  { icon: '🏷', title: 'İndirim Kulakçığı', desc: 'Sayfanızın kenarına indirim kulakçığını yerleştirin ve kuponlarınızı gösterin.', tag: '', color: '#00b894' },
  { icon: '🎊', title: 'Konfeti Patlatma', desc: 'Ziyaretçiler sepete ürün eklediğinde sayfada konfeti patlatsın!', tag: '', color: '#ff7675' },
  { icon: '🎡', title: 'Çarkıfelek', desc: 'Şansa dayalı hediye ürünler, indirimler ve promosyonlar kazandırarak dönüşüm artırın.', tag: 'Popüler', color: '#6c5ce7' },
  { icon: '👋', title: 'Hoşgeldin Mesajı', desc: 'Sayfanıza ilk kez giren ziyaretçilere özel mesaj veya kupon kodu gösterin.', tag: '', color: '#fdcb6e' },
  { icon: '🌨', title: 'Yağdırma Efekti', desc: 'Sayfanızda görsel efektlerle ziyaretçilerin dikkatini çekin, tema oluşturun.', tag: '', color: '#74b9ff' },
];

export default function HomePage() {
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? modules : modules.filter(m => m.tag === (filter === 'popular' ? 'Popüler' : 'Yeni'));

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <span className="logo-icon">◆</span>
            <span className="logo-text">AKTARMATIK</span>
          </Link>
          <div className="nav-links">
            <a href="#modules">Modüller</a>
            <a href="#pricing">Fiyatlandırma</a>
            <a href="#about">Hakkımızda</a>
            <Link href="/giris" className="btn btn-secondary btn-sm">Giriş Yap</Link>
            <Link href="/kayit" className="btn btn-primary btn-sm">Ücretsiz Başla</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow"></div>
        <div className="container hero-content">
          <div className="hero-badge">🚀 E-Ticaret Modülleri</div>
          <h1 className="hero-title">
            Tüm Altyapılarda Çalışan
            <span className="gradient-text"> E-Ticaret Modülleri</span>
          </h1>
          <p className="hero-desc">
            Trendyol yorum aktarma, sosyal kanıt, akıllı arama, Instagram feed ve 
            daha fazla modülle e-ticaret sitenizi güçlendirin. Satışlarınızı artırın!
          </p>
          <div className="hero-ctas">
            <Link href="/kayit" className="btn btn-primary btn-lg">Hemen Başla →</Link>
            <a href="#modules" className="btn btn-secondary btn-lg">Modülleri İncele</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">20+</span>
              <span className="hero-stat-label">E-Ticaret Modülü</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">%45</span>
              <span className="hero-stat-label">Dönüşüm Artışı</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="hero-stat-value">1000+</span>
              <span className="hero-stat-label">Aktif Mağaza</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="modules-section">
        <div className="container">
          <h2 className="section-title">E-Ticaret <span className="gradient-text">Modülleri</span></h2>
          <p className="section-desc">Tüm altyapılarda çalışan modüllerimizle sitenizi özelleştirin!</p>

          <div className="module-filters">
            {[['all','Tümü'],['popular','Popüler'],['new','Yeni']].map(([key, label]) => (
              <button key={key} className={`filter-btn ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>

          <div className="modules-grid">
            {filtered.map((m, i) => (
              <div key={i} className="module-card glass-card fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                {m.tag && <span className="module-tag" style={{ background: m.color + '22', color: m.color }}>{m.tag}</span>}
                <div className="module-icon" style={{ background: m.color + '15', color: m.color }}>{m.icon}</div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
                <span className="module-link">Detayları İncele →</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Neden <span className="gradient-text">AKTARMATIK</span>?</h2>
          <p className="section-desc">E-ticaret sitenizi güçlendirmek için ihtiyacınız olan her şey.</p>
          <div className="features-grid">
            {[
              { icon: '⚡', title: 'Kolay Kurulum', desc: 'Tek satır kod ile tüm modülleri sitenize entegre edin. Teknik bilgi gerektirmez.' },
              { icon: '🔄', title: 'Tüm Altyapılar', desc: 'Ticimax, Shopify, WordPress, WooCommerce ve daha fazla altyapı ile uyumlu.' },
              { icon: '📈', title: 'Dönüşüm Artışı', desc: 'Sosyal kanıt, FOMO efektleri ve akıllı modüllerle dönüşüm oranlarınızı artırın.' },
              { icon: '🤖', title: 'AI Destekli', desc: 'Yapay zeka ile yorum analizi, akıllı arama ve kişiselleştirilmiş deneyimler.' },
              { icon: '🎨', title: 'Özelleştirilebilir', desc: 'Her modülü markanıza uygun renk, font ve tasarımla özelleştirin.' },
              { icon: '📞', title: '7/24 Destek', desc: 'Herhangi bir sorunuzda teknik ekibimiz her zaman yanınızda.' },
            ].map((f, i) => (
              <div key={i} className="feature-card glass-card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <h2 className="section-title">Basit <span className="gradient-text">Fiyatlandırma</span></h2>
          <p className="section-desc">Her ölçekteki mağaza için uygun planlar.</p>
          <div className="pricing-grid">
            {[
              { name: 'Başlangıç', price: 'Ücretsiz', period: '', features: ['3 modül kullanımı', '1 site entegrasyonu', 'Temel widget tasarımı', 'E-posta desteği'], cta: 'Ücretsiz Başla', popular: false },
              { name: 'Profesyonel', price: '₺499', period: '/ay', features: ['Tüm modüller', '5 site entegrasyonu', 'Özel widget tasarımı', 'AI yorum analizi', 'Öncelikli destek', 'API erişimi'], cta: 'Pro\'ya Geç', popular: true },
              { name: 'Kurumsal', price: '₺999', period: '/ay', features: ['Sınırsız modül', 'Sınırsız site', 'Özel geliştirme', 'Gelişmiş analitik', '7/24 canlı destek', 'Beyaz etiket desteği'], cta: 'İletişime Geç', popular: false },
            ].map((plan, i) => (
              <div key={i} className={`pricing-card glass-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="popular-badge">En Popüler</div>}
                <h3>{plan.name}</h3>
                <div className="pricing-price">
                  <span className="price-value">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <ul className="pricing-features">
                  {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                </ul>
                <Link href="/kayit" className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-lg`} style={{ width: '100%' }}>{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-card glass-card">
            <h2>AKTARMATIK Hakkında</h2>
            <p>AKTARMATIK, e-ticaret mağazalarını güçlendiren modüler bir SaaS platformudur. Trendyol yorum aktarma, sosyal kanıt, akıllı arama ve daha fazla modülle satışlarınızı artırmanıza yardımcı oluyoruz.</p>
            <div className="about-credits">
              <span>Design by <strong>Morfil Media</strong></span>
              <span className="credit-divider">•</span>
              <span>Coding by <strong>Utku ÇALPALA</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="logo-icon">◆</span>
            <span className="logo-text">AKTARMATIK</span>
            <p>E-ticaret sitenizi güçlendiren modüler SaaS platformu.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Platform</h4>
              <a href="#modules">E-Ticaret Modülleri</a>
              <a href="#pricing">Fiyatlandırma</a>
              <a href="#about">Hakkımızda</a>
            </div>
            <div>
              <h4>Destek</h4>
              <a href="#">Dokümantasyon</a>
              <a href="#">S.S.S</a>
              <a href="#">İletişim</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom container">
          <p>© 2024 AKTARMATIK. Design by Morfil Media / Coding by Utku ÇALPALA</p>
        </div>
      </footer>

      <style jsx>{`
        .landing { min-height: 100vh; }
        .landing-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(10,11,20,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border-color); }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 64px; }
        .logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 20px; }
        .logo-icon { background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-size: 24px; }
        .nav-links { display: flex; align-items: center; gap: 24px; font-size: 14px; color: var(--text-secondary); }
        .nav-links a:hover { color: var(--text-primary); }

        .hero { position: relative; padding: 160px 0 100px; text-align: center; overflow: hidden; }
        .hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 800px; height: 600px; background: radial-gradient(ellipse, rgba(108,92,231,0.15) 0%, transparent 70%); pointer-events: none; }
        .hero-content { position: relative; z-index: 1; }
        .hero-badge { display: inline-block; padding: 8px 20px; background: var(--bg-glass); border: 1px solid var(--border-color); border-radius: var(--radius-full); font-size: 14px; color: var(--accent-secondary); margin-bottom: 32px; }
        .hero-title { font-size: 52px; font-weight: 800; line-height: 1.15; letter-spacing: -2px; max-width: 800px; margin: 0 auto 24px; }
        .gradient-text { background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-desc { font-size: 18px; color: var(--text-secondary); max-width: 600px; margin: 0 auto 40px; line-height: 1.7; }
        .hero-ctas { display: flex; gap: 16px; justify-content: center; margin-bottom: 64px; }
        .hero-stats { display: flex; justify-content: center; align-items: center; gap: 40px; }
        .hero-stat { text-align: center; }
        .hero-stat-value { display: block; font-size: 28px; font-weight: 800; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hero-stat-label { font-size: 13px; color: var(--text-secondary); }
        .hero-stat-divider { width: 1px; height: 40px; background: var(--border-color); }

        .modules-section, .features-section, .pricing-section, .about-section { padding: 100px 0; }
        .section-title { font-size: 36px; font-weight: 800; text-align: center; margin-bottom: 12px; }
        .section-desc { text-align: center; color: var(--text-secondary); margin-bottom: 48px; font-size: 16px; }

        .module-filters { display: flex; justify-content: center; gap: 8px; margin-bottom: 40px; }
        .filter-btn { padding: 8px 20px; border-radius: var(--radius-full); border: 1px solid var(--border-color); background: var(--bg-glass); color: var(--text-secondary); cursor: pointer; font-size: 14px; font-weight: 500; font-family: var(--font-sans); transition: all var(--transition-fast); }
        .filter-btn.active, .filter-btn:hover { background: rgba(108,92,231,0.15); border-color: var(--accent-primary); color: var(--accent-secondary); }

        .modules-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .module-card { padding: 28px; position: relative; cursor: pointer; }
        .module-card:hover .module-link { opacity: 1; }
        .module-tag { position: absolute; top: 16px; right: 16px; padding: 3px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; }
        .module-icon { width: 48px; height: 48px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
        .module-card h3 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
        .module-card p { color: var(--text-secondary); font-size: 13px; line-height: 1.6; margin-bottom: 12px; }
        .module-link { font-size: 13px; color: var(--accent-secondary); font-weight: 600; opacity: 0; transition: opacity var(--transition-fast); }

        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .feature-card { padding: 32px; }
        .feature-icon { font-size: 32px; margin-bottom: 16px; }
        .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .feature-card p { color: var(--text-secondary); font-size: 14px; line-height: 1.6; }

        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: start; }
        .pricing-card { padding: 36px; position: relative; text-align: center; }
        .pricing-card.popular { border-color: var(--accent-primary); box-shadow: var(--shadow-glow); }
        .popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--accent-gradient); color: white; padding: 4px 16px; border-radius: var(--radius-full); font-size: 12px; font-weight: 700; }
        .pricing-card h3 { font-size: 18px; margin-bottom: 16px; color: var(--text-secondary); }
        .pricing-price { margin-bottom: 24px; }
        .price-value { font-size: 42px; font-weight: 800; }
        .price-period { font-size: 16px; color: var(--text-secondary); }
        .pricing-features { list-style: none; text-align: left; margin-bottom: 32px; }
        .pricing-features li { padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-secondary); }

        .about-card { padding: 60px; text-align: center; }
        .about-card h2 { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
        .about-card p { color: var(--text-secondary); font-size: 16px; line-height: 1.8; max-width: 600px; margin: 0 auto 32px; }
        .about-credits { display: flex; justify-content: center; gap: 16px; font-size: 14px; color: var(--text-muted); }
        .about-credits strong { color: var(--accent-secondary); }
        .credit-divider { color: var(--border-color); }

        .landing-footer { border-top: 1px solid var(--border-color); padding: 60px 0 0; }
        .footer-inner { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .footer-brand p { color: var(--text-secondary); margin-top: 12px; font-size: 14px; }
        .footer-links { display: flex; gap: 60px; }
        .footer-links h4 { margin-bottom: 12px; font-size: 14px; color: var(--text-secondary); }
        .footer-links a { display: block; padding: 4px 0; color: var(--text-muted); font-size: 14px; }
        .footer-links a:hover { color: var(--text-primary); }
        .footer-bottom { border-top: 1px solid var(--border-color); padding: 20px 0; color: var(--text-muted); font-size: 13px; }

        @media (max-width: 1024px) { .modules-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) {
          .hero-title { font-size: 32px; letter-spacing: -1px; }
          .hero-desc { font-size: 16px; }
          .modules-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid, .pricing-grid { grid-template-columns: 1fr; }
          .hero-stats { flex-direction: column; gap: 16px; }
          .hero-stat-divider { width: 40px; height: 1px; }
          .nav-links a:not(.btn) { display: none; }
          .footer-inner { flex-direction: column; gap: 32px; }
          .footer-links { gap: 32px; }
          .about-credits { flex-direction: column; gap: 4px; }
          .about-card { padding: 32px; }
        }
        @media (max-width: 480px) { .modules-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

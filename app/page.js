'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ───────────────────────── YARDIMCI COMPONENTLER ───────────────────────── */

function AnimatedCounter({ target, suffix = '', prefix = '', decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const iv = setInterval(() => {
          current += increment;
          if (current >= target) { current = target; clearInterval(iv); }
          setVal(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current));
        }, duration / steps);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, decimals]);
  return <span ref={ref}>{prefix}{decimals > 0 ? val.toFixed(decimals) : val.toLocaleString('tr-TR')}{suffix}</span>;
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [answer]);
  return (
    <div
      style={{
        background: open ? 'rgba(108,92,231,0.08)' : 'rgba(255,255,255,0.025)',
        border: '1px solid',
        borderColor: open ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)',
        borderRadius: 16, cursor: 'pointer', overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        marginBottom: 10
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 28px', fontFamily: "'Jost', sans-serif", fontWeight: 700,
        fontSize: 17, color: open ? '#e8d5a3' : '#f0eaff'
      }}>
        <span>{question}</span>
        <span style={{
          fontSize: 22, color: '#d4af37', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: 16
        }}>&#9662;</span>
      </div>
      <div ref={contentRef} style={{
        maxHeight: open ? height + 24 : 0, overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), padding 0.4s cubic-bezier(0.4,0,0.2,1)',
        padding: open ? '0 28px 22px' : '0 28px 0'
      }}>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontFamily: "'Jost', sans-serif" }}>{answer}</p>
      </div>
    </div>
  );
}

function ScrollReveal({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{
      ...style,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.8s cubic-bezier(0.4,0,0.2,1) ${delay}ms`
    }}>
      {children}
    </div>
  );
}

/* Lotus / Mandala ayirici */
function LotusDivider({ color = '#d4af37' }) {
  return (
    <div style={{ textAlign: 'center', margin: '12px 0 20px', opacity: 0.5 }}>
      <span style={{ fontSize: 14, color, letterSpacing: 12 }}>
        {'\u2727'} {'\u2726'} {'\u2727'}
      </span>
    </div>
  );
}

/* Dekoratif kose susu */
function CornerOrnament({ position = 'top-left' }) {
  const positions = {
    'top-left': { top: -1, left: -1, borderTop: '2px solid rgba(212,175,55,0.4)', borderLeft: '2px solid rgba(212,175,55,0.4)' },
    'top-right': { top: -1, right: -1, borderTop: '2px solid rgba(212,175,55,0.4)', borderRight: '2px solid rgba(212,175,55,0.4)' },
    'bottom-left': { bottom: -1, left: -1, borderBottom: '2px solid rgba(212,175,55,0.4)', borderLeft: '2px solid rgba(212,175,55,0.4)' },
    'bottom-right': { bottom: -1, right: -1, borderBottom: '2px solid rgba(212,175,55,0.4)', borderRight: '2px solid rgba(212,175,55,0.4)' },
  };
  return (
    <div style={{
      position: 'absolute', width: 24, height: 24, pointerEvents: 'none',
      ...positions[position]
    }} />
  );
}

/* ───────────────────────── ANA SAYFA ───────────────────────── */

export default function HomePage() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoStarted, setDemoStarted] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);
  const demoRef = useRef(null);
  const formRef = useRef(null);

  // Google Fonts + scroll listener
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700;800&family=Jost:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Widget demo animation sequence
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !demoStarted) {
        setDemoStarted(true);
        let step = 0;
        const iv = setInterval(() => {
          step++;
          if (step > 5) { clearInterval(iv); return; }
          setDemoStep(step);
        }, 900);
      }
    }, { threshold: 0.2 });
    if (demoRef.current) obs.observe(demoRef.current);
    return () => obs.disconnect();
  }, [demoStarted]);

  // Before/After slider
  const handleSliderMove = useCallback((clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => { if (isDragging) handleSliderMove(e.clientX); };
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchMove = (e) => { if (isDragging) handleSliderMove(e.touches[0].clientX); };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleSliderMove]);

  const scrollToForm = (e) => {
    e.preventDefault();
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ─── RENKLER ─── */
  const C = {
    bg: '#0a0a14',
    purple: '#7c6cf7',
    purpleLight: '#b8a9ff',
    purpleBright: '#a78bfa',
    gold: '#d4af37',
    goldLight: '#e8d5a3',
    goldGlow: 'rgba(212,175,55,0.15)',
    pink: '#e84393',
    green: '#00d2a0',
    textPrimary: '#f5f0ff',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: 'rgba(255,255,255,0.4)',
    cardBg: 'rgba(255,255,255,0.03)',
    cardBorder: 'rgba(212,175,55,0.1)',
  };

  const sampleReviews = [
    { name: 'E*** K***', date: '28.03.2026', stars: 5, text: 'Kalitesi harika, beklentimin cok ustunde. Herkese tavsiye ederim, hizli da kargo yaptilar.' },
    { name: 'A*** Y***', date: '15.03.2026', stars: 5, text: 'Urun tam aciklamada yazdigi gibi. Kullanimi cok kolay, sonuclar muhtesem.' },
    { name: 'M*** D***', date: '02.03.2026', stars: 4, text: 'Gayet basarili bir urun. Fiyat performans orani cok iyi. Tekrar alirim.' },
  ];

  const features = [
    { emoji: '\u2B50', title: 'Yorum & Puanlama', desc: 'Trendyol\'daki tum musteri yorumlarini ve yildiz puanlarini e-ticaret sitenizde gosterin.' },
    { emoji: '\uD83D\uDD25', title: 'Sosyal Kanit Bandi', desc: '"X kisi bu urunu aldi", favori ve sepet sayilari ile guveni artirin.' },
    { emoji: '\u2753', title: 'Soru & Cevap', desc: 'Trendyol\'daki soru-cevaplari urun sayfanizda otomatik gosterin.' },
    { emoji: '\uD83D\uDCCA', title: 'Tavsiye Orani', desc: '"Alicilarin %96\'si tavsiye ediyor" gibi guclu sosyal kanit mesajlari.' },
    { emoji: '\uD83D\uDD17', title: 'Coklu Platform', desc: 'ikas, Shopify, WordPress, IdeaSoft \u2014 tek script ile her yerde calisir.' },
    { emoji: '\u26A1', title: 'Otomatik Guncelleme', desc: 'Veriler her 6 saatte otomatik guncellenir. Siteniz her zaman guncel kalir.' },
  ];

  const testimonials = [
    { initials: 'AK', name: 'Ahmet Kaya', role: 'Dogal Yasam Kozmetik \u2014 Kurucu', text: 'Trendyol\'daki 4.9 puanimizi sitemizde gostermeye basladiktan sonra donusum oranimiz %38 artti. Musteriler artik dogrudan bizden siparis veriyor.' },
    { initials: 'SY', name: 'Selin Yilmaz', role: 'BebekDunyasi \u2014 E-Ticaret Muduru', text: 'Kurulumu gercekten 3 dakika surdu. Teknik bilgim olmamasina ragmen tek satir kodla widget\'i sitemize ekledik. Sosyal kanit etkisi inanilmaz.' },
    { initials: 'MO', name: 'Murat Ozdemir', role: 'TeknoPlus Elektronik \u2014 Genel Mudur', text: 'Sepet terk oranimiz %22 dustu. Musteriler urun sayfasinda Trendyol yorumlarini gorunce guvenip alisverisi tamamliyor.' },
  ];

  const faqs = [
    { q: 'Aktarmatik nedir?', a: 'Aktarmatik, Trendyol\'daki musteri yorumlarini, puanlari ve sosyal kanit verilerini (favori sayisi, sepet sayisi, satis adedi) kendi e-ticaret sitenizde otomatik olarak gosteren bir widget platformudur.' },
    { q: 'Hangi platformlarla calisir?', a: 'ikas, Shopify, WordPress (WooCommerce), IdeaSoft ve ozel yazilim altyapilariyla uyumludur. Tek satir JavaScript kodu ile her platformda calisir.' },
    { q: 'Kurulumu ne kadar surer?', a: 'Kurulum ortalama 3 dakika surer. Script kodunu sitenize ekleyin, Trendyol URL\'lerini eslestirin, gerisini Aktarmatik halleder.' },
    { q: 'Veriler ne siklikla guncellenir?', a: 'Trendyol\'daki yeni yorumlar, puan degisiklikleri ve sosyal kanit verileri her 6 saatte otomatik guncellenir. Siteniz her zaman guncel kalir.' },
    { q: 'Sitemin hizini etkiler mi?', a: 'Hayir. Widget asenkron yuklenir ve sitenizin sayfa hizini etkilemez. Google PageSpeed skorunuzda herhangi bir dusus yasamazsiniz.' },
    { q: 'Hizmet nasil baslar?', a: 'Yukaridaki formu doldurarak veya bizi 0850 309 20 49 numarasindan arayarak hizmet talebinde bulunabilirsiniz. 24 saat icinde size donus yapiyoruz.' },
  ];

  /* ─── MANDALA SVG PATTERN (background) ─── */
  const mandalaPattern = `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(212,175,55,0.04)' stroke-width='0.5'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3Cpath d='M40 10 L40 70 M10 40 L70 40 M18 18 L62 62 M62 18 L18 62'/%3E%3C/g%3E%3C/svg%3E")`;

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", color: C.textPrimary, background: C.bg, overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ──── FLOATING GRADIENT ORBS ──── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,108,247,0.2), transparent 70%)',
          top: '-10%', right: '-5%', filter: 'blur(100px)',
          animation: 'orbFloat1 10s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 550, height: 550, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)',
          bottom: '10%', left: '-8%', filter: 'blur(100px)',
          animation: 'orbFloat2 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,67,147,0.08), transparent 70%)',
          top: '50%', left: '50%', filter: 'blur(80px)',
          animation: 'orbFloat3 8s ease-in-out infinite'
        }} />
      </div>

      {/* ──── NAVBAR ──── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,10,20,0.95)' : 'rgba(10,10,20,0.5)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.04)'}`,
        transition: 'all 0.4s ease'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 800, fontSize: 22,
            color: C.goldLight, textDecoration: 'none', letterSpacing: -0.5,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 26, color: C.gold }}>{'\u25C6'}</span>
            <div>
              <div style={{ lineHeight: 1.1 }}>AKTARMATIK</div>
              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(212,175,55,0.5)', fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase' }}>by Morfil Medya</div>
            </div>
          </a>
          <button className="mob-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{
            display: 'none', background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: C.goldLight
          }}>
            {mobileMenu ? '\u2715' : '\u2630'}
          </button>
          <div className={`nav-links ${mobileMenu ? 'nav-open' : ''}`} style={{
            display: 'flex', alignItems: 'center', gap: 30
          }}>
            <a href="#demo" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, transition: 'color 0.3s' }}>Demo</a>
            <a href="#ozellikler" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, transition: 'color 0.3s' }}>Ozellikler</a>
            <a href="#sss" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, transition: 'color 0.3s' }}>SSS</a>
            <a href="#iletisim" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: 600, transition: 'color 0.3s' }}>Iletisim</a>
            <a href="#" onClick={scrollToForm} style={{
              padding: '10px 26px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              textDecoration: 'none', color: '#0a0a14', cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #d4af37, #f0d060)',
              boxShadow: '0 4px 20px rgba(212,175,55,0.35)', transition: 'all 0.3s',
              fontFamily: "'Jost', sans-serif"
            }}>Bilgi Al</a>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 999,
          background: 'rgba(10,10,20,0.98)', backdropFilter: 'blur(20px)',
          padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 18,
          borderBottom: '1px solid rgba(212,175,55,0.15)'
        }}>
          <a href="#demo" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: C.textSecondary, fontSize: 17, fontWeight: 600 }}>Demo</a>
          <a href="#ozellikler" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: C.textSecondary, fontSize: 17, fontWeight: 600 }}>Ozellikler</a>
          <a href="#sss" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: C.textSecondary, fontSize: 17, fontWeight: 600 }}>SSS</a>
          <a href="#iletisim" onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: C.textSecondary, fontSize: 17, fontWeight: 600 }}>Iletisim</a>
          <a href="#" onClick={(e) => { scrollToForm(e); setMobileMenu(false); }} style={{
            textAlign: 'center', display: 'block', padding: '12px 26px', borderRadius: 10,
            fontWeight: 700, fontSize: 14, color: '#0a0a14', background: 'linear-gradient(135deg, #d4af37, #f0d060)',
            textDecoration: 'none'
          }}>Bilgi Al</a>
        </div>
      )}

      {/* ──── HERO + FORM (yan yana) ──── */}
      <section ref={formRef} id="hero" style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        overflow: 'hidden', backgroundImage: mandalaPattern
      }}>
        {/* Gold corner accents */}
        <div style={{ position: 'absolute', top: 100, left: 40, width: 60, height: 60, pointerEvents: 'none' }}>
          <CornerOrnament position="top-left" />
        </div>
        <div style={{ position: 'absolute', top: 100, right: 40, width: 60, height: 60, pointerEvents: 'none' }}>
          <CornerOrnament position="top-right" />
        </div>

        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '140px 28px 80px',
          display: 'flex', alignItems: 'flex-start', gap: 60,
          position: 'relative', zIndex: 1, width: '100%'
        }} className="hero-flex">
          {/* SOL: Hero content */}
          <div style={{ flex: 1.1 }} className="hero-left-col">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)',
              color: C.goldLight, padding: '9px 20px', borderRadius: 24, fontSize: 13, fontWeight: 700,
              marginBottom: 28
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.gold, animation: 'pulse 2s infinite' }} />
              Trendyol Entegrasyonu
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 4.5vw, 58px)', fontWeight: 800,
              lineHeight: 1.08, marginBottom: 24, color: 'white', letterSpacing: -2
            }}>
              Trendyol Yorumlarinizi{' '}
              <span style={{
                background: 'linear-gradient(135deg, #d4af37, #f0d060, #d4af37)',
                backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite'
              }}>Sitenize Tasiyin</span>
            </h1>
            <p style={{ fontSize: 18, color: C.textSecondary, lineHeight: 1.8, marginBottom: 40, maxWidth: 480, fontWeight: 400 }}>
              Trendyol&apos;daki musteri yorumlarini, puanlari ve sosyal kanitlari
              e-ticaret sitenizde tek bir script ile gosterin.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 44, marginBottom: 40, flexWrap: 'wrap' }}>
              {[
                { val: <><span style={{ marginRight: 4 }}>{'\u2605'}</span><AnimatedCounter target={4.8} decimals={1} /></>, label: 'Ortalama Puan' },
                { val: <AnimatedCounter target={45} suffix="%" />, label: 'Donusum Artisi' },
                { val: <AnimatedCounter target={3} suffix="dk" />, label: 'Kurulum' },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.gold, fontFamily: "'Jost', sans-serif" }}>{stat.val}</div>
                  <div style={{ fontSize: 13, color: C.textMuted, marginTop: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Platform tags */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>Uyumlu:</span>
              {['ikas', 'Shopify', 'WordPress', 'IdeaSoft'].map(p => (
                <span key={p} style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(212,175,55,0.06)', color: C.goldLight, fontWeight: 700,
                  border: '1px solid rgba(212,175,55,0.15)'
                }}>{p}</span>
              ))}
            </div>
          </div>

          {/* SAG: Form */}
          <div style={{ flex: 0.9, maxWidth: 440, position: 'relative' }} className="hero-right-col">
            <div style={{
              background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 60px rgba(212,175,55,0.05)',
              backdropFilter: 'blur(20px)'
            }}>
              {/* Kose susleri */}
              <CornerOrnament position="top-left" />
              <CornerOrnament position="top-right" />
              <CornerOrnament position="bottom-left" />
              <CornerOrnament position="bottom-right" />
              {/* Glow */}
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 180, height: 180,
                background: 'radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)',
                borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
              }} />
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 800,
                color: C.goldLight, marginBottom: 4, position: 'relative'
              }}>Ucretsiz Demo Talep Edin</h3>
              <LotusDivider />
              <form action="mailto:morfilmedia@gmail.com" method="POST" encType="text/plain" style={{ position: 'relative' }}>
                <input type="hidden" name="subject" value="Aktarmatik Hizmet Talebi" />
                {[
                  { label: 'Ad Soyad', name: 'Ad Soyad', type: 'text', ph: 'Adiniz Soyadiniz', req: true },
                  { label: 'Firma Adi', name: 'Firma Adi', type: 'text', ph: 'Firma adiniz', req: true },
                  { label: 'E-posta', name: 'E-posta', type: 'email', ph: 'ornek@firma.com', req: true },
                  { label: 'Telefon', name: 'Telefon', type: 'tel', ph: '05XX XXX XX XX', req: true },
                  { label: 'E-Ticaret Site URL', name: 'Site URL', type: 'url', ph: 'https://www.siteniz.com', req: false },
                ].map((f, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(212,175,55,0.7)', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {f.label} {f.req && '*'}
                    </label>
                    <input
                      type={f.type} name={f.name} placeholder={f.ph} required={f.req}
                      style={{
                        width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.12)',
                        borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 15, fontWeight: 500,
                        fontFamily: "'Jost', sans-serif", outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
                        boxSizing: 'border-box'
                      }}
                      className="form-input"
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(212,175,55,0.7)', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' }}>Mesaj</label>
                  <textarea
                    name="Mesaj" rows={3} placeholder="Hizmet hakkinda sormak istedikleriniz..."
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.12)',
                      borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 15, fontWeight: 500,
                      fontFamily: "'Jost', sans-serif", outline: 'none', resize: 'vertical',
                      transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box'
                    }}
                    className="form-input"
                  />
                </div>
                <button type="submit" style={{
                  width: '100%', textAlign: 'center', padding: '15px 24px',
                  background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                  color: '#0a0a14', borderRadius: 12, fontWeight: 800, fontSize: 16,
                  border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                  boxShadow: '0 8px 30px rgba(212,175,55,0.3)', transition: 'all 0.3s',
                  letterSpacing: 0.5
                }} className="submit-btn">Hizmet Talep Et {'\u2192'}</button>
              </form>
              <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 18 }}>
                  <a href="tel:08503092049" style={{ fontSize: 14, color: C.gold, textDecoration: 'none', fontWeight: 700 }}>
                    {'\uD83D\uDCDE'} 0850 309 20 49
                  </a>
                  <a href="tel:05407275757" style={{ fontSize: 14, color: C.gold, textDecoration: 'none', fontWeight: 700 }}>
                    {'\uD83D\uDCDE'} 0540 727 57 57
                  </a>
                </div>
                <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
                  {'\u23F0'} Size 24 saat icinde donus yapacagiz
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── LOTUS DIVIDER ──── */}
      <div style={{ textAlign: 'center', padding: '20px 0', background: 'rgba(212,175,55,0.02)', borderTop: '1px solid rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.06)' }}>
        <span style={{ fontSize: 18, color: C.gold, letterSpacing: 16, opacity: 0.5 }}>
          {'\u2727'} {'\u2022'} {'\u2726'} {'\u2022'} {'\u2727'}
        </span>
      </div>

      {/* ──── CANLI DEMO BOLUMU ──── */}
      <section id="demo" style={{
        padding: '100px 28px', background: 'rgba(108,92,231,0.02)',
        borderBottom: '1px solid rgba(212,175,55,0.06)', backgroundImage: mandalaPattern
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <h2 style={{
              textAlign: 'center', fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, marginBottom: 6,
              color: 'white', letterSpacing: -1
            }}>Sistemi Kesfedin</h2>
            <LotusDivider />
            <p style={{ textAlign: 'center', color: C.textSecondary, fontSize: 18, marginBottom: 60, fontWeight: 400 }}>
              Widget&apos;in sitenizde nasil calistigini canli gorun
            </p>
          </ScrollReveal>

          {/* A) Widget Onizleme Animasyonu */}
          <ScrollReveal delay={100}>
            <div ref={demoRef} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(212,175,55,0.12)',
              borderRadius: 24, maxWidth: 520, margin: '0 auto 70px', padding: 0, overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.3), 0 0 40px rgba(212,175,55,0.03)',
              position: 'relative'
            }}>
              <CornerOrnament position="top-left" />
              <CornerOrnament position="top-right" />
              <CornerOrnament position="bottom-left" />
              <CornerOrnament position="bottom-right" />
              {/* Mockup product header */}
              <div style={{ background: 'white', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: '#999', fontWeight: 700, letterSpacing: 1 }}>MARKA ADI</span>
                  <span style={{ fontSize: 16, color: '#ccc' }}>{'\u2661'}</span>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Premium Bakim Serumu 50ml</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a2e' }}>489 {'\u20BA'}</div>
              </div>
              {/* Aktarmatik widget area */}
              <div style={{ background: 'white', padding: '16px 24px 24px' }}>
                <div style={{
                  fontSize: 10, color: '#6c5ce7', fontWeight: 800, letterSpacing: 1.5,
                  marginBottom: 12, textTransform: 'uppercase',
                  opacity: demoStep >= 1 ? 1 : 0, transition: 'opacity 0.6s'
                }}>AKTARMATIK WIDGET</div>
                {/* Stars */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  opacity: demoStep >= 1 ? 1 : 0, transition: 'opacity 0.6s ease 0.2s'
                }}>
                  <span style={{ fontWeight: 900, fontSize: 22, color: '#1a1a2e' }}>4.8</span>
                  <span>
                    {[1,2,3,4,5].map(i => (
                      <span key={i} style={{
                        color: i <= 4 ? '#f39c12' : (demoStep >= 2 ? '#f39c12' : '#ddd'),
                        fontSize: 20, transition: 'color 0.4s',
                        transitionDelay: `${i * 150}ms`
                      }}>{'\u2605'}</span>
                    ))}
                  </span>
                  <span style={{
                    fontSize: 14, color: '#555', fontWeight: 600,
                    opacity: demoStep >= 2 ? 1 : 0, transition: 'opacity 0.8s ease 0.3s'
                  }}>
                    <AnimatedCounter target={demoStep >= 2 ? 2341 : 0} /> degerlendirme
                  </span>
                </div>
                {/* Social proof band */}
                <div style={{
                  background: 'linear-gradient(135deg, #fff5f5, #fff8f0)', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 10, fontSize: 14, color: '#e17055', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transform: demoStep >= 3 ? 'translateX(0)' : 'translateX(-110%)',
                  opacity: demoStep >= 3 ? 1 : 0,
                  transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)'
                }}>
                  {'\uD83D\uDD25'} <span>1.847 kisi son 30 gunde satin aldi</span>
                </div>
                {/* Recommendation */}
                <div style={{
                  fontSize: 14, color: '#00b894', fontWeight: 700, marginBottom: 12,
                  opacity: demoStep >= 3 ? 1 : 0, transition: 'opacity 0.6s ease 0.5s'
                }}>{'\u2705'} Alicilarin <strong>%96&apos;si</strong> bu urunu tavsiye ediyor!</div>
                {/* Review cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sampleReviews.map((r, i) => (
                    <div key={i} style={{
                      background: 'linear-gradient(135deg, #f8f9ff, #f5f0ff)', borderRadius: 12,
                      padding: '12px 14px', border: '1px solid rgba(108,92,231,0.06)',
                      opacity: demoStep >= 4 ? 1 : 0,
                      transform: demoStep >= 4 ? 'translateY(0)' : 'translateY(15px)',
                      transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 200}ms`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{r.name}</span>
                        <span style={{ color: '#f39c12', fontSize: 11 }}>{'\u2605'.repeat(r.stars)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: '#444', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>&quot;{r.text}&quot;</p>
                      <span style={{ fontSize: 10, color: '#bbb', marginTop: 4, display: 'block' }}>{r.date}</span>
                    </div>
                  ))}
                </div>
                {/* Q&A tab */}
                <div style={{
                  marginTop: 12, borderTop: '1px solid #eee', paddingTop: 12,
                  opacity: demoStep >= 5 ? 1 : 0,
                  transform: demoStep >= 5 ? 'translateY(0)' : 'translateY(10px)',
                  transition: 'all 0.6s cubic-bezier(0.4,0,0.2,1) 0.2s'
                }}>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, color: '#6c5ce7', fontWeight: 800, borderBottom: '2px solid #6c5ce7', paddingBottom: 4 }}>Soru-Cevap</span>
                    <span style={{ fontSize: 14, color: '#999', fontWeight: 500, paddingBottom: 4 }}>Yorumlar</span>
                  </div>
                  <div style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <strong style={{ color: '#1a1a2e' }}>S:</strong> <span style={{ color: '#444' }}>Hassas ciltlere uygun mu?</span>
                    <br />
                    <span style={{ color: '#00b894', fontWeight: 700 }}>C:</span> <span style={{ color: '#444' }}>Evet, dermatolog testinden gecmistir.</span>
                  </div>
                  <div style={{ fontSize: 13, padding: '6px 0' }}>
                    <strong style={{ color: '#1a1a2e' }}>S:</strong> <span style={{ color: '#444' }}>Ne kadar surede etki gosterir?</span>
                    <br />
                    <span style={{ color: '#00b894', fontWeight: 700 }}>C:</span> <span style={{ color: '#444' }}>Duzenli kullanim ile 2 haftada sonuc alinir.</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* B) Entegrasyon Adimlari */}
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
            {[
              {
                step: 1, title: 'Script Ekle', icon: '\uD83D\uDCDD',
                content: (
                  <div style={{
                    background: '#0d0d1a', borderRadius: 10, padding: '14px 16px', marginTop: 12,
                    fontFamily: 'monospace', fontSize: 12, color: C.purpleBright, position: 'relative',
                    border: '1px solid rgba(212,175,55,0.1)', overflow: 'hidden'
                  }}>
                    <div style={{ opacity: 0.5, marginBottom: 4 }}>&lt;!-- Aktarmatik Widget --&gt;</div>
                    <div>&lt;script src=&quot;https://cdn.</div>
                    <div>&nbsp;&nbsp;aktarmatik.com/w.js&quot;&gt;</div>
                    <div>&lt;/script&gt;</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard?.writeText('<script src="https://cdn.aktarmatik.com/w.js"></script>');
                        const btn = e.currentTarget;
                        btn.textContent = 'Kopyalandi!';
                        setTimeout(() => { btn.textContent = 'Kopyala'; }, 2000);
                      }}
                      style={{
                        position: 'absolute', top: 8, right: 8, background: 'rgba(212,175,55,0.15)',
                        border: '1px solid rgba(212,175,55,0.3)', borderRadius: 6, padding: '4px 12px',
                        color: C.goldLight, fontSize: 11, cursor: 'pointer', fontWeight: 700,
                        fontFamily: "'Jost', sans-serif"
                      }}
                    >Kopyala</button>
                  </div>
                )
              },
              {
                step: 2, title: 'URL Esle', icon: '\uD83D\uDD17',
                content: (
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      background: '#0d0d1a', borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                      fontSize: 12, color: '#e17055', fontFamily: 'monospace', fontWeight: 600,
                      border: '1px solid rgba(212,175,55,0.1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>trendyol.com/urun/serum-123</div>
                    <div style={{ textAlign: 'center', fontSize: 22, color: C.gold, animation: 'arrowBounce 1.5s infinite' }}>{'\u2193'}</div>
                    <div style={{
                      background: '#0d0d1a', borderRadius: 10, padding: '10px 14px',
                      fontSize: 12, color: C.green, fontFamily: 'monospace', fontWeight: 600,
                      border: '1px solid rgba(212,175,55,0.1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>siteniz.com/urun/serum</div>
                  </div>
                )
              },
              {
                step: 3, title: 'Otomatik Guncelle', icon: '\uD83D\uDD04',
                content: (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <div style={{
                      fontSize: 52, animation: 'spin 3s linear infinite', display: 'inline-block', color: C.gold
                    }}>{'\u21BB'}</div>
                    <p style={{ fontSize: 14, color: C.textSecondary, marginTop: 8, fontWeight: 500 }}>
                      Veriler her 6 saatte otomatik guncellenir
                    </p>
                  </div>
                )
              }
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 200} style={{ flex: '1 1 280px', maxWidth: 340 }}>
                <div style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20,
                  padding: '32px 24px', textAlign: 'center', height: '100%',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
                }} className="hover-card">
                  <CornerOrnament position="top-left" />
                  <CornerOrnament position="top-right" />
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0a14',
                    width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 900, fontSize: 15,
                    boxShadow: '0 4px 15px rgba(212,175,55,0.4)'
                  }}>{item.step}</div>
                  <div style={{ fontSize: 40, marginBottom: 10, marginTop: 14 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 19, fontWeight: 800, color: C.goldLight, marginBottom: 4 }}>{item.title}</h3>
                  {item.content}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* C) Oncesi/Sonrasi Karsilastirma */}
          <ScrollReveal>
            <h3 style={{
              textAlign: 'center', fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(26px, 3vw, 36px)', fontWeight: 800, marginBottom: 6, color: 'white'
            }}>Oncesi / Sonrasi</h3>
            <LotusDivider />
            <p style={{ textAlign: 'center', color: C.textSecondary, fontSize: 16, marginBottom: 40, fontWeight: 500 }}>
              Slider&apos;i surukleyerek farki gorun
            </p>
            <div
              ref={sliderRef}
              style={{
                maxWidth: 700, margin: '0 auto', position: 'relative', borderRadius: 20,
                overflow: 'hidden', border: '1px solid rgba(212,175,55,0.15)', cursor: 'ew-resize',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)', userSelect: 'none', height: 380,
                background: 'white'
              }}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            >
              {/* Before - sade sayfa */}
              <div style={{ position: 'absolute', inset: 0, background: 'white', padding: '30px 36px' }}>
                <div style={{ maxWidth: 300 }}>
                  <div style={{ width: 80, height: 8, background: '#eee', borderRadius: 4, marginBottom: 16 }} />
                  <div style={{ width: 200, height: 14, background: '#ddd', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: 100, height: 20, background: '#ccc', borderRadius: 4, marginBottom: 24 }} />
                  <div style={{ width: '100%', height: 160, background: '#f5f5f5', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 40, color: '#ddd' }}>{'\uD83D\uDDBC'}</span>
                  </div>
                  <div style={{ width: '100%', height: 40, background: '#eee', borderRadius: 8, marginBottom: 12 }} />
                  <div style={{ width: '60%', height: 10, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '80%', height: 10, background: '#f0f0f0', borderRadius: 4 }} />
                </div>
                <div style={{
                  position: 'absolute', bottom: 20, left: 36,
                  background: 'rgba(220,53,69,0.1)', color: '#dc3545', fontSize: 13, fontWeight: 800,
                  padding: '8px 16px', borderRadius: 8
                }}>Yorum yok, sosyal kanit yok</div>
              </div>
              {/* After - Aktarmatik'li sayfa */}
              <div style={{
                position: 'absolute', inset: 0, background: 'white', padding: '30px 36px',
                clipPath: `inset(0 ${100 - sliderPos}% 0 0)`
              }}>
                <div style={{ maxWidth: 300 }}>
                  <div style={{ width: 80, height: 8, background: '#eee', borderRadius: 4, marginBottom: 16 }} />
                  <div style={{ width: 200, height: 14, background: '#ddd', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: 100, height: 20, background: '#ccc', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontWeight: 900, color: '#1a1a2e', fontSize: 16 }}>4.8</span>
                    <span style={{ color: '#f39c12', fontSize: 15 }}>{'\u2605\u2605\u2605\u2605\u2605'}</span>
                    <span style={{ fontSize: 12, color: '#777', fontWeight: 600 }}>2.341 degerlendirme</span>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #fff5f5, #fff8f0)', borderRadius: 8,
                    padding: '6px 10px', fontSize: 12, color: '#e17055', fontWeight: 700, marginBottom: 8
                  }}>{'\uD83D\uDD25'} 1.847 kisi son 30 gunde satin aldi</div>
                  <div style={{ width: '100%', height: 100, background: '#f5f5f5', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 30, color: '#ddd' }}>{'\uD83D\uDDBC'}</span>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #f8f9ff, #f5f0ff)', borderRadius: 8,
                    padding: '8px 10px', border: '1px solid rgba(108,92,231,0.06)', marginBottom: 6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>E*** K***</span>
                      <span style={{ color: '#f39c12', fontSize: 9 }}>{'\u2605\u2605\u2605\u2605\u2605'}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#444', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>&quot;Harika kalite, tavsiye ederim!&quot;</p>
                  </div>
                  <div style={{ fontSize: 12, color: '#00b894', fontWeight: 700 }}>{'\u2705'} %96 tavsiye orani</div>
                </div>
                <div style={{
                  position: 'absolute', bottom: 20, left: 36,
                  background: 'rgba(108,92,231,0.1)', color: '#6c5ce7', fontSize: 13, fontWeight: 800,
                  padding: '8px 16px', borderRadius: 8
                }}>Aktarmatik ile zengin sayfa</div>
              </div>
              {/* Slider handle */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: 3,
                background: 'linear-gradient(180deg, #d4af37, #6c5ce7)', zIndex: 10, transform: 'translateX(-50%)'
              }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(212,175,55,0.5)', color: '#0a0a14', fontWeight: 900, fontSize: 18
                }}>{'\u2194'}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── LOTUS DIVIDER ──── */}
      <div style={{ textAlign: 'center', padding: '20px 0', background: 'rgba(212,175,55,0.02)' }}>
        <span style={{ fontSize: 18, color: C.gold, letterSpacing: 16, opacity: 0.5 }}>
          {'\u2727'} {'\u2022'} {'\u2726'} {'\u2022'} {'\u2727'}
        </span>
      </div>

      {/* ──── OZELLIKLER ──── */}
      <section id="ozellikler" style={{ padding: '100px 28px', maxWidth: 1200, margin: '0 auto', backgroundImage: mandalaPattern }}>
        <ScrollReveal>
          <h2 style={{
            textAlign: 'center', fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, marginBottom: 6,
            color: 'white', letterSpacing: -1
          }}>Neler Sunuyoruz?</h2>
          <LotusDivider />
          <p style={{ textAlign: 'center', color: C.textSecondary, fontSize: 18, marginBottom: 60, fontWeight: 400 }}>
            Trendyol verilerinizi en etkili sekilde kullanin
          </p>
        </ScrollReveal>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, maxWidth: 1200, margin: '0 auto'
        }} className="features-grid">
          {features.map((f, i) => (
            <ScrollReveal key={i} delay={i * 100}>
              <div style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20,
                padding: '36px 28px', height: '100%', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                position: 'relative', overflow: 'hidden'
              }} className="hover-card">
                <CornerOrnament position="top-right" />
                <CornerOrnament position="bottom-left" />
                <div style={{ fontSize: 46, marginBottom: 18 }}>{f.emoji}</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.goldLight, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.7, fontWeight: 400 }}>{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ──── TESTIMONIALS ──── */}
      <section id="yorumlar" style={{
        padding: '100px 28px', background: 'rgba(108,92,231,0.02)',
        borderTop: '1px solid rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.06)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <h2 style={{
              textAlign: 'center', fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, marginBottom: 6,
              color: 'white', letterSpacing: -1
            }}>Musterilerimiz Ne Diyor?</h2>
            <LotusDivider />
            <p style={{ textAlign: 'center', color: C.textSecondary, fontSize: 18, marginBottom: 60, fontWeight: 400 }}>
              Aktarmatik kullanan e-ticaret firmalarinin deneyimleri
            </p>
          </ScrollReveal>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22, maxWidth: 1200, margin: '0 auto'
          }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 150}>
                <div style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 20,
                  padding: '36px 28px', height: '100%', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  position: 'relative', overflow: 'hidden'
                }} className="hover-card">
                  <CornerOrnament position="top-left" />
                  <CornerOrnament position="bottom-right" />
                  <div style={{ color: '#f39c12', fontSize: 18, marginBottom: 18, letterSpacing: 3 }}>{'\u2605\u2605\u2605\u2605\u2605'}</div>
                  <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 28, fontWeight: 400 }}>
                    &quot;{t.text}&quot;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #d4af37, #f0d060)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 15, color: '#0a0a14', flexShrink: 0
                    }}>{t.initials}</div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 15, color: C.goldLight, fontWeight: 700 }}>{t.name}</strong>
                      <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{t.role}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──── FAQ ──── */}
      <section id="sss" style={{ padding: '100px 28px', maxWidth: 1200, margin: '0 auto' }}>
        <ScrollReveal>
          <h2 style={{
            textAlign: 'center', fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, marginBottom: 6,
            color: 'white', letterSpacing: -1
          }}>Sikca Sorulan Sorular</h2>
          <LotusDivider />
          <p style={{ textAlign: 'center', color: C.textSecondary, fontSize: 18, marginBottom: 60, fontWeight: 400 }}>
            Merak ettiklerinize hizli cevaplar
          </p>
        </ScrollReveal>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {faqs.map((f, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <FAQItem question={f.q} answer={f.a} />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ──── IKINCI CTA ──── */}
      <section id="iletisim" style={{
        padding: '100px 28px', background: 'rgba(108,92,231,0.02)',
        borderTop: '1px solid rgba(212,175,55,0.06)', borderBottom: '1px solid rgba(212,175,55,0.06)',
        textAlign: 'center', position: 'relative', overflow: 'hidden', backgroundImage: mandalaPattern
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
          <ScrollReveal>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(32px, 3.5vw, 48px)', fontWeight: 800, marginBottom: 6, color: 'white'
            }}>Hemen Baslayin</h2>
            <LotusDivider />
            <p style={{ fontSize: 18, color: C.textSecondary, lineHeight: 1.8, marginBottom: 40, fontWeight: 400 }}>
              Trendyol yorumlarinizi e-ticaret sitenize tasiyin,
              donusum oranlarinizi artirin.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
              <a href="#" onClick={scrollToForm} style={{
                display: 'inline-block', padding: '16px 40px',
                background: 'linear-gradient(135deg, #d4af37, #f0d060)', color: '#0a0a14',
                borderRadius: 14, fontWeight: 800, fontSize: 17, textDecoration: 'none',
                boxShadow: '0 8px 35px rgba(212,175,55,0.35)', transition: 'all 0.3s',
                fontFamily: "'Jost', sans-serif"
              }} className="submit-btn">Bilgi Al {'\u2192'}</a>
              <a href="tel:08503092049" style={{
                display: 'inline-flex', alignItems: 'center', padding: '16px 36px',
                border: '1px solid rgba(212,175,55,0.25)', color: C.goldLight,
                borderRadius: 14, fontWeight: 700, fontSize: 17, textDecoration: 'none',
                transition: 'all 0.3s', fontFamily: "'Jost', sans-serif"
              }}>{'\uD83D\uDCDE'} 0850 309 20 49</a>
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:08503092049" style={{ fontSize: 15, color: C.gold, textDecoration: 'none', fontWeight: 700 }}>
                {'\uD83D\uDCDE'} 0850 309 20 49
              </a>
              <a href="tel:05407275757" style={{ fontSize: 15, color: C.gold, textDecoration: 'none', fontWeight: 700 }}>
                {'\uD83D\uDCDE'} 0540 727 57 57
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer style={{
        background: '#06060c', borderTop: '1px solid rgba(212,175,55,0.08)',
        color: 'white', padding: '52px 28px 36px'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', display: 'flex',
          justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24, color: C.gold }}>{'\u25C6'}</span>
              <div>
                <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: C.goldLight }}>AKTARMATIK</strong>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: 'rgba(212,175,55,0.4)', letterSpacing: 1.5 }}>by Morfil Medya</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 280, lineHeight: 1.7, marginBottom: 14, fontWeight: 400 }}>
              Trendyol verilerinizi e-ticaret sitenize tasiyin.
            </p>
            <div style={{ display: 'flex', gap: 18, marginBottom: 8 }}>
              <a href="tel:08503092049" style={{ color: C.gold, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{'\uD83D\uDCDE'} 0850 309 20 49</a>
              <a href="tel:05407275757" style={{ color: C.gold, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{'\uD83D\uDCDE'} 0540 727 57 57</a>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <a href="#demo" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>Demo</a>
            <a href="#ozellikler" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>Ozellikler</a>
            <a href="#sss" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>SSS</a>
            <a href="#iletisim" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'color 0.2s' }}>Iletisim</a>
          </div>
        </div>
        <div style={{
          maxWidth: 1200, margin: '36px auto 0', paddingTop: 20,
          borderTop: '1px solid rgba(212,175,55,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
            {'\u00A9'} {new Date().getFullYear()} Aktarmatik. Morfil Medya tarafindan gelistirilmistir.
          </span>
          <a href="https://aktarmatik.webtasarimi.net" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'rgba(212,175,55,0.3)', textDecoration: 'none', fontWeight: 500 }}>
            aktarmatik.webtasarimi.net
          </a>
        </div>
      </footer>

      {/* ──── GLOBAL CSS ──── */}
      <style jsx>{`
        @keyframes orbFloat1 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-40px) scale(1.08); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(30px) scale(1.05); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, -25px) scale(1.1); } }
        @keyframes shimmer { to { background-position: 200% center; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes arrowBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }

        .hover-card:hover {
          transform: translateY(-8px) !important;
          border-color: rgba(212, 175, 55, 0.35) !important;
          background: rgba(212, 175, 55, 0.04) !important;
          box-shadow: 0 16px 50px rgba(212, 175, 55, 0.08), 0 0 30px rgba(108, 92, 231, 0.05) !important;
        }

        .submit-btn:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 45px rgba(212, 175, 55, 0.5) !important;
        }

        .form-input:focus {
          border-color: rgba(212, 175, 55, 0.4) !important;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.08) !important;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.2) !important;
        }

        .mob-btn { display: none !important; }

        a:hover { color: #e8d5a3 !important; }

        /* 1024px */
        @media (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        /* 768px */
        @media (max-width: 768px) {
          .mob-btn { display: block !important; }
          .nav-links { display: none !important; }
          .nav-open { display: flex !important; }
          .hero-flex { flex-direction: column !important; padding-top: 100px !important; gap: 40px !important; }
          .hero-left-col { text-align: center !important; }
          .hero-left-col > div:nth-child(4) { justify-content: center !important; }
          .hero-left-col > div:last-child { justify-content: center !important; }
          .hero-right-col { max-width: 100% !important; width: 100% !important; }
          .features-grid { grid-template-columns: 1fr !important; max-width: 440px !important; margin: 0 auto !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; max-width: 440px !important; margin: 0 auto !important; }
        }

        /* 480px */
        @media (max-width: 480px) {
          .hero-left-col h1 { font-size: 28px !important; }
          .hero-left-col > div:nth-child(4) { gap: 20px !important; flex-wrap: wrap !important; }
        }
      `}</style>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0a14; }
      `}</style>
    </div>
  );
}

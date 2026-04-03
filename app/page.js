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

function FAQItem({ question, answer, idx }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (contentRef.current) setHeight(contentRef.current.scrollHeight);
  }, [answer]);
  return (
    <div
      style={{
        background: open ? 'rgba(138,92,246,0.08)' : 'rgba(255,255,255,0.02)',
        border: '1px solid',
        borderColor: open ? 'rgba(168,132,255,0.35)' : 'rgba(255,255,255,0.06)',
        borderRadius: 18, cursor: 'pointer', overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
        marginBottom: 12,
        boxShadow: open ? '0 8px 32px rgba(138,92,246,0.12)' : 'none'
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 28px', fontFamily: "'Jost', sans-serif", fontWeight: 700,
        fontSize: 17, color: open ? '#c4b5fd' : '#e0d6ff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: open ? 'linear-gradient(135deg, #8b5cf6, #a78bfa)' : 'rgba(139,92,246,0.12)',
            color: open ? 'white' : '#a78bfa', fontSize: 13, fontWeight: 800, flexShrink: 0,
            transition: 'all 0.3s'
          }}>{String(idx + 1).padStart(2, '0')}</span>
          <span>{question}</span>
        </div>
        <span style={{
          fontSize: 22, color: '#a78bfa', transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0, marginLeft: 16
        }}>&#9662;</span>
      </div>
      <div ref={contentRef} style={{
        maxHeight: open ? height + 24 : 0, overflow: 'hidden',
        transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), padding 0.4s cubic-bezier(0.4,0,0.2,1)',
        padding: open ? '0 28px 22px 74px' : '0 28px 0 74px'
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

/* Mandala / Oriental ayirici */
function MandalaDivider({ variant = 'default' }) {
  if (variant === 'lotus') {
    return (
      <div style={{ textAlign: 'center', margin: '16px 0 24px', opacity: 0.6 }}>
        <svg width="120" height="24" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 2C60 2 55 8 50 12C55 16 60 22 60 22C60 22 65 16 70 12C65 8 60 2 60 2Z" stroke="#a78bfa" strokeWidth="0.8" fill="rgba(167,139,250,0.08)" />
          <path d="M60 6C60 6 57 10 54 12C57 14 60 18 60 18C60 18 63 14 66 12C63 10 60 6 60 6Z" stroke="#c4b5fd" strokeWidth="0.5" fill="rgba(196,181,253,0.1)" />
          <circle cx="60" cy="12" r="2" fill="#a78bfa" opacity="0.6" />
          <line x1="10" y1="12" x2="48" y2="12" stroke="url(#grad1)" strokeWidth="0.5" />
          <line x1="72" y1="12" x2="110" y2="12" stroke="url(#grad2)" strokeWidth="0.5" />
          <circle cx="10" cy="12" r="1.5" fill="#8b5cf6" opacity="0.3" />
          <circle cx="110" cy="12" r="1.5" fill="#8b5cf6" opacity="0.3" />
          <defs>
            <linearGradient id="grad1" x1="10" y1="12" x2="48" y2="12"><stop stopColor="transparent" /><stop offset="1" stopColor="#a78bfa" stopOpacity="0.5" /></linearGradient>
            <linearGradient id="grad2" x1="72" y1="12" x2="110" y2="12"><stop stopColor="#a78bfa" stopOpacity="0.5" /><stop offset="1" stopColor="transparent" /></linearGradient>
          </defs>
        </svg>
      </div>
    );
  }
  return (
    <div style={{ textAlign: 'center', margin: '12px 0 20px', opacity: 0.5 }}>
      <span style={{ fontSize: 14, color: '#a78bfa', letterSpacing: 12 }}>
        {'\u2727'} {'\u2726'} {'\u2727'}
      </span>
    </div>
  );
}

/* Dekoratif kose susu - mor tema */
function CornerOrnament({ position = 'top-left', color = 'rgba(139,92,246,0.3)' }) {
  const positions = {
    'top-left': { top: -1, left: -1, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    'top-right': { top: -1, right: -1, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
    'bottom-left': { bottom: -1, left: -1, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    'bottom-right': { bottom: -1, right: -1, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
  };
  return (
    <div style={{
      position: 'absolute', width: 28, height: 28, pointerEvents: 'none',
      ...positions[position]
    }} />
  );
}

/* Parlayan badge */
function GlowBadge({ children, color = '#8b5cf6' }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: `rgba(${color === '#8b5cf6' ? '139,92,246' : '212,175,55'},0.1)`,
      border: `1px solid rgba(${color === '#8b5cf6' ? '139,92,246' : '212,175,55'},0.25)`,
      color: color === '#8b5cf6' ? '#c4b5fd' : '#e8d5a3',
      padding: '10px 22px', borderRadius: 30, fontSize: 13, fontWeight: 700,
      letterSpacing: 1.5, textTransform: 'uppercase'
    }}>
      {children}
    </span>
  );
}

/* Floating particle background */
function ParticleField() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 3 + 1,
          height: Math.random() * 3 + 1,
          borderRadius: '50%',
          background: `rgba(${Math.random() > 0.5 ? '167,139,250' : '196,181,253'},${Math.random() * 0.3 + 0.1})`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animation: `particleFloat${i % 4} ${8 + Math.random() * 12}s ease-in-out infinite`,
          animationDelay: `${Math.random() * 5}s`
        }} />
      ))}
    </div>
  );
}

/* Mini demo widget karti */
function DemoWidgetCard({ type, delay = 0 }) {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => setActive(true), delay); obs.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  if (type === 'rating') {
    return (
      <div ref={ref} style={{
        background: 'white', borderRadius: 16, padding: '20px 24px', minWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', transition: 'all 0.8s',
        opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(20px)'
      }}>
        <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 800, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>Aktarmatik Widget</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontWeight: 900, fontSize: 28, color: '#1a1a2e' }}>4.8</span>
          <span style={{ color: '#f59e0b', fontSize: 22 }}>{'\u2605\u2605\u2605\u2605\u2605'}</span>
        </div>
        <div style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>2.341 degerlendirme &middot; 36 soru-cevap</div>
        <div style={{
          marginTop: 10, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 10,
          padding: '8px 14px', fontSize: 13, color: '#92400e', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
          animation: active ? 'pulseGlow 2s infinite' : 'none'
        }}>
          <span style={{ animation: 'pulse 1.5s infinite', display: 'inline-block' }}>{'\uD83D\uDD25'}</span>
          1.847 kisi son 30 gunde satin aldi
        </div>
      </div>
    );
  }

  if (type === 'review') {
    return (
      <div ref={ref} style={{
        background: 'white', borderRadius: 16, padding: '20px 24px', minWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', transition: 'all 0.8s',
        opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(20px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 800
            }}>SM</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>Selin M.</div>
              <div style={{ fontSize: 12, color: '#f59e0b' }}>{'\u2605\u2605\u2605\u2605\u2605'}</div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0 }}>
          Harika bir urun! Dogal icerikler guven veriyor, kizim da cok sevdi.
        </p>
        <div style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 700, marginTop: 8 }}>Trendyol&apos;dan aktarildi</div>
      </div>
    );
  }

  if (type === 'social') {
    return (
      <div ref={ref} style={{
        background: 'white', borderRadius: 16, padding: '20px 24px', minWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', transition: 'all 0.8s',
        opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(20px)'
      }}>
        <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 800, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Canli Sosyal Kanit Widget</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>2.343 kisi bu urunu son 30 gunde satin aldi</span>
        </div>
        {[
          { name: 'Selin M.', text: 'Kizim icin aldim, bayildi! Dogal icerikler guven veriyor.', stars: 5 },
          { name: 'Hakan B.', text: 'Ilk deneyimim, simdiden farki goruyorum.', stars: 5 },
          { name: 'Gamze O.', text: 'Anneme hediye aldim, o bile cok begendi!', stars: 5 },
        ].map((r, i) => (
          <div key={i} style={{
            padding: '12px 0', borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            opacity: active ? 1 : 0, transition: `opacity 0.6s ease ${(i + 1) * 300}ms`
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e' }}>{r.name}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{r.text}</div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Trendyol&apos;dan aktarildi &middot; Az once</div>
            </div>
            <span style={{ color: '#f59e0b', fontSize: 12, flexShrink: 0 }}>{'\u2605'.repeat(r.stars)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'qa') {
    return (
      <div ref={ref} style={{
        background: 'white', borderRadius: 16, padding: '20px 24px', minWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', transition: 'all 0.8s',
        opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(20px)'
      }}>
        <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 800, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>Soru & Cevap Widget</div>
        {[
          { q: 'Hassas ciltlere uygun mu?', a: 'Evet, dermatolog testinden gecmistir. Hassas ciltler icin ozel formullu.' },
          { q: 'Kac ml geliyor?', a: '50ml standart boy. Gunluk kullanim ile 2-3 ay yeterli.' },
        ].map((item, i) => (
          <div key={i} style={{
            marginBottom: 12, padding: '12px', background: '#f8f7ff', borderRadius: 10,
            opacity: active ? 1 : 0, transition: `opacity 0.6s ease ${(i + 1) * 400}ms`
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
              <span style={{ color: '#8b5cf6', marginRight: 6 }}>S:</span>{item.q}
            </div>
            <div style={{ fontSize: 13, color: '#555' }}>
              <span style={{ color: '#10b981', fontWeight: 700, marginRight: 6 }}>C:</span>{item.a}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'sentiment') {
    return (
      <div ref={ref} style={{
        background: 'white', borderRadius: 16, padding: '20px 24px', minWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', transition: 'all 0.8s',
        opacity: active ? 1 : 0, transform: active ? 'translateY(0)' : 'translateY(20px)'
      }}>
        <div style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 800, letterSpacing: 1.5, marginBottom: 14, textTransform: 'uppercase' }}>AI Duygu Analizi</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>{'\u2713'} Olumlu Noktalar</div>
          {['Kalitesi harika', 'Kargo hizli', 'Dogal icerikler', 'Fiyat/performans'].map((t, i) => (
            <span key={i} style={{
              display: 'inline-block', background: '#ecfdf5', color: '#065f46', fontSize: 12, fontWeight: 600,
              padding: '4px 10px', borderRadius: 6, margin: '2px 4px 2px 0'
            }}>{t}</span>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>{'\u26A0'} Dikkat Edilecekler</div>
          {['Ambalaj ince'].map((t, i) => (
            <span key={i} style={{
              display: 'inline-block', background: '#fffbeb', color: '#92400e', fontSize: 12, fontWeight: 600,
              padding: '4px 10px', borderRadius: 6, margin: '2px 4px 2px 0'
            }}>{t}</span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* Canli sayac bantlari */
function LiveCounterBand({ items }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(p => (p + 1) % items.length), 3500);
    return () => clearInterval(iv);
  }, [items.length]);
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(167,139,250,0.1))',
      border: '1px solid rgba(139,92,246,0.2)',
      borderRadius: 14, padding: '14px 24px', position: 'relative', overflow: 'hidden'
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          position: i === idx ? 'relative' : 'absolute',
          opacity: i === idx ? 1 : 0,
          transform: i === idx ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
          fontSize: 14, fontWeight: 700, color: '#c4b5fd'
        }}>
          <span style={{ fontSize: 18 }}>{item.icon}</span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
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
  const [activeTab, setActiveTab] = useState('yorumlar');
  const [activePlatform, setActivePlatform] = useState(0);
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
          if (step > 6) { clearInterval(iv); return; }
          setDemoStep(step);
        }, 800);
      }
    }, { threshold: 0.2 });
    if (demoRef.current) obs.observe(demoRef.current);
    return () => obs.disconnect();
  }, [demoStarted]);

  // Platform carousel
  useEffect(() => {
    const iv = setInterval(() => setActivePlatform(p => (p + 1) % 4), 4000);
    return () => clearInterval(iv);
  }, []);

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

  /* ─── RENKLER (MOR AGIRLIKLI) ─── */
  const C = {
    bg: '#0a0612',
    bgAlt: '#0f0a1a',
    purple: '#8b5cf6',
    purpleLight: '#c4b5fd',
    purpleBright: '#a78bfa',
    purpleDeep: '#6d28d9',
    purpleDark: '#4c1d95',
    violet: '#7c3aed',
    gold: '#d4af37',
    goldLight: '#e8d5a3',
    goldGlow: 'rgba(212,175,55,0.15)',
    pink: '#e879f9',
    fuchsia: '#d946ef',
    green: '#10b981',
    emerald: '#34d399',
    textPrimary: '#f5f0ff',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: 'rgba(255,255,255,0.4)',
    cardBg: 'rgba(139,92,246,0.04)',
    cardBorder: 'rgba(139,92,246,0.12)',
    cardBgHover: 'rgba(139,92,246,0.08)',
  };

  const sampleReviews = [
    { name: 'E*** K***', date: '28.03.2026', stars: 5, text: 'Kalitesi harika, beklentimin cok ustunde. Herkese tavsiye ederim.' },
    { name: 'A*** Y***', date: '15.03.2026', stars: 5, text: 'Urun tam aciklamada yazdigi gibi. Kullanimi cok kolay.' },
    { name: 'M*** D***', date: '02.03.2026', stars: 4, text: 'Gayet basarili bir urun. Fiyat performans orani cok iyi.' },
  ];

  const allFeatures = [
    {
      icon: '\u2B50', title: 'Yorum & Puanlama Aktarimi',
      desc: 'Trendyol, Hepsiburada ve Amazon\'daki tum musteri yorumlarini, yildiz puanlarini ve degerlendirme sayilarini kendi e-ticaret sitenizde otomatik olarak gosterin. Musterileriniz baska bir platforma gitmeden, urun sayfanizda binlerce gercek yorum gorebilir.',
      highlight: 'Ortalama %38 donusum artisi'
    },
    {
      icon: '\uD83D\uDD25', title: 'Canli Sosyal Kanit Bandi',
      desc: '"2.343 kisi bu urunu son 30 gunde satin aldi", "847 kisi favorilerine ekledi", "156 kisi simdi sepetinde" gibi guclu sosyal kanit mesajlarini canli olarak gosterin. Her 3.5 saniyede donusumlü mesajlar ile musterilerinizin guvenini kazanin.',
      highlight: 'Sepet terk oranlari %22 azaldi'
    },
    {
      icon: '\u2753', title: 'Soru & Cevap Entegrasyonu',
      desc: 'Trendyol\'daki soru-cevap bolumunu urun sayfaniza otomatik aktarin. Musteriler satin alma kararini vermeden once en cok merak edilen sorularin cevaplarini gorebilir. Bu, iade oranlarini azaltir ve musteri memnuniyetini arttirir.',
      highlight: 'Iade oranlari %15 dustu'
    },
    {
      icon: '\uD83D\uDCCA', title: 'Tavsiye Orani Gosterimi',
      desc: '"Alicilarin %96\'si bu urunu tavsiye ediyor" gibi guclu sosyal kanit mesajlari ile musterilerinize guven aslayin. Gercek Trendyol verilerinden hesaplanan tavsiye oranlari, potansiyel alicilarin kararlarini olumlu yonde etkiler.',
      highlight: 'Guven %45 artti'
    },
    {
      icon: '\uD83C\uDFA8', title: 'Tema & Tasarim Uyumu',
      desc: 'Widget otomatik olarak sitenizin tasarimina uyum saglar. Acik tema, koyu tema ve dogal tema secenekleri ile markanizla mukemmel uyum. Ozel CSS destegi ile her detayi kisisellestirin. Sitenizin bir parcasi gibi gorunur, dis eklenti gibi hissettirmez.',
      highlight: 'Sifir tasarim calismasi'
    },
    {
      icon: '\uD83D\uDD17', title: 'Coklu Platform Destegi',
      desc: 'ikas, Shopify, WordPress, WooCommerce, IdeaSoft, Ticimax, T-Soft ve ozel yazilim altyapilari dahil tum e-ticaret platformlariyla uyumludur. Tek satir JavaScript kodu ile her platformda calisir. Platform degistirseniz bile kodunuz ayni kalir.',
      highlight: '8+ platform destegi'
    },
    {
      icon: '\u26A1', title: 'Otomatik Veri Guncelleme',
      desc: 'Trendyol\'daki yeni yorumlar, puan degisiklikleri, satis sayilari ve sosyal kanit verileri her 6 saatte otomatik guncellenir. Siz hicbir sey yapmadan siteniz her zaman guncel kalir. Yeni gelen yorumlar aninda yansitilir.',
      highlight: 'Her 6 saatte oto-guncelleme'
    },
    {
      icon: '\uD83E\uDDE0', title: 'AI Duygu Analizi',
      desc: 'Yapay zeka destekli duygu analizi ile binlerce yorumu otomatik olarak kategorize edin. Olumlu ve olumsuz noktalari ozetleyin. Musterileriniz tek bakista urunun guclu ve zayif yonlerini gorebilir. "Kalitesi harika", "Kargo hizli" gibi etiketler otomatik olusturulur.',
      highlight: 'Akilli yorum ozeti'
    },
    {
      icon: '\uD83D\uDCF1', title: 'Mobil Oncelikli Tasarim',
      desc: 'Widget tamamen responsive tasarimlidir ve mobil cihazlarda mukemmel gorunur. E-ticaret trafiginizin %70\'inden fazlasi mobil cihazlardan gelir. Aktarmatik widget\'i, mobil deneyimi oncelikli olarak tasarlanmistir. Touch-friendly arayuz ile kusursuz deneyim.',
      highlight: '%100 responsive'
    },
    {
      icon: '\uD83D\uDE80', title: 'Sifir Performans Etkisi',
      desc: 'Widget asenkron yuklenir ve sitenizin sayfa hizini ASLA etkilemez. Lazy loading ve cache mekanizmalari ile optimize edilmistir. Google Core Web Vitals puanlariniz etkilenmez. PageSpeed skorunuzda sifir dusus garantisi.',
      highlight: 'Google PageSpeed 100 uyumlu'
    },
    {
      icon: '\uD83D\uDCE6', title: 'Toplu Urun Yonetimi',
      desc: 'Tek tek URL eslestirmek yerine toplu yukleme ozelligini kullanin. CSV, Excel veya API ile yuzlerce urununuzu tek seferde eslestirin. Yeni urunler eklendiginde otomatik tespit ve oneri sistemi ile zamandan tasarruf edin.',
      highlight: 'Toplu islem destegi'
    },
    {
      icon: '\uD83D\uDD12', title: 'Guvenli & KVKK Uyumlu',
      desc: 'Tum veriler sifrelenmis baglanti (SSL/TLS) ile iletilir. Kisisel veriler KVKK ve GDPR uyumlu olarak islenir. Kullanici isimleri otomatik maskelenir (E*** K*** gibi). Verileriniz Turkiye\'deki sunucularda guvenle saklanir.',
      highlight: 'KVKK/GDPR uyumlu'
    },
  ];

  const testimonials = [
    { initials: 'AK', name: 'Ahmet Kaya', role: 'Dogal Yasam Kozmetik — Kurucu', text: 'Trendyol\'daki 4.9 puanimizi sitemizde gostermeye basladiktan sonra donusum oranimiz %38 artti. Musteriler artik dogrudan bizden siparis veriyor. Pazar yeri komisyonu olmadan satis yapmak inanilmaz.', stat: '%38', statLabel: 'Donusum Artisi' },
    { initials: 'SY', name: 'Selin Yilmaz', role: 'BebekDunyasi — E-Ticaret Muduru', text: 'Kurulumu gercekten 3 dakika surdu. Teknik bilgim olmamasina ragmen tek satir kodla widget\'i sitemize ekledik. Sosyal kanit etkisi inanilmaz. Sepet doldurma orani ciddi artti.', stat: '3dk', statLabel: 'Kurulum Suresi' },
    { initials: 'MO', name: 'Murat Ozdemir', role: 'TeknoPlus Elektronik — Genel Mudur', text: 'Sepet terk oranimiz %22 dustu. Musteriler urun sayfasinda Trendyol yorumlarini gorunce guvenip alisverisi tamamliyor. ROI\'miz ilk ayda bile positif.', stat: '%22', statLabel: 'Sepet Terk Azalisi' },
    { initials: 'EB', name: 'Elif Bozkurt', role: 'GlowBeauty — Dijital Pazarlama', text: 'Rakiplerimizden farkimizi ortaya koyduk. 4.8 yildiz puanimiz ve 3000+ gercek yorum sitenizde gorunur olunca, musteriler baska yere bakmiyor bile. Marka guvenilirligi tavana vurdu.', stat: '3000+', statLabel: 'Aktarilan Yorum' },
    { initials: 'CK', name: 'Can Karaca', role: 'FitSupp — Kurucu Ortak', text: 'Supplement sektorunde guven her sey. Trendyol\'daki kullanici deneyimlerini sitemizde gostermek, potansiyel musterilerin en buyuk cekingesini ortadan kaldirdi. Sifir teknik bilgiyle kurduk.', stat: '%45', statLabel: 'Guven Artisi' },
    { initials: 'DA', name: 'Deniz Arslan', role: 'PetMama — E-Ticaret Yoneticisi', text: 'Evcil hayvan urunlerinde yorumlar cok onemli. Trendyol\'daki detayli kullanici deneyimlerini sitemizde gostermek satislari patlatti. Ozellikle foto yorumlar cok etkili oluyor.', stat: '%52', statLabel: 'Satis Artisi' },
  ];

  const faqs = [
    { q: 'Aktarmatik nedir ve ne ise yarar?', a: 'Aktarmatik, Trendyol, Hepsiburada ve Amazon gibi pazar yerlerindeki musteri yorumlarini, puanlari, soru-cevaplari ve sosyal kanit verilerini (favori sayisi, sepet sayisi, satis adedi) kendi e-ticaret sitenizde otomatik olarak gosteren bir widget platformudur. Tek satir JavaScript kodu ile sitenize entegre olur ve musterilerinizin guvenini kazanmaniza yardimci olur.' },
    { q: 'Hangi e-ticaret platformlariyla calisir?', a: 'ikas, Shopify, WordPress (WooCommerce), IdeaSoft, Ticimax, T-Soft ve ozel yazilim altyapilari dahil tum populer e-ticaret platformlariyla uyumludur. Tek satir JavaScript kodu ile her platformda calisir. Platform degistirseniz bile kodunuz ayni kalir — tasinmaniz gerekmiyor.' },
    { q: 'Kurulum ne kadar surer ve teknik bilgi gerekir mi?', a: 'Kurulum ortalama 3 dakika surer ve SIFIR teknik bilgi gerektirir. Script kodunuzu sitenize ekleyin (kopyala-yapistir), panelimizden Trendyol URL\'lerini sitenizin URL\'leriyle eslestirin, gerisini Aktarmatik halleder. Video rehberimiz adim adim yonlendirir.' },
    { q: 'Veriler ne siklikla guncellenir?', a: 'Trendyol\'daki yeni yorumlar, puan degisiklikleri ve sosyal kanit verileri her 6 saatte otomatik guncellenir. Siz hicbir sey yapmaniza gerek kalmadan siteniz her zaman guncel kalir. Acil guncelleme gerektiginde manuel tetikleme de yapabilirsiniz.' },
    { q: 'Sitemin hizini veya SEO\'sunu etkiler mi?', a: 'Hayir, kesinlikle etkilemez. Widget asenkron yuklenir, lazy loading kullanir ve sitenizin sayfa hizini etkilemez. Google Core Web Vitals ve PageSpeed skorlarinizda herhangi bir dusus yasamazsiniz. Ustelik zengin yorum icerigi SEO\'nuza katki saglar — Google bot\'lari bu icerikleri okuyabilir.' },
    { q: 'Hangi verileri aktarabiliyorsunuz?', a: 'Yildiz puanlari ve genel ortalama, tum musteri yorumlari (metin + tarih), musteri fotograflari, soru-cevap bolumleri, sosyal kanit verileri (satis adedi, favori sayisi, sepet sayisi), tavsiye oranlari ve AI destekli duygu analizi (olumlu/olumsuz nokta ozetleri). Kisacasi Trendyol\'da gorunen her sey.' },
    { q: 'Bir urun icin kac yorum aktarilir?', a: 'Sinir yoktur. Bir urunde 50 yorum varsa 50, 5.000 yorum varsa 5.000 yorumun tamami aktarilir. Tum yorumlar sayfalama (pagination) ile duzgun sekilde gosterilir. Musteriler istedikleri kadar yorum okuyabilir.' },
    { q: 'KVKK ve gizlilik politikasina uygun mu?', a: 'Evet. Tum kisisel veriler KVKK ve GDPR uyumlu olarak islenir. Kullanici isimleri otomatik maskelenir (E*** K*** gibi). Veriler SSL/TLS sifrelenmis baglanti ile iletilir. IP adresleri ve kisisel bilgiler saklanmaz. Turkiye\'deki sunucularda host edilir.' },
    { q: 'Hizmeti nasil deneyebilirim?', a: 'Formu doldurarak veya bizi arayarak ucretsiz demo talebinde bulunabilirsiniz. Ekibimiz sizin icin ornek bir entegrasyon hazirlayarak sonuclari canli gosterir. Begenirseniz devam ederiz — hicbir baglayici taahhut yoktur.' },
    { q: 'Trendyol disinda baska platformlardan da yorum cekebilir misiniz?', a: 'Evet! Trendyol\'un yani sira Hepsiburada, Amazon Turkiye ve diger pazar yerlerinden de yorum aktarimi yapabiliyoruz. Birden fazla pazar yerindeki yorumlarinizi tek bir widget\'ta birlestirerek sitenizde gosterebilirsiniz.' },
    { q: 'Widget tasarimini sitemize uygun olarak degistirebilir miyiz?', a: 'Evet. Acik tema, koyu tema ve dogal tema secenekleri mevcuttur. Widget otomatik olarak sitenizin tasarimina uyum saglar. Ayrica ozel CSS destegi ile renk, font, kenar yuvarlakligi gibi her detayi kisisellestirmeniz mumkundur. Markaniza ozel tasarim desteği de sunuyoruz.' },
    { q: 'Nasil baslayabilirim?', a: 'Cok basit! Sayfadaki formu doldurarak veya bizi 0850 309 20 49 numarasindan arayarak hizmet talebinde bulunabilirsiniz. Ekibimiz 24 saat icinde size donus yapar, sitenize ozel canli demo hazirlayarak nasil calistigini gosterir.' },
  ];

  const platforms = [
    { name: 'ikas', desc: 'ikas paneli > Tema > Kod Duzenle bolumunden tek satirlik kodu ekleyin. Otomatik URL eslestirme destegi.', code: '<!-- ikas Tema Ayarlari > Kod -->\n<script src="https://cdn.aktarmatik.com/w.js"></script>' },
    { name: 'Shopify', desc: 'Shopify Admin > Temalar > Kod Duzenle > theme.liquid dosyasina ekleyin. Shopify uyumlu lazy loading.', code: '<!-- Shopify theme.liquid -->\n<script src="https://cdn.aktarmatik.com/w.js" defer></script>' },
    { name: 'WordPress', desc: 'Footer.php veya eklenti ile ekleyin. WooCommerce urun sayfalariyla otomatik entegrasyon.', code: '<!-- WordPress footer.php -->\n<script src="https://cdn.aktarmatik.com/w.js"></script>' },
    { name: 'IdeaSoft', desc: 'IdeaSoft Tema Kod Duzenleyici\'den ekleyin. Tum tema versiyonlariyla uyumlu.', code: '<!-- IdeaSoft Tema Kodu -->\n<script src="https://cdn.aktarmatik.com/w.js"></script>' },
  ];

  /* ─── MANDALA SVG PATTERN (background) ─── */
  const mandalaPattern = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(139,92,246,0.03)' stroke-width='0.5'%3E%3Ccircle cx='50' cy='50' r='40'/%3E%3Ccircle cx='50' cy='50' r='28'/%3E%3Ccircle cx='50' cy='50' r='16'/%3E%3Ccircle cx='50' cy='50' r='6'/%3E%3Cpath d='M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M78 22 L22 78'/%3E%3Cpath d='M50 10 Q65 35 90 50 Q65 65 50 90 Q35 65 10 50 Q35 35 50 10Z'/%3E%3C/g%3E%3C/svg%3E")`;

  const orientalBorder = `url("data:image/svg+xml,%3Csvg width='60' height='8' viewBox='0 0 60 8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 4 Q7.5 0 15 4 Q22.5 8 30 4 Q37.5 0 45 4 Q52.5 8 60 4' fill='none' stroke='rgba(139,92,246,0.15)' stroke-width='1'/%3E%3C/svg%3E")`;

  return (
    <div style={{ fontFamily: "'Jost', sans-serif", color: C.textPrimary, background: C.bg, overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ──── FLOATING GRADIENT ORBS ──── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 800, height: 800, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)',
          top: '-15%', right: '-10%', filter: 'blur(120px)',
          animation: 'orbFloat1 10s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)',
          bottom: '5%', left: '-10%', filter: 'blur(100px)',
          animation: 'orbFloat2 12s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217,70,239,0.06), transparent 70%)',
          top: '40%', left: '30%', filter: 'blur(80px)',
          animation: 'orbFloat3 8s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,175,55,0.05), transparent 70%)',
          top: '60%', right: '10%', filter: 'blur(100px)',
          animation: 'orbFloat1 14s ease-in-out infinite'
        }} />
      </div>

      {/* ──── NAVBAR ──── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(10,6,18,0.95)' : 'rgba(10,6,18,0.4)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)'}`,
        transition: 'all 0.4s ease'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="#" style={{
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 800, fontSize: 22,
            color: C.purpleLight, textDecoration: 'none', letterSpacing: -0.5,
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{ fontSize: 28, color: C.purpleBright, animation: 'mandalaSpin 20s linear infinite' }}>{'\u2726'}</span>
            <div>
              <div style={{ lineHeight: 1.1 }}>AKTARMATIK</div>
              <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, color: 'rgba(167,139,250,0.5)', fontWeight: 500, letterSpacing: 2.5, textTransform: 'uppercase' }}>by Morfil Medya</div>
            </div>
          </a>
          <button className="mob-btn" onClick={() => setMobileMenu(!mobileMenu)} style={{
            display: 'none', background: 'none', border: 'none', fontSize: 28, cursor: 'pointer', color: C.purpleLight
          }}>
            {mobileMenu ? '\u2715' : '\u2630'}
          </button>
          <div className={`nav-links ${mobileMenu ? 'nav-open' : ''}`} style={{
            display: 'flex', alignItems: 'center', gap: 30
          }}>
            {[
              { label: 'Demo', href: '#demo' },
              { label: 'Ozellikler', href: '#ozellikler' },
              { label: 'Nasil Calisir', href: '#nasil-calisir' },
              { label: 'Platformlar', href: '#platformlar' },
              { label: 'Yorumlar', href: '#yorumlar' },
              { label: 'SSS', href: '#sss' },
            ].map(link => (
              <a key={link.href} href={link.href} onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 14, fontWeight: 600, transition: 'color 0.3s' }}>{link.label}</a>
            ))}
            <a href="#" onClick={scrollToForm} style={{
              padding: '10px 26px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              textDecoration: 'none', color: 'white', cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)', transition: 'all 0.3s',
              fontFamily: "'Jost', sans-serif"
            }}>Demo Talep Et</a>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenu && (
        <div style={{
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 999,
          background: 'rgba(10,6,18,0.98)', backdropFilter: 'blur(20px)',
          padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 18,
          borderBottom: '1px solid rgba(139,92,246,0.15)'
        }}>
          {['Demo', 'Ozellikler', 'Nasil Calisir', 'Platformlar', 'Yorumlar', 'SSS'].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenu(false)} style={{ textDecoration: 'none', color: C.textSecondary, fontSize: 17, fontWeight: 600 }}>{label}</a>
          ))}
          <a href="#" onClick={(e) => { scrollToForm(e); setMobileMenu(false); }} style={{
            textAlign: 'center', display: 'block', padding: '12px 26px', borderRadius: 10,
            fontWeight: 700, fontSize: 14, color: 'white', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
            textDecoration: 'none'
          }}>Demo Talep Et</a>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HERO SECTION
         ══════════════════════════════════════════════════════════ */}
      <section ref={formRef} id="hero" style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        overflow: 'hidden', backgroundImage: mandalaPattern
      }}>
        <ParticleField />
        {/* Decorative mandala circle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 800, height: 800, borderRadius: '50%', pointerEvents: 'none',
          border: '1px solid rgba(139,92,246,0.06)',
          animation: 'mandalaSpin 40s linear infinite'
        }}>
          <div style={{
            position: 'absolute', inset: 60, borderRadius: '50%',
            border: '1px solid rgba(139,92,246,0.04)',
          }} />
          <div style={{
            position: 'absolute', inset: 120, borderRadius: '50%',
            border: '1px solid rgba(139,92,246,0.03)',
          }} />
        </div>

        <div style={{
          maxWidth: 1200, margin: '0 auto', padding: '140px 28px 80px',
          display: 'flex', alignItems: 'flex-start', gap: 60,
          position: 'relative', zIndex: 1, width: '100%'
        }} className="hero-flex">
          {/* SOL: Hero content */}
          <div style={{ flex: 1.1 }} className="hero-left-col">
            <GlowBadge>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              E-Ticaret Sosyal Kanit
            </GlowBadge>

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px, 5vw, 64px)', fontWeight: 800,
              lineHeight: 1.06, marginBottom: 24, marginTop: 28, color: 'white', letterSpacing: -2
            }}>
              Trendyol Yorumlarini{' '}
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #c084fc, #e879f9, #8b5cf6)',
                backgroundSize: '300% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'shimmer 4s linear infinite'
              }}>E-Ticaret Sitenize</span>{' '}
              <span style={{ fontStyle: 'italic', color: C.goldLight }}>Tasiyin</span>
            </h1>
            <p style={{ fontSize: 19, color: C.textSecondary, lineHeight: 1.8, marginBottom: 32, maxWidth: 500, fontWeight: 400 }}>
              Trendyol, Hepsiburada ve pazaryeri yorumlarini otomatik olarak
              kendi e-ticaret sitenize aktarin. Sosyal kanit gucuyle donusum
              oranlarinizi katlayin.
            </p>

            {/* Feature list */}
            <div style={{ marginBottom: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Yildiz puanlama, musteri yorumlari ve soru-cevap widget\'lari',
                'Canli sosyal kanit bandi ile anlik bildirimler',
                'ikas, Shopify, WordPress ve IdeaSoft destegi',
                'Otomatik senkronizasyon, sifir teknik bilgi gerektirir',
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(167,139,250,0.1))',
                    border: '1px solid rgba(139,92,246,0.3)', flexShrink: 0
                  }}>
                    <span style={{ color: '#a78bfa', fontSize: 11 }}>{'\u2713'}</span>
                  </span>
                  <span style={{ fontSize: 15, color: C.textSecondary, fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 40, marginBottom: 40, flexWrap: 'wrap' }}>
              {[
                { val: <><span style={{ color: '#f59e0b', marginRight: 4 }}>{'\u2605'}</span><AnimatedCounter target={4.8} decimals={1} /></>, label: 'Ortalama Puan' },
                { val: <AnimatedCounter target={45} suffix="%" />, label: 'Donusum Artisi' },
                { val: <AnimatedCounter target={3} suffix="dk" />, label: 'Kurulum Suresi' },
                { val: <AnimatedCounter target={1847} prefix="" />, label: 'Aktarilan Yorum' },
              ].map((stat, i) => (
                <div key={i}>
                  <div style={{ fontSize: 30, fontWeight: 800, color: C.purpleBright, fontFamily: "'Jost', sans-serif" }}>{stat.val}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
              <a href="#" onClick={scrollToForm} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 36px', borderRadius: 14, fontWeight: 800, fontSize: 16,
                textDecoration: 'none', color: 'white', cursor: 'pointer', border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                boxShadow: '0 8px 30px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.1)',
                transition: 'all 0.3s', fontFamily: "'Jost', sans-serif"
              }} className="submit-btn">Aktarmatik&apos;i Incele {'\u2192'}</a>
              <a href="tel:08503092049" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '16px 32px', borderRadius: 14, fontWeight: 700, fontSize: 16,
                textDecoration: 'none', color: C.purpleLight,
                border: '1px solid rgba(139,92,246,0.3)',
                transition: 'all 0.3s', fontFamily: "'Jost', sans-serif"
              }}>{'\uD83D\uDCDE'} 0850 309 20 49</a>
            </div>
          </div>

          {/* SAG: Form */}
          <div style={{ flex: 0.9, maxWidth: 440, position: 'relative' }} className="hero-right-col">
            <div style={{
              background: 'rgba(15,10,26,0.85)', border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 80px rgba(139,92,246,0.08)',
              backdropFilter: 'blur(20px)'
            }}>
              <CornerOrnament position="top-left" />
              <CornerOrnament position="top-right" />
              <CornerOrnament position="bottom-left" />
              <CornerOrnament position="bottom-right" />
              <div style={{
                position: 'absolute', top: -60, right: -60, width: 200, height: 200,
                background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent 70%)',
                borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
              }} />
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 800,
                color: C.purpleLight, marginBottom: 4, position: 'relative'
              }}>Ucretsiz Demo Talep Edin</h3>
              <MandalaDivider variant="lotus" />
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
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(167,139,250,0.7)', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      {f.label} {f.req && '*'}
                    </label>
                    <input
                      type={f.type} name={f.name} placeholder={f.ph} required={f.req}
                      style={{
                        width: '100%', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                        borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 15, fontWeight: 500,
                        fontFamily: "'Jost', sans-serif", outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
                        boxSizing: 'border-box'
                      }}
                      className="form-input"
                    />
                  </div>
                ))}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'rgba(167,139,250,0.7)', marginBottom: 5, letterSpacing: 0.5, textTransform: 'uppercase' }}>Mesaj</label>
                  <textarea
                    name="Mesaj" rows={3} placeholder="Hizmet hakkinda sormak istedikleriniz..."
                    style={{
                      width: '100%', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)',
                      borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 15, fontWeight: 500,
                      fontFamily: "'Jost', sans-serif", outline: 'none', resize: 'vertical',
                      transition: 'border-color 0.3s, box-shadow 0.3s', boxSizing: 'border-box'
                    }}
                    className="form-input"
                  />
                </div>
                <button type="submit" style={{
                  width: '100%', textAlign: 'center', padding: '15px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  color: 'white', borderRadius: 12, fontWeight: 800, fontSize: 16,
                  border: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif",
                  boxShadow: '0 8px 30px rgba(139,92,246,0.35)', transition: 'all 0.3s',
                  letterSpacing: 0.5
                }} className="submit-btn">Hizmet Talep Et {'\u2192'}</button>
              </form>
              <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 18 }}>
                  <a href="tel:08503092049" style={{ fontSize: 14, color: C.purpleBright, textDecoration: 'none', fontWeight: 700 }}>
                    {'\uD83D\uDCDE'} 0850 309 20 49
                  </a>
                  <a href="tel:05407275757" style={{ fontSize: 14, color: C.purpleBright, textDecoration: 'none', fontWeight: 700 }}>
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

      {/* ──── ORIENTAL DIVIDER ──── */}
      <div style={{
        textAlign: 'center', padding: '24px 0',
        background: 'linear-gradient(180deg, rgba(139,92,246,0.03), transparent)',
        borderTop: '1px solid rgba(139,92,246,0.08)',
        borderBottom: '1px solid rgba(139,92,246,0.08)',
        backgroundImage: orientalBorder, backgroundRepeat: 'repeat-x', backgroundPosition: 'center'
      }}>
        <span style={{ fontSize: 20, color: C.purpleBright, letterSpacing: 16, opacity: 0.5 }}>
          {'\u2726'} {'\u2022'} {'\u2727'} {'\u2022'} {'\u2726'}
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════
          CANLI DEMO BOLUMLERI
         ══════════════════════════════════════════════════════════ */}
      <section id="demo" style={{
        padding: '120px 28px', position: 'relative',
        background: `linear-gradient(180deg, ${C.bg}, ${C.bgAlt})`,
        backgroundImage: mandalaPattern
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <GlowBadge>{'\u2726'} Canli Demo {'\u2726'}</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Widget&apos;lerimizi Canli Gorun</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 600, margin: '0 auto', fontWeight: 400 }}>
                Her bir widget, e-ticaret sitenizin farkli bir alanini guclendirmek icin tasarlandi.
                Asagida gercek hayattan orneklerle nasil calistiklarini kesfedebilirsiniz.
              </p>
            </div>
          </ScrollReveal>

          {/* Demo Grid - Widget ornekleri */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 40, marginBottom: 100 }} className="demo-grid">

            {/* Demo 1: Rating Widget */}
            <ScrollReveal delay={0}>
              <div style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24,
                padding: '40px 32px', position: 'relative', overflow: 'hidden'
              }}>
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 800,
                  color: C.purpleLight, marginBottom: 8
                }}>Puanlama & Degerlendirme</h3>
                <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24, lineHeight: 1.7 }}>
                  Trendyol&apos;daki yildiz puanlarinizi, degerlendirme sayilarinizi ve genel ortalamanizi urun sayfanizda gorunur kilin.
                </p>
                <DemoWidgetCard type="rating" delay={200} />
              </div>
            </ScrollReveal>

            {/* Demo 2: Review Cards */}
            <ScrollReveal delay={200}>
              <div style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24,
                padding: '40px 32px', position: 'relative', overflow: 'hidden'
              }}>
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 800,
                  color: C.purpleLight, marginBottom: 8
                }}>Musteri Yorum Kartlari</h3>
                <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24, lineHeight: 1.7 }}>
                  Gercek musteri deneyimlerini guzel kartlarla gosterin. Avatar, puan ve kaynak bilgisi ile tam seffaflik.
                </p>
                <DemoWidgetCard type="review" delay={400} />
              </div>
            </ScrollReveal>

            {/* Demo 3: Social Proof */}
            <ScrollReveal delay={400}>
              <div style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24,
                padding: '40px 32px', position: 'relative', overflow: 'hidden'
              }}>
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 800,
                  color: C.purpleLight, marginBottom: 8
                }}>Canli Sosyal Kanit Widget</h3>
                <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24, lineHeight: 1.7 }}>
                  Canli satis verileri, yorumlar ve puanlar tek bir panelde. Musterileriniz gercek zamanlida neler oldugunu gorur.
                </p>
                <DemoWidgetCard type="social" delay={600} />
              </div>
            </ScrollReveal>

            {/* Demo 4: Q&A */}
            <ScrollReveal delay={600}>
              <div style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24,
                padding: '40px 32px', position: 'relative', overflow: 'hidden'
              }}>
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 800,
                  color: C.purpleLight, marginBottom: 8
                }}>Soru & Cevap Entegrasyonu</h3>
                <p style={{ fontSize: 15, color: C.textSecondary, marginBottom: 24, lineHeight: 1.7 }}>
                  Trendyol&apos;daki soru-cevaplari otomatik aktarin. Musteriler satin alma oncesi merak ettiklerini ogrensin.
                </p>
                <DemoWidgetCard type="qa" delay={800} />
              </div>
            </ScrollReveal>
          </div>

          {/* Demo 5: AI Sentiment - Tam genislik */}
          <ScrollReveal delay={200}>
            <div style={{
              background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 24,
              padding: '48px 40px', position: 'relative', overflow: 'hidden',
              display: 'flex', gap: 48, alignItems: 'center', marginBottom: 80
            }} className="sentiment-flex">
              <CornerOrnament position="top-left" />
              <CornerOrnament position="top-right" />
              <CornerOrnament position="bottom-left" />
              <CornerOrnament position="bottom-right" />
              <div style={{ flex: 1 }}>
                <GlowBadge color="#d4af37">{'\uD83E\uDDE0'} Yapay Zeka Destekli</GlowBadge>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 800,
                  color: 'white', marginTop: 20, marginBottom: 12
                }}>AI Duygu Analizi</h3>
                <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.8, marginBottom: 20 }}>
                  Binlerce yorumu yapay zeka ile analiz ederek olumlu ve olumsuz noktalari otomatik cikarin.
                  Musterileriniz tek bakista urunun guclu ve zayif yonlerini gorebilir. Her yorum otomatik kategorize edilir.
                </p>
                <LiveCounterBand items={[
                  { icon: '\u2713', text: 'Olumlu: "Kalite harika", "Kargo hizli"' },
                  { icon: '\u26A0', text: 'Dikkat: "Ambalaj ince olabilir"' },
                  { icon: '\uD83D\uDCCA', text: '%94 olumlu yorum orani' },
                  { icon: '\uD83E\uDDE0', text: 'AI ile 2.341 yorum analiz edildi' },
                ]} />
              </div>
              <div style={{ flex: 0, flexShrink: 0 }}>
                <DemoWidgetCard type="sentiment" delay={400} />
              </div>
            </div>
          </ScrollReveal>

          {/* Animasyonlu Widget Onizleme (Mevcut) */}
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: 'white', marginBottom: 8
              }}>Adim Adim Widget Animasyonu</h3>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
                Widget&apos;in sitenizde nasil gorunecegini adim adim izleyin
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div ref={demoRef} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(139,92,246,0.15)',
              borderRadius: 24, maxWidth: 520, margin: '0 auto 80px', padding: 0, overflow: 'hidden',
              boxShadow: '0 30px 80px rgba(0,0,0,0.3), 0 0 60px rgba(139,92,246,0.05)',
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
              {/* Widget area */}
              <div style={{ background: 'white', padding: '16px 24px 24px' }}>
                <div style={{
                  fontSize: 10, color: '#8b5cf6', fontWeight: 800, letterSpacing: 1.5,
                  marginBottom: 12, textTransform: 'uppercase',
                  opacity: demoStep >= 1 ? 1 : 0, transition: 'opacity 0.6s'
                }}>AKTARMATIK WIDGET</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                  opacity: demoStep >= 1 ? 1 : 0, transition: 'opacity 0.6s ease 0.2s'
                }}>
                  <span style={{ fontWeight: 900, fontSize: 22, color: '#1a1a2e' }}>4.8</span>
                  <span>{[1,2,3,4,5].map(i => (
                    <span key={i} style={{
                      color: i <= 4 ? '#f59e0b' : (demoStep >= 2 ? '#f59e0b' : '#ddd'),
                      fontSize: 20, transition: 'color 0.4s', transitionDelay: `${i * 150}ms`
                    }}>{'\u2605'}</span>
                  ))}</span>
                  <span style={{
                    fontSize: 14, color: '#555', fontWeight: 600,
                    opacity: demoStep >= 2 ? 1 : 0, transition: 'opacity 0.8s ease 0.3s'
                  }}>
                    <AnimatedCounter target={demoStep >= 2 ? 2341 : 0} /> degerlendirme
                  </span>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 10,
                  padding: '10px 14px', marginBottom: 10, fontSize: 14, color: '#92400e', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 8,
                  transform: demoStep >= 3 ? 'translateX(0)' : 'translateX(-110%)',
                  opacity: demoStep >= 3 ? 1 : 0,
                  transition: 'all 0.7s cubic-bezier(0.4,0,0.2,1)'
                }}>
                  {'\uD83D\uDD25'} <span>1.847 kisi son 30 gunde satin aldi</span>
                </div>
                <div style={{
                  fontSize: 14, color: '#10b981', fontWeight: 700, marginBottom: 12,
                  opacity: demoStep >= 3 ? 1 : 0, transition: 'opacity 0.6s ease 0.5s'
                }}>{'\u2705'} Alicilarin <strong>%96&apos;si</strong> bu urunu tavsiye ediyor!</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sampleReviews.map((r, i) => (
                    <div key={i} style={{
                      background: 'linear-gradient(135deg, #f8f7ff, #f3f0ff)', borderRadius: 12,
                      padding: '12px 14px', border: '1px solid rgba(139,92,246,0.08)',
                      opacity: demoStep >= 4 ? 1 : 0,
                      transform: demoStep >= 4 ? 'translateY(0)' : 'translateY(15px)',
                      transition: `all 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 200}ms`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{r.name}</span>
                        <span style={{ color: '#f59e0b', fontSize: 11 }}>{'\u2605'.repeat(r.stars)}</span>
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
                    <span style={{ fontSize: 14, color: '#8b5cf6', fontWeight: 800, borderBottom: '2px solid #8b5cf6', paddingBottom: 4 }}>Soru-Cevap</span>
                    <span style={{ fontSize: 14, color: '#999', fontWeight: 500, paddingBottom: 4 }}>Yorumlar</span>
                  </div>
                  <div style={{ fontSize: 13, padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
                    <strong style={{ color: '#1a1a2e' }}>S:</strong> <span style={{ color: '#444' }}>Hassas ciltlere uygun mu?</span><br />
                    <span style={{ color: '#10b981', fontWeight: 700 }}>C:</span> <span style={{ color: '#444' }}>Evet, dermatolog testinden gecmistir.</span>
                  </div>
                  <div style={{ fontSize: 13, padding: '6px 0' }}>
                    <strong style={{ color: '#1a1a2e' }}>S:</strong> <span style={{ color: '#444' }}>Ne kadar surede etki gosterir?</span><br />
                    <span style={{ color: '#10b981', fontWeight: 700 }}>C:</span> <span style={{ color: '#444' }}>Duzenli kullanim ile 2 haftada sonuc alinir.</span>
                  </div>
                </div>
                {/* Sentiment badge */}
                <div style={{
                  marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap',
                  opacity: demoStep >= 6 ? 1 : 0, transition: 'opacity 0.6s ease 0.3s'
                }}>
                  {['Kalitesi harika', 'Kargo hizli', 'Dogal icerik'].map((t, i) => (
                    <span key={i} style={{
                      background: '#ecfdf5', color: '#065f46', fontSize: 11, fontWeight: 600,
                      padding: '4px 10px', borderRadius: 6
                    }}>{'\u2713'} {t}</span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Oncesi/Sonrasi Karsilastirma */}
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h3 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: 800, color: 'white', marginBottom: 8
              }}>Oncesi / Sonrasi</h3>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 16, maxWidth: 500, margin: '0 auto' }}>
                Slider&apos;i surukleyerek Aktarmatik&apos;in farkini gorun
              </p>
            </div>
            <div
              ref={sliderRef}
              style={{
                maxWidth: 700, margin: '0 auto', position: 'relative', borderRadius: 20,
                overflow: 'hidden', border: '1px solid rgba(139,92,246,0.2)', cursor: 'ew-resize',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 40px rgba(139,92,246,0.05)',
                userSelect: 'none', height: 400, background: 'white'
              }}
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            >
              {/* Before */}
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
              {/* After */}
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
                    <span style={{ color: '#f59e0b', fontSize: 15 }}>{'\u2605\u2605\u2605\u2605\u2605'}</span>
                    <span style={{ fontSize: 12, color: '#777', fontWeight: 600 }}>2.341 yorum</span>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 8,
                    padding: '6px 10px', fontSize: 12, color: '#92400e', fontWeight: 700, marginBottom: 8
                  }}>{'\uD83D\uDD25'} 1.847 kisi satin aldi</div>
                  <div style={{ width: '100%', height: 100, background: '#f5f5f5', borderRadius: 12, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 30, color: '#ddd' }}>{'\uD83D\uDDBC'}</span>
                  </div>
                  <div style={{
                    background: '#f8f7ff', borderRadius: 8, padding: '8px 10px', border: '1px solid rgba(139,92,246,0.08)', marginBottom: 6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontSize: 10, color: '#888', fontWeight: 600 }}>E*** K***</span>
                      <span style={{ color: '#f59e0b', fontSize: 9 }}>{'\u2605\u2605\u2605\u2605\u2605'}</span>
                    </div>
                    <p style={{ fontSize: 10, color: '#444', margin: 0, lineHeight: 1.4, fontWeight: 500 }}>&quot;Harika kalite, tavsiye ederim!&quot;</p>
                  </div>
                  <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>{'\u2705'} %96 tavsiye orani</div>
                </div>
                <div style={{
                  position: 'absolute', bottom: 20, left: 36,
                  background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', fontSize: 13, fontWeight: 800,
                  padding: '8px 16px', borderRadius: 8
                }}>Aktarmatik ile zengin sayfa</div>
              </div>
              {/* Slider handle */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: `${sliderPos}%`, width: 3,
                background: 'linear-gradient(180deg, #8b5cf6, #c084fc)', zIndex: 10, transform: 'translateX(-50%)'
              }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(139,92,246,0.5)', color: 'white', fontWeight: 900, fontSize: 18
                }}>{'\u2194'}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          ISTATISTIKLER BANDI
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 28px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(124,58,237,0.04))',
        borderTop: '1px solid rgba(139,92,246,0.1)',
        borderBottom: '1px solid rgba(139,92,246,0.1)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, backgroundImage: mandalaPattern, opacity: 0.5
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
            {[
              { value: <AnimatedCounter target={12500} suffix="+" />, label: 'Aktarilan Yorum', icon: '\u2B50' },
              { value: <AnimatedCounter target={340} suffix="+" />, label: 'Mutlu E-Ticaret Sitesi', icon: '\uD83C\uDF10' },
              { value: <AnimatedCounter target={38} suffix="%" />, label: 'Ortalama Donusum Artisi', icon: '\uD83D\uDCC8' },
              { value: <AnimatedCounter target={99.9} suffix="%" decimals={1} />, label: 'Uptime Garantisi', icon: '\u26A1' },
              { value: <AnimatedCounter target={6} suffix=" saat" />, label: 'Otomatik Guncelleme', icon: '\uD83D\uDD04' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div style={{ textAlign: 'center', minWidth: 140 }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: C.purpleBright, fontFamily: "'Jost', sans-serif", marginBottom: 6 }}>{stat.value}</div>
                  <div style={{ fontSize: 14, color: C.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          OZELLIKLER - DETAYLI
         ══════════════════════════════════════════════════════════ */}
      <section id="ozellikler" style={{
        padding: '120px 28px', position: 'relative',
        background: C.bg, backgroundImage: mandalaPattern
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <GlowBadge>{'\u2726'} Tum Ozellikler {'\u2726'}</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Sayfalar Dolusu Ozellik</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 600, margin: '0 auto', fontWeight: 400 }}>
                Aktarmatik sadece yorum aktaran bir arac degil — e-ticaret sitenizi
                donusum makinesine ceviren kapsamli bir platformdur.
              </p>
            </div>
          </ScrollReveal>

          {/* Feature cards - alternating layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {allFeatures.map((f, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 22,
                  padding: '36px 36px', display: 'flex', alignItems: 'center', gap: 28,
                  transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', position: 'relative', overflow: 'hidden',
                  flexDirection: i % 2 === 0 ? 'row' : 'row-reverse'
                }} className="hover-card feature-row">
                  <CornerOrnament position={i % 2 === 0 ? 'top-left' : 'top-right'} />
                  <CornerOrnament position={i % 2 === 0 ? 'bottom-right' : 'bottom-left'} />

                  {/* Icon */}
                  <div style={{
                    width: 80, height: 80, borderRadius: 20, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.06))',
                    border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 40
                  }}>{f.icon}</div>

                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: C.purpleLight, marginBottom: 8 }}>{f.title}</h3>
                    <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.8, marginBottom: 12 }}>{f.desc}</p>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                      color: '#34d399', padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700
                    }}>
                      {'\u2713'} {f.highlight}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NASIL CALISIR - 3 ADIM
         ══════════════════════════════════════════════════════════ */}
      <section id="nasil-calisir" style={{
        padding: '120px 28px',
        background: `linear-gradient(180deg, ${C.bgAlt}, ${C.bg})`,
        borderTop: '1px solid rgba(139,92,246,0.08)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <GlowBadge>{'\u2726'} 3 Kolay Adim {'\u2726'}</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>3 Dakikada Hazir</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
                Teknik bilgi gerektirmez. Kopyala, yapistir, calis.
              </p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
            {/* Connection line */}
            <div className="steps-line" style={{
              position: 'absolute', top: 40, left: '20%', right: '20%', height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), transparent)',
              zIndex: 0
            }} />

            {[
              {
                step: 1, title: 'Script Ekle', icon: '\uD83D\uDCDD',
                desc: 'Tek satir JavaScript kodunu sitenize kopyala-yapistir ile ekleyin.',
                content: (
                  <div style={{
                    background: '#0d0b1a', borderRadius: 10, padding: '14px 16px', marginTop: 12,
                    fontFamily: 'monospace', fontSize: 12, color: C.purpleBright, position: 'relative',
                    border: '1px solid rgba(139,92,246,0.15)', overflow: 'hidden'
                  }}>
                    <div style={{ opacity: 0.5, marginBottom: 4 }}>&lt;!-- Aktarmatik --&gt;</div>
                    <div>&lt;script src=&quot;https://cdn.</div>
                    <div>&nbsp;&nbsp;aktarmatik.com/w.js&quot;&gt;</div>
                    <div>&lt;/script&gt;</div>
                    <button
                      onClick={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        navigator.clipboard?.writeText('<script src="https://cdn.aktarmatik.com/w.js"></script>');
                        const btn = e.currentTarget;
                        btn.textContent = 'Kopyalandi!';
                        setTimeout(() => { btn.textContent = 'Kopyala'; }, 2000);
                      }}
                      style={{
                        position: 'absolute', top: 8, right: 8, background: 'rgba(139,92,246,0.2)',
                        border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, padding: '4px 12px',
                        color: C.purpleLight, fontSize: 11, cursor: 'pointer', fontWeight: 700,
                        fontFamily: "'Jost', sans-serif"
                      }}
                    >Kopyala</button>
                  </div>
                )
              },
              {
                step: 2, title: 'URL Esle', icon: '\uD83D\uDD17',
                desc: 'Trendyol URL\'lerini sitenizin URL\'leri ile eslestirin.',
                content: (
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      background: '#0d0b1a', borderRadius: 10, padding: '10px 14px', marginBottom: 8,
                      fontSize: 12, color: '#f87171', fontFamily: 'monospace', fontWeight: 600,
                      border: '1px solid rgba(139,92,246,0.1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>trendyol.com/urun/serum-123</div>
                    <div style={{ textAlign: 'center', fontSize: 22, color: C.purpleBright, animation: 'arrowBounce 1.5s infinite' }}>{'\u2193'}</div>
                    <div style={{
                      background: '#0d0b1a', borderRadius: 10, padding: '10px 14px',
                      fontSize: 12, color: C.emerald, fontFamily: 'monospace', fontWeight: 600,
                      border: '1px solid rgba(139,92,246,0.1)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>siteniz.com/urun/serum</div>
                  </div>
                )
              },
              {
                step: 3, title: 'Otomatik Calis', icon: '\u2728',
                desc: 'Tamamdir! Veriler her 6 saatte otomatik guncellenir.',
                content: (
                  <div style={{ marginTop: 12, textAlign: 'center' }}>
                    <div style={{
                      fontSize: 52, animation: 'mandalaSpin 6s linear infinite', display: 'inline-block', color: C.purpleBright,
                      filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.3))'
                    }}>{'\u2726'}</div>
                    <p style={{ fontSize: 14, color: C.textSecondary, marginTop: 8, fontWeight: 500 }}>
                      Veriler her 6 saatte otomatik guncellenir
                    </p>
                  </div>
                )
              }
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 200} style={{ flex: '1 1 300px', maxWidth: 360, position: 'relative', zIndex: 1 }}>
                <div style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 22,
                  padding: '36px 28px', textAlign: 'center', height: '100%',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)'
                }} className="hover-card">
                  <CornerOrnament position="top-left" />
                  <CornerOrnament position="top-right" />
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white',
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 900, fontSize: 15,
                    boxShadow: '0 4px 15px rgba(139,92,246,0.5)'
                  }}>{item.step}</div>
                  <div style={{ fontSize: 44, marginBottom: 12, marginTop: 14 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: C.purpleLight, marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.6, marginBottom: 0 }}>{item.desc}</p>
                  {item.content}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PLATFORM DESTEGI
         ══════════════════════════════════════════════════════════ */}
      <section id="platformlar" style={{
        padding: '120px 28px', position: 'relative',
        background: C.bgAlt, backgroundImage: mandalaPattern,
        borderTop: '1px solid rgba(139,92,246,0.08)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <GlowBadge>{'\uD83D\uDD17'} Platform Entegrasyonu</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Her Platformda Calisir</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                Hangi e-ticaret altyapisini kullanirsiniz kullamin, Aktarmatik tek satir kodla entegre olur.
              </p>
            </div>
          </ScrollReveal>

          <div style={{ display: 'flex', gap: 20, marginBottom: 30, justifyContent: 'center', flexWrap: 'wrap' }}>
            {platforms.map((p, i) => (
              <button key={i} onClick={() => setActivePlatform(i)} style={{
                padding: '12px 28px', borderRadius: 12, fontWeight: 700, fontSize: 15,
                cursor: 'pointer', border: '1px solid',
                borderColor: activePlatform === i ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)',
                background: activePlatform === i ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.02)',
                color: activePlatform === i ? C.purpleLight : C.textSecondary,
                fontFamily: "'Jost', sans-serif", transition: 'all 0.3s',
                boxShadow: activePlatform === i ? '0 4px 20px rgba(139,92,246,0.2)' : 'none'
              }}>{p.name}</button>
            ))}
          </div>

          <ScrollReveal>
            <div style={{
              background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 22,
              padding: '40px 36px', maxWidth: 700, margin: '0 auto', position: 'relative', overflow: 'hidden'
            }}>
              <CornerOrnament position="top-left" />
              <CornerOrnament position="top-right" />
              <CornerOrnament position="bottom-left" />
              <CornerOrnament position="bottom-right" />
              <h3 style={{ fontSize: 22, fontWeight: 800, color: C.purpleLight, marginBottom: 8 }}>
                {platforms[activePlatform].name} Entegrasyonu
              </h3>
              <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.7, marginBottom: 20 }}>
                {platforms[activePlatform].desc}
              </p>
              <div style={{
                background: '#0d0b1a', borderRadius: 12, padding: '20px 20px',
                fontFamily: 'monospace', fontSize: 13, color: C.purpleBright,
                border: '1px solid rgba(139,92,246,0.15)', lineHeight: 1.8,
                whiteSpace: 'pre-wrap'
              }}>
                {platforms[activePlatform].code}
              </div>
              <div style={{
                marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap'
              }}>
                {['Tek satirlik kod', 'Otomatik eslestirme', 'Aninda aktif'].map((tag, i) => (
                  <span key={i} style={{
                    background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)',
                    color: C.purpleLight, padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700
                  }}>{'\u2713'} {tag}</span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MUSTERILER NE DIYOR
         ══════════════════════════════════════════════════════════ */}
      <section id="yorumlar" style={{
        padding: '120px 28px',
        background: C.bg,
        borderTop: '1px solid rgba(139,92,246,0.08)',
        position: 'relative'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 80 }}>
              <GlowBadge>{'\u2B50'} Basari Hikayeleri</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Musterilerimiz Ne Diyor?</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
                Aktarmatik kullanan e-ticaret firmalarinin gercek deneyimleri
              </p>
            </div>
          </ScrollReveal>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24
          }} className="testimonials-grid">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} delay={i * 120}>
                <div style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 22,
                  padding: '36px 28px', height: '100%', transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                  position: 'relative', overflow: 'hidden'
                }} className="hover-card">
                  <CornerOrnament position="top-left" />
                  <CornerOrnament position="bottom-right" />

                  {/* Stat highlight */}
                  <div style={{
                    position: 'absolute', top: 20, right: 20,
                    textAlign: 'right'
                  }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.purpleBright }}>{t.stat}</div>
                    <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.statLabel}</div>
                  </div>

                  <div style={{ color: '#f59e0b', fontSize: 18, marginBottom: 18, letterSpacing: 3 }}>{'\u2605\u2605\u2605\u2605\u2605'}</div>
                  <p style={{ fontSize: 16, color: C.textSecondary, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 28, fontWeight: 400 }}>
                    &quot;{t.text}&quot;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 15, color: 'white', flexShrink: 0
                    }}>{t.initials}</div>
                    <div>
                      <strong style={{ display: 'block', fontSize: 15, color: C.purpleLight, fontWeight: 700 }}>{t.name}</strong>
                      <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{t.role}</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NEDEN AKTARMATIK - USP BOLUMU
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '120px 28px',
        background: `linear-gradient(180deg, ${C.bgAlt}, ${C.bg})`,
        borderTop: '1px solid rgba(139,92,246,0.08)',
        position: 'relative', backgroundImage: mandalaPattern
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <GlowBadge>{'\u2726'} Neden Biz? {'\u2726'}</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Neden Aktarmatik?</h2>
              <MandalaDivider variant="lotus" />
            </div>
          </ScrollReveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }} className="usp-grid">
            {[
              { icon: '\uD83C\uDFC6', title: 'Turkiye\'nin 1 Numarasi', desc: 'Trendyol yorum aktarimi konusunda Turkiye\'nin en kapsamli ve guvenilir cozumu. 340+ e-ticaret sitesi tarafindan tercih ediliyor.' },
              { icon: '\uD83D\uDD27', title: 'Sifir Bakim', desc: 'Kurulumdan sonra hicbir sey yapmaniza gerek yok. Veriler otomatik guncellenir, hatalar otomatik duzeltilir, yeni ozellikler otomatik eklenir.' },
              { icon: '\uD83D\uDCB0', title: 'Yuksek ROI', desc: 'Ortalama %38 donusum artisi ve %22 sepet terk azalisi. Yatiriminizi ilk ayda bile geri kazanirsiniz. Sonuclari canli demo ile gorun.' },
              { icon: '\uD83D\uDEE1', title: 'Turkiye Sunucularinda', desc: 'Tum veriler Turkiye\'deki sunucularda saklanir. KVKK ve GDPR uyumlu. SSL/TLS sifreleme. Kisisel veriler maskelenir.' },
              { icon: '\uD83C\uDF1F', title: '7/24 Destek', desc: 'Teknik destek ekibimiz 0850 309 20 49 numarasindan her zaman ulasimda. WhatsApp, e-posta ve telefon destegi.' },
              { icon: '\uD83D\uDE80', title: 'Surekli Gelisim', desc: 'Her ay yeni ozellikler ekleniyor: AI duygu analizi, Hepsiburada destegi, Amazon entegrasyonu, detayli analitik paneli ve daha fazlasi.' },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div style={{
                  background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: 18,
                  padding: '28px 24px', display: 'flex', gap: 16, alignItems: 'flex-start',
                  transition: 'all 0.4s', position: 'relative', overflow: 'hidden'
                }} className="hover-card">
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.06))',
                    border: '1px solid rgba(139,92,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26
                  }}>{item.icon}</div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: C.purpleLight, marginBottom: 6 }}>{item.title}</h3>
                    <p style={{ fontSize: 15, color: C.textSecondary, lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          KARSILASTIRMA — AKTARMATIK VS MANUAL
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '120px 28px', position: 'relative',
        background: `linear-gradient(180deg, ${C.bg}, ${C.bgAlt})`,
        borderTop: '1px solid rgba(139,92,246,0.08)',
        backgroundImage: mandalaPattern
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <GlowBadge>{'\u2694'} Karsilastirma</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Aktarmatik vs Manuel Yontem</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 600, margin: '0 auto' }}>
                Yorumlari elle kopyalamak yerine otomatik aktarim ile zamandan ve emekten tasarruf edin
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 40
            }} className="compare-grid">
              {/* Manuel Yontem */}
              <div style={{
                background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 22, padding: '36px 28px', position: 'relative'
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 800, color: '#f87171', letterSpacing: 1.5,
                  textTransform: 'uppercase', marginBottom: 20
                }}>Manuel Yontem</div>
                {[
                  'Her yorum tek tek kopyala-yapistir',
                  'Guncellemeler icin surekli kontrol',
                  'Puanlar ve istatistikler hesaplanamaz',
                  'Sosyal kanit gosterilemez',
                  'Mobil uyum sorunu',
                  'Saatler suren emek gerektir',
                  'Hata yapma riski yuksek',
                  'Yeni yorumlar gecikir',
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                    fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 500
                  }}>
                    <span style={{ color: '#f87171', fontSize: 16, flexShrink: 0 }}>{'\u2717'}</span>
                    {item}
                  </div>
                ))}
              </div>

              {/* Aktarmatik */}
              <div style={{
                background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: 22, padding: '36px 28px', position: 'relative',
                boxShadow: '0 8px 40px rgba(139,92,246,0.1)'
              }}>
                <CornerOrnament position="top-left" />
                <CornerOrnament position="top-right" />
                <CornerOrnament position="bottom-left" />
                <CornerOrnament position="bottom-right" />
                <div style={{
                  fontSize: 12, fontWeight: 800, color: C.purpleBright, letterSpacing: 1.5,
                  textTransform: 'uppercase', marginBottom: 20
                }}>Aktarmatik ile</div>
                {[
                  'Tum yorumlar otomatik aktarilir',
                  'Her 6 saatte otomatik guncelleme',
                  'Yildiz puanlari ve ortalama hesaplanir',
                  'Canli sosyal kanit bandi',
                  '%100 mobil uyumlu responsive',
                  '3 dakikada kurulur, sifir emek',
                  'AI duygu analizi ile akilli ozet',
                  'Yeni yorumlar aninda yansir',
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
                    fontSize: 15, color: C.purpleLight, fontWeight: 500
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(167,139,250,0.2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#a78bfa'
                    }}>{'\u2713'}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DONUSUM HIKAYESI — ETKILEYICI BANT
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        padding: '80px 28px',
        background: 'linear-gradient(135deg, #1a0836, #0f0a1a, #1a0836)',
        borderTop: '1px solid rgba(139,92,246,0.15)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0, backgroundImage: mandalaPattern, opacity: 0.5
        }} />
        {/* Mandala decoration */}
        <div style={{
          position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)',
          width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
          border: '1px solid rgba(139,92,246,0.06)',
          animation: 'mandalaSpin 30s linear infinite'
        }}>
          <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.04)' }} />
        </div>
        <div style={{
          position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)',
          width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
          border: '1px solid rgba(139,92,246,0.06)',
          animation: 'mandalaSpin 25s linear infinite reverse'
        }}>
          <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.04)' }} />
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', textAlign: 'center' }}>
          <ScrollReveal>
            <div style={{ fontSize: 48, marginBottom: 20 }}>{'\u2726'}</div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: 'white',
              lineHeight: 1.3, marginBottom: 30
            }}>
              Musterileriniz Trendyol&apos;a degil, <br />
              <span style={{
                background: 'linear-gradient(135deg, #8b5cf6, #c084fc, #e879f9)',
                backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                animation: 'shimmer 4s linear infinite'
              }}>size gelsin.</span>
            </h2>
            <p style={{ fontSize: 18, color: C.textSecondary, lineHeight: 1.8, maxWidth: 700, margin: '0 auto 40px' }}>
              E-ticaret sitenizde sosyal kanit gostermediginizde, musteriler Trendyol&apos;a gidip yorumlari okuyor.
              Bir kismisi orada kalip oradan satin aliyor — siz komisyon oduyorsunuz.
              Aktarmatik bu donguyu kirarak musterileri sizin sitenizde tutar.
            </p>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { before: 'Ziyaretci sitenize gelir', after: 'Yorumlari gorup guven duyar', icon: '\uD83D\uDC41' },
                { before: '"Acaba gercekten iyi mi?"', after: '%96 tavsiye oranini gorur', icon: '\uD83E\uDD14' },
                { before: 'Trendyol\'a gider, orada alir', after: 'Dogrudan sizden satin alir', icon: '\uD83D\uDED2' },
              ].map((item, i) => (
                <ScrollReveal key={i} delay={i * 200}>
                  <div style={{ textAlign: 'center', maxWidth: 220 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>{item.icon}</div>
                    <div style={{
                      fontSize: 13, color: '#f87171', fontWeight: 600, marginBottom: 8,
                      textDecoration: 'line-through', opacity: 0.6
                    }}>{item.before}</div>
                    <div style={{ fontSize: 14, color: C.emerald, fontWeight: 700 }}>{item.after}</div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SIKCA SORULAN SORULAR
         ══════════════════════════════════════════════════════════ */}
      <section id="sss" style={{
        padding: '120px 28px', position: 'relative',
        background: C.bg,
        borderTop: '1px solid rgba(139,92,246,0.08)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <ScrollReveal>
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <GlowBadge>{'\u2753'} SSS</GlowBadge>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(34px, 4vw, 54px)', fontWeight: 800, marginBottom: 6, marginTop: 20,
                color: 'white', letterSpacing: -1
              }}>Sikca Sorulan Sorular</h2>
              <MandalaDivider variant="lotus" />
              <p style={{ color: C.textSecondary, fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
                Merak ettiklerinize detayli cevaplar
              </p>
            </div>
          </ScrollReveal>
          {faqs.map((f, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <FAQItem question={f.q} answer={f.a} idx={i} />
            </ScrollReveal>
          ))}

          <ScrollReveal delay={200}>
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <p style={{ fontSize: 16, color: C.textSecondary, marginBottom: 16 }}>
                Baska sorulariniz mi var?
              </p>
              <a href="tel:08503092049" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 32px', borderRadius: 12,
                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)',
                color: C.purpleLight, fontWeight: 700, fontSize: 15,
                textDecoration: 'none', transition: 'all 0.3s'
              }}>{'\uD83D\uDCDE'} 0850 309 20 49 — Bizi Arayin</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA
         ══════════════════════════════════════════════════════════ */}
      <section id="iletisim" style={{
        padding: '120px 28px',
        background: `linear-gradient(180deg, ${C.bgAlt}, ${C.bg})`,
        borderTop: '1px solid rgba(139,92,246,0.08)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        backgroundImage: mandalaPattern
      }}>
        {/* Mandala background circle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
          border: '1px solid rgba(139,92,246,0.06)',
          animation: 'mandalaSpin 30s linear infinite'
        }}>
          <div style={{ position: 'absolute', inset: 40, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.04)' }} />
          <div style={{ position: 'absolute', inset: 80, borderRadius: '50%', border: '1px solid rgba(139,92,246,0.03)' }} />
        </div>

        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none'
        }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <ScrollReveal>
            <div style={{ fontSize: 52, marginBottom: 20 }}>{'\u2726'}</div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, marginBottom: 8, color: 'white'
            }}>Donusumu Baslatmaya Hazir Misiniz?</h2>
            <MandalaDivider variant="lotus" />
            <p style={{ fontSize: 19, color: C.textSecondary, lineHeight: 1.8, marginBottom: 20 }}>
              Trendyol yorumlarinizi e-ticaret sitenize tasiyin.
              Size ozel canli demo hazirlayalim — hemen formu doldurun.
            </p>
            <p style={{ fontSize: 16, color: C.textMuted, marginBottom: 40 }}>
              Ortalama %38 donusum artisi &middot; 3 dakikada kurulum &middot; 340+ mutlu musteri
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
              <a href="#" onClick={scrollToForm} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '18px 44px',
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white',
                borderRadius: 14, fontWeight: 800, fontSize: 18, textDecoration: 'none',
                boxShadow: '0 8px 35px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.1)',
                transition: 'all 0.3s', fontFamily: "'Jost', sans-serif"
              }} className="submit-btn">Hemen Basvurun {'\u2192'}</a>
              <a href="tel:08503092049" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '18px 36px',
                border: '1px solid rgba(139,92,246,0.3)', color: C.purpleLight,
                borderRadius: 14, fontWeight: 700, fontSize: 18, textDecoration: 'none',
                transition: 'all 0.3s', fontFamily: "'Jost', sans-serif"
              }}>{'\uD83D\uDCDE'} Bizi Arayin</a>
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="tel:08503092049" style={{ fontSize: 15, color: C.purpleBright, textDecoration: 'none', fontWeight: 700 }}>
                {'\uD83D\uDCDE'} 0850 309 20 49
              </a>
              <a href="tel:05407275757" style={{ fontSize: 15, color: C.purpleBright, textDecoration: 'none', fontWeight: 700 }}>
                {'\uD83D\uDCDE'} 0540 727 57 57
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── FOOTER ──── */}
      <footer style={{
        background: '#04020a', borderTop: '1px solid rgba(139,92,246,0.1)',
        color: 'white', padding: '60px 28px 36px'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', gap: 40
        }} className="footer-grid">
          {/* Logo & desc */}
          <div style={{ gridColumn: 'span 2' }} className="footer-brand">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ fontSize: 28, color: C.purpleBright, animation: 'mandalaSpin 20s linear infinite' }}>{'\u2726'}</span>
              <div>
                <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.purpleLight }}>AKTARMATIK</strong>
                <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: 'rgba(167,139,250,0.4)', letterSpacing: 1.5 }}>by Morfil Medya</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: C.textMuted, maxWidth: 340, lineHeight: 1.7, marginBottom: 18 }}>
              Trendyol, Hepsiburada ve pazaryeri yorumlarini e-ticaret sitenize otomatik aktarin.
              Sosyal kanit gucuyle donusum oranlarinizi katlayin.
            </p>
            <div style={{ display: 'flex', gap: 18, marginBottom: 8 }}>
              <a href="tel:08503092049" style={{ color: C.purpleBright, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{'\uD83D\uDCDE'} 0850 309 20 49</a>
              <a href="tel:05407275757" style={{ color: C.purpleBright, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>{'\uD83D\uDCDE'} 0540 727 57 57</a>
            </div>
          </div>
          {/* Hizli Linkler */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: C.purpleLight, marginBottom: 18, letterSpacing: 1, textTransform: 'uppercase' }}>Sayfalar</h4>
            {[
              { label: 'Demo', href: '#demo' },
              { label: 'Ozellikler', href: '#ozellikler' },
              { label: 'Nasil Calisir', href: '#nasil-calisir' },
              { label: 'Platformlar', href: '#platformlar' },
              { label: 'Yorumlar', href: '#yorumlar' },
              { label: 'SSS', href: '#sss' },
            ].map(link => (
              <a key={link.href} href={link.href} style={{
                display: 'block', color: 'rgba(255,255,255,0.4)', textDecoration: 'none',
                fontSize: 14, fontWeight: 500, marginBottom: 10, transition: 'color 0.2s'
              }}>{link.label}</a>
            ))}
          </div>
          {/* Platformlar */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 800, color: C.purpleLight, marginBottom: 18, letterSpacing: 1, textTransform: 'uppercase' }}>Platformlar</h4>
            {['ikas', 'Shopify', 'WordPress', 'WooCommerce', 'IdeaSoft', 'Ticimax'].map(p => (
              <span key={p} style={{
                display: 'block', color: 'rgba(255,255,255,0.4)',
                fontSize: 14, fontWeight: 500, marginBottom: 10
              }}>{p}</span>
            ))}
          </div>
        </div>
        <div style={{
          maxWidth: 1200, margin: '40px auto 0', paddingTop: 20,
          borderTop: '1px solid rgba(139,92,246,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
            {'\u00A9'} {new Date().getFullYear()} Aktarmatik. Morfil Medya tarafindan gelistirilmistir.
          </span>
          <a href="https://aktarmatik.webtasarimi.net" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: 'rgba(139,92,246,0.3)', textDecoration: 'none', fontWeight: 500 }}>
            aktarmatik.webtasarimi.net
          </a>
        </div>
      </footer>

      {/* ──── GLOBAL CSS ──── */}
      <style jsx>{`
        @keyframes orbFloat1 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-40px) scale(1.08); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(30px) scale(1.05); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, -25px) scale(1.1); } }
        @keyframes shimmer { to { background-position: 300% center; } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 rgba(245,158,11,0); } 50% { box-shadow: 0 0 20px rgba(245,158,11,0.15); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes mandalaSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes arrowBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        @keyframes particleFloat0 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(20px, -30px); } }
        @keyframes particleFloat1 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-15px, 25px); } }
        @keyframes particleFloat2 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(25px, 15px); } }
        @keyframes particleFloat3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-20px, -20px); } }

        .hover-card:hover {
          transform: translateY(-6px) !important;
          border-color: rgba(139, 92, 246, 0.35) !important;
          background: rgba(139, 92, 246, 0.06) !important;
          box-shadow: 0 16px 50px rgba(139, 92, 246, 0.1), 0 0 40px rgba(139, 92, 246, 0.05) !important;
        }

        .submit-btn:hover {
          transform: translateY(-3px) !important;
          box-shadow: 0 12px 45px rgba(139, 92, 246, 0.5), 0 0 80px rgba(139, 92, 246, 0.15) !important;
        }

        .form-input:focus {
          border-color: rgba(139, 92, 246, 0.5) !important;
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.1) !important;
        }

        .form-input::placeholder {
          color: rgba(255, 255, 255, 0.2) !important;
        }

        .mob-btn { display: none !important; }

        a:hover { color: #c4b5fd !important; }

        .feature-row { flex-direction: row !important; }

        /* 1024px */
        @media (max-width: 1024px) {
          .demo-grid { grid-template-columns: 1fr !important; max-width: 560px !important; margin: 0 auto 100px !important; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .usp-grid { grid-template-columns: 1fr !important; }
          .compare-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-brand { grid-column: span 2 !important; }
          .sentiment-flex { flex-direction: column !important; }
          .steps-line { display: none !important; }
        }

        /* 768px */
        @media (max-width: 768px) {
          .mob-btn { display: block !important; }
          .nav-links { display: none !important; }
          .nav-open { display: flex !important; }
          .hero-flex { flex-direction: column !important; padding-top: 100px !important; gap: 40px !important; }
          .hero-left-col { text-align: center !important; }
          .hero-right-col { max-width: 100% !important; width: 100% !important; }
          .demo-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; max-width: 440px !important; margin: 0 auto !important; }
          .feature-row { flex-direction: column !important; text-align: center !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-brand { grid-column: span 1 !important; }
        }

        /* 480px */
        @media (max-width: 480px) {
          .hero-left-col h1 { font-size: 28px !important; }
        }
      `}</style>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0612; }
      `}</style>
    </div>
  );
}

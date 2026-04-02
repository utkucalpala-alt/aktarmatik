'use client';
import Link from 'next/link';

export default function KayitPage() {
  return (
    <div className="auth-page">
      <div className="auth-glow"></div>
      <div className="auth-card glass-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">AKTARMATIK</span>
        </Link>
        <h1>Kayıt</h1>
        <p className="auth-subtitle">Aktarmatik hizmetine erişim için yönetici onayı gerekmektedir.</p>

        <div className="info-box">
          <div className="info-icon">🔒</div>
          <p className="info-title">Yönetici İzni Gerekli</p>
          <p className="info-text">
            Aktarmatik hizmeti, Morfil Medya tarafından yönetilen bir platformdur.
            Hesap oluşturmak için lütfen bizimle iletişime geçin.
          </p>
        </div>

        <div className="contact-info">
          <a href="tel:08503092049" className="contact-link">
            <span>📞</span> 0850 309 20 49
          </a>
          <a href="tel:05407275757" className="contact-link">
            <span>📱</span> 0540 727 57 57
          </a>
          <a href="mailto:morfilmedia@gmail.com?subject=Aktarmatik%20Hizmet%20Talebi" className="contact-link">
            <span>✉️</span> morfilmedia@gmail.com
          </a>
        </div>

        <a href="/#iletisim" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          Hizmet Talep Formu
        </a>

        <p className="auth-footer">
          Zaten hesabınız var mı? <Link href="/giris">Giriş yapın</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .auth-glow {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse, rgba(108,92,231,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 48px;
          text-align: center;
        }
        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 20px;
          margin-bottom: 32px;
          text-decoration: none;
          color: inherit;
        }
        .logo-icon {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 24px;
        }
        .auth-card h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 32px;
        }
        .info-box {
          background: rgba(108, 92, 231, 0.08);
          border: 1px solid rgba(108, 92, 231, 0.2);
          border-radius: var(--radius-md);
          padding: 24px;
          margin-bottom: 24px;
        }
        .info-icon {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .info-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #a29bfe;
        }
        .info-text {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 8px;
        }
        .contact-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        .contact-link:hover {
          background: rgba(108, 92, 231, 0.1);
          border-color: rgba(108, 92, 231, 0.3);
        }
        .auth-footer {
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .auth-footer a {
          color: var(--accent-secondary);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

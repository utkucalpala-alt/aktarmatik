'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function KayitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', email, password, name }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Kayıt başarısız');
        setLoading(false);
        return;
      }

      localStorage.setItem('tp_token', data.token);
      localStorage.setItem('tp_user', JSON.stringify(data.user));
      router.push('/panel');
    } catch (err) {
      setError('Bağlantı hatası');
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow"></div>
      <div className="auth-card glass-card">
        <Link href="/" className="auth-logo">
          <span className="logo-icon">◆</span>
          <span className="logo-text">AKTARMATIK</span>
        </Link>
        <h1>Ücretsiz Kayıt Ol</h1>
        <p className="auth-subtitle">Hemen başlayın, kredi kartı gerekmez.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ad Soyad</label>
            <input
              type="text"
              className="form-input"
              placeholder="Adınız Soyadınız"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input
              type="email"
              className="form-input"
              placeholder="ornek@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-input"
              placeholder="En az 6 karakter"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
            {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
          </button>
        </form>

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
        .auth-error {
          background: rgba(225, 112, 85, 0.1);
          border: 1px solid rgba(225, 112, 85, 0.3);
          color: var(--danger);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          font-size: 13px;
          margin-bottom: 16px;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-align: left;
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

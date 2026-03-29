'use client';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  useEffect(() => {
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  const cards = stats ? [
    { label: 'Toplam Üye', value: stats.totalUsers, icon: '👥', color: '#6c5ce7' },
    { label: 'Toplam Ürün', value: stats.totalProducts, icon: '📦', color: '#00b894' },
    { label: 'Aktif Ürünler', value: stats.activeProducts, icon: '✅', color: '#fdcb6e' },
    { label: 'Toplam Yorum', value: stats.totalReviews, icon: '⭐', color: '#e17055' },
  ] : [];

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Admin Dashboard</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Aktarmatik sistem genel bakış</p>

      {!stats ? (
        <div style={{ color: '#888' }}>Yükleniyor...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: c.color }}>{c.value.toLocaleString()}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

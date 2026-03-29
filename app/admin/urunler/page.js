'use client';
import { useState, useEffect } from 'react';

export default function AdminUrunler() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  useEffect(() => {
    fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        // Load each user's products
        const promises = (data.users || []).filter(u => parseInt(u.product_count) > 0).map(u =>
          fetch(`/api/admin/users/${u.id}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => d.products.map(p => ({ ...p, user_email: u.email, user_name: u.name })))
        );
        return Promise.all(promises);
      })
      .then(results => {
        setUsers(results.flat());
        setLoading(false);
      })
      .catch(e => { console.error(e); setLoading(false); });
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Tüm Ürünler</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Sistemdeki tüm ürün eşlemeleri</p>

      {loading ? <div style={{ color: '#888' }}>Yükleniyor...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 12, padding: '12px 16px', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
            <span>Ürün</span><span>Kullanıcı</span><span>Puan</span><span>Yorum</span><span>Durum</span>
          </div>
          {users.map(p => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', gap: 12, alignItems: 'center',
              padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, fontSize: 13
            }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.product_name || 'İsim bekleniyor...'}</div>
                {p.site_url && <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>🌐 {p.site_url.replace(/^https?:\/\//, '').substring(0, 40)}</div>}
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>{p.user_email}</div>
              <div>{p.rating ? `⭐ ${parseFloat(p.rating).toFixed(1)}` : '-'}</div>
              <div>{p.review_count || 0}</div>
              <div>
                <span style={{ background: p.status === 'active' ? 'rgba(0,184,148,0.1)' : 'rgba(255,255,255,0.05)', color: p.status === 'active' ? '#00b894' : '#888', padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>{p.status}</span>
              </div>
            </div>
          ))}
          {users.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>Henüz ürün yok.</div>}
        </div>
      )}
    </div>
  );
}

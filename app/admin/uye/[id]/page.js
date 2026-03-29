'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminUyeDetay() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [plan, setPlan] = useState('');
  const [role, setRole] = useState('');
  const [gift, setGift] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  async function loadData() {
    try {
      const res = await fetch(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setData(d);
      setPlan(d.user.plan || 'free');
      setRole(d.user.role || 'user');
      setGift(d.user.gift_products || 0);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleSave() {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: parseInt(id), plan, role, giftProducts: parseInt(gift) }),
    });
    setEditMode(false);
    loadData();
  }

  if (!data) return <div style={{ color: '#888' }}>Yükleniyor...</div>;

  const { user, products } = data;

  return (
    <div>
      <Link href="/admin/uyeler" style={{ color: '#6c5ce7', textDecoration: 'none', fontSize: 13, marginBottom: 16, display: 'inline-block' }}>← Üyelere Dön</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>{user.name || user.email}</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>{user.email} · Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}</p>

      {/* User Info Card */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Üye Bilgileri</h3>
          <button onClick={() => setEditMode(!editMode)} style={{ background: editMode ? 'rgba(255,107,107,0.1)' : 'rgba(108,92,231,0.1)', color: editMode ? '#ff6b6b' : '#6c5ce7', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            {editMode ? 'İptal' : 'Düzenle'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>PLAN</div>
            {editMode ? (
              <select value={plan} onChange={e => setPlan(e.target.value)} style={{ background: '#1a1a2e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: 13, width: '100%' }}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="unlimited">Unlimited</option>
              </select>
            ) : (
              <div style={{ fontSize: 15, fontWeight: 700, color: plan === 'unlimited' ? '#00b894' : plan === 'pro' ? '#6c5ce7' : '#888' }}>{user.plan || 'free'}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>ROL</div>
            {editMode ? (
              <select value={role} onChange={e => setRole(e.target.value)} style={{ background: '#1a1a2e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: 13, width: '100%' }}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <div style={{ fontSize: 15, fontWeight: 700, color: user.role === 'admin' ? '#ff6b35' : '#888' }}>{user.role || 'user'}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>HEDİYE ÜRÜN</div>
            {editMode ? (
              <input type="number" value={gift} onChange={e => setGift(e.target.value)} style={{ background: '#1a1a2e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: 13, width: '100%' }} />
            ) : (
              <div style={{ fontSize: 15, fontWeight: 700 }}>{user.gift_products || 0}</div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>ÜRÜN SAYISI</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{products.length}</div>
          </div>
        </div>

        {editMode && (
          <button onClick={handleSave} style={{ marginTop: 16, background: '#6c5ce7', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>Kaydet</button>
        )}
      </div>

      {/* Products */}
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Ürünleri ({products.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {products.map(p => (
          <div key={p.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{p.product_name || 'İsim bekleniyor...'}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                {p.site_url && <span>🌐 {p.site_url.replace(/^https?:\/\//, '').substring(0, 50)}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {p.rating && <span style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>⭐ {parseFloat(p.rating).toFixed(1)}</span>}
              {p.review_count > 0 && <span style={{ background: 'rgba(0,184,148,0.1)', color: '#00b894', padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>{p.review_count} yorum</span>}
              <span style={{ background: p.status === 'active' ? 'rgba(0,184,148,0.1)' : 'rgba(255,255,255,0.05)', color: p.status === 'active' ? '#00b894' : '#888', padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>{p.status}</span>
            </div>
          </div>
        ))}
        {products.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>Bu kullanıcının henüz ürünü yok.</div>}
      </div>
    </div>
  );
}

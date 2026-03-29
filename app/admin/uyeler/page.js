'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminUyeler() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPlan, setEditPlan] = useState('');
  const [editGift, setEditGift] = useState(0);
  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleSave(userId) {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, plan: editPlan, giftProducts: parseInt(editGift) || 0 }),
    });
    setEditingId(null);
    loadUsers();
  }

  function startEdit(u) {
    setEditingId(u.id);
    setEditPlan(u.plan || 'free');
    setEditGift(u.gift_products || 0);
  }

  const planColors = { free: '#888', pro: '#6c5ce7', unlimited: '#00b894' };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Üye Yönetimi</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 32 }}>Tüm kayıtlı kullanıcılar</p>

      {loading ? <div style={{ color: '#888' }}>Yükleniyor...</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: 12, padding: '12px 16px', fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>
            <span>E-posta</span><span>Plan</span><span>Rol</span><span>Ürün</span><span>Hediye</span><span>İşlem</span>
          </div>
          {users.map(u => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px', gap: 12, alignItems: 'center',
              padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, fontSize: 13
            }}>
              <div>
                <Link href={`/admin/uye/${u.id}`} style={{ color: '#e0e0e0', textDecoration: 'none', fontWeight: 600 }}>
                  {u.email}
                </Link>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{u.name || '-'} · {new Date(u.created_at).toLocaleDateString('tr-TR')}</div>
              </div>

              {editingId === u.id ? (
                <>
                  <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{ background: '#1a1a2e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 12 }}>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                    <option value="unlimited">Unlimited</option>
                  </select>
                  <span style={{ color: u.role === 'admin' ? '#ff6b35' : '#888', fontSize: 12 }}>{u.role || 'user'}</span>
                  <span>{u.product_count}</span>
                  <input type="number" value={editGift} onChange={e => setEditGift(e.target.value)} style={{ width: 60, background: '#1a1a2e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '4px 8px', fontSize: 12 }} />
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => handleSave(u.id)} style={{ background: '#6c5ce7', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Kaydet</button>
                    <button onClick={() => setEditingId(null)} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 10px', fontSize: 11, cursor: 'pointer' }}>X</button>
                  </div>
                </>
              ) : (
                <>
                  <span style={{ color: planColors[u.plan] || '#888', fontWeight: 600, fontSize: 12 }}>{u.plan || 'free'}</span>
                  <span style={{ color: u.role === 'admin' ? '#ff6b35' : '#888', fontSize: 12 }}>{u.role || 'user'}</span>
                  <span>{u.product_count}</span>
                  <span>{u.gift_products || 0}</span>
                  <button onClick={() => startEdit(u)} style={{ background: 'rgba(108,92,231,0.1)', color: '#6c5ce7', border: '1px solid rgba(108,92,231,0.2)', borderRadius: 6, padding: '6px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Düzenle</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

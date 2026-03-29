'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/uyeler', label: 'Üyeler', icon: '👥' },
  { href: '/admin/urunler', label: 'Ürünler', icon: '📦' },
];

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('tp_user');
    const token = localStorage.getItem('tp_token');
    if (!stored || !token) { router.push('/giris'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin') { setUser(null); return; }
    setUser(u);
  }, []);

  if (user === null && typeof window !== 'undefined' && localStorage.getItem('tp_user')) {
    const u = JSON.parse(localStorage.getItem('tp_user'));
    if (u.role !== 'admin') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', color: '#ff6b6b', fontSize: 20, fontWeight: 700 }}>
          Yetkisiz Erişim — Admin değilsiniz.
        </div>
      );
    }
  }

  function handleLogout() {
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_user');
    router.push('/giris');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', color: '#e0e0e0', fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' }}>
      <aside style={{ width: collapsed ? 64 : 240, background: '#12121a', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', transition: 'width 0.2s' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && <span style={{ fontWeight: 900, fontSize: 15, color: '#ff6b35', letterSpacing: -0.5 }}>ADMIN PANEL</span>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {navItems.map(item => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, marginBottom: 4,
                background: active ? 'rgba(108,92,231,0.15)' : 'transparent',
                color: active ? '#6c5ce7' : '#888', textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {!collapsed && user && (
            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
              <div style={{ color: '#ff6b35', fontSize: 11 }}>admin</div>
            </div>
          )}
          <button onClick={handleLogout} style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, width: '100%' }}>
            {collapsed ? '🚪' : '🚪 Çıkış'}
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

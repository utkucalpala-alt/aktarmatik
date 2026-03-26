'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function PanelLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('tp_user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      router.push('/giris');
    }
  }, [router]);

  function handleLogout() {
    localStorage.removeItem('tp_token');
    localStorage.removeItem('tp_user');
    router.push('/giris');
  }

  const navItems = [
    { href: '/panel', label: 'Genel Bakış', icon: '📊' },
    { href: '/panel/barkodlar', label: 'Barkodlar', icon: '📦' },
    { href: '/panel/widget', label: 'Widget', icon: '🎨' },
  ];

  if (!user) return null;

  return (
    <div className="panel-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link href="/" className="sidebar-logo">
            <span className="logo-icon">◆</span>
            {sidebarOpen && <span className="logo-text">AKTARMATIK</span>}
          </Link>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user.name?.charAt(0) || user.email?.charAt(0) || 'U'}</div>
            {sidebarOpen && (
              <div className="user-info">
                <div className="user-name">{user.name || 'Kullanıcı'}</div>
                <div className="user-plan badge badge-info">{user.plan || 'free'}</div>
              </div>
            )}
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Çıkış Yap">
            {sidebarOpen ? '🚪 Çıkış' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="panel-main">
        {children}
      </main>

      <style jsx>{`
        .panel-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          background: var(--bg-secondary);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: width var(--transition-normal);
          z-index: 50;
        }
        .sidebar.open { width: 240px; }
        .sidebar.closed { width: 64px; }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          min-height: 64px;
        }
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          font-size: 18px;
          text-decoration: none;
          color: inherit;
        }
        .logo-icon {
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 22px;
          flex-shrink: 0;
        }
        .sidebar-toggle {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 12px;
          padding: 4px;
        }
        .sidebar-toggle:hover { color: var(--text-primary); }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .sidebar-link:hover {
          background: var(--bg-glass);
          color: var(--text-primary);
        }
        .sidebar-link.active {
          background: rgba(108, 92, 231, 0.1);
          color: var(--accent-secondary);
          border: 1px solid rgba(108, 92, 231, 0.15);
        }
        .sidebar-icon { font-size: 18px; flex-shrink: 0; }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--border-color);
        }
        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }
        .user-info { overflow: hidden; }
        .user-name {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-plan { font-size: 10px; margin-top: 2px; }

        .sidebar-logout {
          width: 100%;
          background: none;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 13px;
          transition: all var(--transition-fast);
          font-family: var(--font-sans);
        }
        .sidebar-logout:hover {
          border-color: var(--danger);
          color: var(--danger);
        }

        .panel-main {
          flex: 1;
          margin-left: 240px;
          padding: 32px;
          transition: margin-left var(--transition-normal);
          min-height: 100vh;
        }
        .sidebar.closed ~ .panel-main {
          margin-left: 64px;
        }

        @media (max-width: 768px) {
          .sidebar { width: 64px !important; }
          .panel-main { margin-left: 64px !important; padding: 16px; }
        }
      `}</style>
    </div>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PanelPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = localStorage.getItem('tp_token');
        const res = await fetch('/api/barcodes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const barcodes = data.barcodes || [];

        setStats({
          totalBarcodes: barcodes.length,
          activeBarcodes: barcodes.filter(b => b.status === 'active').length,
          totalReviews: barcodes.reduce((sum, b) => sum + (b.review_count || 0), 0),
          avgRating: barcodes.length > 0
            ? (barcodes.reduce((sum, b) => sum + (parseFloat(b.rating) || 0), 0) / barcodes.filter(b => b.rating).length || 0).toFixed(1)
            : '0',
          totalWidgets: barcodes.reduce((sum, b) => sum + (parseInt(b.widget_count) || 0), 0),
          recentBarcodes: barcodes.slice(0, 5),
        });
      } catch (err) {
        console.error(err);
        setStats({ totalBarcodes: 0, activeBarcodes: 0, totalReviews: 0, avgRating: '0', totalWidgets: 0, recentBarcodes: [] });
      }
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="panel-content">
        <h1 className="page-title">Genel Bakış</h1>
        <div className="stats-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="glass-card stat-card">
              <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 12 }}></div>
              <div className="skeleton" style={{ width: '40%', height: 32 }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="panel-content">
      <h1 className="page-title">Genel Bakış</h1>

      <div className="stats-grid">
        <div className="glass-card stat-card fade-in">
          <div className="stat-label">Toplam Barkod</div>
          <div className="stat-value">{stats.totalBarcodes}</div>
        </div>
        <div className="glass-card stat-card fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-label">Aktif Ürün</div>
          <div className="stat-value">{stats.activeBarcodes}</div>
        </div>
        <div className="glass-card stat-card fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="stat-label">Toplam Yorum</div>
          <div className="stat-value">{stats.totalReviews}</div>
        </div>
        <div className="glass-card stat-card fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="stat-label">Ort. Puan</div>
          <div className="stat-value">⭐ {stats.avgRating}</div>
        </div>
      </div>

      {/* Recent barcodes */}
      <div className="section-header" style={{ marginTop: 40 }}>
        <h2>Son Eklenen Ürünler</h2>
        <Link href="/panel/barkodlar" className="btn btn-secondary btn-sm">Tümünü Gör →</Link>
      </div>

      {stats.recentBarcodes.length === 0 ? (
        <div className="glass-card empty-state fade-in">
          <div className="empty-icon">📦</div>
          <h3>Henüz ürün eklenmemiş</h3>
          <p>İlk barkodunuzu ekleyerek başlayın.</p>
          <Link href="/panel/barkodlar" className="btn btn-primary">Barkod Ekle</Link>
        </div>
      ) : (
        <div className="products-list">
          {stats.recentBarcodes.map((b, i) => (
            <Link key={b.id} href={`/panel/urun/${b.id}`} className="glass-card product-row fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="product-info">
                <div className="product-name">{b.product_name || `Barkod: ${b.barcode}`}</div>
                <div className="product-barcode">{b.barcode}</div>
              </div>
              <div className="product-metrics">
                {b.rating && <span className="badge badge-success">⭐ {parseFloat(b.rating).toFixed(1)}</span>}
                {b.review_count > 0 && <span className="badge badge-info">{b.review_count} yorum</span>}
                <span className={`badge ${b.status === 'active' ? 'badge-success' : b.status === 'scraping' ? 'badge-warning' : 'badge-danger'}`}>
                  {b.status === 'active' ? 'Aktif' : b.status === 'scraping' ? 'Çekiliyor' : 'Bekliyor'}
                </span>
              </div>
              <span className="product-arrow">→</span>
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        .panel-content { max-width: 1100px; }
        .page-title {
          font-size: 28px;
          font-weight: 800;
          margin-bottom: 32px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .section-header h2 {
          font-size: 18px;
          font-weight: 700;
        }

        .empty-state {
          text-align: center;
          padding: 60px 40px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-state h3 { margin-bottom: 8px; font-size: 18px; }
        .empty-state p { color: var(--text-secondary); margin-bottom: 24px; font-size: 14px; }

        .products-list { display: flex; flex-direction: column; gap: 8px; }
        .product-row {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          gap: 16px;
          text-decoration: none;
          cursor: pointer;
        }
        .product-info { flex: 1; }
        .product-name { font-weight: 600; font-size: 14px; }
        .product-barcode { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .product-metrics { display: flex; gap: 8px; align-items: center; }
        .product-arrow { color: var(--text-muted); font-size: 18px; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

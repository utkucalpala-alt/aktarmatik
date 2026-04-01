'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BarkodlarPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [scraping, setScraping] = useState({});

  const token = typeof window !== 'undefined' ? localStorage.getItem('tp_token') : '';

  async function loadBarcodes() {
    try {
      const res = await fetch('/api/barcodes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBarcodes(data.barcodes || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => { loadBarcodes(); }, []);

  // Auto-refresh when any barcode is in 'scraping' status
  useEffect(() => {
    const hasScrapingBarcode = barcodes.some(b => b.status === 'scraping');
    if (!hasScrapingBarcode) return;

    const interval = setInterval(() => {
      loadBarcodes();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [barcodes]);

  async function handleAdd(e) {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      const res = await fetch('/api/barcodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barcode: newBarcode, productUrl: newUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAddError(data.error);
        setAddLoading(false);
        return;
      }

      setNewBarcode('');
      setNewUrl('');
      setShowAdd(false);
      loadBarcodes();
    } catch (err) {
      setAddError('Bağlantı hatası');
    }
    setAddLoading(false);
  }

  async function handleDelete(id) {
    if (!confirm('Bu barkodu silmek istediğinize emin misiniz?')) return;
    try {
      await fetch(`/api/barcodes?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      loadBarcodes();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleScrape(id) {
    setScraping(prev => ({ ...prev, [id]: true }));
    try {
      await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ barcodeId: id }),
      });
      await loadBarcodes();
    } catch (err) {
      console.error(err);
    }
    setScraping(prev => ({ ...prev, [id]: false }));
  }

  return (
    <div className="panel-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Barkodlar</h1>
          <p className="page-desc">Takip ettiğiniz Trendyol ürünleri.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✕ İptal' : '+ Barkod Ekle'}
        </button>
      </div>

      {showAdd && (
        <div className="glass-card add-form fade-in">
          <h3>Yeni Barkod Ekle</h3>
          {addError && <div className="add-error">{addError}</div>}
          <form onSubmit={handleAdd}>
            <div className="add-fields">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Barkod / Ürün ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Örn: 123456789"
                  value={newBarcode}
                  onChange={e => setNewBarcode(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ flex: 2 }}>
                <label className="form-label">Trendyol Ürün Linki (opsiyonel)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://www.trendyol.com/..."
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={addLoading} style={{ alignSelf: 'flex-end' }}>
                {addLoading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="barcodes-list">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card barcode-row">
              <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 8 }}></div>
              <div className="skeleton" style={{ width: '20%', height: 12 }}></div>
            </div>
          ))}
        </div>
      ) : barcodes.length === 0 ? (
        <div className="glass-card empty-state fade-in">
          <div className="empty-icon">📦</div>
          <h3>Henüz barkod eklenmemiş</h3>
          <p>Yukarıdaki butonu kullanarak ilk barkodunuzu ekleyin.</p>
        </div>
      ) : (
        <div className="barcodes-list">
          {barcodes.map((b, i) => (
            <div key={b.id} className="glass-card barcode-row fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="barcode-main">
                <Link href={`/panel/urun/${b.id}`} className="barcode-link">
                  <div className="barcode-name">{b.product_name || `Barkod: ${b.barcode}`}</div>
                  <div className="barcode-meta">
                    <span>#{b.barcode}</span>
                    {b.last_scraped_at && <span>Son: {new Date(b.last_scraped_at).toLocaleDateString('tr-TR')}</span>}
                  </div>
                </Link>
              </div>
              <div className="barcode-stats">
                {b.rating && <span className="badge badge-success">⭐ {parseFloat(b.rating).toFixed(1)}</span>}
                {b.review_count > 0 && <span className="badge badge-info">{b.review_count} yorum</span>}
                {b.favorite_count > 0 && <span className="badge badge-warning">❤ {b.favorite_count}</span>}
                <span className={`badge ${b.status === 'active' ? 'badge-success' : b.status === 'scraping' ? 'badge-warning' : 'badge-danger'}`}>
                  {b.status === 'active' ? 'Aktif' : b.status === 'scraping' ? 'Çekiliyor...' : 'Bekliyor'}
                </span>
              </div>
              <div className="barcode-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleScrape(b.id)}
                  disabled={scraping[b.id]}
                >
                  {scraping[b.id] ? '⏳' : '🔄'} {scraping[b.id] ? 'Çekiliyor...' : 'Veri Çek'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .panel-content { max-width: 1100px; }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        .page-title { font-size: 28px; font-weight: 800; margin-bottom: 4px; }
        .page-desc { color: var(--text-secondary); font-size: 14px; }

        .add-form { padding: 24px; margin-bottom: 24px; }
        .add-form h3 { margin-bottom: 16px; font-size: 16px; }
        .add-error {
          background: rgba(225,112,85,0.1);
          border: 1px solid rgba(225,112,85,0.3);
          color: var(--danger);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 12px;
        }
        .add-fields { display: flex; gap: 12px; align-items: flex-end; }

        .barcodes-list { display: flex; flex-direction: column; gap: 8px; }
        .barcode-row {
          display: flex;
          align-items: center;
          padding: 16px 20px;
          gap: 16px;
        }
        .barcode-main { flex: 1; }
        .barcode-link { text-decoration: none; color: inherit; }
        .barcode-name { font-weight: 600; font-size: 14px; }
        .barcode-meta { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: flex; gap: 12px; }
        .barcode-stats { display: flex; gap: 6px; flex-wrap: wrap; }
        .barcode-actions { display: flex; gap: 6px; }

        .empty-state { text-align: center; padding: 60px; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
        .empty-state h3 { margin-bottom: 8px; }
        .empty-state p { color: var(--text-secondary); font-size: 14px; }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; gap: 12px; }
          .add-fields { flex-direction: column; }
          .barcode-row { flex-direction: column; align-items: flex-start; }
          .barcode-stats { margin-top: 8px; }
          .barcode-actions { margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}

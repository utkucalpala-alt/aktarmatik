// AKTARMATIK Universal Widget - Auto-detects barcode from product page
(function() {
  var script = document.currentScript;
  var theme = script.getAttribute('data-theme') || 'native';
  var apiBase = script.src.replace('/widget-auto.js', '');
  var position = script.getAttribute('data-position') || 'after-cart'; // after-cart, bottom, custom

  // Detect barcode from JSON-LD structured data (ikas, Shopify, etc.)
  function detectBarcode() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var ld = JSON.parse(scripts[i].textContent);
        if (ld['@type'] === 'Product') {
          // ikas uses sku field for barcode
          if (ld.sku) return ld.sku;
          if (ld.gtin13) return ld.gtin13;
          if (ld.gtin) return ld.gtin;
          if (ld.mpn) return ld.mpn;
          // Check offers
          if (ld.offers) {
            var offers = Array.isArray(ld.offers) ? ld.offers : [ld.offers];
            for (var j = 0; j < offers.length; j++) {
              if (offers[j].sku) return offers[j].sku;
            }
          }
        }
      } catch(e) {}
    }
    // Fallback: check meta tags
    var metaSku = document.querySelector('meta[property="product:sku"], meta[name="product:sku"]');
    if (metaSku) return metaSku.getAttribute('content');
    var metaBarcode = document.querySelector('meta[name="barcode"], meta[property="barcode"]');
    if (metaBarcode) return metaBarcode.getAttribute('content');
    return null;
  }

  // Only run on product pages - detect barcode or use URL matching
  var barcode = detectBarcode();
  var pageUrl = window.location.href.split('?')[0];

  var isDark = theme === 'dark';
  var isNative = theme === 'native';
  var text = isNative ? 'inherit' : (isDark ? '#f0f0ff' : '#1a1a2e');
  var muted = isNative ? 'inherit' : (isDark ? '#8b8bab' : '#666');
  var border = isNative ? 'rgba(0,0,0,0.08)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)');
  var cardBg = isNative ? 'transparent' : (isDark ? 'rgba(26,27,58,0.8)' : 'rgba(248,249,250,0.9)');

  // Need either barcode or a product page URL to work
  if (!barcode && !document.querySelector('script[type="application/ld+json"]')) return;

  var cid = 'aktarmatik-widget-' + (barcode ? barcode.substring(0, 8) : pageUrl.replace(/\W/g,'').substring(0, 12));

  var css = '\n' +
    '#' + cid + ' * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; }\n' +
    '#' + cid + ' .ak-w { padding: 20px 0; color: ' + text + '; width: 100%; }\n' +
    '#' + cid + ' .ak-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }\n' +
    '#' + cid + ' .ak-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }\n' +
    '#' + cid + ' .ak-rating { font-size: 32px; font-weight: 800; }\n' +
    '#' + cid + ' .ak-stars { color: #f39c12; font-size: 18px; }\n' +
    '#' + cid + ' .ak-count { font-size: 14px; color: ' + muted + '; }\n' +
    '#' + cid + ' .ak-social { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 20px; }\n' +
    '#' + cid + ' .ak-badge { background: rgba(108,92,231,0.08); border: 1px solid rgba(108,92,231,0.15); padding: 6px 14px; border-radius: 20px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; font-weight: 500; }\n' +
    '#' + cid + ' .ak-tabs { display: flex; gap: 0; border-bottom: 2px solid ' + border + '; margin-bottom: 16px; }\n' +
    '#' + cid + ' .ak-tab { padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -2px; color: ' + muted + '; transition: all 0.2s; }\n' +
    '#' + cid + ' .ak-tab:hover { color: ' + text + '; }\n' +
    '#' + cid + ' .ak-tab.active { color: #6c5ce7; border-bottom-color: #6c5ce7; }\n' +
    '#' + cid + ' .ak-panel { display: none; }\n' +
    '#' + cid + ' .ak-panel.active { display: block; }\n' +
    '#' + cid + ' .ak-review { padding: 14px; border: 1px solid ' + border + '; border-radius: 10px; margin: 10px 0; }\n' +
    '#' + cid + ' .ak-review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }\n' +
    '#' + cid + ' .ak-review-author { font-weight: 600; font-size: 14px; }\n' +
    '#' + cid + ' .ak-review-stars { color: #f39c12; font-size: 12px; }\n' +
    '#' + cid + ' .ak-review-text { font-size: 14px; line-height: 1.6; color: ' + muted + '; }\n' +
    '#' + cid + ' .ak-review-date { font-size: 12px; color: ' + muted + '; opacity: 0.7; margin-top: 4px; }\n' +
    '#' + cid + ' .ak-qa { padding: 14px; border: 1px solid ' + border + '; border-radius: 10px; margin: 10px 0; }\n' +
    '#' + cid + ' .ak-qa-q { font-weight: 600; font-size: 14px; margin-bottom: 8px; }\n' +
    '#' + cid + ' .ak-qa-q::before { content: "S: "; color: #6c5ce7; font-weight: 700; }\n' +
    '#' + cid + ' .ak-qa-a { font-size: 14px; color: ' + muted + '; line-height: 1.5; padding-left: 16px; border-left: 3px solid #00b894; }\n' +
    '#' + cid + ' .ak-qa-a::before { content: "C: "; color: #00b894; font-weight: 700; }\n' +
    '#' + cid + ' .ak-qa-meta { font-size: 12px; color: ' + muted + '; opacity: 0.7; margin-top: 4px; }\n' +
    '#' + cid + ' .ak-ai { font-size: 14px; line-height: 1.6; padding: 16px; background: rgba(0,184,148,0.05); border-left: 4px solid #00b894; border-radius: 0 8px 8px 0; margin-bottom: 16px; }\n' +
    '#' + cid + ' .ak-footer { margin-top: 16px; font-size: 11px; opacity: 0.5; text-align: right; }\n' +
    '#' + cid + ' .ak-footer a { color: inherit; text-decoration: none; font-weight: 600; }\n' +
    '#' + cid + ' .ak-empty { text-align: center; padding: 30px; color: ' + muted + '; font-size: 14px; }\n';

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // Create container
  var container = document.createElement('div');
  container.id = cid;
  container.innerHTML = '<div class="ak-w"><div style="text-align:center;padding:20px;opacity:0.5;">Trendyol verileri yükleniyor...</div></div>';

  // Insert widget into page
  function insertWidget() {
    // Try to find product detail area to insert after
    var targets = [
      '.product-detail-right', // ikas ozy theme
      '[class*="product-detail"]',
      '[class*="product-info"]',
      '[class*="ProductDetail"]',
      '.product-page',
      'main',
      '#content',
    ];
    for (var i = 0; i < targets.length; i++) {
      var el = document.querySelector(targets[i]);
      if (el) {
        el.appendChild(container);
        return;
      }
    }
    // Fallback: insert before footer or at end of body
    var footer = document.querySelector('footer');
    if (footer) {
      footer.parentNode.insertBefore(container, footer);
    } else {
      document.body.appendChild(container);
    }
  }

  function starHtml(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  }

  function formatNum(n) {
    if (!n) return '0';
    n = parseInt(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'B';
    return n.toString();
  }

  function render(data) {
    if (!data || data.error || !data.data) { container.innerHTML = ''; return; }

    var d = data.data;
    var reviews = data.reviews || [];
    var questions = data.questions || [];
    var analysis = data.analysis;

    var html = '<div class="ak-w">';

    // Title
    html += '<div class="ak-title">📊 Trendyol Verileri</div>';

    // Rating header
    html += '<div class="ak-header">';
    html += '<span class="ak-rating">' + (d.rating ? parseFloat(d.rating).toFixed(1) : '-') + '</span>';
    html += '<span class="ak-stars">' + starHtml(d.rating || 0) + '</span>';
    html += '<span class="ak-count">' + formatNum(d.review_count) + ' değerlendirme · ' + formatNum(d.question_count) + ' soru</span>';
    html += '</div>';

    // Social proof badges
    html += '<div class="ak-social">';
    if (d.favorite_count) html += '<span class="ak-badge">❤️ ' + formatNum(d.favorite_count) + ' favori</span>';
    if (d.cart_count) html += '<span class="ak-badge">🛒 ' + formatNum(d.cart_count) + ' sepette</span>';
    if (d.sold_count) html += '<span class="ak-badge">📦 ' + formatNum(d.sold_count) + ' satıldı</span>';
    html += '</div>';

    // AI Summary
    if (analysis && analysis.summary) {
      html += '<div class="ak-ai">🤖 <strong>AI Özet:</strong> ' + analysis.summary + '</div>';
    }

    // Tabs
    var hasReviews = reviews.length > 0;
    var hasQa = questions.length > 0;

    if (hasReviews || hasQa) {
      html += '<div class="ak-tabs">';
      if (hasReviews) html += '<div class="ak-tab active" data-tab="reviews">💬 Yorumlar (' + reviews.length + ')</div>';
      if (hasQa) html += '<div class="ak-tab' + (!hasReviews ? ' active' : '') + '" data-tab="qa">❓ Soru-Cevap (' + questions.length + ')</div>';
      html += '</div>';

      // Reviews panel
      if (hasReviews) {
        html += '<div class="ak-panel active" data-panel="reviews">';
        reviews.forEach(function(r) {
          html += '<div class="ak-review">';
          html += '<div class="ak-review-head"><span class="ak-review-author">' + escHtml(r.author) + '</span><span class="ak-review-stars">' + starHtml(r.rating || 5) + '</span></div>';
          html += '<div class="ak-review-text">' + escHtml(r.content) + '</div>';
          if (r.review_date) html += '<div class="ak-review-date">' + escHtml(r.review_date) + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }

      // Q&A panel
      if (hasQa) {
        html += '<div class="ak-panel' + (!hasReviews ? ' active' : '') + '" data-panel="qa">';
        questions.forEach(function(q) {
          html += '<div class="ak-qa">';
          html += '<div class="ak-qa-q">' + escHtml(q.question_text) + '</div>';
          if (q.answer_text) html += '<div class="ak-qa-a">' + escHtml(q.answer_text) + '</div>';
          html += '<div class="ak-qa-meta">' + escHtml(q.user_name || '') + (q.question_date ? ' · ' + escHtml(q.question_date) : '') + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    } else {
      html += '<div class="ak-empty">Henüz veri bulunamadı.</div>';
    }

    html += '<div class="ak-footer">Powered by <a href="https://aktarmatik.webtasarimi.net" target="_blank">AKTARMATIK</a></div>';
    html += '</div>';

    container.innerHTML = html;

    // Tab click handler
    container.querySelectorAll('.ak-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.ak-tab').forEach(function(t) { t.classList.remove('active'); });
        container.querySelectorAll('.ak-panel').forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        var panel = container.querySelector('[data-panel="' + tab.getAttribute('data-tab') + '"]');
        if (panel) panel.classList.add('active');
      });
    });
  }

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Load data - try barcode first, then URL matching
  function loadData() {
    insertWidget();

    function tryBarcode() {
      if (!barcode) return tryUrl();
      fetch(apiBase + '/api/widget/by-barcode/' + encodeURIComponent(barcode))
        .then(function(r) {
          if (!r.ok) return tryUrl();
          return r.json().then(function(data) {
            if (data.error) return tryUrl();
            render(data);
          });
        })
        .catch(function() { tryUrl(); });
    }

    function tryUrl() {
      fetch(apiBase + '/api/widget/by-url?url=' + encodeURIComponent(pageUrl))
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.error) { container.innerHTML = ''; return; }
          render(data);
        })
        .catch(function() { container.innerHTML = ''; });
    }

    tryBarcode();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }
})();

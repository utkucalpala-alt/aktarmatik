// AKTARMATIK Universal Widget - ikas & SPA compatible
// Supports: ikas, Shopify, custom e-commerce platforms
// Handles client-side routing (SPA), dynamic content loading
(function() {
  'use strict';

  var script = document.currentScript;
  if (!script) return;

  var API_BASE = script.src.replace('/widget-auto.js', '');
  var THEME = script.getAttribute('data-theme') || 'native';
  var POSITION = script.getAttribute('data-position') || 'auto';
  var ACCENT = script.getAttribute('data-color') || '#6c5ce7';
  var CONTAINER_ID = 'aktarmatik-widget-root';

  // Track current state for SPA navigation
  var currentUrl = '';
  var currentBarcode = null;
  var isLoading = false;
  var debounceTimer = null;

  // ========================
  // THEME & STYLING
  // ========================
  var isDark = THEME === 'dark';
  var isNative = THEME === 'native';
  var colors = {
    text: isNative ? 'inherit' : (isDark ? '#f0f0ff' : '#1a1a2e'),
    muted: isNative ? 'inherit' : (isDark ? '#8b8bab' : '#666'),
    border: isNative ? 'rgba(0,0,0,0.08)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
    cardBg: isNative ? 'transparent' : (isDark ? 'rgba(26,27,58,0.8)' : 'rgba(248,249,250,0.9)'),
    accent: ACCENT
  };

  function injectStyles() {
    if (document.getElementById('aktarmatik-widget-styles')) return;
    var C = '#' + CONTAINER_ID;
    var css = [
      C + ' * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }',
      C + ' .ak-w { padding: 16px 0; color: ' + colors.text + '; width: 100%; border-top: 1px solid ' + colors.border + '; margin-top: 12px; }',

      /* Rating row - inline like ikas: 4.9 ★★★★★ · 54 Değerlendirme · 36 Soru-Cevap */
      C + ' .ak-rating-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; font-size: 14px; }',
      C + ' .ak-rating-num { font-weight: 700; font-size: 15px; color: ' + colors.text + '; }',
      C + ' .ak-stars { color: #f39c12; font-size: 14px; letter-spacing: 0; }',
      C + ' .ak-dot { color: #999; font-size: 13px; }',
      C + ' .ak-rating-link { color: #555; font-size: 13px; text-decoration: none; cursor: pointer; }',
      C + ' .ak-rating-link:hover { text-decoration: underline; }',

      /* Popular badge - green like ikas "Kullanıcılar Beğeniyor" */
      C + ' .ak-popular { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; font-size: 13px; }',
      C + ' .ak-popular-badge { color: #00b894; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; }',
      C + ' .ak-popular-link { color: #ff6b00; font-size: 13px; text-decoration: none; cursor: pointer; }',
      C + ' .ak-popular-link:hover { text-decoration: underline; }',

      /* Favorite row - heart icon like ikas */
      C + ' .ak-fav-row { display: flex; align-items: center; gap: 6px; margin-bottom: 14px; font-size: 13px; color: #e74c3c; }',
      C + ' .ak-fav-row span { font-weight: 600; }',
      C + ' .ak-fav-count { color: #ff6b00; font-weight: 700; }',

      /* Social metrics row */
      C + ' .ak-metrics { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }',
      C + ' .ak-metric { background: #f5f5f5; padding: 5px 12px; border-radius: 16px; font-size: 12px; color: #555; display: inline-flex; align-items: center; gap: 4px; }',

      /* AI Summary */
      C + ' .ak-ai { font-size: 13px; line-height: 1.6; padding: 12px 14px; background: rgba(0,184,148,0.06); border-left: 3px solid #00b894; border-radius: 0 6px 6px 0; margin-bottom: 14px; color: #444; }',

      /* Sentiment */
      C + ' .ak-sentiment { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }',
      C + ' .ak-sentiment-item { font-size: 12px; padding: 3px 10px; border-radius: 12px; font-weight: 500; }',

      /* Tabs */
      C + ' .ak-tabs { display: flex; gap: 0; border-bottom: 1px solid #e0e0e0; margin-bottom: 12px; }',
      C + ' .ak-tab { padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -1px; color: #999; transition: all 0.2s; user-select: none; }',
      C + ' .ak-tab:hover { color: #333; }',
      C + ' .ak-tab.active { color: #ff6b00; border-bottom-color: #ff6b00; }',
      C + ' .ak-panel { display: none; }',
      C + ' .ak-panel.active { display: block; }',

      /* Reviews */
      C + ' .ak-review { padding: 12px; border: 1px solid #eee; border-radius: 8px; margin: 8px 0; }',
      C + ' .ak-review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }',
      C + ' .ak-review-author { font-weight: 600; font-size: 13px; color: #333; }',
      C + ' .ak-review-stars { color: #f39c12; font-size: 11px; }',
      C + ' .ak-review-text { font-size: 13px; line-height: 1.5; color: #666; }',
      C + ' .ak-review-date { font-size: 11px; color: #999; margin-top: 4px; }',

      /* Q&A */
      C + ' .ak-qa { padding: 12px; border: 1px solid #eee; border-radius: 8px; margin: 8px 0; }',
      C + ' .ak-qa-q { font-weight: 600; font-size: 13px; margin-bottom: 6px; }',
      C + ' .ak-qa-q::before { content: "S: "; color: #ff6b00; font-weight: 700; }',
      C + ' .ak-qa-a { font-size: 13px; color: #666; line-height: 1.5; padding-left: 12px; border-left: 2px solid #00b894; }',
      C + ' .ak-qa-a::before { content: "C: "; color: #00b894; font-weight: 700; }',
      C + ' .ak-qa-meta { font-size: 11px; color: #999; margin-top: 4px; }',

      /* Footer & utility */
      C + ' .ak-footer { margin-top: 12px; font-size: 10px; opacity: 0.4; text-align: right; }',
      C + ' .ak-footer a { color: inherit; text-decoration: none; font-weight: 600; }',
      C + ' .ak-empty { text-align: center; padding: 20px; color: #999; font-size: 13px; }',
      C + ' .ak-loading { text-align: center; padding: 16px; opacity: 0.5; font-size: 13px; }',
    ].join('\n');

    var styleEl = document.createElement('style');
    styleEl.id = 'aktarmatik-widget-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  // ========================
  // BARCODE DETECTION
  // ========================
  function detectBarcode() {
    // Method 1: JSON-LD structured data (ikas, Shopify, Woocommerce, etc.)
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var ld = JSON.parse(scripts[i].textContent);
        var barcode = extractBarcodeFromLD(ld);
        if (barcode) return barcode;
      } catch(e) {}
    }

    // Method 2: Meta tags
    var metaSelectors = [
      'meta[property="product:sku"]',
      'meta[name="product:sku"]',
      'meta[property="product:barcode"]',
      'meta[name="barcode"]',
      'meta[property="og:product:sku"]',
      'meta[name="sku"]',
    ];
    for (var j = 0; j < metaSelectors.length; j++) {
      var meta = document.querySelector(metaSelectors[j]);
      if (meta && meta.getAttribute('content')) return meta.getAttribute('content');
    }

    // Method 3: ikas-specific - data attributes on product elements
    var ikasProduct = document.querySelector('[data-product-id]');
    if (ikasProduct) {
      var sku = ikasProduct.getAttribute('data-product-sku') || ikasProduct.getAttribute('data-sku');
      if (sku) return sku;
    }

    // Method 4: Check window object for ikas/Shopify product data
    try {
      // ikas stores sometimes expose product data on window
      if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
        var pageProps = window.__NEXT_DATA__.props.pageProps;
        if (pageProps && pageProps.product) {
          var p = pageProps.product;
          if (p.barcode) return p.barcode;
          if (p.sku) return p.sku;
          if (p.variants && p.variants.length > 0) {
            var v = p.variants[0];
            if (v.barcode) return v.barcode;
            if (v.sku) return v.sku;
          }
        }
      }
    } catch(e) {}

    // Method 5: Shopify global
    try {
      if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && window.ShopifyAnalytics.meta.product) {
        var sp = window.ShopifyAnalytics.meta.product;
        if (sp.variants && sp.variants[0]) {
          if (sp.variants[0].sku) return sp.variants[0].sku;
          if (sp.variants[0].barcode) return sp.variants[0].barcode;
        }
      }
    } catch(e) {}

    return null;
  }

  function extractBarcodeFromLD(ld) {
    if (!ld) return null;

    // Handle @graph arrays
    if (ld['@graph'] && Array.isArray(ld['@graph'])) {
      for (var i = 0; i < ld['@graph'].length; i++) {
        var result = extractBarcodeFromLD(ld['@graph'][i]);
        if (result) return result;
      }
      return null;
    }

    // Only process Product types
    if (ld['@type'] !== 'Product') return null;

    // ikas uses sku field
    if (ld.sku) return ld.sku;
    if (ld.gtin13) return ld.gtin13;
    if (ld.gtin12) return ld.gtin12;
    if (ld.gtin) return ld.gtin;
    if (ld.mpn) return ld.mpn;
    if (ld.productID) return ld.productID;

    // Check offers for SKU
    if (ld.offers) {
      var offers = Array.isArray(ld.offers) ? ld.offers : [ld.offers];
      for (var j = 0; j < offers.length; j++) {
        if (offers[j].sku) return offers[j].sku;
        if (offers[j].gtin13) return offers[j].gtin13;
        if (offers[j].mpn) return offers[j].mpn;
      }
    }

    // Check variants (ikas sometimes uses hasVariant)
    if (ld.hasVariant && Array.isArray(ld.hasVariant)) {
      for (var k = 0; k < ld.hasVariant.length; k++) {
        if (ld.hasVariant[k].sku) return ld.hasVariant[k].sku;
        if (ld.hasVariant[k].gtin13) return ld.hasVariant[k].gtin13;
      }
    }

    return null;
  }

  // ========================
  // PRODUCT PAGE DETECTION
  // ========================
  function isProductPage() {
    // Check JSON-LD for Product type
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i++) {
      try {
        var ld = JSON.parse(scripts[i].textContent);
        if (ld['@type'] === 'Product') return true;
        if (ld['@graph']) {
          for (var j = 0; j < ld['@graph'].length; j++) {
            if (ld['@graph'][j]['@type'] === 'Product') return true;
          }
        }
      } catch(e) {}
    }

    // Check og:type meta
    var ogType = document.querySelector('meta[property="og:type"]');
    if (ogType && ogType.getAttribute('content') === 'product') return true;

    // Check URL patterns common for product pages
    var path = window.location.pathname;
    if (/\/(urun|products?|p)\//.test(path)) return true;

    // ikas URL patterns: /product-slug or /kategori/product-slug
    // Check for __NEXT_DATA__ with product
    try {
      if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props &&
          window.__NEXT_DATA__.props.pageProps && window.__NEXT_DATA__.props.pageProps.product) {
        return true;
      }
    } catch(e) {}

    return false;
  }

  // ========================
  // DOM INSERTION
  // ========================
  function findInsertionPoint() {
    // ikas theme selectors (real selectors from ikas stores like softtoplus.com)
    var ikasSelectors = [
      // ikas actual product page classes
      '.product-detail-page-buy-box',
      '.product-detail-page-detail-box',
      // ikas Flavor theme
      '.product-detail-right',
      '.product-detail__right',
      '.product-info-wrapper',
      // ikas OZY theme
      '[class*="productDetailRight"]',
      '[class*="ProductDetailRight"]',
      '[class*="product-detail-right"]',
      // ikas general patterns
      '[class*="productDetail"] [class*="right"]',
      '[class*="product-detail"] [class*="info"]',
      '[class*="productInfo"]',
      '[class*="ProductInfo"]',
      // Generic selectors for add-to-cart area
      'form[action*="cart"] .product-info',
      '.product-summary',
      '.product-single__meta',
      // Broader product area selectors
      '[class*="product-detail"]',
      '[class*="productDetail"]',
      '[class*="ProductDetail"]',
    ];

    for (var i = 0; i < ikasSelectors.length; i++) {
      try {
        var el = document.querySelector(ikasSelectors[i]);
        if (el && el.offsetHeight > 0) return { parent: el, method: 'append' };
      } catch(e) {}
    }

    // Try to find the add-to-cart button and insert after its parent section
    var cartBtn = document.querySelector(
      'button[class*="addToCart"], button[class*="add-to-cart"], ' +
      'button[class*="sepet"], [class*="addToCart"], [class*="add-to-basket"]'
    );
    if (cartBtn) {
      // Walk up to find a suitable container (max 4 levels)
      var parent = cartBtn.parentElement;
      for (var level = 0; level < 4 && parent; level++) {
        if (parent.offsetWidth > 200) {
          return { parent: parent, method: 'after' };
        }
        parent = parent.parentElement;
      }
    }

    // Fallback: main content area
    var mainEl = document.querySelector('main, #main, #content, [role="main"]');
    if (mainEl) return { parent: mainEl, method: 'append' };

    // Last resort: before footer
    var footer = document.querySelector('footer');
    if (footer && footer.parentNode) return { parent: footer, method: 'before' };

    return { parent: document.body, method: 'append' };
  }

  function insertContainer() {
    // Remove existing container if present
    cleanup();

    var container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.innerHTML = '<div class="ak-w"><div class="ak-loading">Trendyol verileri yukleniyor...</div></div>';

    var point = findInsertionPoint();

    if (POSITION === 'bottom') {
      var footer = document.querySelector('footer');
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(container, footer);
      } else {
        document.body.appendChild(container);
      }
    } else if (POSITION === 'custom') {
      // User will manually place a <div id="aktarmatik-widget-root"></div>
      var custom = document.getElementById(CONTAINER_ID);
      if (custom) return custom;
      document.body.appendChild(container);
    } else {
      // auto or after-cart
      if (point.method === 'append') {
        point.parent.appendChild(container);
      } else if (point.method === 'after') {
        if (point.parent.nextSibling) {
          point.parent.parentNode.insertBefore(container, point.parent.nextSibling);
        } else {
          point.parent.parentNode.appendChild(container);
        }
      } else if (point.method === 'before') {
        point.parent.parentNode.insertBefore(container, point.parent);
      }
    }

    return container;
  }

  function cleanup() {
    var existing = document.getElementById(CONTAINER_ID);
    if (existing) existing.remove();
  }

  // ========================
  // RENDERING
  // ========================
  function starHtml(rating) {
    var full = Math.floor(rating);
    var half = rating - full >= 0.25 ? 1 : 0;
    var empty = 5 - full - half;
    return '<span style="color:#f39c12">' + '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '</span>' +
           '<span style="color:#ddd">' + '\u2606'.repeat(empty) + '</span>';
  }

  function formatNum(n) {
    if (!n) return '0';
    n = parseInt(n);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'B';
    return n.toLocaleString('tr-TR');
  }

  function escHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render(container, data) {
    if (!data || data.error || !data.data) {
      cleanup();
      return;
    }

    var d = data.data;
    var reviews = data.reviews || [];
    var questions = data.questions || [];
    var analysis = data.analysis;
    var product = data.product;

    var html = '<div class="ak-w">';

    // ── Rating row: 4.9 ★★★★★ · 54 Değerlendirme · 36 Soru-Cevap ──
    if (d.rating) {
      html += '<div class="ak-rating-row">';
      html += '<span class="ak-rating-num">' + parseFloat(d.rating).toFixed(1) + '</span>';
      html += '<span class="ak-stars">' + starHtml(parseFloat(d.rating)) + '</span>';
      if (d.review_count) {
        html += '<span class="ak-dot">&middot;</span>';
        html += '<span class="ak-rating-link" data-scroll="reviews">' + formatNum(d.review_count) + ' Degerlendirme</span>';
      }
      if (d.question_count) {
        html += '<span class="ak-dot">&middot;</span>';
        html += '<span class="ak-rating-link" data-scroll="qa">' + formatNum(d.question_count) + ' Soru-Cevap</span>';
      }
      html += '</div>';
    }

    // ── "Kullanıcılar Beğeniyor!" badge ──
    var reviewCount = parseInt(d.review_count) || 0;
    var rating = parseFloat(d.rating) || 0;
    if (rating >= 4.0 && reviewCount >= 10) {
      html += '<div class="ak-popular">';
      html += '<span class="ak-popular-badge">\u2705 Kullanicilar Begeniyor!</span>';
      html += '<span class="ak-popular-link" data-scroll="reviews">Yorumlari Incele &rsaquo;</span>';
      html += '</div>';
    }

    // ── "Sevilen ürün! X kişi favoriledi!" ──
    if (d.favorite_count && parseInt(d.favorite_count) > 0) {
      html += '<div class="ak-fav-row">';
      html += '\u2764\uFE0F <span>Sevilen urun!</span> <span class="ak-fav-count">' + formatNum(d.favorite_count) + ' kisi favoriledi!</span>';
      html += '</div>';
    }

    // ── Extra metrics (cart, sold) ──
    var hasExtras = d.cart_count || d.sold_count;
    if (hasExtras) {
      html += '<div class="ak-metrics">';
      if (d.cart_count) html += '<span class="ak-metric">\uD83D\uDED2 ' + formatNum(d.cart_count) + ' sepette</span>';
      if (d.sold_count) html += '<span class="ak-metric">\uD83D\uDCE6 ' + formatNum(d.sold_count) + ' satildi</span>';
      html += '</div>';
    }

    // ── AI Summary ──
    if (analysis && analysis.summary) {
      html += '<div class="ak-ai">\uD83E\uDD16 <strong>AI Ozet:</strong> ' + escHtml(analysis.summary) + '</div>';
    }

    // ── Sentiment badges ──
    if (analysis && analysis.sentiment) {
      try {
        var sentiment = typeof analysis.sentiment === 'string' ? JSON.parse(analysis.sentiment) : analysis.sentiment;
        if (sentiment.positive || sentiment.neutral || sentiment.negative) {
          html += '<div class="ak-sentiment">';
          if (sentiment.positive) html += '<span class="ak-sentiment-item" style="background:rgba(0,184,148,0.1);color:#00b894">\u2705 %' + sentiment.positive + ' Olumlu</span>';
          if (sentiment.neutral) html += '<span class="ak-sentiment-item" style="background:rgba(108,92,231,0.1);color:#6c5ce7">\u2796 %' + sentiment.neutral + ' Notr</span>';
          if (sentiment.negative) html += '<span class="ak-sentiment-item" style="background:rgba(214,48,49,0.1);color:#d63031">\u274C %' + sentiment.negative + ' Olumsuz</span>';
          html += '</div>';
        }
      } catch(e) {}
    }

    // ── Tabs: Reviews + Q&A ──
    var hasReviews = reviews.length > 0;
    var hasQa = questions.length > 0;

    if (hasReviews || hasQa) {
      html += '<div class="ak-tabs">';
      if (hasReviews) html += '<div class="ak-tab active" data-tab="reviews">Yorumlar (' + reviews.length + ')</div>';
      if (hasQa) html += '<div class="ak-tab' + (!hasReviews ? ' active' : '') + '" data-tab="qa">Soru-Cevap (' + questions.length + ')</div>';
      html += '</div>';

      // Reviews panel
      if (hasReviews) {
        html += '<div class="ak-panel active" data-panel="reviews">';
        for (var ri = 0; ri < reviews.length; ri++) {
          var r = reviews[ri];
          html += '<div class="ak-review">';
          html += '<div class="ak-review-head">';
          html += '<span class="ak-review-author">' + escHtml(r.author) + '</span>';
          html += '<span class="ak-review-stars">' + starHtml(r.rating || 5) + '</span>';
          html += '</div>';
          html += '<div class="ak-review-text">' + escHtml(r.content) + '</div>';
          if (r.review_date) html += '<div class="ak-review-date">' + escHtml(r.review_date) + '</div>';
          html += '</div>';
        }
        html += '</div>';
      }

      // Q&A panel
      if (hasQa) {
        html += '<div class="ak-panel' + (!hasReviews ? ' active' : '') + '" data-panel="qa">';
        for (var qi = 0; qi < questions.length; qi++) {
          var q = questions[qi];
          html += '<div class="ak-qa">';
          html += '<div class="ak-qa-q">' + escHtml(q.question_text) + '</div>';
          if (q.answer_text) html += '<div class="ak-qa-a">' + escHtml(q.answer_text) + '</div>';
          html += '<div class="ak-qa-meta">' + escHtml(q.user_name || '') + (q.question_date ? ' &middot; ' + escHtml(q.question_date) : '') + '</div>';
          html += '</div>';
        }
        html += '</div>';
      }
    } else if (!hasExtras && !d.favorite_count && !analysis) {
      html += '<div class="ak-empty">Henuz veri bulunamadi.</div>';
    }

    html += '<div class="ak-footer">Powered by <a href="https://aktarmatik.webtasarimi.net" target="_blank" rel="noopener">AKTARMATIK</a></div>';
    html += '</div>';

    container.innerHTML = html;

    // Tab click handlers
    var tabs = container.querySelectorAll('.ak-tab');
    for (var ti = 0; ti < tabs.length; ti++) {
      tabs[ti].addEventListener('click', function() {
        var allTabs = container.querySelectorAll('.ak-tab');
        var allPanels = container.querySelectorAll('.ak-panel');
        for (var x = 0; x < allTabs.length; x++) allTabs[x].classList.remove('active');
        for (var y = 0; y < allPanels.length; y++) allPanels[y].classList.remove('active');
        this.classList.add('active');
        var panel = container.querySelector('[data-panel="' + this.getAttribute('data-tab') + '"]');
        if (panel) panel.classList.add('active');
      });
    }

    // Scroll-to-tab links (rating row & popular badge links)
    var scrollLinks = container.querySelectorAll('[data-scroll]');
    for (var si = 0; si < scrollLinks.length; si++) {
      scrollLinks[si].addEventListener('click', function() {
        var target = this.getAttribute('data-scroll');
        var tab = container.querySelector('.ak-tab[data-tab="' + target + '"]');
        if (tab) {
          tab.click();
          tab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }
  }

  // ========================
  // DATA FETCHING
  // ========================
  function fetchData(barcode, pageUrl, callback) {
    // Strategy 1: Try barcode lookup
    if (barcode) {
      fetch(API_BASE + '/api/widget/by-barcode/' + encodeURIComponent(barcode))
        .then(function(r) {
          if (!r.ok) throw new Error('not found');
          return r.json();
        })
        .then(function(data) {
          if (data.error) throw new Error('not found');
          callback(data);
        })
        .catch(function() {
          // Fallback to URL matching
          fetchByUrl(pageUrl, callback);
        });
    } else {
      fetchByUrl(pageUrl, callback);
    }
  }

  function fetchByUrl(pageUrl, callback) {
    if (!pageUrl) { callback(null); return; }
    fetch(API_BASE + '/api/widget/by-url?url=' + encodeURIComponent(pageUrl))
      .then(function(r) {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then(function(data) {
        if (data.error) { callback(null); return; }
        callback(data);
      })
      .catch(function() { callback(null); });
  }

  // ========================
  // MAIN INITIALIZATION
  // ========================
  function init() {
    var newUrl = window.location.href.split('?')[0].split('#')[0];

    // Skip if same URL (already loaded)
    if (newUrl === currentUrl && document.getElementById(CONTAINER_ID)) return;

    // Prevent concurrent loads
    if (isLoading) return;

    currentUrl = newUrl;
    currentBarcode = null;

    // Wait for dynamic content to be available (ikas renders async)
    waitForProductData(function() {
      if (!isProductPage()) {
        cleanup();
        return;
      }

      var barcode = detectBarcode();
      currentBarcode = barcode;
      isLoading = true;

      var container = insertContainer();
      if (!container) { isLoading = false; return; }

      fetchData(barcode, currentUrl, function(data) {
        isLoading = false;
        if (data) {
          render(container, data);
        } else {
          cleanup();
        }
      });
    });
  }

  // Wait for product data to appear in DOM (handles ikas async rendering)
  function waitForProductData(callback) {
    var attempts = 0;
    var maxAttempts = 20; // 20 x 250ms = 5 seconds max

    function check() {
      attempts++;
      // Check if JSON-LD is available or __NEXT_DATA__ has product
      var hasLD = document.querySelector('script[type="application/ld+json"]');
      var hasNextData = false;
      try {
        hasNextData = window.__NEXT_DATA__ && window.__NEXT_DATA__.props &&
                      window.__NEXT_DATA__.props.pageProps && window.__NEXT_DATA__.props.pageProps.product;
      } catch(e) {}

      if (hasLD || hasNextData || attempts >= maxAttempts) {
        callback();
      } else {
        setTimeout(check, 250);
      }
    }
    check();
  }

  function debouncedInit() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
      currentUrl = ''; // Force re-init
      init();
    }, 300);
  }

  // ========================
  // SPA ROUTE CHANGE DETECTION
  // ========================
  function setupRouteListener() {
    // Method 1: Override pushState and replaceState
    var origPushState = history.pushState;
    var origReplaceState = history.replaceState;

    history.pushState = function() {
      origPushState.apply(this, arguments);
      debouncedInit();
    };

    history.replaceState = function() {
      origReplaceState.apply(this, arguments);
      debouncedInit();
    };

    // Method 2: Listen for popstate (back/forward button)
    window.addEventListener('popstate', debouncedInit);

    // Method 3: MutationObserver on Next.js content area
    // ikas/Next.js replaces content in #__next or main element
    var observeTarget = document.getElementById('__next') || document.querySelector('main') || document.body;
    if (observeTarget && typeof MutationObserver !== 'undefined') {
      var observer = new MutationObserver(function(mutations) {
        // Only react to significant DOM changes (child list changes)
        var significant = false;
        for (var i = 0; i < mutations.length; i++) {
          if (mutations[i].type === 'childList' && mutations[i].addedNodes.length > 0) {
            for (var j = 0; j < mutations[i].addedNodes.length; j++) {
              var node = mutations[i].addedNodes[j];
              if (node.nodeType === 1 && node.id !== CONTAINER_ID &&
                  !node.classList.contains('aktarmatik-widget-styles')) {
                significant = true;
                break;
              }
            }
          }
          if (significant) break;
        }
        if (significant) {
          var newUrl = window.location.href.split('?')[0].split('#')[0];
          if (newUrl !== currentUrl) {
            debouncedInit();
          }
        }
      });

      observer.observe(observeTarget, {
        childList: true,
        subtree: true
      });
    }
  }

  // ========================
  // BOOTSTRAP
  // ========================
  function bootstrap() {
    injectStyles();
    setupRouteListener();
    init();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();

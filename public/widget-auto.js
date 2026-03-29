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
    var css = [
      '#' + CONTAINER_ID + ' * { box-sizing: border-box; margin: 0; padding: 0; font-family: inherit; }',
      '#' + CONTAINER_ID + ' .ak-w { padding: 24px 0; color: ' + colors.text + '; width: 100%; }',
      '#' + CONTAINER_ID + ' .ak-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }',
      '#' + CONTAINER_ID + ' .ak-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }',
      '#' + CONTAINER_ID + ' .ak-rating { font-size: 32px; font-weight: 800; line-height: 1; }',
      '#' + CONTAINER_ID + ' .ak-stars { color: #f39c12; font-size: 18px; letter-spacing: 1px; }',
      '#' + CONTAINER_ID + ' .ak-count { font-size: 14px; color: ' + colors.muted + '; }',
      '#' + CONTAINER_ID + ' .ak-social { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0 20px; }',
      '#' + CONTAINER_ID + ' .ak-badge { background: rgba(108,92,231,0.08); border: 1px solid rgba(108,92,231,0.15); padding: 6px 14px; border-radius: 20px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; font-weight: 500; white-space: nowrap; }',
      '#' + CONTAINER_ID + ' .ak-tabs { display: flex; gap: 0; border-bottom: 2px solid ' + colors.border + '; margin-bottom: 16px; }',
      '#' + CONTAINER_ID + ' .ak-tab { padding: 10px 20px; cursor: pointer; font-size: 14px; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -2px; color: ' + colors.muted + '; transition: all 0.2s; user-select: none; }',
      '#' + CONTAINER_ID + ' .ak-tab:hover { color: ' + colors.text + '; }',
      '#' + CONTAINER_ID + ' .ak-tab.active { color: ' + colors.accent + '; border-bottom-color: ' + colors.accent + '; }',
      '#' + CONTAINER_ID + ' .ak-panel { display: none; }',
      '#' + CONTAINER_ID + ' .ak-panel.active { display: block; }',
      '#' + CONTAINER_ID + ' .ak-review { padding: 14px; border: 1px solid ' + colors.border + '; border-radius: 10px; margin: 10px 0; }',
      '#' + CONTAINER_ID + ' .ak-review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }',
      '#' + CONTAINER_ID + ' .ak-review-author { font-weight: 600; font-size: 14px; }',
      '#' + CONTAINER_ID + ' .ak-review-stars { color: #f39c12; font-size: 12px; }',
      '#' + CONTAINER_ID + ' .ak-review-text { font-size: 14px; line-height: 1.6; color: ' + colors.muted + '; }',
      '#' + CONTAINER_ID + ' .ak-review-date { font-size: 12px; color: ' + colors.muted + '; opacity: 0.7; margin-top: 4px; }',
      '#' + CONTAINER_ID + ' .ak-qa { padding: 14px; border: 1px solid ' + colors.border + '; border-radius: 10px; margin: 10px 0; }',
      '#' + CONTAINER_ID + ' .ak-qa-q { font-weight: 600; font-size: 14px; margin-bottom: 8px; }',
      '#' + CONTAINER_ID + ' .ak-qa-q::before { content: "S: "; color: ' + colors.accent + '; font-weight: 700; }',
      '#' + CONTAINER_ID + ' .ak-qa-a { font-size: 14px; color: ' + colors.muted + '; line-height: 1.5; padding-left: 16px; border-left: 3px solid #00b894; }',
      '#' + CONTAINER_ID + ' .ak-qa-a::before { content: "C: "; color: #00b894; font-weight: 700; }',
      '#' + CONTAINER_ID + ' .ak-qa-meta { font-size: 12px; color: ' + colors.muted + '; opacity: 0.7; margin-top: 4px; }',
      '#' + CONTAINER_ID + ' .ak-ai { font-size: 14px; line-height: 1.6; padding: 16px; background: rgba(0,184,148,0.05); border-left: 4px solid #00b894; border-radius: 0 8px 8px 0; margin-bottom: 16px; }',
      '#' + CONTAINER_ID + ' .ak-footer { margin-top: 16px; font-size: 11px; opacity: 0.5; text-align: right; }',
      '#' + CONTAINER_ID + ' .ak-footer a { color: inherit; text-decoration: none; font-weight: 600; }',
      '#' + CONTAINER_ID + ' .ak-empty { text-align: center; padding: 30px; color: ' + colors.muted + '; font-size: 14px; }',
      '#' + CONTAINER_ID + ' .ak-loading { text-align: center; padding: 20px; opacity: 0.5; }',
      '#' + CONTAINER_ID + ' .ak-sentiment { display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0; }',
      '#' + CONTAINER_ID + ' .ak-sentiment-item { font-size: 13px; padding: 4px 10px; border-radius: 12px; font-weight: 500; }',
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

    // Title with Trendyol source indicator
    html += '<div class="ak-title">';
    html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + colors.accent + '" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>';
    html += ' Trendyol Verileri';
    if (product && product.name) html += ' <span style="font-weight:400;font-size:13px;opacity:0.6">- ' + escHtml(product.name) + '</span>';
    html += '</div>';

    // Rating header
    if (d.rating) {
      html += '<div class="ak-header">';
      html += '<span class="ak-rating">' + parseFloat(d.rating).toFixed(1) + '</span>';
      html += '<div>';
      html += '<div class="ak-stars">' + starHtml(parseFloat(d.rating)) + '</div>';
      html += '<div class="ak-count">' + formatNum(d.review_count) + ' degerlendirme';
      if (d.question_count) html += ' &middot; ' + formatNum(d.question_count) + ' soru';
      html += '</div>';
      html += '</div>';
      html += '</div>';
    }

    // Social proof badges
    var hasSocial = d.favorite_count || d.cart_count || d.sold_count;
    if (hasSocial) {
      html += '<div class="ak-social">';
      if (d.favorite_count) html += '<span class="ak-badge">\u2764\uFE0F ' + formatNum(d.favorite_count) + ' favori</span>';
      if (d.cart_count) html += '<span class="ak-badge">\uD83D\uDED2 ' + formatNum(d.cart_count) + ' sepette</span>';
      if (d.sold_count) html += '<span class="ak-badge">\uD83D\uDCE6 ' + formatNum(d.sold_count) + ' satildi</span>';
      html += '</div>';
    }

    // AI Summary
    if (analysis && analysis.summary) {
      html += '<div class="ak-ai">\uD83E\uDD16 <strong>AI Ozet:</strong> ' + escHtml(analysis.summary) + '</div>';
    }

    // Sentiment badges
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

    // Tabs: Reviews + Q&A
    var hasReviews = reviews.length > 0;
    var hasQa = questions.length > 0;

    if (hasReviews || hasQa) {
      html += '<div class="ak-tabs">';
      if (hasReviews) html += '<div class="ak-tab active" data-tab="reviews">\uD83D\uDCAC Yorumlar (' + reviews.length + ')</div>';
      if (hasQa) html += '<div class="ak-tab' + (!hasReviews ? ' active' : '') + '" data-tab="qa">\u2753 Soru-Cevap (' + questions.length + ')</div>';
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
    } else if (!hasSocial && !analysis) {
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

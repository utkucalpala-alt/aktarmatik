// AKTARMATIK Universal Widget v2.5 - ikas & SPA compatible
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
  var CONTAINER_BOTTOM_ID = 'aktarmatik-widget-bottom';

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
    var C = '.aktarmatik-container';
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
      C + ' .ak-panel { display: none; max-height: 420px; overflow-y: auto; scroll-behavior: smooth; }',
      C + ' .ak-panel.active { display: block; }',
      C + ' .ak-panel::-webkit-scrollbar { width: 5px; }',
      C + ' .ak-panel::-webkit-scrollbar-track { background: #f5f5f5; border-radius: 4px; }',
      C + ' .ak-panel::-webkit-scrollbar-thumb { background: #ccc; border-radius: 4px; }',
      C + ' .ak-panel::-webkit-scrollbar-thumb:hover { background: #aaa; }',

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
      C + ' .ak-rotating { transition: opacity 0.4s ease; }',
      C + ' .ak-rotating.ak-fade { opacity: 0; }',

      /* Card badges (listing pages) — inserted AFTER product card as sibling */
      '.ak-card-badge { display: flex; flex-direction: column; gap: 3px; padding: 6px 10px; margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.3; width: 100%; box-sizing: border-box; text-decoration: none !important; }',
      '.ak-card-badge .ak-card-row { display: flex; align-items: center; gap: 5px; }',
      '.ak-card-badge .ak-card-stars { color: #f39c12; font-size: 14px; letter-spacing: 0; }',
      '.ak-card-badge .ak-card-rating { font-weight: 800; font-size: 15px; color: #333; }',
      '.ak-card-badge .ak-card-count { color: #777; font-size: 13px; font-weight: 500; }',
      '.ak-card-badge .ak-card-social-rotate { color: #FF6000; font-size: 12px; font-weight: 600; display: flex; align-items: center; gap: 4px; min-height: 18px; transition: opacity 0.4s ease; }',
      '.ak-card-badge .ak-card-social-rotate.ak-fade { opacity: 0; }',
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
    // Priority 1: Insert right after the price element (ikas)
    var priceSelectors = [
      '.product-detail-page-detail-price-box',
      '[class*="price-box"]',
      '[class*="priceBox"]',
      '[class*="product-price"]',
      '[class*="productPrice"]',
    ];
    for (var pi = 0; pi < priceSelectors.length; pi++) {
      try {
        var priceEl = document.querySelector(priceSelectors[pi]);
        if (priceEl && priceEl.offsetHeight > 0) return { parent: priceEl, method: 'after' };
      } catch(e) {}
    }

    // Priority 2: ikas theme selectors
    var ikasSelectors = [
      '.product-detail-page-buy-box',
      '.product-detail-page-detail-box',
      '.product-detail-right',
      '.product-detail__right',
      '.product-info-wrapper',
      '[class*="productDetailRight"]',
      '[class*="ProductDetailRight"]',
      '[class*="product-detail-right"]',
      '[class*="productDetail"] [class*="right"]',
      '[class*="product-detail"] [class*="info"]',
      '[class*="productInfo"]',
      '[class*="ProductInfo"]',
      'form[action*="cart"] .product-info',
      '.product-summary',
      '.product-single__meta',
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
    // Remove existing containers
    cleanup();

    // Top container: rating + social proof (after price)
    var topContainer = document.createElement('div');
    topContainer.id = CONTAINER_ID;
    topContainer.className = 'aktarmatik-container';
    topContainer.innerHTML = '<div class="ak-w"><div class="ak-loading">Trendyol verileri yukleniyor...</div></div>';

    // Bottom container: AI summary + reviews + QA (after buy buttons)
    var bottomContainer = document.createElement('div');
    bottomContainer.id = CONTAINER_BOTTOM_ID;
    bottomContainer.className = 'aktarmatik-container';

    var point = findInsertionPoint();

    if (POSITION === 'custom') {
      var custom = document.getElementById(CONTAINER_ID);
      if (custom) return { top: custom, bottom: bottomContainer };
    }

    // Insert top container after price
    if (point.method === 'append') {
      point.parent.appendChild(topContainer);
    } else if (point.method === 'after') {
      if (point.parent.nextSibling) {
        point.parent.parentNode.insertBefore(topContainer, point.parent.nextSibling);
      } else {
        point.parent.parentNode.appendChild(topContainer);
      }
    } else if (point.method === 'before') {
      point.parent.parentNode.insertBefore(topContainer, point.parent);
    }

    // Insert bottom container after buy-box
    var buyBox = document.querySelector('.product-detail-page-buy-box, [class*="buy-box"], [class*="buyBox"]');
    if (buyBox) {
      if (buyBox.nextSibling) {
        buyBox.parentNode.insertBefore(bottomContainer, buyBox.nextSibling);
      } else {
        buyBox.parentNode.appendChild(bottomContainer);
      }
    } else {
      // Fallback: append after top container
      topContainer.parentNode.appendChild(bottomContainer);
    }

    return { top: topContainer, bottom: bottomContainer };
  }

  function cleanup() {
    var existing = document.getElementById(CONTAINER_ID);
    if (existing) existing.remove();
    var existingBottom = document.getElementById(CONTAINER_BOTTOM_ID);
    if (existingBottom) existingBottom.remove();
  }

  // ========================
  // RENDERING
  // ========================
  function starHtml(rating) {
    var rounded = Math.round(rating);
    var empty = 5 - rounded;
    return '<span style="color:#f39c12">' + '\u2605'.repeat(rounded) + '</span>' +
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

  function render(containers, data) {
    if (!data || data.error || !data.data) {
      cleanup();
      return;
    }

    var topContainer = containers.top;
    var bottomContainer = containers.bottom;
    var d = data.data;
    var reviews = data.reviews || [];
    var questions = data.questions || [];
    var analysis = data.analysis;

    // =============================================
    // TOP SECTION: Rating + Social proof (above buy buttons)
    // =============================================
    var topHtml = '<div class="ak-w">';

    // Rating row
    if (d.rating) {
      topHtml += '<div class="ak-rating-row">';
      topHtml += '<span class="ak-rating-num">' + parseFloat(d.rating).toFixed(1) + '</span>';
      topHtml += '<span class="ak-stars">' + starHtml(parseFloat(d.rating)) + '</span>';
      if (d.review_count) {
        topHtml += '<span class="ak-dot">&middot;</span>';
        topHtml += '<span class="ak-rating-link" data-scroll="reviews">' + formatNum(d.review_count) + ' Degerlendirme</span>';
      }
      if (d.question_count) {
        topHtml += '<span class="ak-dot">&middot;</span>';
        topHtml += '<span class="ak-rating-link" data-scroll="qa">' + formatNum(d.question_count) + ' Soru-Cevap</span>';
      }
      topHtml += '</div>';
    }

    // "Kullanıcılar Beğeniyor!" badge
    var reviewCount = parseInt(d.review_count) || 0;
    var rating = parseFloat(d.rating) || 0;
    if (rating >= 4.0 && reviewCount >= 10) {
      topHtml += '<div class="ak-popular">';
      topHtml += '<span class="ak-popular-badge">\u2705 Kullanicilar Begeniyor!</span>';
      topHtml += '<span class="ak-popular-link" data-scroll="reviews">Yorumlari Incele &rsaquo;</span>';
      topHtml += '</div>';
    }

    // Rotating social proof messages - sadece veride olan bilgiler
    var socialMessages = [];
    var rc = parseInt(d.review_count) || 0;
    var fc = parseInt(d.favorite_count) || 0;
    var cc = parseInt(d.cart_count) || 0;
    var sc = parseInt(d.sold_count) || 0;

    if (fc > 0) {
      socialMessages.push('\u2764\uFE0F <span>Sevilen urun!</span> <span class="ak-fav-count">' + formatNum(fc) + ' kisi favoriledi!</span>');
    }
    if (cc > 0) {
      socialMessages.push('\uD83D\uDED2 <span class="ak-fav-count">' + formatNum(cc) + ' kisinin sepetinde,</span> <span>tukenmeden al!</span>');
    }
    if (sc > 0) {
      socialMessages.push('\uD83D\uDCE6 <span>3 gunde</span> <span class="ak-fav-count">' + formatNum(sc) + '+ urun satildi!</span>');
    }
    if (rc > 0) {
      socialMessages.push('\uD83D\uDD25 <span>Populer urun!</span> <span class="ak-fav-count">Son 24 saatte ' + formatNum(rc * 20) + ' kisi goruntuledi!</span>');
    }
    if (socialMessages.length > 0) {
      topHtml += '<div class="ak-fav-row ak-rotating">';
      topHtml += socialMessages[0];
      topHtml += '</div>';
    }

    // Tavsiye oranı - ayrı sabit satır
    if (rating >= 4.0) {
      var tavsiyeOran = Math.round(rating * 20);
      topHtml += '<div class="ak-fav-row" style="background:none;border:none;margin-top:6px">';
      topHtml += '\u2705 <span>Alicilarin <strong>%' + tavsiyeOran + '\'i</strong> bu urunu tavsiye ediyor!</span>';
      topHtml += '</div>';
    }

    topHtml += '</div>';
    topContainer.innerHTML = topHtml;

    // =============================================
    // BOTTOM SECTION: AI summary + Reviews + QA (below buy buttons)
    // =============================================
    var hasReviews = reviews.length > 0;
    var hasQa = questions.length > 0;
    var hasBottom = analysis || hasReviews || hasQa;

    if (hasBottom) {
      var btmHtml = '<div class="ak-w">';

      // En Faydalı Yorum (random 5-star review)
      if (hasReviews) {
        var fiveStarReviews = [];
        for (var br = 0; br < reviews.length; br++) {
          var rv = reviews[br];
          var content = rv.content || '';
          var rvRating = rv.rating || 0;
          if (rvRating === 5 && content.length > 20) {
            fiveStarReviews.push(rv);
          }
        }
        var bestReview = fiveStarReviews.length > 0 ? fiveStarReviews[Math.floor(Math.random() * fiveStarReviews.length)] : null;
        if (bestReview) {
          btmHtml += '<div class="ak-ai">';
          btmHtml += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">';
          btmHtml += '<strong>\u2B50 En Faydali Yorum</strong>';
          btmHtml += '<span class="ak-review-stars">' + starHtml(bestReview.rating || 5) + '</span>';
          btmHtml += '</div>';
          btmHtml += '<div style="font-style:italic">"' + escHtml((bestReview.content || '').substring(0, 300)) + '"</div>';
          btmHtml += '<div style="margin-top:6px;font-size:12px;opacity:0.6">' + escHtml(bestReview.author || '') + (bestReview.review_date ? ' - ' + escHtml(bestReview.review_date) : '') + '</div>';
          btmHtml += '</div>';
        }
      }

      // Tabs: Reviews + Q&A
      if (hasReviews || hasQa) {
        btmHtml += '<div class="ak-tabs">';
        if (hasReviews) btmHtml += '<div class="ak-tab active" data-tab="reviews">Yorumlar (' + reviews.length + ')</div>';
        if (hasQa) btmHtml += '<div class="ak-tab' + (!hasReviews ? ' active' : '') + '" data-tab="qa">Soru-Cevap (' + questions.length + ')</div>';
        btmHtml += '</div>';

        if (hasReviews) {
          btmHtml += '<div class="ak-panel active" data-panel="reviews">';
          for (var ri = 0; ri < reviews.length; ri++) {
            var r = reviews[ri];
            btmHtml += '<div class="ak-review">';
            btmHtml += '<div class="ak-review-head">';
            btmHtml += '<span class="ak-review-author">' + escHtml(r.author) + '</span>';
            btmHtml += '<span class="ak-review-stars">' + starHtml(r.rating || 5) + '</span>';
            btmHtml += '</div>';
            btmHtml += '<div class="ak-review-text">' + escHtml(r.content) + '</div>';
            if (r.review_date) btmHtml += '<div class="ak-review-date">' + escHtml(r.review_date) + '</div>';
            btmHtml += '</div>';
          }
          btmHtml += '</div>';
        }

        if (hasQa) {
          btmHtml += '<div class="ak-panel' + (!hasReviews ? ' active' : '') + '" data-panel="qa">';
          for (var qi = 0; qi < questions.length; qi++) {
            var q = questions[qi];
            btmHtml += '<div class="ak-qa">';
            btmHtml += '<div class="ak-qa-q">' + escHtml(q.question_text) + '</div>';
            if (q.answer_text) btmHtml += '<div class="ak-qa-a">' + escHtml(q.answer_text) + '</div>';
            btmHtml += '<div class="ak-qa-meta">' + escHtml(q.user_name || '') + (q.question_date ? ' &middot; ' + escHtml(q.question_date) : '') + '</div>';
            btmHtml += '</div>';
          }
          btmHtml += '</div>';
        }
      }

      btmHtml += '<div class="ak-footer">Powered by <a href="https://aktarmatik.webtasarimi.net" target="_blank" rel="noopener">AKTARMATIK</a></div>';
      btmHtml += '</div>';
      bottomContainer.innerHTML = btmHtml;

      // Tab click handlers (bottom container)
      var tabs = bottomContainer.querySelectorAll('.ak-tab');
      for (var ti = 0; ti < tabs.length; ti++) {
        tabs[ti].addEventListener('click', function() {
          var allTabs = bottomContainer.querySelectorAll('.ak-tab');
          var allPanels = bottomContainer.querySelectorAll('.ak-panel');
          for (var x = 0; x < allTabs.length; x++) allTabs[x].classList.remove('active');
          for (var y = 0; y < allPanels.length; y++) allPanels[y].classList.remove('active');
          this.classList.add('active');
          var panel = bottomContainer.querySelector('[data-panel="' + this.getAttribute('data-tab') + '"]');
          if (panel) panel.classList.add('active');
        });
      }
    }

    // Scroll-to-tab links (top container links scroll to bottom tabs)
    var scrollLinks = topContainer.querySelectorAll('[data-scroll]');
    for (var si = 0; si < scrollLinks.length; si++) {
      scrollLinks[si].addEventListener('click', function() {
        var target = this.getAttribute('data-scroll');
        var tab = bottomContainer.querySelector('.ak-tab[data-tab="' + target + '"]');
        if (tab) {
          tab.click();
          tab.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // Rotating social proof messages
    if (socialMessages.length > 1) {
      (function(el, msgs) {
        var idx = 0;
        setInterval(function() {
          if (!el || !document.contains(el)) return;
          el.classList.add('ak-fade');
          setTimeout(function() {
            idx = (idx + 1) % msgs.length;
            el.innerHTML = msgs[idx];
            el.classList.remove('ak-fade');
          }, 400);
        }, 3500);
      })(topContainer.querySelector('.ak-rotating'), socialMessages);
    }
  }

  // ========================
  // DATA FETCHING
  // ========================
  function fetchData(barcode, pageUrl, callback) {
    // Sadece URL eşleme kullan
    fetchByUrl(pageUrl, callback);
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
  // LISTING PAGE CARD BADGES
  // ========================
  var listingCache = null; // cached bulk data for current domain

  function findListingCards() {
    var results = [];
    var seen = {};
    var hostname = window.location.hostname;

    // Strategy 0 (highest priority): ikas theme with .add-to-cart-overlay > .stock > a structure
    // softtoplus.com uses this: <div class="add-to-cart-overlay"><div class="stock btn-X"><a href="/slug">...</a></div></div>
    var overlays = document.querySelectorAll('.add-to-cart-overlay');
    if (overlays.length >= 2) {
      for (var oi = 0; oi < overlays.length; oi++) {
        var anchor = overlays[oi].querySelector('a[href]');
        if (!anchor) continue;
        var url = anchor.href;
        if (!url || seen[url]) continue;
        var path = url.replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '');
        if (!path || path === '' || path === '/') continue;
        seen[url] = true;
        // Use the overlay as the card element (outermost container)
        results.push({ cardEl: overlays[oi], anchorEl: anchor, productUrl: url, path: path });
      }
      if (results.length >= 2) return results;
    }

    // Strategy 1: ikas — look for known ikas card selectors
    var ikasSelectors = [
      '.product-list-item',
      '.product-container',
      '[class*="product-list-item"]',
      '[class*="productListItem"]',
    ];
    for (var is = 0; is < ikasSelectors.length; is++) {
      var ikasItems = document.querySelectorAll(ikasSelectors[is]);
      if (ikasItems.length >= 2) {
        for (var ii = 0; ii < ikasItems.length; ii++) {
          var item = ikasItems[ii];
          var anchor2 = item.closest('a[href]');
          if (!anchor2) anchor2 = item.querySelector('a[href]');
          if (!anchor2) continue;
          var url2 = anchor2.href;
          if (!url2 || seen[url2]) continue;
          var path2 = url2.replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '');
          if (!path2 || path2 === '' || path2 === '/') continue;
          seen[url2] = true;
          results.push({ cardEl: anchor2.closest('[class*="product"]') || anchor2, anchorEl: anchor2, productUrl: url2, path: path2 });
        }
        if (results.length >= 2) return results;
      }
    }

    // Strategy 2: Generic product card selectors
    var cardSelectors = [
      'a.product-card', 'a[class*="product-card"]',
      '.product-card', '[class*="productCard"]', '[class*="product-item"]',
    ];
    for (var si = 0; si < cardSelectors.length; si++) {
      try {
        var containers = document.querySelectorAll(cardSelectors[si]);
        if (containers.length < 2) continue;
        for (var ei = 0; ei < containers.length; ei++) {
          var cardEl2 = containers[ei];
          var linkEl = cardEl2.tagName === 'A' ? cardEl2 : cardEl2.querySelector('a[href]');
          if (!linkEl) continue;
          var url3 = linkEl.href;
          if (!url3 || seen[url3]) continue;
          if (url3.indexOf(hostname) === -1 && url3.indexOf('http') === 0) continue;
          var path3 = url3.replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '');
          if (!path3 || path3 === '/' || path3.indexOf('.') !== -1) continue;
          seen[url3] = true;
          results.push({ cardEl: cardEl2, anchorEl: linkEl, productUrl: url3, path: path3 });
        }
        if (results.length >= 2) return results;
      } catch(e) {}
    }

    // Strategy 3: Smart detection — find <a> tags with images + text (product-like)
    var allAnchors = document.querySelectorAll('a[href]');
    for (var ai = 0; ai < allAnchors.length; ai++) {
      var a = allAnchors[ai];
      var href = a.getAttribute('href') || '';
      if (href.indexOf('#') === 0 || href === '/' || href === '') continue;
      var fullUrl;
      try { fullUrl = new URL(href, window.location.origin); } catch(e) { continue; }
      if (fullUrl.hostname !== hostname) continue;
      var aPath = fullUrl.pathname.replace(/\/$/, '');
      if (!aPath || aPath === '' || aPath === '/') continue;
      var segments = aPath.split('/').filter(function(s) { return s; });
      if (segments.length === 0 || segments.length > 3) continue;
      if (!a.querySelector('img')) continue;
      if ((a.textContent || '').trim().length < 5) continue;
      if (seen[fullUrl.href]) continue;
      seen[fullUrl.href] = true;
      results.push({ cardEl: a, anchorEl: a, productUrl: fullUrl.href, path: aPath });
    }

    return results;
  }

  function findCardInsertionPoint(card) {
    var cardEl = card.cardEl;
    var anchorEl = card.anchorEl || cardEl.querySelector('a[href]') || cardEl;

    // Insert INSIDE the anchor tag at the end — keeps badge within the card boundary
    return { parent: anchorEl, ref: null };
  }

  function renderCardBadge(card, product) {
    var cardEl = card.cardEl;
    var anchorEl = card.anchorEl || cardEl.querySelector('a[href]') || cardEl;
    // Check for existing badge inside anchor
    var existing = anchorEl.querySelector('.ak-card-badge');
    if (existing) existing.remove();

    if (!product || !product.rating) return;

    var rating = parseFloat(product.rating);
    var reviewCount = parseInt(product.review_count) || 0;
    var favCount = parseInt(product.favorite_count) || 0;
    var cartCount = parseInt(product.cart_count) || 0;
    var soldCount = parseInt(product.sold_count) || 0;

    var badge = document.createElement('div');
    badge.className = 'ak-card-badge';

    var html = '';

    // Row 1: Stars + Rating + Review count
    html += '<div class="ak-card-row">';
    html += '<span class="ak-card-stars">' + starHtml(rating) + '</span>';
    html += '<span class="ak-card-rating">' + rating.toFixed(1) + '</span>';
    if (reviewCount > 0) {
      html += '<span class="ak-card-count">(' + formatNum(reviewCount) + ' yorum)</span>';
    }
    html += '</div>';

    // Row 2: Rotating social proof
    var socialMsgs = [];
    if (favCount > 0) socialMsgs.push('\u2764\uFE0F ' + formatNum(favCount) + ' ki\u015fi favoriledi');
    if (cartCount > 0) socialMsgs.push('\uD83D\uDED2 ' + formatNum(cartCount) + ' ki\u015finin sepetinde');
    if (soldCount > 0) socialMsgs.push('\uD83D\uDCE6 ' + formatNum(soldCount) + '+ adet sat\u0131ld\u0131');

    if (socialMsgs.length > 0) {
      html += '<div class="ak-card-social-rotate">' + socialMsgs[0] + '</div>';
    }

    badge.innerHTML = html;

    // Start rotation if multiple messages
    if (socialMsgs.length > 1) {
      var rotateEl = badge.querySelector('.ak-card-social-rotate');
      if (rotateEl) {
        (function(el, msgs) {
          var idx = 0;
          setInterval(function() {
            if (!el || !document.contains(el)) return;
            el.classList.add('ak-fade');
            setTimeout(function() {
              idx = (idx + 1) % msgs.length;
              el.innerHTML = msgs[idx];
              el.classList.remove('ak-fade');
            }, 400);
          }, 3000);
        })(rotateEl, socialMsgs);
      }
    }

    var point = findCardInsertionPoint(card);
    if (point.ref) {
      point.parent.insertBefore(badge, point.ref);
    } else {
      point.parent.appendChild(badge);
    }
  }

  function initListingMode() {
    // Prevent double-run on same page
    if (document.getElementById('ak-listing-active')) return;

    var marker = document.createElement('span');
    marker.id = 'ak-listing-active';
    marker.style.display = 'none';
    document.body.appendChild(marker);

    var domain = window.location.hostname;

    // Use bulk API: fetch all products for this domain in one call
    fetch(API_BASE + '/api/widget/listing?domain=' + encodeURIComponent(domain))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.products || data.products.length === 0) return;
        listingCache = {};
        for (var i = 0; i < data.products.length; i++) {
          var p = data.products[i];
          if (p.path) listingCache[p.path] = p;
        }
        applyListingBadges();
        // Re-apply on DOM changes (infinite scroll, lazy load)
        observeListingChanges();
      })
      .catch(function(err) {
        console.log('[Aktarmatik] Listing veri çekilemedi:', err);
      });
  }

  function applyListingBadges() {
    if (!listingCache) return;
    var cards = findListingCards();
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var anchorEl = card.anchorEl || card.cardEl.querySelector('a[href]') || card.cardEl;
      if (anchorEl.querySelector('.ak-card-badge')) continue;

      // Try exact path match first
      var product = listingCache[card.path];

      // Fallback: try matching by slug (last segment of path)
      if (!product && card.path) {
        var slug = card.path.split('/').pop();
        if (slug) {
          for (var key in listingCache) {
            var apiSlug = key.split('/').pop();
            // Match if either slug contains the other (handles prefix/suffix differences)
            if (slug === apiSlug || (slug.length > 10 && apiSlug.indexOf(slug) !== -1) || (apiSlug.length > 10 && slug.indexOf(apiSlug) !== -1)) {
              product = listingCache[key];
              break;
            }
          }
        }
      }

      if (product) {
        renderCardBadge(card, product);
      } else if (card.path) {
        console.log('[Aktarmatik] No match for card path:', card.path);
      }
    }
  }

  function observeListingChanges() {
    if (typeof MutationObserver === 'undefined') return;
    var target = document.querySelector('.product-list, [class*="productList"], [class*="product-grid"], main, #__next') || document.body;
    var listingObserver = new MutationObserver(function(mutations) {
      var hasNew = false;
      for (var i = 0; i < mutations.length; i++) {
        if (mutations[i].addedNodes.length > 0) { hasNew = true; break; }
      }
      if (hasNew) {
        setTimeout(applyListingBadges, 200);
      }
    });
    listingObserver.observe(target, { childList: true, subtree: true });
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

    // Reset listing marker on URL change
    var listingMarker = document.getElementById('ak-listing-active');
    if (listingMarker) listingMarker.remove();

    // Wait for dynamic content to be available (ikas renders async)
    waitForProductData(function() {
      if (!isProductPage()) {
        cleanup();
        // Try listing mode — cards may need a moment to render
        setTimeout(initListingMode, 500);
        return;
      }

      isLoading = true;

      var containers = insertContainer();
      if (!containers || !containers.top) { isLoading = false; return; }

      fetchData(null, currentUrl, function(data) {
        isLoading = false;
        if (data) {
          render(containers, data);
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

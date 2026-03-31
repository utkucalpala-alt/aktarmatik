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
      C + ' .ak-rotating { transition: opacity 0.4s ease; }',
      C + ' .ak-rotating.ak-fade { opacity: 0; }',

      /* Card badges (listing pages) */
      '.ak-card-badge { display: flex; align-items: center; gap: 6px; padding: 8px 0; margin: 4px 0; flex-wrap: wrap; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1; width: 100%; }',
      '.ak-card-badge .ak-card-stars { color: #FF6000; font-size: 16px; letter-spacing: 1px; }',
      '.ak-card-badge .ak-card-rating { font-weight: 800; font-size: 17px; color: #FF6000; }',
      '.ak-card-badge .ak-card-count { color: #777; font-size: 14px; font-weight: 500; }',
      '.ak-card-badge .ak-card-popular { color: #FF6000; font-size: 14px; font-weight: 700; flex-basis: 100%; margin-top: 5px; display: flex; align-items: center; gap: 4px; }',
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
  function findListingCards() {
    var results = [];
    var seen = {};

    // Strategy 1: ikas — card is <a class="grid"> containing .product-list-item
    // Walk up from .product-list-item to find the <a> ancestor
    var ikasItems = document.querySelectorAll('.product-list-item, .product-container');
    if (ikasItems.length >= 2) {
      for (var ii = 0; ii < ikasItems.length; ii++) {
        var item = ikasItems[ii];
        var anchor = item.closest('a[href]');
        if (!anchor) continue;
        var url = anchor.href;
        if (!url || seen[url]) continue;
        var path = url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
        if (!path || path === '' || path.split('/').length > 3) continue;
        seen[url] = true;
        results.push({ cardEl: anchor, productUrl: url, infoEl: item });
      }
    }

    // Strategy 2: Generic product card selectors
    if (results.length < 2) {
      var cardSelectors = [
        { container: 'a.product-card', link: null },
        { container: 'a[class*="product-card"]', link: null },
        { container: '.product-card', link: 'a[href]' },
        { container: '[class*="productCard"]', link: 'a[href]' },
        { container: '[class*="product-item"]', link: 'a[href]' },
      ];
      for (var si = 0; si < cardSelectors.length; si++) {
        try {
          var sel = cardSelectors[si];
          var containers = document.querySelectorAll(sel.container);
          if (containers.length < 2) continue;
          for (var ei = 0; ei < containers.length; ei++) {
            var cardEl2 = containers[ei];
            var linkEl = sel.link ? cardEl2.querySelector(sel.link) : cardEl2;
            if (!linkEl) continue;
            var url2 = linkEl.href || linkEl.getAttribute('href');
            if (!url2 || seen[url2]) continue;
            if (url2.indexOf(window.location.hostname) === -1 && url2.indexOf('http') === 0) continue;
            var path2 = url2.replace(/^https?:\/\/[^/]+/, '');
            if (!path2 || path2 === '/' || path2.indexOf('.') !== -1) continue;
            seen[url2] = true;
            results.push({ cardEl: cardEl2, productUrl: url2 });
          }
          if (results.length >= 2) break;
        } catch(e) {}
      }
    }

    return results;
  }

  function findCardInsertionPoint(cardEl) {
    // ikas: inject into .product-list-item-info, after .add-to-cart-overlay
    var infoEl = cardEl.querySelector('.product-list-item-info, [class*="product-list-item-info"]');
    if (infoEl) {
      var overlay = infoEl.querySelector('.add-to-cart-overlay');
      return overlay
        ? { parent: overlay.parentNode, ref: overlay }  // overlay'in gerçek parent'ına ekle
        : { parent: infoEl, ref: null };
    }
    // Generic: try after price element
    var priceEl = cardEl.querySelector('[class*="price"],[class*="Price"],[class*="fiyat"]');
    if (priceEl) return { parent: priceEl.parentNode, ref: priceEl.nextSibling };
    var genericInfo = cardEl.querySelector('[class*="information"],[class*="detail"],[class*="info"]');
    if (genericInfo) return { parent: genericInfo, ref: null };
    return { parent: cardEl, ref: null };
  }

  function renderCardBadge(cardEl, data) {
    var existing = cardEl.querySelector('.ak-card-badge');
    if (existing) existing.remove();

    if (!data || !data.data || !data.data.rating) return;

    var d = data.data;
    var rating = parseFloat(d.rating);
    var reviewCount = parseInt(d.review_count) || 0;
    var favCount = parseInt(d.favorite_count) || 0;
    var cartCount = parseInt(d.cart_count) || 0;
    var soldCount = parseInt(d.sold_count) || 0;

    var badge = document.createElement('div');
    badge.className = 'ak-card-badge';

    // Yıldız + puan + yorum sayısı
    var html = '<span class="ak-card-stars">' + starHtml(rating) + '</span>';
    html += '<span class="ak-card-rating">' + rating.toFixed(1) + '</span>';
    if (reviewCount > 0) {
      html += '<span class="ak-card-count">(' + formatNum(reviewCount) + ' yorum)</span>';
    }

    badge.innerHTML = html;

    // Dönen sosyal kanıt mesajları (turuncu)
    var socialMessages = [];
    if (favCount > 0) socialMessages.push('\u2764\uFE0F <strong>' + formatNum(favCount) + ' ki\u015fi</strong> favoriledi');
    if (cartCount > 0) socialMessages.push('\uD83D\uDED2 <strong>' + formatNum(cartCount) + '</strong> ki\u015finin sepetinde');
    if (soldCount > 0) socialMessages.push('\uD83D\uDCE6 <strong>' + formatNum(soldCount) + '+</strong> adet sat\u0131ld\u0131');

    if (socialMessages.length > 0) {
      var socialEl = document.createElement('span');
      socialEl.className = 'ak-card-popular ak-rotating';
      socialEl.innerHTML = socialMessages[0];
      badge.appendChild(socialEl);

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
        })(socialEl, socialMessages);
      }
    }

    var point = findCardInsertionPoint(cardEl);
    if (point.ref) {
      point.parent.insertBefore(badge, point.ref);
    } else {
      point.parent.appendChild(badge);
    }
  }

  function initListingMode() {
    // Prevent double-run on same page
    if (document.getElementById('ak-listing-active')) return;
    var cards = findListingCards();
    if (cards.length === 0) return;

    var marker = document.createElement('span');
    marker.id = 'ak-listing-active';
    marker.style.display = 'none';
    document.body.appendChild(marker);

    // Process cards sequentially with small delay to avoid request flood
    var index = 0;
    function processNext() {
      if (index >= cards.length) return;
      var card = cards[index++];
      if (card.cardEl.querySelector('.ak-card-badge')) { processNext(); return; }
      fetchByUrl(card.productUrl, function(data) {
        if (data) renderCardBadge(card.cardEl, data);
        setTimeout(processNext, 80);
      });
    }
    processNext();
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

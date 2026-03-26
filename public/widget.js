// TrendProof Embeddable Widget
(function() {
  const script = document.currentScript;
  const token = script.getAttribute('data-token');
  const type = script.getAttribute('data-type') || 'full';
  const theme = script.getAttribute('data-theme') || 'dark';
  const color = script.getAttribute('data-color') || '#6c5ce7';
  const apiBase = script.src.replace('/widget.js', '');

  if (!token) { console.error('TrendProof: data-token gerekli'); return; }

  const container = document.createElement('div');
  container.id = 'trendproof-widget-' + token.substring(0, 8);
  script.parentNode.insertBefore(container, script.nextSibling);

  const isDark = theme === 'dark';
  const isNative = theme === 'native';
  
  const bg = isNative ? 'transparent' : (isDark ? '#0a0b14' : '#ffffff');
  const cardBg = isNative ? 'transparent' : (isDark ? 'rgba(26,27,58,0.8)' : 'rgba(248,249,250,0.9)');
  const text = isNative ? 'inherit' : (isDark ? '#f0f0ff' : '#1a1a2e');
  const muted = isNative ? 'inherit' : (isDark ? '#8b8bab' : '#666');
  const border = isNative ? 'transparent' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)');
  const radius = isNative ? '0px' : '16px';
  const padding = isNative ? '0px' : '20px';
  const shadow = isNative ? 'none' : (isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)');

  const styles = `
    #${container.id} * { box-sizing: border-box; margin: 0; padding: 0; font-family: ${isNative ? 'inherit' : "'Inter', -apple-system, sans-serif"}; }
    #${container.id} .tp-w { background: ${cardBg}; border: ${isNative?'none':`1px solid ${border}`}; border-radius: ${radius}; padding: ${padding}; color: ${text}; box-shadow: ${shadow}; ${!isNative ? 'backdrop-filter: blur(20px);' : ''} width: 100%; transition: all 0.3s; }
    #${container.id} .tp-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    #${container.id} .tp-rating { font-size: 28px; font-weight: 800; color: ${isNative ? 'inherit' : (isDark ? '#fff' : '#000')}; }
    #${container.id} .tp-count { font-size: 14px; color: ${isNative ? 'inherit' : muted}; opacity: 0.8;}
    #${container.id} .tp-social { display: flex; gap: 8px; flex-wrap: wrap; margin: 16px 0; }
    #${container.id} .tp-badge { background: ${isNative ? 'rgba(108, 92, 231, 0.1)' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)')}; border: ${isNative ? '1px solid rgba(108, 92, 231, 0.2)' : 'none'}; color: ${isNative ? 'inherit' : 'inherit'}; padding: 6px 12px; border-radius: 20px; font-size: 13px; display: inline-flex; align-items: center; gap: 4px; font-weight: 500; }
    #${container.id} .tp-ai { font-size: 14px; line-height: 1.6; margin: 20px 0; padding: 16px; background: ${isNative ? 'rgba(0, 184, 148, 0.05)' : (isDark ? 'rgba(0, 184, 148, 0.05)' : '#f6ffed')}; border-left: 4px solid #00b894; border-radius: 0 8px 8px 0; }
    #${container.id} .tp-review { padding: 16px; border: 1px solid ${border}; border-radius: 12px; margin: 12px 0; font-size: 14px; background: ${isNative?'transparent':(isDark?'rgba(255,255,255,0.02)':'#fff')}; }
    #${container.id} .tp-review-author { font-weight: 600; margin-bottom: 6px; display:flex; justify-content: space-between; align-items: center; color: ${text}; }
    #${container.id} .tp-review-stars { font-size: 12px; color: #fdcb6e; }
    #${container.id} .tp-review-text { color: ${isNative ? 'inherit' : muted}; line-height: 1.6; opacity: 0.9; }
    #${container.id} .tp-footer { margin-top: 20px; font-size: 11px; opacity: 0.6; text-align: right; }
    #${container.id} .tp-footer a { color: inherit; text-decoration: none; font-weight: 600; }
    #${container.id} .tp-footer a:hover { text-decoration: underline; opacity: 1; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  container.innerHTML = '<div class="tp-w"><div style="text-align:center;padding:20px;opacity:0.6;">⏳ Canlı veriler yükleniyor...</div></div>';

  fetch(apiBase + '/api/widget/' + token)
    .then(r => r.json())
    .then(data => {
      if (!data || data.error) { container.innerHTML = ''; return; }
      let html = '<div class="tp-w">';

      // Rating header
      if (data.data) {
        html += '<div class="tp-header">';
        html += '<span style="font-size:20px">⭐</span>';
        html += '<span class="tp-rating">' + (data.data.rating ? parseFloat(data.data.rating).toFixed(1) : '-') + '</span>';
        html += '<span class="tp-count">(' + (data.data.review_count || 0) + ' değerlendirme)</span>';
        html += '</div>';
      }

      // Social proof
      if ((type === 'full' || type === 'social') && data.data) {
        html += '<div class="tp-social">';
        if (data.data.cart_count) html += '<span class="tp-badge">🛒 ' + data.data.cart_count + ' sepette</span>';
        if (data.data.favorite_count) html += '<span class="tp-badge">❤ ' + data.data.favorite_count + ' favori</span>';
        if (data.data.sold_count) html += '<span class="tp-badge">📦 ' + data.data.sold_count + ' satış</span>';
        html += '</div>';
      }

      // AI summary
      if ((type === 'full' || type === 'ai-summary') && data.analysis) {
        html += '<div class="tp-ai">🤖 ' + data.analysis.summary + '</div>';
      }

      // Reviews
      if ((type === 'full' || type === 'reviews') && data.reviews && data.reviews.length > 0) {
        var max = type === 'full' ? 3 : 5;
        data.reviews.slice(0, max).forEach(function(r) {
          html += '<div class="tp-review">';
          html += '<div class="tp-review-author">' + r.author + ' ' + '⭐'.repeat(r.rating || 5) + '</div>';
          html += '<div class="tp-review-text">' + r.content + '</div>';
          html += '</div>';
        });
      }

      html += '<div class="tp-footer">Powered by <a href="https://aktarmatik.webtasarimi.net">AKTARMATIK</a></div>';
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = ''; });
})();

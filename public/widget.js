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
  const bg = isDark ? '#0a0b14' : '#ffffff';
  const cardBg = isDark ? 'rgba(26,27,58,0.8)' : 'rgba(248,249,250,0.9)';
  const text = isDark ? '#f0f0ff' : '#1a1a2e';
  const muted = isDark ? '#8b8bab' : '#666';
  const border = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';

  const styles = `
    #${container.id} * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', -apple-system, sans-serif; }
    #${container.id} .tp-w { background: ${cardBg}; border: 1px solid ${border}; border-radius: 16px; padding: 20px; color: ${text}; backdrop-filter: blur(20px); }
    #${container.id} .tp-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
    #${container.id} .tp-rating { font-size: 24px; font-weight: 800; }
    #${container.id} .tp-count { font-size: 13px; color: ${muted}; }
    #${container.id} .tp-social { display: flex; gap: 8px; flex-wrap: wrap; margin: 12px 0; }
    #${container.id} .tp-badge { background: ${isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)'}; padding: 4px 10px; border-radius: 20px; font-size: 12px; }
    #${container.id} .tp-ai { font-size: 13px; color: ${muted}; line-height: 1.6; margin: 12px 0; }
    #${container.id} .tp-review { padding: 12px; border: 1px solid ${border}; border-radius: 8px; margin: 6px 0; font-size: 13px; }
    #${container.id} .tp-review-author { font-weight: 600; margin-bottom: 4px; }
    #${container.id} .tp-review-text { color: ${muted}; line-height: 1.5; }
    #${container.id} .tp-footer { margin-top: 12px; font-size: 10px; color: ${muted}; opacity: 0.5; text-align: right; }
    #${container.id} .tp-footer a { color: inherit; text-decoration: none; }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  container.innerHTML = '<div class="tp-w"><div style="text-align:center;padding:20px;color:' + muted + '">Yükleniyor...</div></div>';

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

      html += '<div class="tp-footer">Powered by <a href="#">TrendProof</a></div>';
      html += '</div>';
      container.innerHTML = html;
    })
    .catch(function() { container.innerHTML = ''; });
})();

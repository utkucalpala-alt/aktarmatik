const BROWSERLESS_URL = 'https://post.webtasarimi.net';
const BROWSERLESS_TOKEN = 'ygyjmumydei08glg';

export async function scrapeTrendyolProduct(productUrl) {
  const scrapeScript = `
    async () => {
      const data = { reviews: [], socialProof: {} };

      // Wait for product page to load
      await new Promise(r => setTimeout(r, 3000));

      // Product name
      const nameEl = document.querySelector('.pr-new-br span, h1.pr-new-br');
      data.name = nameEl ? nameEl.textContent.trim() : '';

      // Rating
      const ratingEl = document.querySelector('.tltr-cntnr .rt-num, .rating-line-count');
      data.rating = ratingEl ? parseFloat(ratingEl.textContent.replace(',', '.')) : null;

      // Review count
      const reviewCountEl = document.querySelector('.rvw-cnt-tx, .total-review-count');
      if (reviewCountEl) {
        const match = reviewCountEl.textContent.match(/\\d+/);
        data.reviewCount = match ? parseInt(match[0]) : 0;
      }

      // Question count
      const questionEl = document.querySelector('.qa-cnt-tx, .questions-count');
      if (questionEl) {
        const match = questionEl.textContent.match(/\\d+/);
        data.questionCount = match ? parseInt(match[0]) : 0;
      }

      // Social proof metrics
      const socialElements = document.querySelectorAll('.social-proof-item, .pr-bx-w .social-proof span');
      socialElements.forEach(el => {
        const text = el.textContent.toLowerCase();
        const numMatch = text.match(/[\\d.]+/);
        const num = numMatch ? parseInt(numMatch[0]) : 0;
        if (text.includes('sepet')) data.socialProof.cartCount = num;
        if (text.includes('favori')) data.socialProof.favoriteCount = num;
        if (text.includes('sat')) data.socialProof.soldCount = num;
        if (text.includes('kişi')) data.socialProof.viewCount = num;
      });

      // Product image
      const imgEl = document.querySelector('.base-product-image img, .gallery-modal-content img');
      data.image = imgEl ? imgEl.src : '';

      // Reviews (scroll to load)
      const reviewEls = document.querySelectorAll('.comment, .rvw-bc');
      reviewEls.forEach((el, i) => {
        if (i >= 25) return;
        const authorEl = el.querySelector('.comment-author, .rvw-usr');
        const ratingEl = el.querySelector('.star-w .full, .rvw-str');
        const contentEl = el.querySelector('.comment-text, .rvw-txt');
        const dateEl = el.querySelector('.comment-date, .rvw-dt');

        data.reviews.push({
          author: authorEl ? authorEl.textContent.trim() : 'Anonim',
          rating: ratingEl ? ratingEl.querySelectorAll('.full').length || 5 : 5,
          content: contentEl ? contentEl.textContent.trim() : '',
          date: dateEl ? dateEl.textContent.trim() : '',
        });
      });

      return data;
    }
  `;

  try {
    const response = await fetch(`${BROWSERLESS_URL}/function?token=${BROWSERLESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: scrapeScript,
        context: {
          url: productUrl,
          waitForSelector: '.pr-new-br, h1',
          timeout: 30000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Browserless error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Scraper error:', error);
    throw error;
  }
}

export function generateMockAnalysis(productName, rating, reviews) {
  const avgRating = rating || 4.2;
  const sentiment = avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative';

  const positiveTexts = reviews?.filter(r => r.rating >= 4).map(r => r.content).join(' ') || '';
  const negativeTexts = reviews?.filter(r => r.rating <= 2).map(r => r.content).join(' ') || '';

  return {
    summary: `"${productName || 'Bu ürün'}" toplam ${reviews?.length || 0} yorum analiz edildiğinde ${avgRating} ortalama puanla ${sentiment === 'positive' ? 'oldukça beğenilen' : sentiment === 'neutral' ? 'orta düzeyde' : 'eleştirilen'} bir ürün olarak öne çıkıyor. Kullanıcılar genel olarak ürün kalitesinden ${sentiment === 'positive' ? 'memnun' : 'memnun değil'}.`,
    sentiment,
    pros: sentiment === 'positive'
      ? 'Kaliteli malzeme, hızlı kargo, uygun fiyat, beklentileri karşılıyor'
      : 'Fiyat-performans oranı makul',
    cons: sentiment === 'positive'
      ? 'Bazı kullanıcılar beden/renk uyumsuzluğundan şikayetçi'
      : 'Kalite sorunları, geç kargo, beden uyumsuzluğu, iade zorlukları',
    keywords: 'kalite, kargo, beden, fiyat, malzeme, renk',
  };
}

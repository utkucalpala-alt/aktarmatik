// AKTARMATIK - Trendyol Scraper v4
// Strategy: Playwright browser-based scraping (Trendyol requires JS rendering)
// CSS selectors taken from proven working Python Playwright scraper

let chromium;
try {
  chromium = require('playwright-core').chromium;
} catch (e) {
  console.warn('[Scraper] playwright-core not available, falling back to fetch-only mode');
}

const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function extractContentId(url) {
  const match = url.match(/-p-(\d+)/);
  return match ? match[1] : null;
}

// ============================================
// PLAYWRIGHT BROWSER SCRAPING (Primary Method)
// ============================================
async function scrapeWithBrowser(productUrl) {
  if (!chromium) {
    throw new Error('Playwright not available');
  }

  console.log(`[Scraper] 🌐 Launching headless browser for: ${productUrl}`);

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--single-process',
      ],
    });

    const context = await browser.newContext({
      userAgent: getRandomUA(),
      locale: 'tr-TR',
      viewport: { width: 1366, height: 768 },
    });

    const page = await context.newPage();

    // Block unnecessary resources for speed
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,otf}', route => route.abort());
    await page.route('**/analytics**', route => route.abort());
    await page.route('**/tracking**', route => route.abort());
    await page.route('**/googletag**', route => route.abort());
    await page.route('**/facebook**', route => route.abort());

    console.log('[Scraper] 📄 Loading page...');
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Wait for content to render
    await page.waitForTimeout(4000);

    const results = { reviews: [], socialProof: {} };

    // ---- Product Name ----
    try {
      const titleEl = await page.$('h1.product-title');
      if (titleEl) {
        const fullTitle = await titleEl.innerText();
        results.name = fullTitle.trim();
      }
    } catch (e) { console.warn('[Scraper] Title extraction failed:', e.message); }

    // ---- Brand ----
    try {
      const brandEl = await page.$('h1.product-title strong');
      if (brandEl) {
        results.brand = (await brandEl.innerText()).trim();
      }
    } catch (e) { /* ignore */ }

    // ---- Price ----
    try {
      // Try multiple price selectors
      const priceSelectors = [
        '.ty-plus-price-original-price',
        '.prc-dsc',
        '.prc-slg',
        '.product-price-container .prc-dsc',
      ];
      for (const sel of priceSelectors) {
        const priceEl = await page.$(sel);
        if (priceEl) {
          const priceText = (await priceEl.innerText()).trim();
          results.price = priceText;
          break;
        }
      }
    } catch (e) { /* ignore */ }

    // ---- Rating ----
    try {
      const ratingSelectors = [
        '.reviews-summary-average-rating',
        '.rating-line-count .full-star + span',
        '.pr-in-rnr .rating-line-count',
        '.tltp-avg',
      ];
      for (const sel of ratingSelectors) {
        const ratingEl = await page.$(sel);
        if (ratingEl) {
          const ratingText = (await ratingEl.innerText()).trim();
          const ratingNum = parseFloat(ratingText.replace(',', '.'));
          if (!isNaN(ratingNum) && ratingNum > 0 && ratingNum <= 5) {
            results.rating = ratingNum;
            break;
          }
        }
      }
    } catch (e) { console.warn('[Scraper] Rating extraction failed:', e.message); }

    // ---- Review Count ----
    try {
      const reviewSelectors = [
        '.reviews-summary-reviews-detail b',
        '.rvw-cnt-tx',
        '.pr-in-rnr .rnr-cr-wr .rnr-cm-cnt',
      ];
      for (const sel of reviewSelectors) {
        const reviewEl = await page.$(sel);
        if (reviewEl) {
          const reviewText = (await reviewEl.innerText()).trim();
          const reviewNum = parseInt(reviewText.replace(/[^\d]/g, ''));
          if (!isNaN(reviewNum)) {
            results.reviewCount = reviewNum;
            break;
          }
        }
      }
    } catch (e) { /* ignore */ }

    // ---- Question Count ----
    try {
      const qSelectors = [
        '.pr-in-qna .qna-cnt',
        '.qa-cnt',
      ];
      for (const sel of qSelectors) {
        const qEl = await page.$(sel);
        if (qEl) {
          const qText = (await qEl.innerText()).trim();
          const qNum = parseInt(qText.replace(/[^\d]/g, ''));
          if (!isNaN(qNum)) {
            results.questionCount = qNum;
            break;
          }
        }
      }
    } catch (e) { /* ignore */ }

    // ---- Seller ----
    try {
      const sellerEl = await page.$('.merchant-name');
      if (sellerEl) {
        results.seller = (await sellerEl.innerText()).trim();
      }
    } catch (e) { /* ignore */ }

    // ---- Product Image ----
    try {
      const imgEl = await page.$('.gallery-modal-content img, .base-product-image img, .product-slide img');
      if (imgEl) {
        results.image = await imgEl.getAttribute('src') || '';
      }
    } catch (e) { /* ignore */ }

    // ---- Social Proof (Favorites, Cart, Views) ----
    try {
      // Get full page text for social proof extraction
      const bodyText = await page.evaluate(() => document.body.innerText);
      
      // Favorite count: "39,1B kişi favoriledi" or "1.768 kişi favoriledi"
      const favMatch = bodyText.match(/([\d.,]+[BMK]?)\s*kişi favori/i);
      if (favMatch) {
        results.socialProof.favoriteCount = parseFormattedNumber(favMatch[1]);
      }
      
      // Cart count: "5,6B kişinin sepetinde"
      const cartMatch = bodyText.match(/([\d.,]+[BMK]?)\s*kişinin sepetinde/i);
      if (cartMatch) {
        results.socialProof.cartCount = parseFormattedNumber(cartMatch[1]);
      }
      
      // View count: "4B kişi görüntüledi"
      const viewMatch = bodyText.match(/([\d.,]+[BMK]?)\s*kişi görüntüledi/i);
      if (viewMatch) {
        results.socialProof.viewCount = parseFormattedNumber(viewMatch[1]);
      }
      
      // Sold count: "1B+ ürün satıldı"
      const soldMatch = bodyText.match(/([\d.,]+[BMK]?\+?)\s*ürün satıldı/i);
      if (soldMatch) {
        results.socialProof.soldCount = parseFormattedNumber(soldMatch[1]);
      }
    } catch (e) { console.warn('[Scraper] Social proof extraction failed:', e.message); }

    // ---- Also try to extract from __PRODUCT_DETAIL_APP_INITIAL_STATE__ ----
    try {
      const stateData = await page.evaluate(() => {
        if (typeof window.__PRODUCT_DETAIL_APP_INITIAL_STATE__ !== 'undefined') {
          const state = window.__PRODUCT_DETAIL_APP_INITIAL_STATE__;
          return {
            name: state?.product?.name,
            rating: state?.product?.ratingScore?.averageRating,
            reviewCount: state?.product?.ratingScore?.totalRatingCount,
            questionCount: state?.product?.questionCount,
            imageUrl: state?.product?.images?.[0]?.url,
            socialProof: state?.product?.socialProof || state?.socialProof,
          };
        }
        return null;
      });

      if (stateData) {
        console.log('[Scraper] ✅ Also found __PRODUCT_DETAIL_APP_INITIAL_STATE__');
        results.name = results.name || stateData.name || '';
        results.rating = results.rating || stateData.rating;
        results.reviewCount = results.reviewCount || stateData.reviewCount || 0;
        results.questionCount = results.questionCount || stateData.questionCount || 0;
        if (!results.image && stateData.imageUrl) {
          results.image = stateData.imageUrl.startsWith('http')
            ? stateData.imageUrl
            : `https://cdn.dsmcdn.com${stateData.imageUrl}`;
        }
        if (stateData.socialProof) {
          const sp = stateData.socialProof;
          results.socialProof.favoriteCount = results.socialProof.favoriteCount || sp.favoriteCount || sp.favCount || 0;
          results.socialProof.cartCount = results.socialProof.cartCount || sp.basketCount || sp.cartCount || 0;
          results.socialProof.soldCount = results.socialProof.soldCount || sp.orderCount || sp.soldCount || 0;
          results.socialProof.viewCount = results.socialProof.viewCount || sp.visitCount || sp.viewCount || 0;
        }
      }
    } catch (e) { console.warn('[Scraper] State extraction failed:', e.message); }

    // ---- Extract JSON-LD for additional data ----
    try {
      const jsonLdData = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        const results = [];
        scripts.forEach(s => {
          try {
            results.push(JSON.parse(s.textContent));
          } catch (e) { /* ignore */ }
        });
        return results;
      });

      for (const ld of jsonLdData) {
        if (ld['@type'] === 'Product' || ld.aggregateRating) {
          if (!results.name) results.name = ld.name || '';
          if (!results.rating && ld.aggregateRating) {
            results.rating = parseFloat(ld.aggregateRating.ratingValue);
          }
          if (!results.reviewCount && ld.aggregateRating) {
            results.reviewCount = parseInt(ld.aggregateRating.reviewCount || ld.aggregateRating.ratingCount || 0);
          }
          if (!results.image && ld.image) {
            results.image = Array.isArray(ld.image) ? ld.image[0] : ld.image;
          }
          console.log('[Scraper] ✅ Extracted from JSON-LD');
        }
      }
    } catch (e) { /* ignore */ }

    // ---- Scrape Reviews ----
    try {
      // Try to scroll to reviews section to trigger lazy loading
      await page.evaluate(() => {
        const reviewSection = document.querySelector('.pr-in-rnr, .rnr-w, .reviews');
        if (reviewSection) reviewSection.scrollIntoView();
      });
      await page.waitForTimeout(2000);

      // Extract reviews
      const reviewData = await page.evaluate(() => {
        const reviews = [];
        const reviewCards = document.querySelectorAll('.comment, .rnr-cm-w, .review-item, .pr-rvw-cr');
        
        reviewCards.forEach(card => {
          try {
            const author = card.querySelector('.comment-author, .rnr-cm-nm, .review-author')?.innerText?.trim() || 'Anonim';
            const content = card.querySelector('.comment-text, .rnr-cm-tx, .review-text, p')?.innerText?.trim() || '';
            const dateEl = card.querySelector('.comment-date, .rnr-cm-dt, .review-date');
            const date = dateEl ? dateEl.innerText.trim() : '';
            
            // Rating from stars
            const stars = card.querySelectorAll('.star.full, .rnr-cm-str .full, .full-star');
            const rating = stars.length > 0 ? stars.length : 5;
            
            if (content.length > 0) {
              reviews.push({ author, content, date, rating });
            }
          } catch (e) { /* ignore individual review errors */ }
        });
        
        return reviews;
      });

      if (reviewData.length > 0) {
        results.reviews = reviewData.slice(0, 30);
        console.log(`[Scraper] ✅ Found ${results.reviews.length} reviews from page`);
      }
    } catch (e) { console.warn('[Scraper] Review extraction failed:', e.message); }

    // ---- Try to get reviews from API that loads in browser context ----
    if (results.reviews.length === 0) {
      try {
        const contentId = extractContentId(productUrl);
        if (contentId) {
          const reviewApiData = await page.evaluate(async (cid) => {
            try {
              const resp = await fetch(`https://public-mdc.trendyol.com/discovery-web-socialgw-service/api/review/${cid}?page=0&size=25&orderByField=Score&orderByType=DESC`);
              if (resp.ok) return await resp.json();
            } catch (e) {}
            try {
              const resp = await fetch(`/api/review/${cid}?page=0&size=25`);
              if (resp.ok) return await resp.json();
            } catch (e) {}
            return null;
          }, contentId);

          if (reviewApiData?.result?.productReviews?.content) {
            results.reviews = reviewApiData.result.productReviews.content.slice(0, 30).map(r => ({
              author: r.userFullName || r.userName || 'Anonim',
              rating: r.rate || 5,
              content: r.comment || '',
              date: r.lastModifiedDate 
                ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR') : '',
            })).filter(r => r.content.length > 0);
            
            if (!results.rating && reviewApiData.result.hydrateRating) {
              results.rating = reviewApiData.result.hydrateRating.averageRating;
            }
            results.reviewCount = results.reviewCount || reviewApiData.result.productReviews.totalElements || 0;
            console.log(`[Scraper] ✅ Got ${results.reviews.length} reviews from in-page API call`);
          }
        }
      } catch (e) { console.warn('[Scraper] In-page API review fetch failed:', e.message); }
    }

    // Clean up product name
    if (results.name) {
      results.name = results.name
        .replace(/\s*-\s*Fiyatı.*$/i, '')
        .replace(/\s*-\s*Trendyol$/i, '')
        .replace(/\s*Fiyatı,\s*Yorumları$/i, '')
        .trim();
    }

    await browser.close();

    // Validate
    const hasData = results.name || results.rating || results.reviews.length > 0;
    if (hasData) {
      console.log(`[Scraper] ✅ BROWSER SUCCESS!`);
      console.log(`[Scraper]   Name: ${results.name}`);
      console.log(`[Scraper]   Rating: ${results.rating}`);
      console.log(`[Scraper]   Reviews: ${results.reviews.length}`);
      console.log(`[Scraper]   Favorites: ${results.socialProof?.favoriteCount || 0}`);
      return results;
    }

    throw new Error('Browser scraping found no data');
  } catch (error) {
    if (browser) {
      try { await browser.close(); } catch (e) { /* ignore */ }
    }
    throw error;
  }
}

// ============================================
// FETCH-BASED FALLBACK (when Playwright unavailable)
// ============================================
async function scrapeWithFetch(productUrl) {
  console.log(`[Scraper] 📡 Fetch fallback for: ${productUrl}`);

  const response = await fetch(productUrl, {
    headers: {
      'User-Agent': getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(20000),
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  console.log(`[Scraper] Got ${html.length} bytes of HTML`);

  const results = { reviews: [], socialProof: {} };

  // Extract from meta tags / title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    results.name = titleMatch[1]
      .replace(/\s*-\s*Fiyatı.*$/i, '')
      .replace(/\s*-\s*Trendyol$/i, '')
      .replace(/\s*Fiyatı,\s*Yorumları$/i, '')
      .trim();
  }

  const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogImage) results.image = ogImage[1];

  // JSON-LD
  const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const match of jsonLdMatches) {
      try {
        const jsonStr = match.replace(/<\/?script[^>]*>/gi, '');
        const ld = JSON.parse(jsonStr);
        if (ld['@type'] === 'Product' || ld.aggregateRating) {
          results.name = results.name || ld.name || '';
          if (ld.aggregateRating) {
            results.rating = parseFloat(ld.aggregateRating.ratingValue);
            results.reviewCount = parseInt(ld.aggregateRating.reviewCount || ld.aggregateRating.ratingCount || 0);
          }
          if (ld.image) {
            results.image = results.image || (Array.isArray(ld.image) ? ld.image[0] : ld.image);
          }
        }
      } catch (e) { /* ignore */ }
    }
  }

  // Initial state
  const stateMatch = html.match(/window\.__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      const product = state?.product;
      if (product) {
        results.name = results.name || product.name || '';
        results.rating = results.rating || product.ratingScore?.averageRating;
        results.reviewCount = results.reviewCount || product.ratingScore?.totalRatingCount || 0;
        results.questionCount = product.questionCount || 0;
        if (product.images?.[0]?.url) {
          const imgUrl = product.images[0].url;
          results.image = results.image || (imgUrl.startsWith('http') ? imgUrl : `https://cdn.dsmcdn.com${imgUrl}`);
        }
      }
    } catch (e) { /* ignore */ }
  }

  if (results.name || results.rating) {
    return results;
  }

  throw new Error('Fetch fallback found no useful data');
}

// ============================================
// HELPER: Parse formatted Turkish numbers
// ============================================
function parseFormattedNumber(str) {
  if (!str) return 0;
  str = str.replace(/\+/g, '').trim();

  // Turkish abbreviations: B = bin (thousand), K = bin, M = milyon
  if (str.endsWith('B')) {
    return Math.round(parseFloat(str.replace('B', '').replace(',', '.')) * 1000);
  }
  if (str.endsWith('K')) {
    return Math.round(parseFloat(str.replace('K', '').replace(',', '.')) * 1000);
  }
  if (str.endsWith('M')) {
    return Math.round(parseFloat(str.replace('M', '').replace(',', '.')) * 1000000);
  }

  // Remove thousands separators and parse
  return parseInt(str.replace(/\./g, '').replace(',', '.')) || 0;
}

// ============================================
// MAIN FUNCTION
// ============================================
export async function scrapeTrendyolProduct(productUrl, barcode) {
  const contentId = extractContentId(productUrl) || barcode;

  // Ensure valid Trendyol URL
  let url = productUrl;
  if (!url || !url.includes('trendyol.com')) {
    url = `https://www.trendyol.com/brand/product-p-${contentId}`;
  }

  console.log(`[Scraper] === Starting scrape for ${contentId} ===`);
  console.log(`[Scraper] URL: ${url}`);

  // Layer 1: Browser scraping with Playwright (primary method)
  try {
    const result = await scrapeWithBrowser(url);
    if (result && (result.name || result.rating)) {
      return result;
    }
  } catch (e) {
    console.warn(`[Scraper] ⚠️ Browser scraping failed: ${e.message}`);
  }

  // Layer 2: Fetch fallback
  try {
    const result = await scrapeWithFetch(url);
    if (result && (result.name || result.rating)) {
      return result;
    }
  } catch (e) {
    console.warn(`[Scraper] ⚠️ Fetch fallback failed: ${e.message}`);
  }

  // Layer 3: Complete failure
  console.error(`[Scraper] ❌ All scraping methods failed for ${contentId}`);
  throw new Error('Trendyol\'dan veri çekilemedi. Ürün URL\'sini kontrol edin veya daha sonra tekrar deneyin.');
}

export function generateMockAnalysis(productName, rating, reviews) {
  const avgRating = parseFloat(rating) || 4.2;
  const sentiment = avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative';
  const reviewCount = reviews?.length || 0;
  const positiveCount = reviews?.filter(r => (r.rating || 5) >= 4).length || 0;
  const negativeCount = reviews?.filter(r => (r.rating || 5) <= 2).length || 0;

  let summary, pros, cons;

  if (reviewCount > 0) {
    const allContent = reviews.map(r => r.content || '').join(' ').toLowerCase();

    const posWords = ['kaliteli', 'güzel', 'mükemmel', 'süper', 'harika', 'hızlı', 'memnun', 'tavsiye', 'teşekkür', 'uygun', 'iyi', 'sağlam'];
    const negWords = ['kötü', 'bozuk', 'geç', 'sorun', 'iade', 'pişman', 'berbat', 'küçük', 'sahte', 'farklı', 'kırık'];

    const foundPos = posWords.filter(w => allContent.includes(w));
    const foundNeg = negWords.filter(w => allContent.includes(w));

    summary = `"${productName || 'Bu ürün'}" toplam ${reviewCount} yorum analiz edildiğinde ${avgRating} ortalama puanla ${sentiment === 'positive' ? 'oldukça beğenilen' : sentiment === 'neutral' ? 'orta düzeyde değerlendirilen' : 'eleştirilen'} bir ürün olarak öne çıkıyor. ${positiveCount} olumlu, ${negativeCount} olumsuz yorum mevcut.`;

    pros = foundPos.length > 0
      ? foundPos.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
      : (sentiment === 'positive' ? 'Kaliteli, hızlı kargo, uygun fiyat' : 'Fiyat-performans oranı makul');

    cons = foundNeg.length > 0
      ? foundNeg.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
      : (sentiment === 'positive' ? 'Bazı kullanıcılar küçük aksaklıklardan bahsetmiş' : 'Kalite sorunları, geç kargo');
  } else {
    summary = `"${productName || 'Bu ürün'}" henüz yeterli yorum verisi bulunmuyor. Puan: ${avgRating}.`;
    pros = 'Henüz yeterli veri yok';
    cons = 'Henüz yeterli veri yok';
  }

  // Build keywords from reviews
  const keywords = reviewCount > 0
    ? [...new Set(reviews.flatMap(r => {
        const words = (r.content || '').toLowerCase().split(/\s+/).filter(w => w.length > 4 && !['çünkü', 'ancak', 'fakat', 'sonra', 'önce'].includes(w));
        return words.slice(0, 2);
      }))].slice(0, 6).join(', ') || 'kalite, kargo, fiyat'
    : 'kalite, kargo, fiyat';

  return { summary, sentiment, pros, cons, keywords };
}

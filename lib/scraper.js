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
        '--disable-crash-reporter',
        '--disable-breakpad',
        '--disable-software-rasterizer',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--disable-renderer-backgrounding',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
    });

    const context = await browser.newContext({
      userAgent: getRandomUA(),
      locale: 'tr-TR',
      viewport: { width: 1366, height: 768 },
    });

    const page = await context.newPage();

    // ---- SETUP API INTERCEPTION FOR REVIEWS ----
    let interceptedReviews = [];
    page.on('response', async (response) => {
      try {
        const url = response.url();
        if (url.includes('/api/review-read/') || url.includes('/api/review/') || url.includes('product-reviews')) {
          const contentType = response.headers()['content-type'] || '';
          if (contentType.includes('application/json')) {
            console.log(`[Scraper API] Intercepted review request: ${url}`);
            const json = await response.json();
            
            // Helpful log for debugging the response
            if (!json?.result?.productReviews?.content) {
              console.log(`[Scraper API] Keys available in JSON:`, Object.keys(json));
              if (json?.result) console.log(`[Scraper API] Keys in json.result:`, Object.keys(json.result));
              if (json?.data) console.log(`[Scraper API] Keys in json.data:`, Object.keys(json.data));
            }
            
            // Support multiple possible Trendyol API structures
            const activeReviews = json?.result?.productReviews?.content || json?.data?.reviews || json?.reviews || json?.result?.reviews || [];

            if (activeReviews.length > 0) {
              const parsedReviews = activeReviews.map(r => ({
                author: r.userFullName || r.userName || 'Anonim',
                rating: r.rate || r.rating || 5,
                content: (r.comment || '').trim(),
                date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('tr-TR') : 
                     (r.lastModifiedDate ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR') : '')
              })).filter(r => r.content.length > 5);
              
              if (parsedReviews.length > 0 && interceptedReviews.length === 0) {
                interceptedReviews = parsedReviews;
                console.log(`[Scraper] 🟢 Intercepted ${parsedReviews.length} reviews from background API!`);
              }
            }
          }
        }
      } catch (e) {
        // Just log the error, don't crash the scraper
        console.warn(`[Scraper API] JSON parse error on ${response.url()}:`, e.message);
      }
    });

    // Block unnecessary resources for speed
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,otf}', route => route.abort());
    await page.route('**/analytics**', route => route.abort());
    await page.route('**/tracking**', route => route.abort());
    await page.route('**/googletag**', route => route.abort());
    await page.route('**/facebook**', route => route.abort());

    console.log('[Scraper] 📄 Loading page...');
    
    // Navigate to the URL
    let response;
    try {
      response = await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    } catch (navError) {
      console.warn(`[Scraper] Navigation error: ${navError.message}`);
    }
    
    // Wait for content to render
    await page.waitForTimeout(5000);
    
    // Log current state for debugging
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`[Scraper] 📍 Current URL: ${currentUrl}`);
    console.log(`[Scraper] 📍 Page title: ${pageTitle}`);
    
    // Check if we landed on a valid product page or search page
    const hasProductTitle = await page.$('h1.product-title');
    const isSearchPage = currentUrl.includes('/sr?q=') || currentUrl.includes('/sr/?q=');
    const is404 = pageTitle.includes('404') || pageTitle.includes('Sayfa Bulunamadı') || currentUrl.includes('/404');
    
    // If we're on a search page or 404 page, find and click the first product
    if (isSearchPage || (!hasProductTitle && is404)) {
      console.log(`[Scraper] 📍 On search/404 page. Looking for product to click...`);
      
      if (isSearchPage) {
        // Already on search page, just click first result
        await page.waitForTimeout(2000);
      } else {
        // Navigate to search
        const contentId = extractContentId(productUrl) || productUrl.match(/\d{5,}/)?.[0];
        if (contentId) {
          await page.goto(`https://www.trendyol.com/sr?q=${contentId}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
          await page.waitForTimeout(3000);
        }
      }
      
      // Try to click the first product from search results
      try {
        const productSelectors = [
          '.p-card-wrppr a',
          '.product-card a',
          '[data-testid="product-card"] a',
          '.prdct-cntnr-wrppr .p-card-wrppr a',
          'div[data-id] a',
        ];
        
        for (const sel of productSelectors) {
          const firstProduct = await page.$(sel);
          if (firstProduct) {
            const href = await firstProduct.getAttribute('href');
            if (href) {
              const fullUrl = href.startsWith('http') ? href : `https://www.trendyol.com${href}`;
              console.log(`[Scraper] 📍 Found product link: ${fullUrl}`);
              await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
              await page.waitForTimeout(5000);
              console.log(`[Scraper] 📍 Now on: ${page.url()}`);
              break;
            }
          }
        }
      } catch (searchError) {
        console.warn(`[Scraper] Search navigation failed: ${searchError.message}`);
      }
    }

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
        '.rating-score',
        '.reviews-summary-average-rating',
        '.rating-line-count .full-star + span',
        '.pr-in-rnr .rating-line-count',
        '.tltp-avg',
        '.pr-in-rnr .rnr-cr-wr .rating-score',
      ];
      for (const sel of ratingSelectors) {
        const ratingEl = await page.$(sel);
        if (ratingEl) {
          const ratingText = (await ratingEl.innerText()).trim();
          const ratingNum = parseFloat(ratingText.replace(',', '.'));
          if (!isNaN(ratingNum) && ratingNum > 0 && ratingNum <= 5) {
            results.rating = ratingNum;
            console.log(`[Scraper] ✅ Rating from ${sel}: ${ratingNum}`);
            break;
          }
        }
      }
    } catch (e) { console.warn('[Scraper] Rating extraction failed:', e.message); }

    // ---- Review Count ----
    try {
      const reviewSelectors = [
        'a.reviews-summary-reviews-detail b',
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
            console.log(`[Scraper] ✅ Review count from ${sel}: ${reviewNum}`);
            break;
          }
        }
      }
    } catch (e) { /* ignore */ }

    // ---- Question Count ----
    try {
      const qSelectors = [
        'a.questions-summary-questions-summary b',
        '.questions-summary-questions-summary b',
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
            console.log(`[Scraper] ✅ Question count from ${sel}: ${qNum}`);
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
      console.log(`[Scraper] Body text length: ${bodyText.length} chars`);
      
      // Favorite count: "39,1B kişi favoriledi" or "1.768 kişi favoriledi" or "29,9B kişi favoriledi"
      const favMatch = bodyText.match(/([\d.,]+[BMKbmk]?)\s*kişi\s*favori/i);
      if (favMatch) {
        results.socialProof.favoriteCount = parseFormattedNumber(favMatch[1]);
        console.log(`[Scraper] ✅ Favorites: ${favMatch[1]} → ${results.socialProof.favoriteCount}`);
      }
      
      // Cart count: "5,6B kişinin sepetinde" or "521 kişinin sepetinde"
      const cartMatch = bodyText.match(/([\d.,]+[BMKbmk]?)\s*kişinin\s*sepetinde/i);
      if (cartMatch) {
        results.socialProof.cartCount = parseFormattedNumber(cartMatch[1]);
        console.log(`[Scraper] ✅ Cart: ${cartMatch[1]} → ${results.socialProof.cartCount}`);
      }
      
      // View count: "704 kişi görüntüledi" or "4B kişi görüntüledi"
      const viewMatch = bodyText.match(/([\d.,]+[BMKbmk]?)\s*kişi\s*görüntüledi/i);
      if (viewMatch) {
        results.socialProof.viewCount = parseFormattedNumber(viewMatch[1]);
        console.log(`[Scraper] ✅ Views: ${viewMatch[1]} → ${results.socialProof.viewCount}`);
      }
      
      // Sold count: "1B+ ürün satıldı" or "500+ satıldı"
      const soldMatch = bodyText.match(/([\d.,]+[BMKbmk]?\+?)\s*(?:ürün\s*)?satıldı/i);
      if (soldMatch) {
        results.socialProof.soldCount = parseFormattedNumber(soldMatch[1]);
        console.log(`[Scraper] ✅ Sold: ${soldMatch[1]} → ${results.socialProof.soldCount}`);
      }
      
      // Also check for top banner: "Son 24 saatte XXX kişi görüntüledi"
      const bannerMatch = bodyText.match(/Son\s*24\s*saatte\s*([\d.,]+[BMKbmk]?)\s*kişi\s*görüntüledi/i);
      if (bannerMatch && !results.socialProof.viewCount) {
        results.socialProof.viewCount = parseFormattedNumber(bannerMatch[1]);
        console.log(`[Scraper] ✅ Views (banner): ${bannerMatch[1]} → ${results.socialProof.viewCount}`);
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

    // ---- API Intercepted Reviews OR Navigate to /yorumlar ----
    if (interceptedReviews.length > 0) {
      results.reviews = interceptedReviews.slice(0, 30);
      console.log(`[Scraper] ✅ Found ${results.reviews.length} reviews from background API!`);
    } else {
      console.log('[Scraper] No reviews intercepted statically. Navigating to /yorumlar...');
      try {
        let currentUrl = page.url().split('?')[0];
        if (!currentUrl.endsWith('/yorumlar')) {
          currentUrl = `${currentUrl}/yorumlar`;
        }
        await page.goto(currentUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(4000); // Give it time to load the API in background
        
        if (interceptedReviews.length > 0) {
          results.reviews = interceptedReviews.slice(0, 30);
          console.log(`[Scraper] ✅ Found ${results.reviews.length} reviews after navigating to /yorumlar!`);
        } else {
          console.log('[Scraper] Still no intercepted API reviews. Attempting DOM extraction on /yorumlar...');
          // Fallback DOM extraction on the /yorumlar page just in case
          const reviewData = await page.evaluate(() => {
            const reviews = [];
            const cards = document.querySelectorAll('.review-item, .rnr-cm-w, .comment, [class*="review-card"], .ugc-comment-item');
            cards.forEach(card => {
              try {
                const author = card.querySelector('.review-author, .rnr-cm-nm, .comment-author, [class*="user-name"]')?.innerText.trim() || 'Anonim';
                const content = card.querySelector('.review-text, .rnr-cm-tx, .comment-text, p')?.innerText.trim() || '';
                const date = card.querySelector('.review-date, .rnr-cm-dt, .comment-date, [class*="date"]')?.innerText.trim() || '';
                const stars = card.querySelectorAll('.star.full, .rnr-cm-str .full, .full-star');
                const rating = stars.length > 0 ? stars.length : 5;
                if (content.length > 5) reviews.push({ author, content: content.substring(0, 500), date, rating });
              } catch (e) {}
            });
            return reviews;
          });
          
          if (reviewData.length > 0) {
            results.reviews = reviewData.slice(0, 30);
            console.log(`[Scraper] ✅ Found ${results.reviews.length} reviews from /yorumlar DOM`);
          }
        }
      } catch (e) {
        console.warn('[Scraper] Navigation to /yorumlar failed:', e.message);
      }
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
    // Use Trendyol search to find the product (direct URL format doesn't work)
    url = `https://www.trendyol.com/sr?q=${contentId}`;
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

    // Removed the "X olumlu, X olumsuz yorum mevcut." text per user request.
    summary = `"${productName || 'Bu ürün'}" toplam ${reviewCount} yorum analiz edildiğinde ${avgRating} ortalama puanla ${sentiment === 'positive' ? 'oldukça beğenilen' : sentiment === 'neutral' ? 'orta düzeyde değerlendirilen' : 'eleştirilen'} bir ürün olarak öne çıkıyor.`;

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

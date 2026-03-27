// Playwright-based Trendyol review scraper
// Runs locally inside Docker container with Chromium

let chromium;
try {
  chromium = require('playwright-core').chromium;
} catch (e) {
  console.warn('[ReviewScraper] playwright-core not available');
}

const CHROMIUM_PATH = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || '/usr/bin/chromium';
const MAX_REVIEWS = 15;

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

export async function scrapeReviews(productUrl) {
  if (!chromium) {
    console.warn('[ReviewScraper] Playwright not available, skipping reviews');
    return [];
  }

  let browser;
  try {
    console.log(`[ReviewScraper] Launching browser for: ${productUrl}`);

    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-software-rasterizer',
      ],
    });

    const context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      locale: 'tr-TR',
      viewport: { width: 1366, height: 768 },
    });

    const page = await context.newPage();

    // Block heavy resources
    await page.route('**/*.{png,jpg,jpeg,gif,webp,svg,ico,woff,woff2,ttf,otf}', r => r.abort());
    await page.route('**/analytics**', r => r.abort());
    await page.route('**/tracking**', r => r.abort());
    await page.route('**/googletag**', r => r.abort());
    await page.route('**/facebook**', r => r.abort());

    // Intercept review API responses
    let interceptedReviews = [];
    page.on('response', async (response) => {
      try {
        const url = response.url();
        if ((url.includes('/api/review') || url.includes('product-reviews')) &&
            (response.headers()['content-type'] || '').includes('application/json')) {
          const json = await response.json();
          const reviews = json?.result?.productReviews?.content
            || json?.result?.reviews
            || json?.data?.reviews
            || json?.reviews
            || [];

          if (reviews.length > 0 && interceptedReviews.length === 0) {
            interceptedReviews = reviews.slice(0, MAX_REVIEWS).map(r => ({
              author: r.userFullName || r.userName || 'Anonim',
              rating: r.rate || r.rating || 5,
              content: (r.comment || '').trim().substring(0, 2000),
              date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString('tr-TR')
                : (r.lastModifiedDate ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR') : ''),
            })).filter(r => r.content.length > 5);
            console.log(`[ReviewScraper] Intercepted ${interceptedReviews.length} reviews from API`);
          }
        }
      } catch (e) { /* ignore parse errors */ }
    });

    // Navigate to reviews page directly
    let reviewUrl = productUrl.split('?')[0];
    if (!reviewUrl.endsWith('/yorumlar')) {
      reviewUrl = `${reviewUrl}/yorumlar`;
    }

    await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);

    // If no intercepted reviews, try DOM extraction
    if (interceptedReviews.length === 0) {
      console.log('[ReviewScraper] No API intercepts, trying DOM extraction...');
      const domReviews = await page.evaluate((maxReviews) => {
        const reviews = [];
        const cards = document.querySelectorAll(
          '.comment, .comment-item, .rnr-cm-w, .review-item, [class*="review-card"], .ugc-comment-item'
        );
        cards.forEach(card => {
          if (reviews.length >= maxReviews) return;
          try {
            const author = card.querySelector(
              '.comment-author, .rnr-cm-nm, .review-author, [class*="user-name"]'
            )?.innerText?.trim() || 'Anonim';
            const content = card.querySelector(
              '.comment-text, .rnr-cm-tx, .review-text, p'
            )?.innerText?.trim() || '';
            const date = card.querySelector(
              '.comment-date, .rnr-cm-dt, .review-date, [class*="date"]'
            )?.innerText?.trim() || '';
            const stars = card.querySelectorAll('.star.full, .rnr-cm-str .full, .full-star');
            const rating = stars.length > 0 ? stars.length : 5;
            if (content.length > 5) {
              reviews.push({ author, content: content.substring(0, 2000), date, rating });
            }
          } catch (e) { /* skip */ }
        });
        return reviews;
      }, MAX_REVIEWS);

      if (domReviews.length > 0) {
        interceptedReviews = domReviews;
        console.log(`[ReviewScraper] Found ${domReviews.length} reviews from DOM`);
      }
    }

    await browser.close();
    console.log(`[ReviewScraper] Done. Total reviews: ${interceptedReviews.length}`);
    return interceptedReviews;

  } catch (error) {
    console.error(`[ReviewScraper] Error: ${error.message}`);
    if (browser) try { await browser.close(); } catch (e) { /* */ }
    return [];
  }
}

// AKTARMATIK - Trendyol Scraper v2
// Strategy: Fetch product page HTML with proxy → extract embedded JSON data
// Trendyol embeds product data in HTML as JSON within script tags

const PROXIES = (process.env.PROXY_LIST || '').split(',').filter(Boolean);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getRandomProxy() {
  if (PROXIES.length === 0) return null;
  return PROXIES[Math.floor(Math.random() * PROXIES.length)];
}

function parseProxyUrl(proxyStr) {
  if (proxyStr.startsWith('http')) return proxyStr;
  const parts = proxyStr.split(':');
  if (parts.length === 4) {
    const [ip, port, user, pass] = parts;
    if (user === 'farketmez' || !user) {
      return `http://${ip}:${port}`;
    }
    return `http://${user}:${pass}@${ip}:${port}`;
  }
  if (parts.length === 2) {
    return `http://${parts[0]}:${parts[1]}`;
  }
  return proxyStr;
}

function extractContentId(url) {
  const match = url.match(/-p-(\d+)/);
  return match ? match[1] : null;
}

// Fetch with proxy + retry
async function fetchWithProxy(url, options = {}, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const proxyStr = getRandomProxy();
      let fetchOptions = {
        ...options,
        headers: {
          'User-Agent': getRandomUA(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'Upgrade-Insecure-Requests': '1',
          ...(options.headers || {}),
        },
        signal: AbortSignal.timeout(20000),
      };

      if (proxyStr) {
        try {
          const { ProxyAgent } = await import('undici');
          fetchOptions.dispatcher = new ProxyAgent(parseProxyUrl(proxyStr));
          console.log(`[Scraper] Attempt ${attempt + 1}: Using proxy ${proxyStr.split(':').slice(0,2).join(':')}`);
        } catch (e) {
          console.warn('[Scraper] Proxy agent unavailable:', e.message);
        }
      }

      const response = await fetch(url, fetchOptions);
      
      if (response.status === 403 || response.status === 429 || response.status === 503) {
        console.warn(`[Scraper] Attempt ${attempt + 1}: Got ${response.status}, retrying with different proxy...`);
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      
      return response;
    } catch (error) {
      console.warn(`[Scraper] Attempt ${attempt + 1} failed:`, error.message);
      if (attempt === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

// ============================================
// MAIN SCRAPING APPROACH: HTML + Embedded JSON
// ============================================
async function scrapeProductPage(productUrl) {
  console.log(`[Scraper] Fetching product page: ${productUrl}`);
  
  const response = await fetchWithProxy(productUrl);
  const html = await response.text();
  
  console.log(`[Scraper] Got ${html.length} bytes of HTML`);
  
  const results = { reviews: [], socialProof: {} };
  
  // Method 1: Extract from __PRODUCT_DETAIL_APP_INITIAL_STATE__
  const stateMatch = html.match(/window\.__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      console.log('[Scraper] Found __PRODUCT_DETAIL_APP_INITIAL_STATE__');
      
      const product = state?.product;
      if (product) {
        results.name = product.name || '';
        results.rating = product.ratingScore?.averageRating || null;
        results.reviewCount = product.ratingScore?.totalRatingCount || product.ratingScore?.totalCount || 0;
        results.questionCount = product.questionCount || 0;
        results.image = product.images?.[0]?.url 
          ? (product.images[0].url.startsWith('http') ? product.images[0].url : `https://cdn.dsmcdn.com${product.images[0].url}`)
          : '';
        
        // Social proof from state
        if (product.socialProof || state.socialProof) {
          const sp = product.socialProof || state.socialProof || {};
          results.socialProof = {
            favoriteCount: sp.favoriteCount || 0,
            cartCount: sp.basketCount || sp.cartCount || 0,
            soldCount: sp.orderCount || sp.soldCount || 0,
            viewCount: sp.visitCount || sp.viewCount || 0,
          };
        }
      }
      
      // Reviews from state
      if (state?.reviews?.content || state?.ratingAndReview?.reviews) {
        const reviewList = state?.reviews?.content || state?.ratingAndReview?.reviews || [];
        results.reviews = reviewList.slice(0, 25).map(r => ({
          author: r.userFullName || r.userName || 'Anonim',
          rating: r.rate || r.rating || 5,
          content: r.comment || r.text || '',
          date: r.lastModifiedDate 
            ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR')
            : (r.reviewDate || ''),
        }));
      }
    } catch (e) {
      console.warn('[Scraper] Failed to parse __PRODUCT_DETAIL_APP_INITIAL_STATE__:', e.message);
    }
  }
  
  // Method 2: Extract from JSON-LD structured data
  if (!results.name) {
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<\/?script[^>]*>/gi, '');
          const ld = JSON.parse(jsonStr);
          if (ld['@type'] === 'Product' || ld.aggregateRating) {
            results.name = results.name || ld.name || '';
            if (ld.aggregateRating) {
              results.rating = results.rating || parseFloat(ld.aggregateRating.ratingValue);
              results.reviewCount = results.reviewCount || parseInt(ld.aggregateRating.reviewCount || ld.aggregateRating.ratingCount || 0);
            }
            if (ld.image) {
              results.image = results.image || (Array.isArray(ld.image) ? ld.image[0] : ld.image);
            }
            if (ld.offers) {
              results.price = ld.offers.price || ld.offers.lowPrice;
              results.currency = ld.offers.priceCurrency || 'TRY';
            }
            console.log('[Scraper] Extracted from JSON-LD');
          }
        } catch (e) { /* parse error, continue */ }
      }
    }
  }
  
  // Method 3: Extract from meta tags and HTML
  if (!results.name) {
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    results.name = ogTitle ? ogTitle[1].trim() : '';
  }
  if (!results.image) {
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    results.image = ogImage ? ogImage[1] : '';
  }
  
  // Method 4: Extract review data from inline scripts
  if (results.reviews.length === 0) {
    // Try to find review data in any script tag
    const reviewDataMatch = html.match(/"reviews"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
    if (reviewDataMatch) {
      try {
        const reviewArr = JSON.parse(reviewDataMatch[1]);
        results.reviews = reviewArr.slice(0, 25).map(r => ({
          author: r.userFullName || r.userName || r.author || 'Anonim',
          rating: r.rate || r.rating || 5,
          content: r.comment || r.text || r.content || '',
          date: r.lastModifiedDate 
            ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR')
            : (r.reviewDate || r.date || ''),
        }));
        console.log(`[Scraper] Found ${results.reviews.length} reviews from inline script`);
      } catch (e) { /* parse error */ }
    }
  }
  
  // Check if we got meaningful data
  const hasData = results.name || results.rating || results.reviews.length > 0;
  
  if (hasData) {
    console.log(`[Scraper] SUCCESS! Product: ${results.name}, Rating: ${results.rating}, Reviews: ${results.reviews.length}`);
    return results;
  }
  
  // Log what we received for debugging
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  console.warn(`[Scraper] No product data found. Page title: ${titleMatch?.[1] || 'unknown'}`);
  console.warn(`[Scraper] HTML starts with: ${html.substring(0, 500)}`);
  
  throw new Error('Could not extract product data from page');
}

// ============================================
// TRENDYOL API ATTEMPT (as secondary method)
// ============================================
async function scrapeViaAPI(contentId) {
  console.log(`[Scraper] Trying Trendyol API for contentId: ${contentId}`);
  
  const results = { reviews: [], socialProof: {} };
  let gotData = false;
  
  // Try different API base URLs
  const apiUrls = [
    `https://api.trendyol.com/webbrowsinggw/api/review/${contentId}?page=0&size=25`,
    `https://apigw.trendyol.com/discovery-web-productgw-service/api/productDetail/${contentId}`,
  ];
  
  for (const apiUrl of apiUrls) {
    try {
      const response = await fetchWithProxy(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': `https://www.trendyol.com/`,
          'Origin': 'https://www.trendyol.com',
        },
      }, 2);
      
      const data = await response.json();
      
      if (data?.result?.productReviews?.content) {
        results.reviews = data.result.productReviews.content.map(r => ({
          author: r.userFullName || 'Anonim',
          rating: r.rate || 5,
          content: r.comment || '',
          date: r.lastModifiedDate 
            ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR') : '',
        }));
        results.reviewCount = data.result.productReviews.totalElements || results.reviews.length;
        gotData = true;
      }
      
      if (data?.result?.name) {
        results.name = data.result.name;
        results.rating = data.result.ratingScore?.averageRating;
        results.image = data.result.images?.[0]?.url 
          ? `https://cdn.dsmcdn.com${data.result.images[0].url}` : '';
        gotData = true;
      }
    } catch (e) {
      console.warn(`[Scraper] API ${apiUrl} failed:`, e.message);
    }
  }
  
  if (gotData) return results;
  throw new Error('API scraping failed');
}

// ============================================
// MOCK DATA (Last Resort)
// ============================================
function generateMockData(barcode) {
  console.log(`[Scraper] Using mock data for barcode: ${barcode}`);
  return {
    name: `Trendyol Ürün #${barcode}`,
    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
    reviewCount: Math.floor(Math.random() * 200) + 20,
    questionCount: Math.floor(Math.random() * 30) + 2,
    image: '',
    socialProof: {
      favoriteCount: Math.floor(Math.random() * 5000) + 500,
      cartCount: Math.floor(Math.random() * 200) + 10,
      soldCount: Math.floor(Math.random() * 10000) + 1000,
      viewCount: Math.floor(Math.random() * 20000) + 2000,
    },
    reviews: Array.from({ length: 10 }, (_, i) => ({
      author: `Kullanıcı ${i + 1}`,
      rating: Math.floor(Math.random() * 2) + 4,
      content: [
        'Ürün kalitesi gayet iyi, tavsiye ederim.',
        'Hızlı kargo, güzel paketleme. Teşekkürler.',
        'Beden tam oturdu, kumaşı kaliteli.',
        'Fiyatına göre gayet iyi bir ürün.',
        'Rengi fotoğraftakinden biraz farklı ama yine de güzel.',
        'İkinci defa alıyorum, çok memnunum.',
        'Kargo biraz geç geldi ama ürün güzel.',
        'Beklentilerimi karşıladı, puanı hak ediyor.',
        'Kaliteli malzeme, dikişleri düzgün.',
        'Hediye olarak aldım, çok beğenildi.',
      ][i],
      date: new Date(Date.now() - i * 86400000).toLocaleDateString('tr-TR'),
    })),
    _isMock: true,
  };
}

// ============================================
// MAIN FUNCTION
// ============================================
export async function scrapeTrendyolProduct(productUrl, barcode) {
  const contentId = extractContentId(productUrl) || barcode;
  
  // Ensure we have a valid Trendyol URL
  let url = productUrl;
  if (!url || !url.includes('trendyol.com')) {
    url = `https://www.trendyol.com/brand/product-p-${contentId}`;
  }
  
  // Layer 1: Scrape the HTML page directly
  try {
    const result = await scrapeProductPage(url);
    if (result && !result._isMock) return result;
  } catch (e) {
    console.warn('[Scraper] HTML scraping failed:', e.message);
  }
  
  // Layer 2: Try API endpoints  
  if (contentId) {
    try {
      const result = await scrapeViaAPI(contentId);
      if (result && (result.name || result.reviews.length > 0)) return result;
    } catch (e) {
      console.warn('[Scraper] API scraping failed:', e.message);
    }
  }
  
  // Layer 3: Mock data
  return generateMockData(barcode || contentId || 'unknown');
}

export function generateMockAnalysis(productName, rating, reviews) {
  const avgRating = parseFloat(rating) || 4.2;
  const sentiment = avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative';
  const reviewCount = reviews?.length || 0;
  const positiveCount = reviews?.filter(r => r.rating >= 4).length || 0;
  const negativeCount = reviews?.filter(r => r.rating <= 2).length || 0;

  return {
    summary: `"${productName || 'Bu ürün'}" toplam ${reviewCount} yorum analiz edildiğinde ${avgRating} ortalama puanla ${sentiment === 'positive' ? 'oldukça beğenilen' : sentiment === 'neutral' ? 'orta düzeyde' : 'eleştirilen'} bir ürün olarak öne çıkıyor. ${positiveCount} olumlu, ${negativeCount} olumsuz yorum mevcut.`,
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

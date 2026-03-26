// AKTARMATIK - Trendyol Scraper
// 3 Katmanlı: API → HTML Scraping → Mock Data

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
  // Format: ip:port:user:pass  or  http://user:pass@ip:port
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

// Extract contentId from Trendyol URL
function extractContentId(url) {
  // URL format: https://www.trendyol.com/brand/product-name-p-123456789
  const match = url.match(/-p-(\d+)/);
  return match ? match[1] : null;
}

// Build common headers to mimic a real browser
function getBrowserHeaders() {
  return {
    'User-Agent': getRandomUA(),
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Referer': 'https://www.trendyol.com/',
    'Origin': 'https://www.trendyol.com',
    'sec-ch-ua': '"Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'Connection': 'keep-alive',
  };
}

// Fetch with proxy support and retry
async function fetchWithProxy(url, options = {}, retries = 3) {
  const headers = { ...getBrowserHeaders(), ...(options.headers || {}) };
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const proxyStr = getRandomProxy();
      let fetchOptions = { 
        ...options, 
        headers, 
        signal: AbortSignal.timeout(15000),
      };

      // If proxy available, use undici ProxyAgent
      if (proxyStr) {
        const proxyUrl = parseProxyUrl(proxyStr);
        try {
          const { ProxyAgent } = await import('undici');
          fetchOptions.dispatcher = new ProxyAgent(proxyUrl);
        } catch (e) {
          // undici not available, try without proxy
          console.warn('Proxy agent unavailable, fetching direct:', e.message);
        }
      }

      const response = await fetch(url, fetchOptions);
      
      if (response.status === 403 || response.status === 429) {
        console.warn(`Attempt ${attempt + 1}: Got ${response.status} from ${url}, retrying...`);
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed for ${url}:`, error.message);
      if (attempt === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

// ============================================
// KATMAN 1: Trendyol Internal API
// ============================================
async function scrapeViaAPI(contentId) {
  console.log(`[Scraper] API katmanı deneniyor... contentId: ${contentId}`);
  
  const results = { reviews: [], socialProof: {} };
  
  // 1. Product Detail
  try {
    const detailRes = await fetchWithProxy(
      `https://public.trendyol.com/discovery-web-productgw-service/api/productDetail/${contentId}`,
      {}
    );
    const detail = await detailRes.json();
    
    if (detail?.result) {
      const product = detail.result;
      results.name = product.name || product.productName || '';
      results.rating = product.ratingScore?.averageRating || null;
      results.reviewCount = product.ratingScore?.totalRatingCount || 0;
      results.questionCount = product.questionCount || 0;
      results.image = product.images?.[0]?.url 
        ? `https://cdn.dsmcdn.com${product.images[0].url}` 
        : '';
    }
  } catch (e) {
    console.warn('[Scraper] Product detail API failed:', e.message);
  }
  
  // 2. Reviews
  try {
    const reviewRes = await fetchWithProxy(
      `https://public.trendyol.com/discovery-web-ugc-service/api/review/${contentId}?page=0&size=25&orderByMostHelpful=true`,
      {}
    );
    const reviewData = await reviewRes.json();
    
    if (reviewData?.result?.productReviews?.content) {
      results.reviews = reviewData.result.productReviews.content.map(r => ({
        author: r.userFullName || 'Anonim',
        rating: r.rate || 5,
        content: r.comment || '',
        date: r.lastModifiedDate 
          ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR') 
          : '',
      }));
      
      // Update review count from actual data
      if (reviewData.result.productReviews.totalElements) {
        results.reviewCount = reviewData.result.productReviews.totalElements;
      }
    }
  } catch (e) {
    console.warn('[Scraper] Reviews API failed:', e.message);
  }
  
  // 3. Social Proof
  try {
    const socialRes = await fetchWithProxy(
      `https://public.trendyol.com/discovery-web-socialgw-service/api/social-proof/${contentId}`,
      {}
    );
    const socialData = await socialRes.json();
    
    if (socialData?.result) {
      const sp = socialData.result;
      results.socialProof = {
        favoriteCount: sp.favoriteCount || 0,
        cartCount: sp.basketCount || sp.cartCount || 0,
        soldCount: sp.orderCount || sp.soldCount || 0,
        viewCount: sp.visitCount || sp.viewCount || 0,
      };
    }
  } catch (e) {
    console.warn('[Scraper] Social proof API failed:', e.message);
  }
  
  // Check if we got meaningful data
  if (results.name || results.reviews.length > 0 || results.rating) {
    console.log(`[Scraper] API başarılı! Ürün: ${results.name}, ${results.reviews.length} yorum`);
    return results;
  }
  
  throw new Error('API returned no useful data');
}

// ============================================
// KATMAN 2: HTML Scraping
// ============================================
async function scrapeViaHTML(productUrl) {
  console.log(`[Scraper] HTML katmanı deneniyor... URL: ${productUrl}`);
  
  const response = await fetchWithProxy(productUrl, {
    headers: {
      ...getBrowserHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
  });
  
  const html = await response.text();
  const results = { reviews: [], socialProof: {} };
  
  // Extract product name
  const nameMatch = html.match(/<h1[^>]*class="[^"]*pr-new-br[^"]*"[^>]*>([^<]+)<\/h1>/i) 
    || html.match(/<title>([^|<]+)/i);
  results.name = nameMatch ? nameMatch[1].trim() : '';
  
  // Extract rating from structured data (JSON-LD)
  const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonStr = match.replace(/<\/?script[^>]*>/gi, '');
        const ld = JSON.parse(jsonStr);
        if (ld.aggregateRating) {
          results.rating = parseFloat(ld.aggregateRating.ratingValue);
          results.reviewCount = parseInt(ld.aggregateRating.reviewCount || ld.aggregateRating.ratingCount || 0);
        }
        if (ld.name && !results.name) {
          results.name = ld.name;
        }
        if (ld.image) {
          results.image = Array.isArray(ld.image) ? ld.image[0] : ld.image;
        }
      } catch (e) { /* JSON parse hatası, devam */ }
    }
  }
  
  // Extract image from meta og:image
  const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogImageMatch && !results.image) {
    results.image = ogImageMatch[1];
  }
  
  if (results.name || results.rating) {
    console.log(`[Scraper] HTML scraping başarılı! Ürün: ${results.name}`);
    return results;
  }
  
  throw new Error('HTML scraping returned no useful data');
}

// ============================================
// KATMAN 3: Mock Data (Son Çare)
// ============================================
function generateMockData(barcode) {
  console.log(`[Scraper] Mock data kullanılıyor... Barkod: ${barcode}`);
  return {
    name: `Trendyol Ürün #${barcode}`,
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
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
  };
}

// ============================================
// ANA FONKSİYON
// ============================================
export async function scrapeTrendyolProduct(productUrl, barcode) {
  const contentId = extractContentId(productUrl);
  
  // Katman 1: API
  if (contentId) {
    try {
      return await scrapeViaAPI(contentId);
    } catch (e) {
      console.warn('[Scraper] API katmanı başarısız:', e.message);
    }
  }
  
  // Katman 2: HTML Scraping
  try {
    return await scrapeViaHTML(productUrl);
  } catch (e) {
    console.warn('[Scraper] HTML katmanı başarısız:', e.message);
  }
  
  // Katman 3: Mock Data
  return generateMockData(barcode || contentId || 'unknown');
}

export function generateMockAnalysis(productName, rating, reviews) {
  const avgRating = parseFloat(rating) || 4.2;
  const sentiment = avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative';

  const reviewCount = reviews?.length || 0;
  const positiveCount = reviews?.filter(r => r.rating >= 4).length || 0;
  const negativeCount = reviews?.filter(r => r.rating <= 2).length || 0;

  return {
    summary: `"${productName || 'Bu ürün'}" toplam ${reviewCount} yorum analiz edildiğinde ${avgRating} ortalama puanla ${sentiment === 'positive' ? 'oldukça beğenilen' : sentiment === 'neutral' ? 'orta düzeyde' : 'eleştirilen'} bir ürün olarak öne çıkıyor. ${positiveCount} olumlu, ${negativeCount} olumsuz yorum mevcut. Kullanıcılar genel olarak ürün kalitesinden ${sentiment === 'positive' ? 'memnun' : 'memnun değil'}.`,
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

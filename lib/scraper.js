// AKTARMATIK - Trendyol Scraper v3
// Strategy: Multi-layer scraping from Trendyol product pages
// Layer 1: HTML page scraping with embedded JSON extraction
// Layer 2: Trendyol internal API endpoints
// Layer 3: Basic HTML/meta tag extraction as fallback

const PROXIES = (process.env.PROXY_LIST || '').split(',').filter(Boolean);

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
];

function getRandomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
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

// ============================================
// FETCH WITH RETRY - Direct first, then proxies
// ============================================
async function fetchWithRetry(url, options = {}, maxRetries = null) {
  const commonHeaders = {
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
  };

  // Build attempt list: direct first, then each proxy
  const attempts = [null, ...PROXIES]; // null = direct (no proxy)
  const limit = maxRetries ? Math.min(maxRetries, attempts.length) : attempts.length;
  
  for (let i = 0; i < limit; i++) {
    const proxyStr = attempts[i];
    const label = proxyStr ? `proxy ${proxyStr.split(':').slice(0,2).join(':')}` : 'DIRECT';
    
    try {
      let fetchOptions = {
        ...options,
        headers: { ...commonHeaders, 'User-Agent': getRandomUA() },
        signal: AbortSignal.timeout(25000),
        redirect: 'follow',
      };

      if (proxyStr) {
        try {
          const { ProxyAgent } = await import('undici');
          fetchOptions.dispatcher = new ProxyAgent(parseProxyUrl(proxyStr));
        } catch (e) {
          console.warn(`[Scraper] ProxyAgent error: ${e.message}`);
          continue;
        }
      }

      console.log(`[Scraper] Attempt ${i + 1}/${limit}: ${label} → ${url}`);
      const response = await fetch(url, fetchOptions);
      
      console.log(`[Scraper] ${label} → HTTP ${response.status}`);
      
      if (response.status === 403 || response.status === 429 || response.status === 503) {
        console.warn(`[Scraper] ${label}: Blocked (${response.status}), trying next...`);
        await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
        continue;
      }
      
      if (response.ok) {
        return response;
      }
      
      // For redirects, follow them
      if (response.status === 301 || response.status === 302) {
        const location = response.headers.get('location');
        if (location) {
          console.log(`[Scraper] Following redirect to: ${location}`);
          return fetchWithRetry(location, options, 2);
        }
      }
      
      // For other statuses, return anyway
      return response;
    } catch (error) {
      console.warn(`[Scraper] ${label} failed: ${error.message}`);
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    }
  }
  throw new Error(`All ${limit} attempts failed for ${url}`);
}

// ============================================
// HTML SCRAPING - Extract embedded JSON + meta
// ============================================
async function scrapeProductPage(productUrl) {
  console.log(`[Scraper] Fetching product page: ${productUrl}`);
  
  const response = await fetchWithRetry(productUrl);
  const html = await response.text();
  
  console.log(`[Scraper] Got ${html.length} bytes of HTML`);
  
  // Debug: log page title
  const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  console.log(`[Scraper] Page title: ${titleTag?.[1] || 'unknown'}`);
  
  const results = { reviews: [], socialProof: {} };
  
  // ---- Method 1: __PRODUCT_DETAIL_APP_INITIAL_STATE__ ----
  // Trendyol embeds the full product data in a window variable
  const statePatterns = [
    /window\.__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/,
    /window\.__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*window\./,
    /__PRODUCT_DETAIL_APP_INITIAL_STATE__\s*=\s*({[\s\S]*?});/,
  ];
  
  for (const pattern of statePatterns) {
    const stateMatch = html.match(pattern);
    if (stateMatch) {
      try {
        const state = JSON.parse(stateMatch[1]);
        console.log('[Scraper] ✅ Found __PRODUCT_DETAIL_APP_INITIAL_STATE__');
        console.log('[Scraper] State keys:', Object.keys(state).join(', '));
        
        const product = state?.product;
        if (product) {
          results.name = product.name || '';
          results.brand = product.brand?.name || '';
          results.contentId = product.id || product.contentId || '';
          
          // Rating
          if (product.ratingScore) {
            results.rating = product.ratingScore.averageRating || null;
            results.reviewCount = product.ratingScore.totalRatingCount || product.ratingScore.totalCount || 0;
          }
          
          // Question count
          results.questionCount = product.questionCount || 0;
          
          // Image
          if (product.images && product.images.length > 0) {
            const imgUrl = product.images[0].url || product.images[0];
            results.image = typeof imgUrl === 'string' && imgUrl.startsWith('http') 
              ? imgUrl 
              : `https://cdn.dsmcdn.com${imgUrl}`;
          }
          
          // Price
          if (product.price) {
            results.price = product.price.sellingPrice || product.price.originalPrice || null;
            results.currency = 'TRY';
          }
          
          // Social proof from product state
          if (product.socialProof) {
            const sp = product.socialProof;
            results.socialProof = {
              favoriteCount: sp.favoriteCount || sp.favCount || 0,
              cartCount: sp.basketCount || sp.cartCount || 0,
              soldCount: sp.orderCount || sp.soldCount || 0,
              viewCount: sp.visitCount || sp.viewCount || 0,
            };
          }
          
          console.log(`[Scraper] Product: ${results.name}, Rating: ${results.rating}, Reviews: ${results.reviewCount}`);
        }
        
        // Social proof from top-level state
        if (state?.socialProof && Object.keys(results.socialProof).length === 0) {
          const sp = state.socialProof;
          results.socialProof = {
            favoriteCount: sp.favoriteCount || sp.favCount || 0,
            cartCount: sp.basketCount || sp.cartCount || 0,
            soldCount: sp.orderCount || sp.soldCount || 0,
            viewCount: sp.visitCount || sp.viewCount || 0,
          };
        }

        // Reviews from state
        const reviewSources = [
          state?.reviews?.content,
          state?.ratingAndReview?.reviews,
          state?.product?.reviews,
          state?.reviews?.ratingAndReviewResponse?.content,
        ];
        
        for (const reviewList of reviewSources) {
          if (reviewList && Array.isArray(reviewList) && reviewList.length > 0) {
            results.reviews = reviewList.slice(0, 30).map(r => ({
              author: r.userFullName || r.userName || r.nickName || 'Anonim',
              rating: r.rate || r.rating || r.star || 5,
              content: r.comment || r.text || r.reviewText || '',
              date: r.lastModifiedDate 
                ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR')
                : (r.reviewDate || r.createdDate || ''),
            })).filter(r => r.content.length > 0);
            console.log(`[Scraper] Found ${results.reviews.length} reviews from state`);
            break;
          }
        }
        
        break; // Found the state, no need to try other patterns
      } catch (e) {
        console.warn('[Scraper] Failed to parse __PRODUCT_DETAIL_APP_INITIAL_STATE__:', e.message);
        // Try to extract just the product object if full JSON fails
        try {
          const productMatch = stateMatch[1].match(/"product"\s*:\s*({[\s\S]*?})\s*[,}]/);
          if (productMatch) {
            const product = JSON.parse(productMatch[1]);
            results.name = product.name || '';
            console.log(`[Scraper] Partial product extraction: ${results.name}`);
          }
        } catch (e2) { /* ignore */ }
      }
    }
  }
  
  // ---- Method 2: JSON-LD Structured Data ----
  if (!results.name || !results.rating) {
    const jsonLdMatches = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        try {
          const jsonStr = match.replace(/<\/?script[^>]*>/gi, '');
          const ld = JSON.parse(jsonStr);
          
          if (ld['@type'] === 'Product' || ld.aggregateRating) {
            if (!results.name) results.name = ld.name || '';
            if (!results.rating && ld.aggregateRating) {
              results.rating = parseFloat(ld.aggregateRating.ratingValue);
              results.reviewCount = results.reviewCount || parseInt(ld.aggregateRating.reviewCount || ld.aggregateRating.ratingCount || 0);
            }
            if (!results.image && ld.image) {
              results.image = Array.isArray(ld.image) ? ld.image[0] : ld.image;
            }
            if (ld.offers) {
              results.price = results.price || ld.offers.price || ld.offers.lowPrice;
              results.currency = ld.offers.priceCurrency || 'TRY';
            }
            if (!results.brand && ld.brand) {
              results.brand = ld.brand.name || ld.brand || '';
            }
            console.log('[Scraper] ✅ Extracted from JSON-LD');
          }
        } catch (e) { /* parse error, continue */ }
      }
    }
  }
  
  // ---- Method 3: OpenGraph + Meta Tags ----
  if (!results.name) {
    const ogTitle = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    if (ogTitle) {
      results.name = ogTitle[1].replace(/ - Fiyatı.*$/, '').replace(/ - Trendyol$/, '').trim();
    }
  }
  if (!results.image) {
    const ogImage = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    results.image = ogImage ? ogImage[1] : '';
  }
  
  // ---- Method 4: Direct HTML parsing for social proof ----
  if (Object.keys(results.socialProof).length === 0 || 
      (results.socialProof.favoriteCount === 0 && results.socialProof.cartCount === 0)) {
    
    // Favorite count: "39,1B kişi favoriledi" or "1768 kişi favoriledi"
    const favMatch = html.match(/(\d[\d.,]*[BKM]?)\s*kişi favori/i) || 
                     html.match(/favoriteCount['":\s]*(\d+)/i);
    if (favMatch) {
      results.socialProof.favoriteCount = parseFormattedNumber(favMatch[1]);
    }
    
    // Cart count: "5,6B kişinin sepetinde"
    const cartMatch = html.match(/(\d[\d.,]*[BKM]?)\s*kişinin sepetinde/i) ||
                      html.match(/basketCount['":\s]*(\d+)/i);
    if (cartMatch) {
      results.socialProof.cartCount = parseFormattedNumber(cartMatch[1]);
    }
    
    // View count: "4B kişi görüntüledi"
    const viewMatch = html.match(/(\d[\d.,]*[BKM]?)\s*kişi görüntüledi/i) ||
                      html.match(/visitCount['":\s]*(\d+)/i);
    if (viewMatch) {
      results.socialProof.viewCount = parseFormattedNumber(viewMatch[1]);
    }
    
    // Sold count: "1B+ ürün satıldı" or from inline data
    const soldMatch = html.match(/(\d[\d.,]*[BKM]?\+?)\s*ürün satıldı/i) ||
                      html.match(/orderCount['":\s]*(\d+)/i);
    if (soldMatch) {
      results.socialProof.soldCount = parseFormattedNumber(soldMatch[1]);
    }
  }
  
  // ---- Method 5: Extract reviews from inline script data ----
  if (results.reviews.length === 0) {
    // Try multiple patterns for review data
    const reviewPatterns = [
      /"reviews"\s*:\s*\{"content"\s*:\s*(\[[\s\S]*?\])\s*,/,
      /"productReviews"\s*:\s*\{"content"\s*:\s*(\[[\s\S]*?\])\s*,/,
      /"ratingAndReview"\s*:\s*\{[^}]*"reviews"\s*:\s*(\[[\s\S]*?\])/,
    ];
    
    for (const pattern of reviewPatterns) {
      const reviewMatch = html.match(pattern);
      if (reviewMatch) {
        try {
          const reviewArr = JSON.parse(reviewMatch[1]);
          results.reviews = reviewArr.slice(0, 30).map(r => ({
            author: r.userFullName || r.userName || r.nickName || r.author || 'Anonim',
            rating: r.rate || r.rating || r.star || 5,
            content: r.comment || r.text || r.reviewText || r.content || '',
            date: r.lastModifiedDate 
              ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR')
              : (r.reviewDate || r.date || r.createdDate || ''),
          })).filter(r => r.content.length > 0);
          console.log(`[Scraper] ✅ Found ${results.reviews.length} reviews from inline script`);
          break;
        } catch (e) { /* parse error */ }
      }
    }
  }
  
  // ---- Method 6: Rating from HTML elements if not from JSON ----
  if (!results.rating) {
    // Look for rating in HTML: class="ratingScore" or similar
    const ratingHtml = html.match(/ratingScore[^>]*>\s*([\d.]+)/i) ||
                       html.match(/averageRating['":\s]*([\d.]+)/i) ||
                       html.match(/rating-line-count[^>]*>[\s\S]*?([\d.]+)\s*puan/i);
    if (ratingHtml) {
      results.rating = parseFloat(ratingHtml[1]);
    }
  }
  
  if (!results.reviewCount && results.reviewCount !== 0) {
    const reviewCountHtml = html.match(/(\d+)\s*[Dd]eğerlendirme/i) ||
                            html.match(/totalRatingCount['":\s]*(\d+)/i);
    if (reviewCountHtml) {
      results.reviewCount = parseInt(reviewCountHtml[1]);
    }
  }
  
  // Check if we got meaningful data
  const hasData = results.name || results.rating || results.reviews.length > 0;
  
  if (hasData) {
    console.log(`[Scraper] ✅ SUCCESS! Product: ${results.name}, Rating: ${results.rating}, Reviews: ${results.reviews.length}`);
    return results;
  }
  
  // Debug: nothing found
  console.warn(`[Scraper] ❌ No product data found. Page title: ${titleTag?.[1] || 'unknown'}`);
  console.warn(`[Scraper] HTML starts with: ${html.substring(0, 500)}`);
  console.warn(`[Scraper] HTML contains scripts: ${(html.match(/<script/gi) || []).length}`);
  
  throw new Error('Could not extract product data from page');
}

// ============================================
// TRENDYOL API ENDPOINTS
// ============================================
async function scrapeViaAPI(contentId) {
  console.log(`[Scraper] Trying Trendyol API for contentId: ${contentId}`);
  
  const results = { reviews: [], socialProof: {} };
  let gotData = false;
  
  // Try review API
  const reviewUrls = [
    `https://public-mdc.trendyol.com/discovery-web-socialgw-service/api/review/${contentId}?page=0&size=25&orderByField=Score&orderByType=DESC`,
    `https://api.trendyol.com/webbrowsinggw/api/review/${contentId}?page=0&size=25`,
    `https://public-mdc.trendyol.com/discovery-web-socialgw-service/api/review/${contentId}?page=0&size=25`,
  ];
  
  for (const apiUrl of reviewUrls) {
    try {
      const response = await fetchWithRetry(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.trendyol.com/',
          'Origin': 'https://www.trendyol.com',
        },
      }, 2);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data?.result?.productReviews?.content) {
        results.reviews = data.result.productReviews.content.slice(0, 30).map(r => ({
          author: r.userFullName || r.userName || 'Anonim',
          rating: r.rate || 5,
          content: r.comment || '',
          date: r.lastModifiedDate 
            ? new Date(r.lastModifiedDate).toLocaleDateString('tr-TR') : '',
        })).filter(r => r.content.length > 0);
        results.reviewCount = data.result.productReviews.totalElements || results.reviews.length;
        results.rating = data.result.hydrateRating?.averageRating || null;
        gotData = true;
        console.log(`[Scraper] ✅ API reviews: ${results.reviews.length}`);
        break;
      }
    } catch (e) {
      console.warn(`[Scraper] API review failed:`, e.message);
    }
  }
  
  // Try product detail API
  const detailUrls = [
    `https://public-mdc.trendyol.com/discovery-web-productgw-service/api/productDetail/${contentId}`,
    `https://apigw.trendyol.com/discovery-web-productgw-service/api/productDetail/${contentId}`,
  ];
  
  for (const apiUrl of detailUrls) {
    try {
      const response = await fetchWithRetry(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.trendyol.com/',
          'Origin': 'https://www.trendyol.com',
        },
      }, 2);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data?.result?.name) {
        results.name = results.name || data.result.name;
        results.brand = results.brand || data.result.brand?.name;
        results.rating = results.rating || data.result.ratingScore?.averageRating;
        results.reviewCount = results.reviewCount || data.result.ratingScore?.totalRatingCount || 0;
        results.questionCount = data.result.questionCount || 0;
        results.image = results.image || (data.result.images?.[0]?.url 
          ? `https://cdn.dsmcdn.com${data.result.images[0].url}` : '');
        
        if (data.result.socialProof) {
          const sp = data.result.socialProof;
          results.socialProof = {
            favoriteCount: sp.favoriteCount || 0,
            cartCount: sp.basketCount || 0,
            soldCount: sp.orderCount || 0,
            viewCount: sp.visitCount || 0,
          };
        }
        gotData = true;
        console.log(`[Scraper] ✅ API detail: ${results.name}`);
        break;
      }
    } catch (e) {
      console.warn(`[Scraper] API detail failed:`, e.message);
    }
  }
  
  // Try social proof API
  const socialUrls = [
    `https://public-sdc.trendyol.com/discovery-web-socialgw-service/api/social-proof/${contentId}`,
    `https://public-mdc.trendyol.com/discovery-web-socialgw-service/api/social-proof/${contentId}`,
  ];
  
  for (const apiUrl of socialUrls) {
    try {
      const response = await fetchWithRetry(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': 'https://www.trendyol.com/',
          'Origin': 'https://www.trendyol.com',
        },
      }, 2);
      
      if (!response.ok) continue;
      
      const data = await response.json();
      if (data?.result || data?.socialProof) {
        const sp = data.result || data.socialProof || data;
        results.socialProof = {
          favoriteCount: sp.favoriteCount || results.socialProof?.favoriteCount || 0,
          cartCount: sp.basketCount || sp.cartCount || results.socialProof?.cartCount || 0,
          soldCount: sp.orderCount || sp.soldCount || results.socialProof?.soldCount || 0,
          viewCount: sp.visitCount || sp.viewCount || results.socialProof?.viewCount || 0,
        };
        gotData = true;
        console.log(`[Scraper] ✅ API social proof fetched`);
        break;
      }
    } catch (e) {
      console.warn(`[Scraper] API social proof failed:`, e.message);
    }
  }
  
  if (gotData) return results;
  throw new Error('API scraping failed');
}

// ============================================
// HELPER: Parse formatted numbers
// ============================================
function parseFormattedNumber(str) {
  if (!str) return 0;
  str = str.replace(/\+/g, '').trim();
  
  // Handle Turkish abbreviations: B = bin (thousand), M = milyon, K = bin
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
  return parseInt(str.replace(/[.,]/g, '')) || 0;
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
  
  console.log(`[Scraper] === Starting scrape for ${contentId} ===`);
  console.log(`[Scraper] URL: ${url}`);
  
  let htmlResult = null;
  let apiResult = null;
  
  // Layer 1: Scrape the HTML page directly
  try {
    htmlResult = await scrapeProductPage(url);
    console.log(`[Scraper] HTML scraping result: name=${htmlResult?.name}, rating=${htmlResult?.rating}, reviews=${htmlResult?.reviews?.length}`);
  } catch (e) {
    console.warn('[Scraper] ⚠️ HTML scraping failed:', e.message);
  }
  
  // Layer 2: Try API endpoints
  if (contentId) {
    try {
      apiResult = await scrapeViaAPI(contentId);
      console.log(`[Scraper] API scraping result: name=${apiResult?.name}, rating=${apiResult?.rating}, reviews=${apiResult?.reviews?.length}`);
    } catch (e) {
      console.warn('[Scraper] ⚠️ API scraping failed:', e.message);
    }
  }
  
  // Merge results: prefer HTML data, supplement with API
  if (htmlResult || apiResult) {
    const merged = {
      name: htmlResult?.name || apiResult?.name || '',
      brand: htmlResult?.brand || apiResult?.brand || '',
      rating: htmlResult?.rating || apiResult?.rating || null,
      reviewCount: htmlResult?.reviewCount || apiResult?.reviewCount || 0,
      questionCount: htmlResult?.questionCount || apiResult?.questionCount || 0,
      image: htmlResult?.image || apiResult?.image || '',
      price: htmlResult?.price || apiResult?.price || null,
      currency: htmlResult?.currency || apiResult?.currency || 'TRY',
      socialProof: {
        favoriteCount: (htmlResult?.socialProof?.favoriteCount || apiResult?.socialProof?.favoriteCount || 0),
        cartCount: (htmlResult?.socialProof?.cartCount || apiResult?.socialProof?.cartCount || 0),
        soldCount: (htmlResult?.socialProof?.soldCount || apiResult?.socialProof?.soldCount || 0),
        viewCount: (htmlResult?.socialProof?.viewCount || apiResult?.socialProof?.viewCount || 0),
      },
      reviews: (htmlResult?.reviews?.length > 0 ? htmlResult.reviews : apiResult?.reviews) || [],
    };
    
    // Only return if we have at least some real data
    if (merged.name || merged.rating || merged.reviews.length > 0) {
      console.log(`[Scraper] ✅ FINAL: "${merged.name}" | ⭐${merged.rating} | 💬${merged.reviews.length} reviews | ❤️${merged.socialProof.favoriteCount} fav`);
      return merged;
    }
  }
  
  // Layer 3: Complete failure - return error instead of mock data
  console.error(`[Scraper] ❌ All scraping methods failed for ${contentId}`);
  throw new Error(`Trendyol'dan veri çekilemedi. Ürün URL'sini kontrol edin veya daha sonra tekrar deneyin.`);
}

export function generateMockAnalysis(productName, rating, reviews) {
  const avgRating = parseFloat(rating) || 4.2;
  const sentiment = avgRating >= 4 ? 'positive' : avgRating >= 3 ? 'neutral' : 'negative';
  const reviewCount = reviews?.length || 0;
  const positiveCount = reviews?.filter(r => r.rating >= 4).length || 0;
  const negativeCount = reviews?.filter(r => r.rating <= 2).length || 0;

  // Generate a more natural analysis from real review data
  let summary, pros, cons;
  
  if (reviewCount > 0) {
    // Extract keywords from actual reviews
    const allContent = reviews.map(r => r.content || '').join(' ');
    
    const positiveKeywords = [];
    const negativeKeywords = [];
    
    // Simple keyword extraction from Turkish reviews
    const posWords = ['kaliteli', 'güzel', 'mükemmel', 'süper', 'harika', 'hızlı', 'memnun', 'tavsiye', 'teşekkür', 'uygun', 'iyi'];
    const negWords = ['kötü', 'bozuk', 'geç', 'sorun', 'iade', 'pişman', 'berbat', 'küçük', 'sahte', 'farklı'];
    
    for (const w of posWords) {
      if (allContent.toLowerCase().includes(w)) positiveKeywords.push(w);
    }
    for (const w of negWords) {
      if (allContent.toLowerCase().includes(w)) negativeKeywords.push(w);
    }
    
    summary = `"${productName || 'Bu ürün'}" toplam ${reviewCount} yorum analiz edildiğinde ${avgRating} ortalama puanla ${sentiment === 'positive' ? 'oldukça beğenilen' : sentiment === 'neutral' ? 'orta düzeyde değerlendirilen' : 'eleştirilen'} bir ürün olarak öne çıkıyor. ${positiveCount} olumlu, ${negativeCount} olumsuz yorum mevcut.`;
    
    pros = positiveKeywords.length > 0 
      ? positiveKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
      : (sentiment === 'positive' ? 'Kaliteli malzeme, hızlı kargo, uygun fiyat' : 'Fiyat-performans oranı makul');
    
    cons = negativeKeywords.length > 0
      ? negativeKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')
      : (sentiment === 'positive' ? 'Bazı kullanıcılar beden/renk uyumsuzluğundan şikayetçi' : 'Kalite sorunları, geç kargo');
  } else {
    summary = `"${productName || 'Bu ürün'}" henüz yeterli yorum verisi bulunmuyor. Puan: ${avgRating}.`;
    pros = 'Henüz yeterli veri yok';
    cons = 'Henüz yeterli veri yok';
  }

  return {
    summary,
    sentiment,
    pros,
    cons,
    keywords: [...new Set([
      ...reviews?.flatMap(r => {
        const words = (r.content || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
        return words.slice(0, 2);
      }) || []
    ])].slice(0, 6).join(', ') || 'kalite, kargo, fiyat',
  };
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { scrapeTrendyolProduct, generateMockAnalysis } from '@/lib/scraper';

// POST /api/scrape - trigger scraping for a barcode
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { barcodeId } = await request.json();
    if (!barcodeId) {
      return NextResponse.json({ error: 'Barkod ID gerekli' }, { status: 400 });
    }

    // Get barcode
    const barcodeResult = await query(
      'SELECT * FROM tp_barcodes WHERE id = $1 AND user_id = $2',
      [barcodeId, user.id]
    );
    if (barcodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Barkod bulunamadı' }, { status: 404 });
    }

    const barcode = barcodeResult.rows[0];
    let productUrl = barcode.product_url;

    // If no URL, use search to find the product
    if (!productUrl) {
      productUrl = `https://www.trendyol.com/sr?q=${barcode.barcode}`;
    }

    // Update status
    await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['scraping', barcodeId]);

    let scrapedData;
    try {
      scrapedData = await scrapeTrendyolProduct(productUrl, barcode.barcode);
    } catch (scrapeError) {
      console.error('Scrape failed completely:', scrapeError.message);
      await query('UPDATE tp_barcodes SET product_name = $1, status = $2 WHERE id = $3', [`TRND_ERR: ${scrapeError.message}`.substring(0, 500), 'error', barcodeId]);
      return NextResponse.json({ 
        error: scrapeError.message || 'Veri çekme başarısız',
        details: 'Trendyol\'dan veri alınamadı. URL\'yi kontrol edin veya daha sonra tekrar deneyin.'
      }, { status: 500 });
    }

    try {
      // Safely parse potentially non-string properties from scraper (e.g. JSON-LD objects)
      const safeName = typeof scrapedData.name === 'string' ? scrapedData.name.substring(0, 500) : String(scrapedData.name || '').substring(0, 500);
      let safeImage = '';
      if (typeof scrapedData.image === 'string') safeImage = scrapedData.image;
      else if (scrapedData.image && scrapedData.image.url) safeImage = scrapedData.image.url;
      else if (scrapedData.image) safeImage = String(scrapedData.image);
      safeImage = safeImage.substring(0, 1000);
      
      const safeUrl = typeof productUrl === 'string' ? productUrl.substring(0, 1000) : String(productUrl || '').substring(0, 1000);

      // Update barcode info
      await query(
        'UPDATE tp_barcodes SET product_name = $1, product_image = $2, product_url = $3, status = $4, last_scraped_at = NOW() WHERE id = $5',
        [safeName, safeImage, safeUrl, 'active', barcodeId]
      );

      // Insert product data
      await query(
        `INSERT INTO tp_product_data (barcode_id, rating, review_count, question_count, favorite_count, cart_count, sold_count, view_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          barcodeId,
          scrapedData.rating,
          scrapedData.reviewCount || 0,
          scrapedData.questionCount || 0,
          scrapedData.socialProof?.favoriteCount || 0,
          scrapedData.socialProof?.cartCount || 0,
          scrapedData.socialProof?.soldCount || 0,
          scrapedData.socialProof?.viewCount || 0,
        ]
      );

      // Insert reviews
      if (scrapedData.reviews && scrapedData.reviews.length > 0) {
        // Clear old reviews
        await query('DELETE FROM tp_reviews WHERE barcode_id = $1', [barcodeId]);

        for (const review of scrapedData.reviews) {
          const safeAuthor = typeof review.author === 'string' ? review.author.substring(0, 250) : String(review.author || '').substring(0, 250);
          const safeDate = typeof review.date === 'string' ? review.date.substring(0, 90) : String(review.date || '').substring(0, 90);
          await query(
            'INSERT INTO tp_reviews (barcode_id, author, rating, content, review_date) VALUES ($1, $2, $3, $4, $5)',
            [barcodeId, safeAuthor, review.rating, review.content, safeDate]
          );
        }
      }

      // Generate AI analysis (mock for now)
      const analysis = generateMockAnalysis(scrapedData.name, scrapedData.rating, scrapedData.reviews);
      await query('DELETE FROM tp_ai_analysis WHERE barcode_id = $1', [barcodeId]);
      await query(
        'INSERT INTO tp_ai_analysis (barcode_id, summary, sentiment, pros, cons, keywords) VALUES ($1, $2, $3, $4, $5, $6)',
        [barcodeId, analysis.summary, analysis.sentiment, analysis.pros, analysis.cons, analysis.keywords]
      );

    } catch (dbError) {
      console.error('Database write error:', dbError);
      await query('UPDATE tp_barcodes SET product_name = $1, status = $2 WHERE id = $3', [`DB_ERR: ${dbError.message}`.substring(0, 500), 'error', barcodeId]);
      return NextResponse.json({ error: 'DB hatası', details: dbError.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Scrape top level error:', error);
    if (barcodeId) {
      await query('UPDATE tp_barcodes SET product_name = $1, status = $2 WHERE id = $3', [`SCRAPE_ERR: ${error.message}`.substring(0, 500), 'error', barcodeId]);
    }
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

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

    // If no URL, construct from barcode
    if (!productUrl) {
      productUrl = `https://www.trendyol.com/brand/product-p-${barcode.barcode}`;
    }

    // Update status
    await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['scraping', barcodeId]);

    let scrapedData;
    try {
      scrapedData = await scrapeTrendyolProduct(productUrl);
    } catch (scrapeError) {
      // If scraping fails, use mock data for demo
      scrapedData = {
        name: `Trendyol Ürün #${barcode.barcode}`,
        rating: 4.3,
        reviewCount: 128,
        questionCount: 15,
        image: '',
        socialProof: {
          favoriteCount: 2450,
          cartCount: 89,
          soldCount: 5200,
          viewCount: 12000,
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

    // Update barcode info
    await query(
      'UPDATE tp_barcodes SET product_name = $1, product_image = $2, product_url = $3, status = $4, last_scraped_at = NOW() WHERE id = $5',
      [scrapedData.name, scrapedData.image, productUrl, 'active', barcodeId]
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
        await query(
          'INSERT INTO tp_reviews (barcode_id, author, rating, content, review_date) VALUES ($1, $2, $3, $4, $5)',
          [barcodeId, review.author, review.rating, review.content, review.date]
        );
      }
    }

    // Generate AI analysis
    const analysis = generateMockAnalysis(scrapedData.name, scrapedData.rating, scrapedData.reviews);
    await query('DELETE FROM tp_ai_analysis WHERE barcode_id = $1', [barcodeId]);
    await query(
      'INSERT INTO tp_ai_analysis (barcode_id, summary, sentiment, pros, cons, keywords) VALUES ($1, $2, $3, $4, $5, $6)',
      [barcodeId, analysis.summary, analysis.sentiment, analysis.pros, analysis.cons, analysis.keywords]
    );

    return NextResponse.json({ success: true, data: scrapedData });
  } catch (error) {
    console.error('Scrape error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

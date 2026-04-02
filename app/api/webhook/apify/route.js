import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/webhook/apify - Receive Apify results from scrape route
export async function POST(request) {
  try {
    // Basic security token check
    const token = request.headers.get('Authorization') || request.headers.get('authorization');
    const expectedToken = process.env.N8N_SECRET_TOKEN || 'aktarmatik-n8n-secret-token-123';

    if (process.env.N8N_SECRET_TOKEN && token !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const data = await request.json();
    let { barcodeId, datasetId, eventType, apifyDataArr, playwrightReviews, isCustomScraper, scrapedData } = data;

    // Handle failure events from Apify
    if (eventType && eventType !== 'ACTOR.RUN.SUCCEEDED') {
      console.log(`[Webhook] Apify run failed for barcode ${barcodeId}. Event: ${eventType}`);
      await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
      return NextResponse.json({ success: false, message: `Run failed: ${eventType}` });
    }

    if (datasetId && !apifyDataArr) {
      console.log(`[Webhook] Native Apify trigger received. Fetching dataset ${datasetId} for barcode: ${barcodeId}`);
      try {
        const apifyToken = process.env.APIFY_API_TOKEN || '';
        const tokenQuery = apifyToken ? `?token=${apifyToken}` : '';
        const res = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items${tokenQuery}`);
        apifyDataArr = await res.json();
      } catch (e) {
        console.error('Failed to fetch dataset from Apify:', e);
      }
    }

    if (!barcodeId) {
      return NextResponse.json({ error: 'Geçersiz webhook payload yapısı (Barcode eksik)' }, { status: 400 });
    }

    let safeProductName = 'Ürün', safeProductUrl = '', safeImage = '';
    let rating = 0, reviewCount = 0, favoriteCount = 0, questionCount = 0, cartCount = 0, soldCount = 0;
    let allReviews = [], allQuestions = [];
    let reviewSource = '';

    if (isCustomScraper && scrapedData) {
      console.log(`[Webhook] Processing custom scraper data for barcode: ${barcodeId}`);
      const productData = scrapedData.product;
      
      if (!productData) {
         await query('UPDATE tp_barcodes SET status = $1, product_name = $2 WHERE id = $3',
          ['error', 'SCRAPER_ERR: Product verisi bulunamadı', barcodeId]
        );
        return NextResponse.json({ error: 'Ürün metadata bulunamadı' }, { status: 404 });
      }

      safeProductName = String(productData.title || 'Ürün').substring(0, 1000);
      safeProductUrl = String(productData.url || '').substring(0, 1000);
      safeImage = (productData.images && productData.images.length > 0) ? productData.images[0].substring(0, 2000) : '';
      
      rating = productData.rating || 0;
      // Normalize rating to max 5
      if (rating > 5) rating = Math.round((rating / 2) * 10) / 10;
      reviewCount = productData.reviewCount || 0;
      favoriteCount = productData.favoriteCount || 0;
      cartCount = productData.cartCount || 0;
      soldCount = productData.soldCount || 0;

      allReviews = scrapedData.reviews || [];
      allQuestions = scrapedData.questions || [];
      questionCount = productData.questionCount || allQuestions.length;
      reviewSource = 'Aktarmatik Scraper';

    } else {
      // Legacy Apify logic fallback
      if (!apifyDataArr || !Array.isArray(apifyDataArr)) {
        return NextResponse.json({ error: 'Geçersiz apify veri dizisi' }, { status: 400 });
      }
      console.log(`[Webhook] Processing APify data array for barcode: ${barcodeId} with ${apifyDataArr.length} items`);

      const productData = apifyDataArr.find(item => item.type === 'product');
      const reviewsData = apifyDataArr.filter(item => item.type === 'review');
      allQuestions = apifyDataArr.filter(item => item.type === 'qna' || item.type === 'question_answer' || item.type === 'question');

      if (!productData) {
         await query('UPDATE tp_barcodes SET status = $1, product_name = $2 WHERE id = $3',
          ['error', 'APIFY_ERR: Product verisi bulunamadı', barcodeId]
        );
        return NextResponse.json({ error: 'Ürün metadata bulunamadı' }, { status: 404 });
      }

      safeProductName = String(productData.product_title || 'Ürün').substring(0, 1000);
      safeProductUrl = String(productData.url || '').substring(0, 1000);
      if (productData.media_and_content?.images && productData.media_and_content.images.length > 0) {
         safeImage = productData.media_and_content.images[0].substring(0, 2000);
      }

      rating = productData.pricing_and_availability?.rating_score?.average_rating || 0;
      reviewCount = productData.pricing_and_availability?.rating_score?.comment_count || 0;
      favoriteCount = productData.social_and_engagement?.favorite_count || productData.ux_layout_properties?.favorite_count || 0;
      questionCount = allQuestions.length;

      allReviews = (playwrightReviews && playwrightReviews.length > 0) ? playwrightReviews : reviewsData;
      reviewSource = (playwrightReviews && playwrightReviews.length > 0) ? 'Playwright' : 'Apify';
    }

    // Update main product data
    await query(
      `UPDATE tp_barcodes
       SET product_name = $1,
           product_url = $2,
           product_image = $3,
           status = 'active',
           last_scraped_at = NOW()
       WHERE id = $4`,
      [
        safeProductName,
        safeProductUrl,
        safeImage,
        barcodeId
      ]
    );

    // Insert into product data history
    await query(
      `INSERT INTO tp_product_data (barcode_id, rating, review_count, question_count, favorite_count, cart_count, sold_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [barcodeId, rating, reviewCount, questionCount, favoriteCount, cartCount, soldCount]
    );


    if (allReviews.length > 0) {
      await query('DELETE FROM tp_reviews WHERE barcode_id = $1', [barcodeId]);
      console.log(`[Webhook] Saving ${allReviews.length} reviews from ${reviewSource}`);

      for (const review of allReviews) {
        const safeAuthor = String(review.author || review.user_full_name || review.user_name || review.userName || 'Anonim').substring(0, 250);
        let safeDate = '';
        const reviewRawDate = review.date || review.created_at || review.creation_date;
        if (reviewRawDate) {
          const ts = Number(reviewRawDate);
          if (ts > 1e12) {
            safeDate = new Date(ts).toLocaleDateString('tr-TR');
          } else if (!isNaN(Date.parse(reviewRawDate))) {
            safeDate = new Date(reviewRawDate).toLocaleDateString('tr-TR');
          } else {
            safeDate = String(reviewRawDate).substring(0, 50);
          }
        }
        const reviewContent = String(review.content || review.comment || review.review_text || review.text || '').substring(0, 2000);
        const reviewRating = review.rating || review.rate || 5;

        if (reviewContent.length > 5) {
          await query(
            'INSERT INTO tp_reviews (barcode_id, author, rating, content, review_date) VALUES ($1, $2, $3, $4, $5)',
            [barcodeId, safeAuthor, reviewRating, reviewContent, safeDate]
          );
        }
      }
    }

    // Insert questions
    if (allQuestions.length > 0) {
      await query('DELETE FROM tp_questions WHERE barcode_id = $1', [barcodeId]);

      for (const q of allQuestions) {
        const safeUser = String(q.user_name || q.userName || q.user_full_name || q.userFullName || 'Müşteri').substring(0, 250);
        const qText = String(q.question_text || q.questionText || q.text || q.question || '').substring(0, 2000);
        let aText = '';
        if (q.answer_text) aText = q.answer_text;
        else if (q.answerText) aText = q.answerText;
        else if (typeof q.answer === 'object' && q.answer?.text) aText = q.answer.text;
        else if (typeof q.answer === 'string') aText = q.answer;
        aText = String(aText).substring(0, 2000);

        let qDate = '';
        const rawDate = q.creation_date || q.creationDate || q.created_at || q.date;
        if (rawDate) {
          const ts = Number(rawDate);
          if (ts > 1e12) {
            qDate = new Date(ts).toLocaleDateString('tr-TR');
          } else if (!isNaN(Date.parse(rawDate))) {
            qDate = new Date(rawDate).toLocaleDateString('tr-TR');
          }
        }

        // Only save questions that have an answer
        if (qText.length > 3 && aText.length > 1) {
          await query(
            'INSERT INTO tp_questions (barcode_id, user_name, question_text, answer_text, question_date) VALUES ($1, $2, $3, $4, $5)',
            [barcodeId, safeUser, qText, aText, qDate]
          );
        }
      }
    }

    // Run analysis based on the freshly inserted reviews
    try {
       const mappedReviews = allReviews.slice(0, 30).map(r => ({ author: r.author || r.user_full_name, rating: r.rating || r.rate, content: r.content || r.comment, date: r.date || r.created_at }));
       const { generateMockAnalysis } = await import('@/lib/scraper');
       const analysis = generateMockAnalysis(safeProductName, rating, mappedReviews);

       await query('DELETE FROM tp_ai_analysis WHERE barcode_id = $1', [barcodeId]);
       await query(
         'INSERT INTO tp_ai_analysis (barcode_id, summary, sentiment, pros, cons, keywords) VALUES ($1, $2, $3, $4, $5, $6)',
         [barcodeId, analysis.summary, analysis.sentiment, analysis.pros, analysis.cons, analysis.keywords]
       );
    } catch(e) {
      console.warn("Analysis generation failed:", e.message);
    }

    console.log(`[Webhook] Successfully saved Apify data for barcode ${barcodeId}`);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

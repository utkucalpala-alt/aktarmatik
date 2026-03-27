import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST /api/webhook/apify - Receive Apify results from n8n
export async function POST(request) {
  try {
    // Basic security token check (you should set this in n8n and Dokploy)
    const token = request.headers.get('Authorization') || request.headers.get('authorization');
    const expectedToken = process.env.N8N_SECRET_TOKEN || 'aktarmatik-n8n-secret-token-123';
    
    // In production, enforce tokens. For now we accept if no token mapped in env.
    if (process.env.N8N_SECRET_TOKEN && token !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    const data = await request.json();
    let { barcodeId, datasetId, eventType, apifyDataArr } = data;
<<<<<<< HEAD

    // Handle failure events from Apify
    if (eventType && eventType !== 'ACTOR.RUN.SUCCEEDED') {
      console.log(`[Webhook] Apify run failed or aborted for barcode ${barcodeId}. Event: ${eventType}`);
      await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
      return NextResponse.json({ success: false, message: `Run failed: ${eventType}` });
    }
=======
>>>>>>> ec7b0e8c03488487ef2b386d6ced4d7600059689

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

    if (!barcodeId || !apifyDataArr || !Array.isArray(apifyDataArr)) {
      return NextResponse.json({ error: 'Geçersiz webhook payload yapısı' }, { status: 400 });
    }

    console.log(`[Webhook] Processing data array for barcode: ${barcodeId} with ${apifyDataArr.length} items`);

    // Parse Apify polymorphic data structure
    const productData = apifyDataArr.find(item => item.type === 'product');
    const reviewsData = apifyDataArr.filter(item => item.type === 'review');
    const questionsData = apifyDataArr.filter(item => item.type === 'qna' || item.type === 'question_answer' || item.type === 'question');

    console.log(`[Webhook] Found: product=${!!productData}, reviews=${reviewsData.length}, qna=${questionsData.length}`);

    if (!productData) {
       await query('UPDATE tp_barcodes SET status = $1, product_name = $2 WHERE id = $3', 
        ['error', 'APIFY_ERR: Product verisi bulunamadı', barcodeId]
      );
      return NextResponse.json({ error: 'Ürün metadata bulunamadı' }, { status: 404 });
    }

    // Safely extract product fields
    const safeProductName = String(productData.product_title || 'Ürün').substring(0, 1000);
    const safeProductUrl = String(productData.url || '').substring(0, 1000);
    let safeImage = '';
    if (productData.media_and_content?.images && productData.media_and_content.images.length > 0) {
       safeImage = productData.media_and_content.images[0].substring(0, 2000);
    }
    
    // Extract fields from Apify Actor JSON - try multiple paths
    const rating = productData.pricing_and_availability?.rating_score?.average_rating || 0;
    const reviewCount = productData.pricing_and_availability?.rating_score?.comment_count || 0;
    const favoriteCount = productData.social_and_engagement?.favorite_count || productData.ux_layout_properties?.favorite_count || 0;
    const questionCount = questionsData.length;
    
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
      `INSERT INTO tp_product_data (barcode_id, rating, review_count, question_count, favorite_count)
       VALUES ($1, $2, $3, $4, $5)`,
      [barcodeId, rating, reviewCount, questionCount, favoriteCount]
    );

    // Insert reviews
    if (reviewsData.length > 0) {
      await query('DELETE FROM tp_reviews WHERE barcode_id = $1', [barcodeId]);

      for (const review of reviewsData) {
        const safeAuthor = String(review.user_full_name || review.user_name || review.userName || 'Anonim').substring(0, 250);
        let safeDate = '';
        const reviewRawDate = review.created_at || review.creation_date || review.date;
        if (reviewRawDate) {
          const ts = Number(reviewRawDate);
          safeDate = ts > 1e12 ? new Date(ts).toLocaleDateString('tr-TR') : new Date(reviewRawDate).toLocaleDateString('tr-TR');
        }
        const reviewContent = String(review.comment || review.review_text || review.text || review.content || '').substring(0, 2000);

        await query(
          'INSERT INTO tp_reviews (barcode_id, author, rating, content, review_date) VALUES ($1, $2, $3, $4, $5)',
          [barcodeId, safeAuthor, review.rating || review.rate || 5, reviewContent, safeDate]
        );
      }
    }

    // Insert questions
    if (questionsData.length > 0) {
      await query('DELETE FROM tp_questions WHERE barcode_id = $1', [barcodeId]);

      for (const q of questionsData) {
        const safeUser = String(q.user_name || q.userName || q.user_full_name || 'Müşteri').substring(0, 250);
        const qText = String(q.question_text || q.text || q.question || '').substring(0, 2000);
        let aText = '';
        if (q.answer_text) aText = q.answer_text;
        else if (typeof q.answer === 'object' && q.answer?.text) aText = q.answer.text;
        else if (typeof q.answer === 'string') aText = q.answer;
        aText = String(aText).substring(0, 2000);

        let qDate = '';
        const rawDate = q.creation_date || q.creationDate || q.created_at || q.date;
        if (rawDate) {
          // Handle both ISO date and Unix timestamp (ms)
          const ts = Number(rawDate);
          qDate = ts > 1e12 ? new Date(ts).toLocaleDateString('tr-TR') : new Date(rawDate).toLocaleDateString('tr-TR');
        }

        if (qText.length > 3) {
          await query(
            'INSERT INTO tp_questions (barcode_id, user_name, question_text, answer_text, question_date) VALUES ($1, $2, $3, $4, $5)',
            [barcodeId, safeUser, qText, aText, qDate]
          );
        }
      }
    }

    // We can run our local Mock/LLM analysis based on the freshly inserted reviews
    try {
       const mappedReviews = reviewsData.slice(0, 30).map(r => ({ author: r.user_full_name, rating: r.rating, content: r.comment, date: r.created_at }));
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

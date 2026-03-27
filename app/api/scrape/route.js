import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const MAX_QNA = 15;
const MAX_REVIEWS = 15;

// Poll Apify run and process results + scrape reviews with Playwright
async function pollAndProcess(runId, barcodeId, productUrl, apifyToken) {
  const maxAttempts = 60;
  const pollInterval = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`);
      const statusData = await statusRes.json();
      const status = statusData?.data?.status;

      if (status === 'SUCCEEDED') {
        const datasetId = statusData?.data?.defaultDatasetId;
        console.log(`[Scrape] Apify run ${runId} succeeded. Dataset: ${datasetId}`);

        // Fetch Apify dataset (product + QnA)
        const dataRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`);
        const apifyDataArr = await dataRes.json();

        // Scrape reviews with local Playwright (parallel with webhook processing)
        let reviews = [];
        try {
          const { scrapeReviews } = await import('@/lib/review-scraper');
          reviews = await scrapeReviews(productUrl);
          console.log(`[Scrape] Playwright scraped ${reviews.length} reviews`);
        } catch (e) {
          console.warn(`[Scrape] Playwright review scrape failed: ${e.message}`);
        }

        // Process via webhook handler with reviews included
        const webhookRes = await fetch('https://aktarmatik.webtasarimi.net/api/webhook/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barcodeId,
            eventType: 'ACTOR.RUN.SUCCEEDED',
            apifyDataArr,
            playwrightReviews: reviews,
          })
        });
        const result = await webhookRes.json();
        console.log(`[Scrape] Webhook result for barcode ${barcodeId}:`, result);
        return;
      }

      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
        console.error(`[Scrape] Apify run ${runId} failed: ${status}`);
        await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
        return;
      }

      console.log(`[Scrape] Polling run ${runId}: ${status} (${i + 1}/${maxAttempts})`);
    } catch (e) {
      console.error(`[Scrape] Poll error: ${e.message}`);
    }
  }

  await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
}

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

    const barcodeResult = await query(
      'SELECT * FROM tp_barcodes WHERE id = $1 AND user_id = $2',
      [barcodeId, user.id]
    );
    if (barcodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Barkod bulunamadı' }, { status: 404 });
    }

    const barcode = barcodeResult.rows[0];
    let productUrl = barcode.product_url || `https://www.trendyol.com/sr?q=${barcode.barcode}`;

    await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['scraping', barcodeId]);

    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
      return NextResponse.json({ error: 'APIFY_API_TOKEN tanımlı değil' }, { status: 500 });
    }

    console.log(`[Scrape] Starting for barcode ${barcodeId}: ${productUrl}`);

    // Trigger Apify for product data + QnA only (15 max)
    const apifyRes = await fetch(
      `https://api.apify.com/v2/acts/fatihtahta~trendyol-scraper/runs?token=${apifyToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startUrls: [productUrl],
          getReviews: false,
          getQna: true,
          limit: MAX_QNA,
        })
      }
    );

    if (!apifyRes.ok) {
      const errText = await apifyRes.text();
      console.error(`[Scrape] Apify error: ${apifyRes.status} ${errText}`);
      await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
      return NextResponse.json({ error: 'Apify hatası', details: errText }, { status: 500 });
    }

    const apifyData = await apifyRes.json();
    const runId = apifyData?.data?.id;
    console.log(`[Scrape] Apify run started: ${runId}`);

    // Background: poll Apify + scrape reviews with Playwright
    pollAndProcess(runId, barcodeId, productUrl, apifyToken).catch(e => {
      console.error(`[Scrape] Background error: ${e.message}`);
      query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]).catch(() => {});
    });

    return NextResponse.json({
      success: true,
      message: 'Veri çekme başlatıldı (Apify + Playwright)',
      status: 'scraping',
      barcodeId,
      runId,
    });

  } catch (error) {
    console.error('Scrape API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}
 500 });
  }
}

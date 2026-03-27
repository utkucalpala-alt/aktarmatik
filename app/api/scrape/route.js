import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Poll Apify run status and process results when done
async function pollAndProcess(runId, barcodeId, apifyToken) {
  const maxAttempts = 60; // 5 minutes max (60 * 5s)
  const pollInterval = 5000;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));

    try {
      const statusRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
      );
      const statusData = await statusRes.json();
      const status = statusData?.data?.status;

      if (status === 'SUCCEEDED') {
        const datasetId = statusData?.data?.defaultDatasetId;
        console.log(`[Apify Poll] Run ${runId} succeeded. Dataset: ${datasetId}`);

        // Fetch dataset items
        const dataRes = await fetch(
          `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
        );
        const apifyDataArr = await dataRes.json();

        // Call our own webhook handler with the data
        const webhookRes = await fetch('https://aktarmatik.webtasarimi.net/api/webhook/apify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            barcodeId,
            datasetId,
            eventType: 'ACTOR.RUN.SUCCEEDED',
            apifyDataArr
          })
        });
        const result = await webhookRes.json();
        console.log(`[Apify Poll] Webhook processed for barcode ${barcodeId}:`, result);
        return;
      }

      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
        console.error(`[Apify Poll] Run ${runId} ended with status: ${status}`);
        await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
        return;
      }

      console.log(`[Apify Poll] Run ${runId} status: ${status} (attempt ${i + 1}/${maxAttempts})`);
    } catch (e) {
      console.error(`[Apify Poll] Error checking run ${runId}:`, e.message);
    }
  }

  console.error(`[Apify Poll] Run ${runId} timed out after ${maxAttempts} attempts`);
  await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
}

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

    const barcodeResult = await query(
      'SELECT * FROM tp_barcodes WHERE id = $1 AND user_id = $2',
      [barcodeId, user.id]
    );
    if (barcodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Barkod bulunamadı' }, { status: 404 });
    }

    const barcode = barcodeResult.rows[0];
    let productUrl = barcode.product_url;

    if (!productUrl) {
      productUrl = `https://www.trendyol.com/sr?q=${barcode.barcode}`;
    }

    await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['scraping', barcodeId]);

    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
      return NextResponse.json({ error: 'APIFY_API_TOKEN tanımlı değil' }, { status: 500 });
    }

    console.log(`[Native Apify] Triggering for barcode: ${barcodeId} -> ${productUrl}`);

    const apifyEndpoint = `https://api.apify.com/v2/acts/fatihtahta~trendyol-scraper/runs?token=${apifyToken}`;

    // Use exact input format from Apify documentation
    const apifyRes = await fetch(apifyEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [productUrl],
        getReviews: true,
        getQna: true,
        limit: 100
      })
    });

    if (!apifyRes.ok) {
      const errText = await apifyRes.text();
      console.error(`[Apify Trigger Error] Status: ${apifyRes.status}, Body: ${errText}`);
      await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]);
      return NextResponse.json({ error: 'Apify tetiklenirken hata oluştu.', details: errText }, { status: 500 });
    }

    const apifyData = await apifyRes.json();
    const runId = apifyData?.data?.id;
    console.log(`[Native Apify] Run started: ${runId}. Polling in background.`);

    // Start polling in background
    pollAndProcess(runId, barcodeId, apifyToken).catch(e => {
      console.error(`[Apify Poll] Unhandled error for barcode ${barcodeId}:`, e.message);
      query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]).catch(() => {});
    });

    return NextResponse.json({
      success: true,
      message: 'Apify işlemi başlatıldı, veriler otomatik gelecek',
      status: 'scraping',
      barcodeId,
      runId
    });

  } catch (error) {
    console.error('API endpoint error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

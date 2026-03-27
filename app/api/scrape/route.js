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

    // Native Apify API Integration
    const apifyToken = process.env.APIFY_API_TOKEN;
    if (!apifyToken) {
      console.warn('[Scrape] APIFY_API_TOKEN is missing in ENV. You must configure this in Dokploy.');
    }
    
    console.log(`[Native Apify] Triggering Apify Actor for barcode: ${barcodeId} -> ${productUrl}`);
    
    // Create an ad-hoc webhook for this specific run that tells Apify to callback our server
    const webhooksArr = [{
      eventTypes: ["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED", "ACTOR.RUN.ABORTED", "ACTOR.RUN.TIMED_OUT"],
      requestUrl: "https://aktarmatik.webtasarimi.net/api/webhook/apify",
      payloadTemplate: `{"barcodeId": "${barcodeId}", "datasetId": "{{resource.defaultDatasetId}}", "eventType": "{{eventType}}"}`
    }];
    const webhooksB64 = Buffer.from(JSON.stringify(webhooksArr)).toString('base64');
    
    const apifyEndpoint = `https://api.apify.com/v2/acts/fatihtahta~trendyol-scraper/runs?token=${apifyToken}&webhooks=${webhooksB64}`;

    // Wait for Apify trigger confirmation to handle initial API rejection
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
      return NextResponse.json({ error: 'Apify tetiklenirken hata oluştu veya bakiye bitti.', details: errText }, { status: 500 });
    }

    const apifyData = await apifyRes.json();
    console.log(`[Native Apify] Run started with ID: ${apifyData?.data?.id}. Waiting for webhook callback.`);

    // Return immediately so the UI doesn't hang
    return NextResponse.json({ 
      success: true, 
      message: 'İşlem başarıyla Apify kuyruğuna alındı', 
      status: 'scraping',
      barcodeId: barcodeId
    });

  } catch (error) {
    console.error('API endpoint error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

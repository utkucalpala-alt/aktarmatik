import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const MAX_QNA = 15;
const MAX_REVIEWS = 15;

// Call our custom Dokploy scraper and forward data to webhook
async function triggerCustomScraper(barcodeId, productUrl) {
  try {
    const scraperUrl = process.env.SCRAPER_URL || 'http://aktarmatik-aktarmatikscraper-zdkiey:4001/scrape';
    const scraperSecret = process.env.SCRAPER_SECRET || 'aktarmatik-scraper-secret';
    
    console.log(`[Scrape] Calling custom scraper for barcode ${barcodeId} at ${scraperUrl}`);
    
    const res = await fetch(scraperUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': scraperSecret
      },
      body: JSON.stringify({ url: productUrl })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Scraper returned ${res.status}: ${errText}`);
    }

    const scraperResponse = await res.json();
    // Server returns { success: true, data: { product, reviews, questions } }
    const scrapedData = scraperResponse.data || scraperResponse;
    console.log(`[Scrape] Custom scraper finished for ${barcodeId}, total reviews: ${scrapedData.reviews?.length || 0}`);

    // Process via webhook handler with new data structure
    const webhookRes = await fetch(process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/apify` : 'https://aktarmatik.webtasarimi.net/api/webhook/apify', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_SECRET_TOKEN || 'aktarmatik-n8n-secret-token-123'}`
      },
      body: JSON.stringify({
        barcodeId,
        eventType: 'ACTOR.RUN.SUCCEEDED',
        isCustomScraper: true,
        scrapedData
      })
    });
    const result = await webhookRes.json();
    console.log(`[Scrape] Webhook result for barcode ${barcodeId}:`, result);

  } catch (e) {
    console.error(`[Scrape] Background error: ${e.message}`);
    await query('UPDATE tp_barcodes SET status = $1 WHERE id = $2', ['error', barcodeId]).catch(() => {});
  }
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

    console.log(`[Scrape] Starting custom scraper for barcode ${barcodeId}: ${productUrl}`);

    // Fire custom background engine (does not block the response)
    triggerCustomScraper(barcodeId, productUrl);

    // Provide immediate feedback to UI!
    return NextResponse.json({
      success: true,
      message: 'Veri çekme başlatıldı (Aktarmatik Scraper)',
      status: 'scraping',
      barcodeId,
      runId: `custom-scrape-${Math.random().toString(36).substring(7)}`,
    });

  } catch (error) {
    console.error('Scrape API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

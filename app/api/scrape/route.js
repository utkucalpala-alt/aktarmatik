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

    // We are transitioning to a Queue/Webhook architecture with n8n + Apify
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.webtasarimi.net/webhook/trigger-trendyol-scrape';
    
    console.log(`[Queue] Triggering N8N Webhook for barcode: ${barcodeId} -> ${productUrl}`);
    
    // Fire and forget, do not await the completion as Apify takes minutes
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        barcodeId: barcodeId, 
        url: productUrl 
      })
    }).catch(e => console.error('[N8N Trigger Error]', e));

    // Return immediately so the UI doesn't hang
    return NextResponse.json({ 
      success: true, 
      message: 'İşlem n8n + Apify kuyruğuna alındı', 
      status: 'scraping',
      barcodeId: barcodeId
    });

  } catch (error) {
    console.error('API endpoint error:', error);
    return NextResponse.json({ error: 'Sunucu hatası', details: error.message }, { status: 500 });
  }
}

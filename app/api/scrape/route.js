import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const MAX_QNA = 15;
const MAX_REVIEWS = 15;

// Fetch Q&A via Browserless /content endpoint — renders JS, bypasses Cloudflare
async function fetchQnADirect(productUrl, maxQna = MAX_QNA) {
  const BROWSERLESS_HOST = process.env.BROWSERLESS_HOST || 'http://188.132.225.198';
  const BROWSERLESS_PORT = process.env.BROWSERLESS_PORT || '4000';
  const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || 'ygyjmumydei08glg';

  try {
    const baseUrl = productUrl.split('?')[0].replace(/\/(yorumlar|sorular|soru-cevap|saticiya-sor)(\/.*)?$/, '');
    const qnaUrl = baseUrl + '/saticiya-sor';
    const endpoint = `${BROWSERLESS_HOST}:${BROWSERLESS_PORT}/content?token=${BROWSERLESS_TOKEN}`;
    console.log(`[Q&A Browserless] Fetching: ${qnaUrl}`);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: qnaUrl, gotoOptions: { waitUntil: 'networkidle2' }, waitForTimeout: 5000 }),
      signal: AbortSignal.timeout(45000),
    });

    if (!res.ok) {
      console.log(`[Q&A Browserless] Error: ${res.status}`);
      // Fallback to direct HTTP
      const directRes = await fetch(qnaUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'Accept-Language': 'tr-TR,tr;q=0.9' },
        signal: AbortSignal.timeout(15000),
      });
      if (!directRes.ok) return [];
      var html = await directRes.text();
    } else {
      var html = await res.text();
    }

    console.log(`[Q&A Browserless] Got ${(html.length / 1024).toFixed(0)}KB HTML`);

    // Extract Q&A pairs from embedded JSON in HTML
    const qaPairs = [...html.matchAll(/"text":"([^"]{3,500})","userName":"([^"]*)","answeredDateMessage":"([^"]*)","sellerName":"([^"]*)"[^}]*?"answer":\{[^}]*"text":"([^"]*)"/g)];

    if (qaPairs.length === 0) {
      console.log(`[Q&A Browserless] No Q&A pairs found in HTML`);
      return [];
    }

    const questions = qaPairs.slice(0, maxQna).map(m => ({
      questionText: (m[1] || '').replace(/\\n/g, ' ').replace(/\\u002F/g, '/').replace(/\\"/g, '"'),
      userName: m[2] || 'Müşteri',
      answerText: m[5] ? `${m[4]}: ${(m[5] || '').replace(/\\n/g, ' ').replace(/\\u002F/g, '/').replace(/\\"/g, '"')}` : '',
      date: '',
    })).filter(q => q.questionText.length > 3);

    console.log(`[Q&A Browserless] Found ${questions.length} questions`);
    return questions;
  } catch (e) {
    console.log(`[Q&A Browserless] Error: ${e.message}`);
    return [];
  }
}

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
    const scrapedData = scraperResponse.data || scraperResponse;
    console.log(`[Scrape] Custom scraper finished for ${barcodeId}, reviews: ${scrapedData.reviews?.length || 0}, questions: ${scrapedData.questions?.length || 0}`);

    // If scraper returned 0 questions, try direct HTTP fetch (much more reliable for Q&A)
    if (!scrapedData.questions || scrapedData.questions.length === 0) {
      console.log(`[Scrape] Scraper returned 0 Q&A, trying direct HTTP...`);
      const directQuestions = await fetchQnADirect(productUrl);
      if (directQuestions.length > 0) {
        scrapedData.questions = directQuestions;
        console.log(`[Scrape] Direct HTTP got ${directQuestions.length} Q&A`);
      }
    }

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

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET /api/widget/by-url?url=https://softtoplus.com/urun-adi
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const siteUrl = searchParams.get('url');

    if (!siteUrl) {
      return NextResponse.json({ error: 'URL gerekli' }, { status: 400, headers: corsHeaders });
    }

    // Normalize: strip protocol and trailing slash for flexible matching
    const normalized = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/\?.*$/, '');

    // Search by site_url (partial match on path)
    const barcodeResult = await query(
      "SELECT * FROM tp_barcodes WHERE site_url IS NOT NULL AND REPLACE(REPLACE(site_url, 'https://', ''), 'http://', '') LIKE $1 LIMIT 1",
      [`%${normalized}%`]
    );

    if (barcodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Eşleşen ürün bulunamadı' }, { status: 404, headers: corsHeaders });
    }

    const bc = barcodeResult.rows[0];

    const productData = await query(
      'SELECT * FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 1',
      [bc.id]
    );

    const reviews = await query(
      'SELECT author, rating, content, review_date FROM tp_reviews WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 10',
      [bc.id]
    );

    const questions = await query(
      'SELECT user_name, question_text, answer_text, question_date FROM tp_questions WHERE barcode_id = $1 ORDER BY created_at DESC LIMIT 10',
      [bc.id]
    );

    const analysis = await query(
      'SELECT summary, sentiment, pros, cons FROM tp_ai_analysis WHERE barcode_id = $1 ORDER BY analyzed_at DESC LIMIT 1',
      [bc.id]
    );

    return NextResponse.json({
      product: {
        name: bc.product_name,
        url: bc.product_url,
        image: bc.product_image,
        barcode: bc.barcode,
      },
      data: productData.rows[0] || null,
      reviews: reviews.rows,
      questions: questions.rows,
      analysis: analysis.rows[0] || null,
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Widget by-url API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

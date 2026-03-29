import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET /api/widget/by-barcode/[barcode] - public widget data by barcode
export async function GET(request, { params }) {
  try {
    const { barcode } = await params;

    // Find barcode record
    let barcodeResult = await query(
      'SELECT * FROM tp_barcodes WHERE barcode = $1 LIMIT 1',
      [barcode]
    );

    if (barcodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Barkod bulunamadı' }, { status: 404, headers: corsHeaders });
    }

    const bc = barcodeResult.rows[0];

    // Get latest product data
    const productData = await query(
      'SELECT * FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 1',
      [bc.id]
    );

    // Get reviews
    const reviews = await query(
      'SELECT author, rating, content, review_date FROM tp_reviews WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 10',
      [bc.id]
    );

    // Get questions
    const questions = await query(
      'SELECT user_name, question_text, answer_text, question_date FROM tp_questions WHERE barcode_id = $1 ORDER BY created_at DESC LIMIT 10',
      [bc.id]
    );

    // Get AI analysis
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
    console.error('Widget by-barcode API error:', error);
    return NextResponse.json({
      error: 'Sunucu hatası',
      detail: error.message
    }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

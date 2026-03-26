import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/widget/[token] - public widget data endpoint
export async function GET(request, { params }) {
  try {
    const { token } = await params;

    // CORS headers for external sites
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    const widgetResult = await query(
      'SELECT w.*, b.barcode, b.product_name, b.product_url, b.product_image FROM tp_widgets w JOIN tp_barcodes b ON w.barcode_id = b.id WHERE w.token = $1',
      [token]
    );

    if (widgetResult.rows.length === 0) {
      return NextResponse.json({ error: 'Widget bulunamadı' }, { status: 404, headers });
    }

    const widget = widgetResult.rows[0];

    // Get latest product data
    const productData = await query(
      'SELECT * FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 1',
      [widget.barcode_id]
    );

    // Get reviews
    const reviews = await query(
      'SELECT author, rating, content, review_date FROM tp_reviews WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 10',
      [widget.barcode_id]
    );

    // Get AI analysis
    const analysis = await query(
      'SELECT summary, sentiment, pros, cons FROM tp_ai_analysis WHERE barcode_id = $1 ORDER BY analyzed_at DESC LIMIT 1',
      [widget.barcode_id]
    );

    return NextResponse.json({
      widget: {
        type: widget.widget_type,
        theme: widget.theme,
        accentColor: widget.accent_color,
      },
      product: {
        name: widget.product_name,
        url: widget.product_url,
        image: widget.product_image,
        barcode: widget.barcode,
      },
      data: productData.rows[0] || null,
      reviews: reviews.rows,
      analysis: analysis.rows[0] || null,
    }, { headers });
  } catch (error) {
    console.error('Widget API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

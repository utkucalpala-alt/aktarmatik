import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/products/[id] - get product details
export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { id } = await params;

    // Get barcode info
    const barcodeResult = await query(
      'SELECT * FROM tp_barcodes WHERE id = $1 AND user_id = $2',
      [id, user.id]
    );
    if (barcodeResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    const barcode = barcodeResult.rows[0];

    // Get latest product data
    const productData = await query(
      'SELECT * FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 1',
      [id]
    );

    // Get product data history (last 30 entries)
    const history = await query(
      'SELECT rating, review_count, favorite_count, cart_count, sold_count, view_count, scraped_at FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 30',
      [id]
    );

    // Get reviews — pinned first, then newest, include edit/hide status
    const reviews = await query(
      `SELECT id, barcode_id, author, rating, content, review_date, helpful_count, scraped_at,
              COALESCE(is_hidden, false) as is_hidden,
              edited_content,
              COALESCE(is_pinned, false) as is_pinned
       FROM tp_reviews WHERE barcode_id = $1
       ORDER BY COALESCE(is_pinned, false) DESC, scraped_at DESC LIMIT 50`,
      [id]
    );

    // Get questions
    let questions = { rows: [] };
    try {
      questions = await query(
        'SELECT * FROM tp_questions WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 25',
        [id]
      );
    } catch(e) { /* ignore if table not created yet */ }

    // Get AI analysis
    const analysis = await query(
      'SELECT * FROM tp_ai_analysis WHERE barcode_id = $1 ORDER BY analyzed_at DESC LIMIT 1',
      [id]
    );

    // Get widget
    const widget = await query(
      'SELECT * FROM tp_widgets WHERE barcode_id = $1 LIMIT 1',
      [id]
    );

    return NextResponse.json({
      barcode,
      productData: productData.rows[0] || null,
      history: history.rows,
      reviews: reviews.rows,
      questions: questions.rows,
      analysis: analysis.rows[0] || null,
      widget: widget.rows[0] || null,
    });
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/products/[id]
export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    const barcodeResult = await query('SELECT * FROM tp_barcodes WHERE id = $1 AND user_id = $2', [id, user.id]);
    if (barcodeResult.rows.length === 0) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });

    const barcode = barcodeResult.rows[0];

    const productData = await query(
      'SELECT * FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 1',
      [id]
    );

    const history = await query(
      'SELECT rating, review_count, favorite_count, scraped_at FROM tp_product_data WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 30',
      [id]
    );

    // 50 reviews, newest first
    const reviews = await query(
      'SELECT * FROM tp_reviews WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 50',
      [id]
    );

    // 50 questions
    let questions = { rows: [] };
    try {
      questions = await query(
        'SELECT * FROM tp_questions WHERE barcode_id = $1 ORDER BY scraped_at DESC LIMIT 50',
        [id]
      );
    } catch(e) {}

    const analysis = await query(
      'SELECT * FROM tp_ai_analysis WHERE barcode_id = $1 ORDER BY analyzed_at DESC LIMIT 1',
      [id]
    );

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

// PATCH /api/products/[id] — update review
export async function PATCH(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Review edit
    if (body.reviewId && body.action) {
      // Verify ownership
      const check = await query(
        `SELECT r.id FROM tp_reviews r JOIN tp_barcodes b ON r.barcode_id = b.id WHERE r.id = $1 AND b.user_id = $2`,
        [body.reviewId, user.id]
      );
      if (check.rows.length === 0) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

      if (body.action === 'edit') {
        await query('UPDATE tp_reviews SET content = $1 WHERE id = $2', [body.content, body.reviewId]);
      } else if (body.action === 'delete') {
        await query('DELETE FROM tp_reviews WHERE id = $1', [body.reviewId]);
      }
      return NextResponse.json({ success: true });
    }

    // Question edit
    if (body.questionId && body.action) {
      const check = await query(
        `SELECT q.id FROM tp_questions q JOIN tp_barcodes b ON q.barcode_id = b.id WHERE q.id = $1 AND b.user_id = $2`,
        [body.questionId, user.id]
      );
      if (check.rows.length === 0) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 });

      if (body.action === 'edit') {
        await query('UPDATE tp_questions SET question_text = $1, answer_text = $2 WHERE id = $3', [body.questionText, body.answerText, body.questionId]);
      } else if (body.action === 'delete') {
        await query('DELETE FROM tp_questions WHERE id = $1', [body.questionId]);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (error) {
    console.error('Products PATCH error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

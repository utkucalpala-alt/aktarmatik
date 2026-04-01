import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import crypto from 'crypto';

// GET /api/barcodes - list user's barcodes
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const result = await query(`
      SELECT b.*, 
        pd.rating, pd.review_count, pd.favorite_count, pd.cart_count, pd.sold_count,
        (SELECT COUNT(*) FROM tp_widgets w WHERE w.barcode_id = b.id) as widget_count
      FROM tp_barcodes b
      LEFT JOIN LATERAL (
        SELECT * FROM tp_product_data WHERE barcode_id = b.id ORDER BY scraped_at DESC LIMIT 1
      ) pd ON true
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [user.id]);

    return NextResponse.json({ barcodes: result.rows });
  } catch (error) {
    console.error('Barcodes GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// POST /api/barcodes - add new barcode
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { barcode, productUrl } = await request.json();
    if (!barcode) {
      return NextResponse.json({ error: 'Barkod gerekli' }, { status: 400 });
    }

    // Check duplicate
    const existing = await query(
      'SELECT id FROM tp_barcodes WHERE user_id = $1 AND barcode = $2',
      [user.id, barcode]
    );
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Bu barkod zaten ekli' }, { status: 409 });
    }

    const result = await query(
      'INSERT INTO tp_barcodes (user_id, barcode, product_url) VALUES ($1, $2, $3) RETURNING *',
      [user.id, barcode, productUrl || null]
    );

    // Also create a default widget
    const widgetToken = crypto.randomBytes(16).toString('hex');
    await query(
      'INSERT INTO tp_widgets (user_id, barcode_id, token) VALUES ($1, $2, $3)',
      [user.id, result.rows[0].id, widgetToken]
    );

    return NextResponse.json({ barcode: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error('Barcodes POST error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE /api/barcodes - delete barcode
export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID gerekli' }, { status: 400 });
    }

    await query('DELETE FROM tp_barcodes WHERE id = $1 AND user_id = $2', [id, user.id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Barcodes DELETE error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

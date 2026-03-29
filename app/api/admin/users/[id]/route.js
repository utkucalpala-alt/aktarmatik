import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { id } = await params;

    const userResult = await query(
      'SELECT id, email, name, plan, role, gift_products, created_at FROM tp_users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    const user = userResult.rows[0];

    const productsResult = await query(`
      SELECT b.*, pd.rating, pd.review_count, pd.favorite_count, pd.cart_count, pd.sold_count
      FROM tp_barcodes b
      LEFT JOIN LATERAL (
        SELECT * FROM tp_product_data WHERE barcode_id = b.id ORDER BY scraped_at DESC LIMIT 1
      ) pd ON true
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `, [id]);

    return NextResponse.json({
      user,
      products: productsResult.rows,
    });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

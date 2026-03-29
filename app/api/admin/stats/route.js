import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const [users, products, activeProducts, reviews] = await Promise.all([
      query('SELECT COUNT(*) as count FROM tp_users'),
      query('SELECT COUNT(*) as count FROM tp_barcodes'),
      query("SELECT COUNT(*) as count FROM tp_barcodes WHERE status = 'active'"),
      query('SELECT COUNT(*) as count FROM tp_reviews'),
    ]);

    return NextResponse.json({
      totalUsers: parseInt(users.rows[0].count),
      totalProducts: parseInt(products.rows[0].count),
      activeProducts: parseInt(activeProducts.rows[0].count),
      totalReviews: parseInt(reviews.rows[0].count),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

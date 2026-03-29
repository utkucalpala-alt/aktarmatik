import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const result = await query(`
      SELECT u.id, u.email, u.name, u.plan, u.role, u.gift_products, u.created_at,
        COUNT(b.id) as product_count
      FROM tp_users u
      LEFT JOIN tp_barcodes b ON b.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 });
    }

    const { userId, plan, role, giftProducts } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId gerekli' }, { status: 400 });
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (plan !== undefined) { updates.push(`plan = $${idx++}`); values.push(plan); }
    if (role !== undefined) { updates.push(`role = $${idx++}`); values.push(role); }
    if (giftProducts !== undefined) { updates.push(`gift_products = $${idx++}`); values.push(giftProducts); }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Güncellenecek alan yok' }, { status: 400 });
    }

    values.push(userId);
    await query(`UPDATE tp_users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin users patch error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

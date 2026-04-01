import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// PATCH /api/reviews/[id] — edit, hide, pin a review
export async function PATCH(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Verify review belongs to user's product
    const check = await query(
      `SELECT r.id FROM tp_reviews r
       JOIN tp_barcodes b ON r.barcode_id = b.id
       WHERE r.id = $1 AND b.user_id = $2`,
      [id, user.id]
    );
    if (check.rows.length === 0) return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });

    // Edit content
    if (body.edited_content !== undefined) {
      await query('UPDATE tp_reviews SET edited_content = $1 WHERE id = $2', [body.edited_content || null, id]);
    }

    // Toggle hidden
    if (body.is_hidden !== undefined) {
      await query('UPDATE tp_reviews SET is_hidden = $1 WHERE id = $2', [body.is_hidden, id]);
    }

    // Toggle pinned
    if (body.is_pinned !== undefined) {
      await query('UPDATE tp_reviews SET is_pinned = $1 WHERE id = $2', [body.is_pinned, id]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review PATCH error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// DELETE /api/reviews/[id] — permanently delete a review
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });

    const { id } = await params;

    const check = await query(
      `SELECT r.id FROM tp_reviews r
       JOIN tp_barcodes b ON r.barcode_id = b.id
       WHERE r.id = $1 AND b.user_id = $2`,
      [id, user.id]
    );
    if (check.rows.length === 0) return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 });

    await query('DELETE FROM tp_reviews WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

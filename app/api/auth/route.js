import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { initDatabase } from '@/lib/init-db';

// POST /api/auth - login or register
export async function POST(request) {
  try {
    await initDatabase();

    const body = await request.json();
    const { action, email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'E-posta ve şifre gerekli' }, { status: 400 });
    }

    if (action === 'register') {
      // Check if user exists
      const existing = await query('SELECT id FROM tp_users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        return NextResponse.json({ error: 'Bu e-posta zaten kayıtlı' }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      // Admin email gets special treatment
      const isAdmin = email === 'morfilmedia@gmail.com';
      const userRole = isAdmin ? 'admin' : 'user';
      const userPlan = isAdmin ? 'unlimited' : 'free';

      const result = await query(
        'INSERT INTO tp_users (email, password_hash, name, role, plan) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, plan, role',
        [email, passwordHash, name || '', userRole, userPlan]
      );

      const user = result.rows[0];
      const token = signToken({ id: user.id, email: user.email, role: user.role });

      const response = NextResponse.json({ user, token });
      response.cookies.set('tp_token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // Login
    const result = await query('SELECT id, email, name, plan, role, password_hash FROM tp_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı' }, { status: 401 });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role || 'user' });
    const { password_hash, ...safeUser } = user;

    const response = NextResponse.json({ user: safeUser, token });
    response.cookies.set('tp_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

// GET /api/auth - get current user
export async function GET(request) {
  try {
    const { getUserFromRequest } = await import('@/lib/auth');
    const payload = getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
    }

    const result = await query('SELECT id, email, name, plan, role, created_at FROM tp_users WHERE id = $1', [payload.id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Auth GET error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

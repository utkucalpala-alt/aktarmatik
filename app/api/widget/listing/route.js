import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=300', // 5 min cache
};

// GET /api/widget/listing?domain=softtoplus.com
// Returns all products with ratings for a given domain (bulk endpoint for listing pages)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'domain parametresi gerekli' }, { status: 400, headers: corsHeaders });
    }

    // Normalize domain
    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();

    // Find all barcodes with site_url matching this domain, join with latest product data
    const result = await query(`
      SELECT
        b.id, b.product_name, b.site_url, b.product_image,
        pd.rating, pd.review_count, pd.favorite_count, pd.cart_count, pd.sold_count
      FROM tp_barcodes b
      LEFT JOIN LATERAL (
        SELECT rating, review_count, favorite_count, cart_count, sold_count
        FROM tp_product_data
        WHERE barcode_id = b.id
        ORDER BY scraped_at DESC LIMIT 1
      ) pd ON true
      WHERE b.site_url IS NOT NULL
        AND b.site_url ILIKE $1
        AND b.status = 'active'
    `, [`%${normalizedDomain}%`]);

    // Build a map: normalized path -> product data
    const products = result.rows.map(row => {
      let path = '';
      try {
        const url = new URL(row.site_url);
        path = url.pathname.replace(/\/$/, '');
      } catch {
        path = row.site_url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
      }
      return {
        path,
        site_url: row.site_url,
        name: row.product_name,
        image: row.product_image,
        rating: row.rating ? parseFloat(row.rating) : null,
        review_count: parseInt(row.review_count) || 0,
        favorite_count: parseInt(row.favorite_count) || 0,
        cart_count: parseInt(row.cart_count) || 0,
        sold_count: parseInt(row.sold_count) || 0,
      };
    }).filter(p => p.rating); // Only return products with rating data

    return NextResponse.json({ products }, { headers: corsHeaders });
  } catch (error) {
    console.error('Widget listing API error:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500, headers: corsHeaders });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

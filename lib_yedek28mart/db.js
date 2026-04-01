import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'post.webtasarimi.net',
  port: parseInt(process.env.DB_PORT || '5435'),
  database: process.env.DB_NAME || 'webtasarimi_db',
  user: process.env.DB_USER || 'webtasarimi_db_admin',
  password: process.env.DB_PASSWORD || '8858lpU5i7Yr6pEx2oprmdQ95G1G',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('DB Query:', { text: text.substring(0, 80), duration: `${duration}ms`, rows: res.rowCount });
  }
  return res;
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}

export default pool;

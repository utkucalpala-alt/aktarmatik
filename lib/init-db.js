import { query } from './db.js';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS tp_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tp_barcodes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES tp_users(id) ON DELETE CASCADE,
    barcode VARCHAR(100) NOT NULL,
    product_name TEXT,
    product_url TEXT,
    product_image TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    last_scraped_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tp_product_data (
    id SERIAL PRIMARY KEY,
    barcode_id INTEGER REFERENCES tp_barcodes(id) ON DELETE CASCADE,
    rating DECIMAL(3,2),
    review_count INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    cart_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tp_reviews (
    id SERIAL PRIMARY KEY,
    barcode_id INTEGER REFERENCES tp_barcodes(id) ON DELETE CASCADE,
    author VARCHAR(255),
    rating INTEGER,
    content TEXT,
    review_date VARCHAR(100),
    helpful_count INTEGER DEFAULT 0,
    scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tp_ai_analysis (
    id SERIAL PRIMARY KEY,
    barcode_id INTEGER REFERENCES tp_barcodes(id) ON DELETE CASCADE,
    summary TEXT,
    sentiment VARCHAR(50),
    pros TEXT,
    cons TEXT,
    keywords TEXT,
    analyzed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tp_questions (
    id SERIAL PRIMARY KEY,
    barcode_id INTEGER REFERENCES tp_barcodes(id) ON DELETE CASCADE,
    user_name VARCHAR(255),
    question_text TEXT,
    answer_text TEXT,
    question_date VARCHAR(100),
    scraped_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tp_widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES tp_users(id) ON DELETE CASCADE,
    barcode_id INTEGER REFERENCES tp_barcodes(id) ON DELETE CASCADE,
    token VARCHAR(100) UNIQUE NOT NULL,
    widget_type VARCHAR(50) DEFAULT 'full',
    theme VARCHAR(20) DEFAULT 'dark',
    accent_color VARCHAR(20) DEFAULT '#6c5ce7',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_barcodes_user ON tp_barcodes(user_id);
CREATE INDEX IF NOT EXISTS idx_product_data_barcode ON tp_product_data(barcode_id);
CREATE INDEX IF NOT EXISTS idx_reviews_barcode ON tp_reviews(barcode_id);
CREATE INDEX IF NOT EXISTS idx_questions_barcode ON tp_questions(barcode_id);
CREATE INDEX IF NOT EXISTS idx_widgets_token ON tp_widgets(token);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_barcode ON tp_ai_analysis(barcode_id);
`;

// Fix column size limits and add new columns for existing databases
const ALTER_SQL = `
ALTER TABLE tp_barcodes ALTER COLUMN product_name TYPE TEXT;
ALTER TABLE tp_barcodes ALTER COLUMN product_url TYPE TEXT;
ALTER TABLE tp_barcodes ALTER COLUMN product_image TYPE TEXT;
DO $$ BEGIN
  ALTER TABLE tp_barcodes ADD COLUMN site_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE tp_users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE tp_users ADD COLUMN gift_products INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
`;

let initialized = false;

export async function initDatabase() {
  if (initialized) return true;
  try {
    await query(SCHEMA_SQL);
    // Fix column size limits for existing databases
    try {
      await query(ALTER_SQL);
    } catch (alterError) {
      // Ignore if columns are already TEXT type
      console.log('Column type update skipped (likely already TEXT)');
    }
    initialized = true;
    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Database init error:', error);
    return false;
  }
}

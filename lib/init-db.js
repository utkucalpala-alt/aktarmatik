import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from './db.js';

export async function initDatabase() {
  try {
    const schemaPath = join(process.cwd(), 'lib', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    await query(schema);
    console.log('Database schema initialized successfully');
    return true;
  } catch (error) {
    console.error('Database init error:', error);
    return false;
  }
}

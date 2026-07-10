import { createClient, Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

let client: Client | undefined;
let initialized = false;

export async function getDatabase(): Promise<Client> {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (url) {
      client = createClient({ url, authToken });
    } else {
      // Fallback to local file for development
      // On platforms like Netlify and Vercel, the filesystem is read-only except for /tmp
      const isServerless = process.env.NETLIFY === 'true' || process.env.VERCEL === '1';
      const dataDir = isServerless ? '/tmp' : path.join(process.cwd(), 'data');

      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const dbPath = path.join(dataDir, 'app.db');

      if (isServerless) {
        console.warn(`[database] No TURSO_DATABASE_URL found. Falling back to local database at ${dbPath}. DATA WILL NOT PERSIST!`);
      }

      client = createClient({ url: `file:${dbPath}` });
    }
  }

  if (!initialized) {
    await client.execute('PRAGMA foreign_keys = ON');

    // Create base tables and original indexes
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shared_items (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        password TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_shared_items_session ON shared_items(session_id);
      CREATE INDEX IF NOT EXISTS idx_shared_items_slug ON shared_items(slug);
    `);

    // Migrations: add new columns if they don't exist yet
    try {
      await client.execute('ALTER TABLE shared_items ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0');
    } catch { /* already exists */ }

    try {
      await client.execute('ALTER TABLE shared_items ADD COLUMN expires_at DATETIME');
    } catch { /* already exists */ }

    try {
      await client.execute('ALTER TABLE shared_items ADD COLUMN title TEXT');
    } catch { /* already exists */ }

    try {
      await client.execute("ALTER TABLE shared_items ADD COLUMN language TEXT NOT NULL DEFAULT 'plaintext'");
    } catch { /* already exists */ }

    // Backfill expires_at for any rows missing it
    await client.execute("UPDATE shared_items SET expires_at = datetime(created_at, '+15 days') WHERE expires_at IS NULL");

    // Create index on new columns (must be after migrations so the columns exist)
    await client.execute('CREATE INDEX IF NOT EXISTS idx_shared_items_public ON shared_items(is_public, expires_at)');

    initialized = true;
  }

  return client;
}

export type Session = {
  id: string;
  created_at: string;
};

export type SharedItem = {
  id: string;
  session_id: string;
  slug: string;
  content: string;
  title: string | null;
  language: string;
  password: string | null;
  is_public: number;
  expires_at: string | null;
  created_at: string;
};

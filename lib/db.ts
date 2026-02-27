import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'data', 'app.db');
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    db.exec(`
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
  }
  
  return db;
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
  password: string | null;
  created_at: string;
};

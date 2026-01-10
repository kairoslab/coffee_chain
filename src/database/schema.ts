// Database schema and operations for CoffeeChain
// Uses expo-sqlite for local persistence

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'coffeechain.db';

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    
    -- Actors table
    CREATE TABLE IF NOT EXISTS actors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('producer', 'processor', 'exporter', 'importer', 'roaster', 'retailer', 'consumer')),
      country TEXT NOT NULL,
      region TEXT,
      lat REAL,
      lng REAL,
      email TEXT,
      phone TEXT,
      website TEXT,
      certifications TEXT,  -- JSON array
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    -- Lots table (central entity)
    CREATE TABLE IF NOT EXISTS lots (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      lot_code TEXT,
      variety TEXT NOT NULL,
      species TEXT DEFAULT 'Arabica',
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      farm TEXT,
      altitude INTEGER,
      origin_lat REAL,
      origin_lng REAL,
      harvest_date TEXT,
      processing_method TEXT NOT NULL CHECK (processing_method IN ('washed', 'natural', 'honey', 'anaerobic', 'carbonic', 'experimental')),
      current_state TEXT NOT NULL DEFAULT 'harvested' CHECK (current_state IN ('harvested', 'processed', 'exported', 'imported', 'roasted', 'retailed', 'consumed')),
      current_location TEXT,
      current_holder_id TEXT REFERENCES actors(id),
      roast_date TEXT,
      roast_level TEXT CHECK (roast_level IN ('light', 'medium', 'dark')),
      initial_quantity_amount REAL,
      initial_quantity_unit TEXT CHECK (initial_quantity_unit IN ('kg', 'lb', 'bags')),
      photos TEXT,  -- JSON array of URIs
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    -- Handoffs table (chain of custody)
    CREATE TABLE IF NOT EXISTS handoffs (
      id TEXT PRIMARY KEY,
      lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
      from_actor_id TEXT NOT NULL REFERENCES actors(id),
      to_actor_id TEXT NOT NULL REFERENCES actors(id),
      date TEXT NOT NULL,
      location TEXT,
      previous_state TEXT NOT NULL,
      new_state TEXT NOT NULL,
      price_amount REAL,
      price_currency TEXT,
      price_unit TEXT CHECK (price_unit IN ('kg', 'lb', 'bag')),
      price_type TEXT CHECK (price_type IN ('FOB', 'CIF', 'farmgate', 'wholesale', 'retail')),
      verification TEXT NOT NULL DEFAULT 'self_reported' CHECK (verification IN ('self_reported', 'confirmed', 'documented', 'unverified')),
      documents TEXT,  -- JSON array of URIs
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    -- Interactions table
    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
      actor_id TEXT NOT NULL REFERENCES actors(id),
      type TEXT NOT NULL CHECK (type IN ('cupping', 'brew', 'roast_profile', 'cultivation_note', 'review')),
      data TEXT NOT NULL,  -- JSON object
      photos TEXT,  -- JSON array of URIs
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    -- User's collection (lots they own/track)
    CREATE TABLE IF NOT EXISTS collection (
      id TEXT PRIMARY KEY,
      lot_id TEXT NOT NULL REFERENCES lots(id) ON DELETE CASCADE,
      added_at TEXT NOT NULL DEFAULT (datetime('now')),
      quantity_remaining REAL,
      quantity_unit TEXT CHECK (quantity_unit IN ('g', 'kg', 'lb', 'oz')),
      purchase_price REAL,
      purchase_currency TEXT,
      notes TEXT,
      is_favorite INTEGER DEFAULT 0,
      UNIQUE(lot_id)
    );
    
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_lots_current_state ON lots(current_state);
    CREATE INDEX IF NOT EXISTS idx_lots_variety ON lots(variety);
    CREATE INDEX IF NOT EXISTS idx_handoffs_lot_id ON handoffs(lot_id);
    CREATE INDEX IF NOT EXISTS idx_handoffs_date ON handoffs(date);
    CREATE INDEX IF NOT EXISTS idx_interactions_lot_id ON interactions(lot_id);
    CREATE INDEX IF NOT EXISTS idx_collection_lot_id ON collection(lot_id);
  `);
  
  return db;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function toJSON(obj: unknown): string {
  return JSON.stringify(obj);
}

export function fromJSON<T>(str: string | null): T | null {
  if (!str) return null;
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}

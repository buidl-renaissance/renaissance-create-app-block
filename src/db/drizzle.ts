import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';
import * as schema from './schema';

// Load environment variables from .env.local or .env
config({ path: '.env.local' });
config({ path: '.env' });

// Check if we should use local SQLite
const USE_LOCAL = process.env.USE_LOCAL === 'true';
const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH || './dev.sqlite3';

// Create Turso client with singleton pattern for Next.js hot reloading
let tursoClient: ReturnType<typeof createClient> | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDbClient() {
  if (tursoClient) {
    return tursoClient;
  }

  // Explicitly use local SQLite when USE_LOCAL=true
  if (USE_LOCAL) {
    const fileUrl = LOCAL_DB_PATH.startsWith('file:') ? LOCAL_DB_PATH : `file:${LOCAL_DB_PATH}`;
    console.log('🗄️  Using local SQLite database:', fileUrl);
    tursoClient = createClient({ url: fileUrl });
    return tursoClient;
  }

  // Use Turso remote database
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    // Fallback to local if no Turso URL configured
    const fileUrl = `file:${LOCAL_DB_PATH}`;
    console.log('🗄️  No TURSO_DATABASE_URL configured, falling back to local SQLite:', fileUrl);
    tursoClient = createClient({ url: fileUrl });
    return tursoClient;
  }

  console.log('🗄️  Using Turso remote database');
  tursoClient = createClient({ url, authToken });
  return tursoClient;
}

// Create drizzle instance with singleton pattern
export function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const client = getDbClient();
  dbInstance = drizzle(client, { schema });
  return dbInstance;
}

// Export whether we're using local database
export const isUsingLocalDb = () => USE_LOCAL || !process.env.TURSO_DATABASE_URL;

// Export db for backwards compatibility
export const db = getDb();

export type Database = typeof db;

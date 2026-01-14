import 'dotenv/config';
import type { Config } from 'drizzle-kit';

const USE_LOCAL = process.env.USE_LOCAL === 'true';
const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH || './dev.sqlite3';

// Use local SQLite when USE_LOCAL=true or when no Turso URL is configured
const useLocal = USE_LOCAL || !process.env.TURSO_DATABASE_URL;

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: useLocal ? 'sqlite' : 'turso',
  dbCredentials: useLocal
    ? { url: LOCAL_DB_PATH.startsWith('file:') ? LOCAL_DB_PATH : `file:${LOCAL_DB_PATH}` }
    : { url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN },
} satisfies Config;

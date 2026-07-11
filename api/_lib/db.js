import { neon } from '@neondatabase/serverless';
import { config } from './config.js';

let sqlInstance = null;

/**
 * Tagged-template SQL client, memoized per lambda instance. Shares the
 * same Neon Postgres instance as other apps in this account; all tables
 * here are prefixed `mm_` to avoid name collisions with them.
 */
export function sql() {
  if (!sqlInstance) {
    sqlInstance = neon(config.databaseUrl);
  }
  return sqlInstance;
}

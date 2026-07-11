import 'dotenv/config';
import ws from 'ws';
import { Client, neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL. Set it in .env or your shell before running db:init.');
  process.exit(1);
}

const statements = [
  `CREATE TABLE IF NOT EXISTS mm_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    google_sub TEXT UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login TIMESTAMPTZ,
    CONSTRAINT mm_users_auth_method_chk CHECK (password_hash IS NOT NULL OR google_sub IS NOT NULL)
  )`,
  `CREATE TABLE IF NOT EXISTS mm_profiles (
    user_id INTEGER PRIMARY KEY REFERENCES mm_users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS mm_plans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES mm_users(id) ON DELETE CASCADE,
    plan_date TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS mm_advisories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES mm_users(id) ON DELETE CASCADE,
    trip JSONB NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_mm_plans_user ON mm_plans(user_id, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_mm_advisories_user ON mm_advisories(user_id, created_at DESC)`
];

const client = new Client(connectionString);
await client.connect();
try {
  for (const statement of statements) {
    await client.query(statement);
    console.log('OK:', statement.split('\n')[0].trim());
  }
  console.log('Database schema is ready.');
} finally {
  await client.end();
}

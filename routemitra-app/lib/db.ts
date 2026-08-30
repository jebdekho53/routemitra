// Postgres access via node-postgres (`pg`). Works with a plain local Postgres
// and with hosted Postgres (Neon / Supabase) using the same DATABASE_URL.
//
// No-op when DATABASE_URL is unset so the app still runs without a database.
//
// `sql` is a tagged-template helper compatible with the small surface we use:
//   const rows = await sql<Row>`SELECT * FROM t WHERE id = ${id}`;
// Interpolated values become $1, $2, … bind parameters (never string-spliced).

import { Pool } from "pg";

const connStr = process.env.DATABASE_URL;

export const dbEnabled = Boolean(connStr);

function makePool(): Pool {
  const needsSsl = /sslmode=require|neon\.tech|supabase\.co|pooler\.supabase/.test(
    connStr!,
  );
  return new Pool({
    connectionString: connStr,
    max: 10,
    idleTimeoutMillis: 30_000,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });
}

// Reuse the pool across hot-reloads in dev.
const g = globalThis as unknown as { __rmPool?: Pool };
const pool = connStr ? (g.__rmPool ??= makePool()) : null;

export type SqlTag = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<T[]>;

export const sql: SqlTag | null = pool
  ? (<T>(strings: TemplateStringsArray, ...values: unknown[]) => {
      let text = strings[0];
      for (let i = 0; i < values.length; i++) {
        text += `$${i + 1}${strings[i + 1]}`;
      }
      return pool.query(text, values as unknown[]).then((r) => r.rows as T[]);
    })
  : null;

let schemaReady: Promise<void> | null = null;

// Lazily create tables on first use. Fine for an app this size; move to a
// migration tool if the schema keeps growing.
export function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS clicks (
          id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          created_at  timestamptz NOT NULL DEFAULT now(),
          mode        text NOT NULL,
          operator    text NOT NULL,
          price       integer,
          from_city   text NOT NULL,
          to_city     text NOT NULL,
          indicative  boolean NOT NULL DEFAULT false
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS clicks_created_at_idx ON clicks (created_at)`;
      await sql`CREATE INDEX IF NOT EXISTS clicks_route_idx ON clicks (from_city, to_city)`;
      await sql`
        CREATE TABLE IF NOT EXISTS errors (
          id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          created_at  timestamptz NOT NULL DEFAULT now(),
          message     text NOT NULL,
          digest      text,
          path        text
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS errors_created_at_idx ON errors (created_at)`;

      // --- Phase 12: accounts ---
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          email             text NOT NULL UNIQUE,
          name              text,
          password_hash     text,
          image             text,
          oauth_provider    text,
          email_verified_at timestamptz,
          created_at        timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS auth_tokens (
          id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          kind        text NOT NULL,            -- 'verify' | 'reset'
          token_hash  text NOT NULL,
          expires_at  timestamptz NOT NULL,
          created_at  timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS auth_tokens_hash_idx ON auth_tokens (token_hash)`;

      // --- Phase 13: logged-in features ---
      await sql`
        CREATE TABLE IF NOT EXISTS saved_searches (
          id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          from_city   text NOT NULL,
          to_city     text NOT NULL,
          date        text,
          created_at  timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS saved_searches_user_idx ON saved_searches (user_id, created_at DESC)`;
      await sql`
        CREATE TABLE IF NOT EXISTS route_watches (
          id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id       bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          from_city     text NOT NULL,
          to_city       text NOT NULL,
          last_price    integer,
          active        boolean NOT NULL DEFAULT true,
          last_checked_at timestamptz,
          created_at    timestamptz NOT NULL DEFAULT now(),
          UNIQUE (user_id, from_city, to_city)
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS favourite_routes (
          id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          from_city   text NOT NULL,
          to_city     text NOT NULL,
          created_at  timestamptz NOT NULL DEFAULT now(),
          UNIQUE (user_id, from_city, to_city)
        )
      `;
    })().catch((err) => {
      console.error("[db] ensureSchema failed:", err);
      schemaReady = null; // allow a retry on the next request
      throw err;
    });
  }
  return schemaReady;
}

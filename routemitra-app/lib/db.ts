// Postgres access (Neon serverless driver). Used for click tracking (Phase 7)
// and later for saved searches / users.
//
// No-op when DATABASE_URL is unset so the app runs without a database.

import { neon } from "@neondatabase/serverless";

const connStr = process.env.DATABASE_URL;

export const dbEnabled = Boolean(connStr);

export const sql = connStr ? neon(connStr) : null;

let schemaReady: Promise<void> | null = null;

// Lazily create the clicks table on first write. Fine for a small app;
// swap for a real migration tool if the schema grows.
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

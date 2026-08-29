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
    })().catch((err) => {
      console.error("[db] ensureSchema failed:", err);
      schemaReady = null; // allow a retry on the next request
      throw err;
    });
  }
  return schemaReady;
}

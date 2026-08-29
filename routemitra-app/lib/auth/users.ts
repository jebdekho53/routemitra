// User + auth-token queries. All no-op-safe: if the DB isn't configured they
// throw a clear error (auth simply can't work without a database).

import { sql, ensureSchema } from "@/lib/db";
import { createHash, randomBytes } from "node:crypto";

export interface DbUser {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  image: string | null;
  oauth_provider: string | null;
  email_verified_at: string | null;
  created_at: string;
}

function requireDb() {
  if (!sql) throw new Error("DATABASE_URL not set — auth needs a database");
  return sql;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const db = requireDb();
  await ensureSchema();
  const rows = (await db`
    SELECT * FROM users WHERE lower(email) = lower(${email}) LIMIT 1
  `) as unknown as DbUser[];
  return rows[0] ?? null;
}

export async function getUserById(id: string | number): Promise<DbUser | null> {
  const db = requireDb();
  await ensureSchema();
  const rows = (await db`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `) as unknown as DbUser[];
  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  name?: string | null;
  passwordHash?: string | null;
  oauthProvider?: string | null;
  image?: string | null;
  emailVerified?: boolean;
}): Promise<DbUser> {
  const db = requireDb();
  await ensureSchema();
  const rows = (await db`
    INSERT INTO users (email, name, password_hash, oauth_provider, image, email_verified_at)
    VALUES (
      lower(${input.email}),
      ${input.name ?? null},
      ${input.passwordHash ?? null},
      ${input.oauthProvider ?? null},
      ${input.image ?? null},
      ${input.emailVerified ? new Date().toISOString() : null}
    )
    RETURNING *
  `) as unknown as DbUser[];
  return rows[0];
}

export async function updateUserProfile(
  id: string,
  fields: { name?: string; email?: string },
): Promise<void> {
  const db = requireDb();
  if (fields.name !== undefined) {
    await db`UPDATE users SET name = ${fields.name} WHERE id = ${id}`;
  }
  if (fields.email !== undefined) {
    // changing email resets verification
    await db`
      UPDATE users SET email = lower(${fields.email}), email_verified_at = NULL
      WHERE id = ${id}
    `;
  }
}

export async function setPasswordHash(id: string, hash: string): Promise<void> {
  const db = requireDb();
  await db`UPDATE users SET password_hash = ${hash} WHERE id = ${id}`;
}

export async function markEmailVerified(id: string): Promise<void> {
  const db = requireDb();
  await db`UPDATE users SET email_verified_at = now() WHERE id = ${id}`;
}

export async function deleteUser(id: string): Promise<void> {
  const db = requireDb();
  await db`DELETE FROM users WHERE id = ${id}`; // cascades to tokens/searches/watches
}

// --- one-time tokens (email verification, password reset) ---

const hashToken = (raw: string) =>
  createHash("sha256").update(raw).digest("hex");

export async function issueToken(
  userId: string,
  kind: "verify" | "reset",
  ttlMinutes: number,
): Promise<string> {
  const db = requireDb();
  await ensureSchema();
  const raw = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + ttlMinutes * 60_000).toISOString();
  await db`DELETE FROM auth_tokens WHERE user_id = ${userId} AND kind = ${kind}`;
  await db`
    INSERT INTO auth_tokens (user_id, kind, token_hash, expires_at)
    VALUES (${userId}, ${kind}, ${hashToken(raw)}, ${expires})
  `;
  return raw;
}

export async function consumeToken(
  raw: string,
  kind: "verify" | "reset",
): Promise<string | null> {
  const db = requireDb();
  await ensureSchema();
  const rows = (await db`
    DELETE FROM auth_tokens
    WHERE token_hash = ${hashToken(raw)} AND kind = ${kind} AND expires_at > now()
    RETURNING user_id
  `) as unknown as { user_id: string }[];
  return rows[0]?.user_id ?? null;
}

// Password hashing with Node's scrypt — no native dep. Format stored in
// users.password_hash:  scrypt$<N>$<saltHex>$<hashHex>

import {
  randomBytes,
  scrypt,
  timingSafeEqual,
  type BinaryLike,
  type ScryptOptions,
} from "node:crypto";

const KEYLEN = 64;
const COST = 16384; // N

function scryptAsync(
  password: BinaryLike,
  salt: BinaryLike,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scryptAsync(password, salt, KEYLEN, {
    N: COST,
  })) as Buffer;
  return `scrypt$${COST}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored) return false;
  const [scheme, costStr, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt") return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = (await scryptAsync(password, salt, expected.length, {
    N: Number(costStr) || COST,
  })) as Buffer;
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

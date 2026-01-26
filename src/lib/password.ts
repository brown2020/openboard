import "server-only";

import crypto from "node:crypto";
import { base64urlEncode, base64urlDecodeToBuffer } from "./base64url";

const SCRYPT_N = 1 << 15; // 32768
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 32;
const SALT_LEN = 16;

/**
 * Hash format:
 * scrypt$N$r$p$saltB64Url$hashB64Url
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN);

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      KEY_LEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, key) => {
        if (err) reject(err);
        else resolve(key as Buffer);
      }
    );
  });

  return [
    "scrypt",
    String(SCRYPT_N),
    String(SCRYPT_R),
    String(SCRYPT_P),
    base64urlEncode(salt),
    base64urlEncode(derivedKey),
  ].join("$");
}

export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const parts = storedHash.split("$");
  if (parts.length !== 6) return false;

  const [alg, nStr, rStr, pStr, saltB64, hashB64] = parts;
  if (alg !== "scrypt") return false;

  const N = Number(nStr);
  const r = Number(rStr);
  const p = Number(pStr);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return false;

  const salt = base64urlDecodeToBuffer(saltB64);
  const expected = base64urlDecodeToBuffer(hashB64);

  const actual = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, { N, r, p }, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });

  // timingSafeEqual throws if lengths differ
  if (actual.length !== expected.length) return false;
  return crypto.timingSafeEqual(actual, expected);
}


